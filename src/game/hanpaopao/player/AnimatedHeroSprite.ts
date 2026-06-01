import type { Object3D, Texture } from 'three'
import {
  AdditiveBlending,
  Color,
  Group,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  sRGBEncoding,
} from 'three'

export const HERO_SPRITE_STATES = [
  'cruise',
  'leanLeft',
  'leanRight',
  'ascend',
  'descend',
  'dash',
  'hit',
] as const

export type HeroSpriteState = (typeof HERO_SPRITE_STATES)[number]

export type AtlasFrameOrigin = 'top-left' | 'bottom-left'

export interface HeroSpriteAtlasFrame {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly atlasWidth: number
  readonly atlasHeight: number
  readonly origin?: AtlasFrameOrigin
}

export interface HeroSpriteFrameConfig {
  readonly url: string
  readonly atlas?: HeroSpriteAtlasFrame
  readonly duration?: number
}

export type HeroSpriteFrameInput = string | HeroSpriteFrameConfig

export type HeroSpriteFrames = Partial<
  Record<HeroSpriteState, readonly HeroSpriteFrameInput[]>
>

export type HeroSpriteDurations = Partial<Record<HeroSpriteState, number>>

export interface AnimatedHeroSpriteConfig {
  readonly frames: HeroSpriteFrames
  readonly fallbackState?: HeroSpriteState
  readonly defaultFrameDuration?: number
  readonly stateFrameDurations?: HeroSpriteDurations
  readonly width?: number
  readonly height?: number
  readonly opacity?: number
  readonly alphaTest?: number
  readonly maxLeanRotation?: number
  readonly dashScale?: number
  readonly hitTint?: Color | string | number
  readonly renderOrder?: number
  readonly textureLoader?: TextureLoader
}

interface ResolvedHeroFrame {
  readonly texture: Texture
  readonly duration?: number
}

type ResolvedHeroFrames = Partial<Record<HeroSpriteState, ResolvedHeroFrame[]>>

const DEFAULT_FRAME_DURATION = 0.09
const DEFAULT_WIDTH = 2.45
const DEFAULT_HEIGHT = 2.95
const DEFAULT_DASH_SCALE = 1.08
const DEFAULT_MAX_LEAN_ROTATION = 0.24
const LEAN_STATE_THRESHOLD = 0.28

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const normalizeFrame = (frame: HeroSpriteFrameInput): HeroSpriteFrameConfig =>
  typeof frame === 'string' ? { url: frame } : frame

export default class AnimatedHeroSprite {
  private readonly object = new Group()

  private readonly material: SpriteMaterial

  private readonly sprite: Sprite

  private readonly trailMaterials: SpriteMaterial[] = []

  private readonly trailSprites: Sprite[] = []

  private readonly loader: TextureLoader

  private readonly frames: ResolvedHeroFrames = {}

  private readonly textureCache = new Map<string, Texture>()

  private readonly fallbackState: HeroSpriteState

  private readonly defaultFrameDuration: number

  private readonly stateFrameDurations: HeroSpriteDurations

  private readonly width: number

  private readonly height: number

  private readonly baseOpacity: number

  private readonly maxLeanRotation: number

  private readonly dashScale: number

  private readonly hitTint: Color

  private readonly whiteTint = new Color(0xffffff)

  private requestedState: HeroSpriteState

  private activeState: HeroSpriteState

  private frameIndex = 0

  private frameElapsed = 0

  private leanAmount = 0

  private verticalMotion = 0

  private speedIntensity = 0

  private visualLean = 0

  private visualVerticalMotion = 0

  private visualDash = 0

  private visualSpeed = 0

  private elapsed = 0

  private dashActive = false

  private hitFlashRemaining = 0

  constructor(config: AnimatedHeroSpriteConfig) {
    this.loader = config.textureLoader ?? new TextureLoader()
    this.fallbackState = config.fallbackState ?? 'cruise'
    this.defaultFrameDuration =
      config.defaultFrameDuration ?? DEFAULT_FRAME_DURATION
    this.stateFrameDurations = config.stateFrameDurations ?? {}
    this.width = config.width ?? DEFAULT_WIDTH
    this.height = config.height ?? DEFAULT_HEIGHT
    this.baseOpacity = config.opacity ?? 1
    this.maxLeanRotation = config.maxLeanRotation ?? DEFAULT_MAX_LEAN_ROTATION
    this.dashScale = config.dashScale ?? DEFAULT_DASH_SCALE
    this.hitTint = new Color(config.hitTint ?? 0xfff0d0)

    this.material = new SpriteMaterial({
      transparent: true,
      opacity: 0,
      alphaTest: config.alphaTest ?? 0.03,
      depthWrite: false,
      fog: false,
    })
    this.sprite = new Sprite(this.material)
    this.sprite.scale.set(this.width, this.height, 1)
    this.object.renderOrder = config.renderOrder ?? 20
    this.createTrailSprites()
    this.trailSprites.forEach((trail) => this.object.add(trail))
    this.object.add(this.sprite)

    this.resolveFrames(config.frames)

    this.requestedState = this.findInitialState()
    this.activeState = this.requestedState
    this.applyFrame(0)
    this.applyVisualModifiers()
  }

