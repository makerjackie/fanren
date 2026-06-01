import type { Texture } from 'three'
import {
  CanvasTexture,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Sprite,
  SpriteMaterial,
  sRGBEncoding,
  TextureLoader,
} from 'three'

export type ScenicRange = readonly [number, number]
export type ScenicVec3 = readonly [number, number, number]
export type ScenicSideMode = 'left' | 'right' | 'both' | 'center' | 'wide'

export interface ScenicTextureUrls {
  skyPanorama?: string
  bottomCloud?: string
}

export interface ScenicSkyConfig {
  width?: number
  height?: number
  position?: ScenicVec3
  opacity?: number
  sideWrapWidth?: number
  sideWrapAngle?: number
  lowerSkirt?: {
    height?: number
    yOffset?: number
    opacity?: number
  }
}

export interface ScenicCloudCoverConfig {
  planeCount?: number
  width?: number
  depth?: number
  y?: number
  startZ?: number
  spacingZ?: number
  opacity?: number
  scrollSpeed?: number
  resetZ?: number
  spriteCount?: number
  spriteXRange?: ScenicRange
  spriteYRange?: ScenicRange
  spriteZRange?: ScenicRange
  spriteScaleRange?: ScenicRange
  spriteOpacityRange?: ScenicRange
  spriteParallax?: number
}

export interface ScenicBillboardPoolConfig {
  id: string
  textureUrl: string
  count: number
  side?: ScenicSideMode
  xRange?: ScenicRange
  yRange: ScenicRange
  zRange: ScenicRange
  baseSize?: readonly [number, number]
  scaleRange?: ScenicRange
  opacityRange?: ScenicRange
  parallax?: number
  driftX?: number
  driftY?: number
  resetZ?: number
  alphaTest?: number
  renderOrder?: number
}

export interface ScenicWorldOptions {
  textureUrls?: ScenicTextureUrls
  sky?: ScenicSkyConfig
  cloudCover?: ScenicCloudCoverConfig
  billboardPools?: ScenicBillboardPoolConfig[]
  textureLoader?: TextureLoader
  random?: () => number
}

interface CloudPlane {
  mesh: Mesh<PlaneGeometry, MeshBasicMaterial>
  initialZ: number
}

interface CloudSprite {
  sprite: Sprite
  seed: number
}

interface BillboardItem {
  sprite: Sprite
  config: ScenicBillboardPoolConfig
  seed: number
  baseX: number
  baseY: number
}

const DEFAULT_SKY: Required<Omit<ScenicSkyConfig, 'lowerSkirt'>> & {
  lowerSkirt: Required<NonNullable<ScenicSkyConfig['lowerSkirt']>>
} = {
  width: 720,
  height: 500,
  position: [0, 18, -255],
  opacity: 0.96,
  sideWrapWidth: 360,
  sideWrapAngle: 0.7,
  lowerSkirt: {
    height: 220,
    yOffset: -275,
    opacity: 0.74,
  },
}

const DEFAULT_CLOUD_COVER: Required<ScenicCloudCoverConfig> = {
  planeCount: 5,
  width: 320,
  depth: 190,
  y: -5.8,
  startZ: 34,
  spacingZ: -74,
  opacity: 0.78,
  scrollSpeed: 0.18,
  resetZ: 88,
  spriteCount: 72,
  spriteXRange: [-130, 130],
  spriteYRange: [-7.8, -3.8],
  spriteZRange: [-245, 54],
  spriteScaleRange: [24, 62],
  spriteOpacityRange: [0.08, 0.22],
  spriteParallax: 0.12,
}

const DEFAULT_BILLBOARD_BASE_SIZE: readonly [number, number] = [32, 22]

const randomBetween = (range: ScenicRange, random: () => number) =>
  range[0] + random() * (range[1] - range[0])

const clampOpacityRange = (range: ScenicRange | undefined): ScenicRange =>
  range ?? [0.58, 0.94]