  setState(state: HeroSpriteState): void {
    this.requestedState = state
    this.syncVisualState(true)
  }

  update(delta: number): void {
    const dt = Math.max(0, delta)
    this.elapsed += dt
    this.hitFlashRemaining = Math.max(0, this.hitFlashRemaining - dt)
    this.visualLean +=
      (this.leanAmount - this.visualLean) * (1 - Math.exp(-dt * 13))
    this.visualVerticalMotion +=
      (this.verticalMotion - this.visualVerticalMotion) *
      (1 - Math.exp(-dt * 12))
    this.visualDash +=
      ((this.dashActive ? 1 : 0) - this.visualDash) * (1 - Math.exp(-dt * 16))
    this.visualSpeed +=
      (this.speedIntensity - this.visualSpeed) * (1 - Math.exp(-dt * 7))
    this.syncVisualState(false)

    const activeFrames = this.getFramesForState(this.activeState)
    if (activeFrames.length > 1) {
      this.frameElapsed += dt
      let frameDuration = this.getCurrentFrameDuration(activeFrames)
      while (this.frameElapsed >= frameDuration && frameDuration > 0) {
        this.frameElapsed -= frameDuration
        this.frameIndex = (this.frameIndex + 1) % activeFrames.length
        this.applyFrame(this.frameIndex)
        frameDuration = this.getCurrentFrameDuration(activeFrames)
      }
    }

    this.applyVisualModifiers()
  }

  setLean(amount: number): void {
    this.leanAmount = clamp(amount, -1, 1)
    this.syncVisualState(false)
    this.applyVisualModifiers()
  }

  setVerticalMotion(amount: number): void {
    this.verticalMotion = clamp(amount, -1, 1)
    this.applyVisualModifiers()
  }

  setSpeedIntensity(amount: number): void {
    this.speedIntensity = clamp(amount, 0, 1.6)
    this.applyVisualModifiers()
  }

  setDash(active: boolean): void {
    this.dashActive = active
    this.syncVisualState(true)
    this.applyVisualModifiers()
  }

  setHitFlash(time: number): void {
    this.hitFlashRemaining = Math.max(this.hitFlashRemaining, time)
    this.syncVisualState(true)
    this.applyVisualModifiers()
  }

  getObject3D(): Object3D {
    return this.object
  }

  dispose(): void {
    this.material.dispose()
    for (const texture of this.textureCache.values()) {
      texture.dispose()
    }
    for (const state of HERO_SPRITE_STATES) {
      for (const frame of this.frames[state] ?? []) {
        if (!this.textureCacheHasValue(frame.texture)) {
          frame.texture.dispose()
        }
      }
    }
  }

  private resolveFrames(sourceFrames: HeroSpriteFrames): void {
    for (const state of HERO_SPRITE_STATES) {
      const stateFrames = sourceFrames[state] ?? []
      if (stateFrames.length === 0) {
        continue
      }

      this.frames[state] = stateFrames.map((inputFrame) => {
        const frame = normalizeFrame(inputFrame)
        return {
          texture: this.createTexture(frame),
          duration: frame.duration,
        }
      })
    }
  }

  private createTrailSprites(): void {
    for (let index = 0; index < 3; index += 1) {
      const material = new SpriteMaterial({
        transparent: true,
        opacity: 0,
        alphaTest: 0.02,
        depthWrite: false,
        fog: false,
        blending: AdditiveBlending,
        color: index === 0 ? 0xcdfaff : 0x77eaff,
      })
      const trail = new Sprite(material)
      trail.renderOrder = this.object.renderOrder - 1 - index
      trail.visible = false
      this.trailMaterials.push(material)
      this.trailSprites.push(trail)
    }
  }

  private createTexture(frame: HeroSpriteFrameConfig): Texture {
    if (!frame.atlas) {
      return this.getBaseTexture(frame.url)
    }

    const texture = this.loader.load(frame.url)
    this.configureTexture(texture)
    const {
      x,
      y,
      width,
      height,
      atlasWidth,
      atlasHeight,
      origin = 'top-left',
    } = frame.atlas
    texture.repeat.set(width / atlasWidth, height / atlasHeight)
    texture.offset.set(
      x / atlasWidth,
      origin === 'top-left' ? 1 - (y + height) / atlasHeight : y / atlasHeight,
    )
    return texture
  }

  private getBaseTexture(url: string): Texture {
    const cachedTexture = this.textureCache.get(url)
    if (cachedTexture) {
      return cachedTexture
    }

    const texture = this.loader.load(url)
    this.configureTexture(texture)
    this.textureCache.set(url, texture)
    return texture
  }

  private configureTexture(texture: Texture): void {
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
  }

  private findInitialState(): HeroSpriteState {
    if (this.hasFrames(this.fallbackState)) {
      return this.fallbackState
    }

    return (
      HERO_SPRITE_STATES.find((state) => this.hasFrames(state)) ??
      this.fallbackState
    )
  }

  private syncVisualState(resetWhenChanged: boolean): void {
    const nextState = this.resolveVisualState()
    if (nextState === this.activeState) {
      return
    }

    this.activeState = nextState
    if (resetWhenChanged) {
      this.frameIndex = 0
      this.frameElapsed = 0
    } else {
      this.frameIndex =
        this.frameIndex %
        Math.max(1, this.getFramesForState(this.activeState).length)
    }
    this.applyFrame(this.frameIndex)
  }

  private resolveVisualState(): HeroSpriteState {
    if (this.hitFlashRemaining > 0 && this.hasFrames('hit')) {
      return 'hit'
    }
    if (this.dashActive && this.hasFrames('dash')) {
      return 'dash'
    }
    if (
      this.requestedState !== 'cruise' &&
      this.hasFrames(this.requestedState)
    ) {
      return this.requestedState
    }
    if (
      this.leanAmount <= -LEAN_STATE_THRESHOLD &&
      this.hasFrames('leanLeft')
    ) {
      return 'leanLeft'
    }
    if (
      this.leanAmount >= LEAN_STATE_THRESHOLD &&
      this.hasFrames('leanRight')
    ) {
      return 'leanRight'
    }
    if (this.hasFrames(this.requestedState)) {
      return this.requestedState
    }
    return this.findInitialState()
  }

  private applyFrame(index: number): void {
    const activeFrames = this.getFramesForState(this.activeState)
    if (activeFrames.length === 0) {
      this.material.map = null
      this.material.opacity = 0
      this.material.needsUpdate = true
      this.trailMaterials.forEach((material) => {
        material.map = null
        material.opacity = 0
        material.needsUpdate = true
      })
      return
    }

    const frame = activeFrames[index % activeFrames.length]
    if (this.material.map !== frame.texture) {
      this.material.map = frame.texture
      this.material.needsUpdate = true
      this.trailMaterials.forEach((material) => {
        material.map = frame.texture
        material.needsUpdate = true
      })
    }
    this.material.opacity = this.baseOpacity
  }

  private applyVisualModifiers(): void {
    const isFlashing = this.hitFlashRemaining > 0
    const flashPulse = isFlashing
      ? Math.sin(this.hitFlashRemaining * 48) * 0.5 + 0.5
      : 0
    const floatOffset = Math.sin(this.elapsed * 4.2) * 0.026
    this.sprite.position.set(
      -this.visualLean * 0.1,
      floatOffset + this.visualVerticalMotion * 0.09 - this.visualDash * 0.04,
      0,
    )
    this.sprite.scale.set(this.width, this.height, 1)
    this.material.rotation =
      -this.visualLean * this.maxLeanRotation +
      this.visualVerticalMotion * 0.032 +
      Math.sin(this.elapsed * 11) * this.visualDash * 0.01
    this.material.color.copy(
      isFlashing && flashPulse > 0.35 ? this.hitTint : this.whiteTint,
    )
    this.material.opacity = this.material.map
      ? this.baseOpacity * (isFlashing && flashPulse <= 0.35 ? 0.72 : 1)
      : 0
    this.updateTrails()
  }

  private updateTrails(): void {
    const opacityBase = this.material.map
      ? this.visualDash * 0.32 + Math.max(0, this.visualSpeed - 0.74) * 0.26
      : 0
    this.trailSprites.forEach((trail, index) => {
      const delay = index + 1
      const opacity = opacityBase * (0.62 / delay)
      trail.visible = opacity > 0.006
      trail.position.set(
        -this.visualLean * (0.2 + delay * 0.18),
        this.sprite.position.y - 0.06 * delay,
        -0.07 * delay,
      )
      trail.scale.set(this.width, this.height, 1)
      trail.material.rotation =
        this.material.rotation - this.visualLean * delay * 0.04
      trail.material.opacity = opacity
    })
  }

  private getFramesForState(
    state: HeroSpriteState,
  ): readonly ResolvedHeroFrame[] {
    return this.frames[state] ?? []
  }

  private getCurrentFrameDuration(
    activeFrames: readonly ResolvedHeroFrame[],
  ): number {
    const activeFrame = activeFrames[this.frameIndex % activeFrames.length]
    return (
      activeFrame.duration ??
      this.stateFrameDurations[this.activeState] ??
      this.defaultFrameDuration
    )
  }

  private hasFrames(state: HeroSpriteState): boolean {
    return (this.frames[state]?.length ?? 0) > 0
  }

  private textureCacheHasValue(texture: Texture): boolean {
    for (const cachedTexture of this.textureCache.values()) {
      if (cachedTexture === texture) {
        return true
      }
    }
    return false
  }
}