const getSideXRange = (side: ScenicSideMode): ScenicRange => {
  if (side === 'left') return [-86, -26]
  if (side === 'right') return [26, 86]
  if (side === 'both') return [28, 92]
  if (side === 'center') return [-16, 16]
  return [-112, 112]
}

export default class ScenicWorld {
  private readonly root = new Group()

  private readonly textureLoader: TextureLoader

  private readonly random: () => number

  private readonly options: ScenicWorldOptions

  private readonly cloudPlanes: CloudPlane[] = []

  private readonly cloudSprites: CloudSprite[] = []

  private readonly billboards: BillboardItem[] = []

  private readonly fallbackCloudTexture: Texture

  private cloudCoverMaterial?: MeshBasicMaterial

  constructor(options: ScenicWorldOptions = {}) {
    this.options = options
    this.textureLoader = options.textureLoader ?? new TextureLoader()
    this.random = options.random ?? Math.random
    this.fallbackCloudTexture = this.createFallbackCloudTexture()

    this.createSky()
    this.createCloudCover()
    this.createBillboardPools()
  }

  getRoot() {
    return this.root
  }

  reset() {
    this.cloudPlanes.forEach((cloud, index) => {
      const config = { ...DEFAULT_CLOUD_COVER, ...this.options.cloudCover }
      cloud.mesh.position.z = config.startZ + index * config.spacingZ
      cloud.mesh.position.x = index % 2 === 0 ? -18 : 18
      cloud.initialZ = cloud.mesh.position.z
    })

    this.cloudSprites.forEach((cloud) => {
      this.placeCloudSprite(cloud)
    })

    this.billboards.forEach((item) => {
      this.placeBillboard(item)
    })

    if (this.cloudCoverMaterial?.map) {
      this.cloudCoverMaterial.map.offset.set(0, 0)
    }
  }

  update(delta: number, speed: number, distance: number) {
    this.updateCloudCover(delta, speed, distance)
    this.updateBillboards(delta, speed, distance)
  }

  dispose() {
    this.cloudCoverMaterial?.dispose()
    this.fallbackCloudTexture.dispose()
    this.root.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose()
        object.material.dispose()
      }
      if (object instanceof Sprite) {
        object.material.dispose()
      }
    })
  }

  private createSky() {
    const url = this.options.textureUrls?.skyPanorama
    if (!url) return

    const skyOptions = this.options.sky ?? {}
    const config = {
      ...DEFAULT_SKY,
      ...skyOptions,
      lowerSkirt: {
        ...DEFAULT_SKY.lowerSkirt,
        ...skyOptions.lowerSkirt,
      },
    }
    const texture = this.loadTexture(url)
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: config.opacity,
      depthWrite: false,
      fog: false,
      side: DoubleSide,
    })

    const back = new Mesh(
      new PlaneGeometry(config.width, config.height),
      material,
    )
    back.position.set(...config.position)
    back.renderOrder = -40
    this.root.add(back)

    if (config.sideWrapWidth > 0) {
      const left = new Mesh(
        new PlaneGeometry(config.sideWrapWidth, config.height),
        material.clone(),
      )
      left.position.set(
        config.position[0] - config.width * 0.43,
        config.position[1],
        config.position[2] + 42,
      )
      left.rotation.y = config.sideWrapAngle
      left.renderOrder = -41

      const right = new Mesh(
        new PlaneGeometry(config.sideWrapWidth, config.height),
        material.clone(),
      )
      right.position.set(
        config.position[0] + config.width * 0.43,
        config.position[1],
        config.position[2] + 42,
      )
      right.rotation.y = -config.sideWrapAngle
      right.renderOrder = -41
      this.root.add(left, right)
    }

    if (config.lowerSkirt.height > 0) {
      const skirtMaterial = material.clone()
      skirtMaterial.opacity = config.lowerSkirt.opacity
      const skirt = new Mesh(
        new PlaneGeometry(config.width, config.lowerSkirt.height),
        skirtMaterial,
      )
      skirt.position.set(
        config.position[0],
        config.position[1] + config.lowerSkirt.yOffset,
        config.position[2] + 14,
      )
      skirt.renderOrder = -42
      this.root.add(skirt)
    }
  }

  private createCloudCover() {
    const config = { ...DEFAULT_CLOUD_COVER, ...this.options.cloudCover }
    const texture = this.options.textureUrls?.bottomCloud
      ? this.loadTexture(this.options.textureUrls.bottomCloud, true)
      : this.fallbackCloudTexture

    this.cloudCoverMaterial = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: config.opacity,
      depthWrite: false,
      side: DoubleSide,
      fog: false,
    })

    for (let index = 0; index < config.planeCount; index += 1) {
      const mesh = new Mesh(
        new PlaneGeometry(config.width, config.depth),
        this.cloudCoverMaterial,
      )
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(
        index % 2 === 0 ? -18 : 18,
        config.y,
        config.startZ + index * config.spacingZ,
      )
      mesh.renderOrder = -20
      this.root.add(mesh)
      this.cloudPlanes.push({ mesh, initialZ: mesh.position.z })
    }

    const cloudTexture = this.options.textureUrls?.bottomCloud
      ? this.loadTexture(this.options.textureUrls.bottomCloud)
      : this.fallbackCloudTexture

    for (let index = 0; index < config.spriteCount; index += 1) {
      const material = new SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: randomBetween(config.spriteOpacityRange, this.random),
        depthWrite: false,
        fog: false,
      })
      const sprite = new Sprite(material)
      sprite.renderOrder = -10
      this.root.add(sprite)
      const item: CloudSprite = { sprite, seed: this.random() * 1000 }
      this.cloudSprites.push(item)
      this.placeCloudSprite(item)
    }
  }

  private createBillboardPools() {
    ;(this.options.billboardPools ?? []).forEach((config) => {
      const texture = this.loadTexture(config.textureUrl)
      for (let index = 0; index < config.count; index += 1) {
        const material = new SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          fog: false,
          alphaTest: config.alphaTest ?? 0.03,
          opacity: randomBetween(
            clampOpacityRange(config.opacityRange),
            this.random,
          ),
        })
        const sprite = new Sprite(material)
        sprite.renderOrder = config.renderOrder ?? -4
        this.root.add(sprite)

        const item: BillboardItem = {
          sprite,
          config,
          seed: this.random() * 1000,
          baseX: 0,
          baseY: 0,
        }
        this.billboards.push(item)
        this.placeBillboard(item)
      }
    })
  }

  private updateCloudCover(delta: number, speed: number, distance: number) {
    const config = { ...DEFAULT_CLOUD_COVER, ...this.options.cloudCover }
    const movement = speed * delta

    if (this.cloudCoverMaterial?.map) {
      this.cloudCoverMaterial.map.offset.y -= delta * config.scrollSpeed * 0.012
    }

    this.cloudPlanes.forEach((cloud) => {
      cloud.mesh.position.z += movement * config.scrollSpeed
      cloud.mesh.position.x +=
        Math.sin(distance * 0.002 + cloud.initialZ) * delta * 0.32

      if (cloud.mesh.position.z > config.resetZ) {
        const furthestZ = this.cloudPlanes.reduce(
          (min, candidate) => Math.min(min, candidate.mesh.position.z),
          0,
        )
        cloud.mesh.position.z = furthestZ + config.spacingZ
        cloud.mesh.position.x = this.random() > 0.5 ? -18 : 18
        cloud.initialZ = cloud.mesh.position.z
      }
    })

    this.cloudSprites.forEach((cloud) => {
      cloud.sprite.position.z += movement * config.spriteParallax
      cloud.sprite.position.x +=
        Math.sin(distance * 0.004 + cloud.seed) * delta * 0.28
      if (cloud.sprite.position.z > config.resetZ) {
        cloud.sprite.position.z = randomBetween(
          config.spriteZRange,
          this.random,
        )
        cloud.sprite.position.x = randomBetween(
          config.spriteXRange,
          this.random,
        )
        cloud.sprite.position.y = randomBetween(
          config.spriteYRange,
          this.random,
        )
      }
    })
  }

  private updateBillboards(delta: number, speed: number, distance: number) {
    this.billboards.forEach((item) => {
      const parallax = item.config.parallax ?? 0.16
      item.sprite.position.z += speed * delta * parallax
      item.sprite.position.x =
        item.baseX +
        Math.sin(distance * 0.0025 + item.seed) * (item.config.driftX ?? 0)
      item.sprite.position.y =
        item.baseY +
        Math.sin(distance * 0.003 + item.seed * 1.7) * (item.config.driftY ?? 0)

      if (item.sprite.position.z > (item.config.resetZ ?? 60)) {
        this.placeBillboard(item)
      }
    })
  }

  private placeCloudSprite(item: CloudSprite) {
    const config = { ...DEFAULT_CLOUD_COVER, ...this.options.cloudCover }
    const scale = randomBetween(config.spriteScaleRange, this.random)
    item.sprite.position.set(
      randomBetween(config.spriteXRange, this.random),
      randomBetween(config.spriteYRange, this.random),
      randomBetween(config.spriteZRange, this.random),
    )
    item.sprite.scale.set(
      scale,
      scale * randomBetween([0.16, 0.34], this.random),
      1,
    )
    item.sprite.material.opacity = randomBetween(
      config.spriteOpacityRange,
      this.random,
    )
  }

  private placeBillboard(item: BillboardItem) {
    const { config, sprite } = item
    const x = this.pickBillboardX(config)
    const y = randomBetween(config.yRange, this.random)
    const z = randomBetween(config.zRange, this.random)
    const scale = randomBetween(config.scaleRange ?? [0.8, 1.2], this.random)
    const baseSize = config.baseSize ?? DEFAULT_BILLBOARD_BASE_SIZE

    item.baseX = x
    item.baseY = y
    item.seed = this.random() * 1000
    sprite.position.set(x, y, z)
    sprite.scale.set(baseSize[0] * scale, baseSize[1] * scale, 1)
    sprite.material.opacity = randomBetween(
      clampOpacityRange(config.opacityRange),
      this.random,
    )
  }

  private pickBillboardX(config: ScenicBillboardPoolConfig) {
    if (config.xRange) return randomBetween(config.xRange, this.random)

    const side = config.side ?? 'both'
    const range = getSideXRange(side)
    if (side === 'both') {
      return randomBetween(range, this.random) * (this.random() > 0.5 ? 1 : -1)
    }

    return randomBetween(range, this.random)
  }

  private loadTexture(url: string, repeat = false) {
    const texture = this.textureLoader.load(url)
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    if (repeat) {
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(1.8, 1.2)
    }
    return texture
  }

  private createFallbackCloudTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(255,255,255,0)')
      gradient.addColorStop(0.24, 'rgba(250,253,255,0.74)')
      gradient.addColorStop(0.62, 'rgba(218,241,252,0.88)')
      gradient.addColorStop(1, 'rgba(186,223,242,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 28; i += 1) {
        const x = this.random() * canvas.width
        const y = 40 + this.random() * 150
        const radius = 34 + this.random() * 72
        const cloud = context.createRadialGradient(x, y, 4, x, y, radius)
        cloud.addColorStop(0, 'rgba(255,255,255,0.76)')
        cloud.addColorStop(0.46, 'rgba(237,249,255,0.38)')
        cloud.addColorStop(1, 'rgba(237,249,255,0)')
        context.fillStyle = cloud
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    const texture = new CanvasTexture(canvas)
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1.5, 1)
    return texture
  }
}

export const createDefaultXianxiaScenicWorld = (
  textureLoader?: TextureLoader,
) =>
  new ScenicWorld({
    textureLoader,
    textureUrls: {
      skyPanorama:
        '/assets/xianxia/environment/cloudsea-perspective-panorama.png',
    },
    sky: {
      position: [0, 17, -250],
      width: 880,
      height: 495,
      sideWrapWidth: 0,
      lowerSkirt: {
        height: 0,
        yOffset: -305,
        opacity: 0,
      },
    },
    cloudCover: {
      planeCount: 0,
      opacity: 0,
      width: 360,
      depth: 210,
      y: -6.2,
      startZ: 48,
      spacingZ: -72,
      spriteCount: 26,
      spriteYRange: [-8.8, -5.8],
      spriteScaleRange: [18, 42],
      spriteOpacityRange: [0.025, 0.075],
    },
    billboardPools: [
      {
        id: 'near-floating-islands',
        textureUrl: '/assets/xianxia/environment/floating-island-cutout.png',
        count: 5,
        side: 'both',
        yRange: [8, 19],
        zRange: [-250, -112],
        baseSize: [30, 21],
        scaleRange: [0.66, 1.12],
        opacityRange: [0.5, 0.72],
        parallax: 0.16,
        driftX: 1.2,
        driftY: 0.3,
        resetZ: 54,
      },
      {
        id: 'sharp-side-peaks',
        textureUrl: '/assets/xianxia/environment/mountains/sharp-peak.png',
        count: 7,
        side: 'both',
        yRange: [4, 17],
        zRange: [-280, -122],
        baseSize: [14, 24],
        scaleRange: [0.64, 1.18],
        opacityRange: [0.42, 0.68],
        parallax: 0.13,
        driftX: 0.9,
        driftY: 0.18,
        resetZ: 48,
      },
      {
        id: 'pavilion-islands',
        textureUrl: '/assets/xianxia/environment/mountains/pavilion-island.png',
        count: 5,
        side: 'both',
        yRange: [10, 22],
        zRange: [-305, -135],
        baseSize: [22, 27],
        scaleRange: [0.62, 1.05],
        opacityRange: [0.38, 0.66],
        parallax: 0.11,
        driftX: 1,
        driftY: 0.28,
        resetZ: 46,
      },
      {
        id: 'waterfall-islands',
        textureUrl:
          '/assets/xianxia/environment/mountains/waterfall-island.png',
        count: 4,
        side: 'both',
        yRange: [9, 21],
        zRange: [-320, -150],
        baseSize: [19, 27],
        scaleRange: [0.62, 1.08],
        opacityRange: [0.36, 0.62],
        parallax: 0.1,
        driftX: 0.85,
        driftY: 0.32,
        resetZ: 44,
      },
      {
        id: 'thunder-islands',
        textureUrl: '/assets/xianxia/environment/mountains/thunder-island.png',
        count: 3,
        side: 'wide',
        yRange: [13, 29],
        zRange: [-340, -150],
        baseSize: [16, 25],
        scaleRange: [0.56, 0.92],
        opacityRange: [0.26, 0.5],
        parallax: 0.08,
        driftX: 0.55,
        driftY: 0.18,
        resetZ: 38,
        renderOrder: -8,
      },
      {
        id: 'center-mist-peaks',
        textureUrl: '/assets/xianxia/environment/mountains/pavilion-island.png',
        count: 3,
        xRange: [-26, 26],
        yRange: [22, 34],
        zRange: [-370, -210],
        baseSize: [34, 24],
        scaleRange: [0.45, 0.78],
        opacityRange: [0.18, 0.34],
        parallax: 0.045,
        driftX: 0.35,
        driftY: 0.12,
        resetZ: 38,
        renderOrder: -8,
      },
      {
        id: 'far-wide-mountains',
        textureUrl: '/assets/xianxia/environment/mountains/sharp-peak.png',
        count: 7,
        side: 'wide',
        yRange: [10, 26],
        zRange: [-360, -170],
        baseSize: [19, 32],
        scaleRange: [0.38, 0.72],
        opacityRange: [0.16, 0.36],
        parallax: 0.045,
        driftX: 0.32,
        resetZ: 34,
        renderOrder: -9,
      },
    ],
  })
