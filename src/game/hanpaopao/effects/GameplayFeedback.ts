import type { Color, PerspectiveCamera } from 'three'
import {
  AdditiveBlending,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RingGeometry,
  Vector3,
} from 'three'

export interface FeedbackPosition {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type FeedbackColor = Color | string | number

export interface GameplayFeedbackOptions {
  pickupPoolSize?: number
  speedLineCount?: number
  hitFlashCount?: number
  dashTrailCount?: number
  reducedMotion?: boolean
}

interface BurstRing {
  readonly mesh: Mesh<RingGeometry, MeshBasicMaterial>
  active: boolean
  delay: number
  age: number
  duration: number
  startScale: number
  endScale: number
  startOpacity: number
  spin: number
}

interface SpeedLine {
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>
  readonly angle: number
  readonly sin: number
  readonly cos: number
  readonly width: number
  readonly length: number
  readonly radiusStart: number
  readonly radiusSpan: number
  readonly speed: number
  phase: number
}

interface DashTrail {
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>
  readonly baseX: number
  readonly baseY: number
  readonly width: number
  readonly height: number
  readonly phase: number
  readonly rotation: number
}

interface CameraState {
  camera: PerspectiveCamera | null
  baseFov: number
  lastShake: Vector3
}

const TAU = Math.PI * 2

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3

const makeAdditiveMaterial = (color: FeedbackColor, opacity = 0) =>
  new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: DoubleSide,
    fog: false,
  })

const DEFAULT_OPTIONS = {
  pickupPoolSize: 36,
  speedLineCount: 28,
  hitFlashCount: 2,
  dashTrailCount: 7,
}

export default class GameplayFeedback {
  private readonly root = new Group()

  private readonly worldBurstRoot = new Group()

  private readonly cameraRoot = new Group()

  private readonly speedLineRoot = new Group()

  private readonly dashTrailRoot = new Group()

  private readonly overlayRoot = new Group()

  private readonly burstRings: BurstRing[] = []

  private readonly speedLines: SpeedLine[] = []

  private readonly dashTrails: DashTrail[] = []

  private readonly hitFlashes: Mesh<PlaneGeometry, MeshBasicMaterial>[] = []

  private readonly ringGeometry = new RingGeometry(0.32, 0.48, 40)

  private readonly planeGeometry = new PlaneGeometry(1, 1)

  private readonly cameraState: CameraState = {
    camera: null,
    baseFov: 62,
    lastShake: new Vector3(),
  }

  private readonly forward = new Vector3()

  private readonly shakeOffset = new Vector3()

  private elapsed = 0

  private activeSpeedTarget = 0

  private activeSpeed = 0

  private dashTimer = 0

  private dashDuration = 0

  private fovPulse = 0

  private shakeTimer = 0

  private shakeDuration = 0

  private shakeAmplitude = 0

  private hitFlashOpacity = 0

  private pickupGlowOpacity = 0

  private nextBurstIndex = 0

  private reducedMotion = false

  constructor(options: GameplayFeedbackOptions = {}) {
    const pickupPoolSize =
      options.pickupPoolSize ?? DEFAULT_OPTIONS.pickupPoolSize
    const speedLineCount =
      options.speedLineCount ?? DEFAULT_OPTIONS.speedLineCount
    const hitFlashCount = options.hitFlashCount ?? DEFAULT_OPTIONS.hitFlashCount
    const dashTrailCount =
      options.dashTrailCount ?? DEFAULT_OPTIONS.dashTrailCount

    this.root.name = 'gameplay-feedback'
    this.worldBurstRoot.name = 'feedback-world-bursts'
    this.cameraRoot.name = 'feedback-camera-space'
    this.speedLineRoot.name = 'feedback-speed-lines'
    this.dashTrailRoot.name = 'feedback-dash-trail'
    this.overlayRoot.name = 'feedback-hit-flash'

    this.root.add(this.worldBurstRoot, this.cameraRoot)
    this.cameraRoot.add(
      this.speedLineRoot,
      this.dashTrailRoot,
      this.overlayRoot,
    )

    this.createBurstRingPool(pickupPoolSize)
    this.createSpeedLines(speedLineCount)
    this.createDashTrails(dashTrailCount)
    this.createHitFlashes(hitFlashCount)
    this.reducedMotion = options.reducedMotion ?? false

    this.speedLineRoot.visible = false
    this.dashTrailRoot.visible = false
    this.overlayRoot.visible = false
  }

  getRoot(): Group {
    return this.root
  }

  setActiveSpeed(speedRatio: number): void {
    this.activeSpeedTarget = this.reducedMotion ? 0 : clamp(speedRatio, 0, 1.8)
  }

  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion
    if (reducedMotion) {
      this.activeSpeedTarget = 0
      this.speedLineRoot.visible = false
      this.dashTrailRoot.visible = false
      this.overlayRoot.visible = false
      this.hitFlashOpacity = 0
      this.pickupGlowOpacity = 0
    }
  }

  triggerPickup(position: FeedbackPosition, color: FeedbackColor): void {
    if (this.reducedMotion) {
      this.activateBurst(position, color, 0, 0.42, 1.35, 0.34, 0.34, 0.35)
      return
    }
    this.pickupGlowOpacity = Math.max(this.pickupGlowOpacity, 0.12)
    this.fovPulse = Math.max(this.fovPulse, 1.4)
    this.activateBurst(position, color, 0, 0.52, 2.1, 0.58, 0.46, 0.9)
    this.activateBurst(position, 0xffffff, 0.045, 0.34, 1.35, 0.36, 0.34, -1.2)
  }

  triggerHit(position: FeedbackPosition): void {
    this.hitFlashOpacity = this.reducedMotion ? 0 : 0.42
    this.fovPulse = Math.max(this.fovPulse, this.reducedMotion ? 0.8 : 3.5)
    if (!this.reducedMotion) {
      this.startShake(0.34, 0.32)
    }
    this.activateBurst(position, 0xfff2f2, 0, 0.7, 2.7, 0.72, 0.38, 1.6)
    this.activateBurst(position, 0xff3d66, 0.06, 0.45, 3.25, 0.55, 0.46, -2.1)
  }

  triggerDash(seconds: number): void {
    if (seconds >= this.dashTimer) {
      this.dashDuration = Math.max(seconds, 0.001)
    }
    this.dashTimer = Math.max(this.dashTimer, seconds)
    this.fovPulse = Math.max(this.fovPulse, this.reducedMotion ? 1.4 : 7.8)
    if (!this.reducedMotion) {
      this.startShake(Math.min(0.22, seconds), 0.085)
    }
  }

  update(delta: number): void {
    const dt = Math.min(Math.max(delta, 0), 0.06)
    this.elapsed += dt

    this.activeSpeed +=
      (this.activeSpeedTarget - this.activeSpeed) * (1 - Math.exp(-dt * 8.5))
    this.dashTimer = Math.max(0, this.dashTimer - dt)
    this.fovPulse = Math.max(0, this.fovPulse - dt * 11.5)
    this.hitFlashOpacity = Math.max(0, this.hitFlashOpacity - dt * 2.8)
    this.pickupGlowOpacity = Math.max(0, this.pickupGlowOpacity - dt * 1.6)
    this.shakeTimer = Math.max(0, this.shakeTimer - dt)

    this.updateBursts(dt)
    this.updateSpeedLines(dt)
    this.updateDashTrails()
    this.updateHitFlashes()
  }

  applyCamera(camera: PerspectiveCamera): void {
    this.restoreLastShake(camera)
    this.applyFov(camera)
    this.applyShake(camera)
    this.placeCameraSpaceEffects(camera)
    this.faceWorldBursts(camera)
  }

  dispose(): void {
    this.ringGeometry.dispose()
    this.planeGeometry.dispose()
    this.burstRings.forEach((ring) => ring.mesh.material.dispose())
    this.speedLines.forEach((line) => line.mesh.material.dispose())
    this.dashTrails.forEach((trail) => trail.mesh.material.dispose())
    this.hitFlashes.forEach((flash) => flash.material.dispose())
  }

  private createBurstRingPool(poolSize: number): void {
    for (let i = 0; i < poolSize; i += 1) {
      const material = makeAdditiveMaterial(0xffffff, 0)
      const mesh = new Mesh(this.ringGeometry, material)
      mesh.visible = false
      mesh.frustumCulled = false
      mesh.renderOrder = 20
      this.worldBurstRoot.add(mesh)
      this.burstRings.push({
        mesh,
        active: false,
        delay: 0,
        age: 0,
        duration: 0.5,
        startScale: 0.5,
        endScale: 2,
        startOpacity: 0.5,
        spin: 0,
      })
    }
  }

  private createSpeedLines(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / Math.max(1, count)) * TAU + ((i * 1.618) % 0.85)
      const material = makeAdditiveMaterial(
        i % 4 === 0 ? 0xffffff : 0x8ff6ff,
        0,
      )
      const mesh = new Mesh(this.planeGeometry, material)
      mesh.frustumCulled = false
      mesh.renderOrder = 12
      this.speedLineRoot.add(mesh)
      this.speedLines.push({
        mesh,
        angle,
        sin: Math.sin(angle),
        cos: Math.cos(angle),
        width: 0.025 + (i % 5) * 0.009,
        length: 1.4 + (i % 7) * 0.22,
        radiusStart: 0.8 + (i % 9) * 0.08,
        radiusSpan: 4.8 + (i % 6) * 0.55,
        speed: 0.72 + (i % 8) * 0.11,
        phase: ((i * 37) % 100) / 100,
      })
    }
  }

  private createDashTrails(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const centered = i - (count - 1) / 2
      const material = makeAdditiveMaterial(
        i % 2 === 0 ? 0x8ff8ff : 0xd7fbff,
        0,
      )
      const mesh = new Mesh(this.planeGeometry, material)
      mesh.frustumCulled = false
      mesh.renderOrder = 14
      this.dashTrailRoot.add(mesh)
      this.dashTrails.push({
        mesh,
        baseX: centered * 0.24,
        baseY: -2.08 - Math.abs(centered) * 0.04,
        width: 0.08 + (i % 3) * 0.025,
        height: 3.5 + (i % 4) * 0.45,
        phase: i * 0.73,
        rotation: centered * 0.1,
      })
    }
  }

  private createHitFlashes(count: number): void {
    for (let i = 0; i < count; i += 1) {
      const material = makeAdditiveMaterial(i === 0 ? 0xff3155 : 0x8ff6ff, 0)
      const mesh = new Mesh(this.planeGeometry, material)
      mesh.frustumCulled = false
      mesh.renderOrder = 30 + i
      this.overlayRoot.add(mesh)
      this.hitFlashes.push(mesh)
    }
  }

  private activateBurst(
    position: FeedbackPosition,
    color: FeedbackColor,
    delay: number,
    startScale: number,
    endScale: number,
    startOpacity: number,
    duration: number,
    spin: number,
  ): void {
    const ring = this.burstRings[this.nextBurstIndex]
    this.nextBurstIndex = (this.nextBurstIndex + 1) % this.burstRings.length

    ring.active = true
    ring.delay = delay
    ring.age = 0
    ring.duration = Math.max(0.001, duration)
    ring.startScale = startScale
    ring.endScale = endScale
    ring.startOpacity = startOpacity
    ring.spin = spin
    ring.mesh.position.set(position.x, position.y, position.z)
    ring.mesh.scale.setScalar(startScale)
    ring.mesh.rotation.set(0, 0, 0)
    ring.mesh.material.color.set(color)
    ring.mesh.material.opacity = delay > 0 ? 0 : startOpacity
    ring.mesh.visible = delay <= 0
  }

  private updateBursts(delta: number): void {
    this.burstRings.forEach((ring) => {
      if (!ring.active) return

      if (ring.delay > 0) {
        ring.delay = Math.max(0, ring.delay - delta)
        if (ring.delay > 0) return
        ring.mesh.visible = true
      }

      ring.age += delta
      const progress = clamp(ring.age / ring.duration, 0, 1)
      const eased = easeOutCubic(progress)
      ring.mesh.scale.setScalar(
        ring.startScale + (ring.endScale - ring.startScale) * eased,
      )
      ring.mesh.rotation.z += ring.spin * delta
      ring.mesh.material.opacity = ring.startOpacity * (1 - progress) ** 1.35

      if (progress >= 1) {
        ring.active = false
        ring.mesh.visible = false
        ring.mesh.material.opacity = 0
      }
    })
  }

  private updateSpeedLines(delta: number): void {
    if (this.reducedMotion) {
      this.speedLineRoot.visible = false
      return
    }
    const dashRatio = this.getDashRatio()
    const intensity = clamp(
      Math.max((this.activeSpeed - 0.12) / 0.88, dashRatio),
      0,
      1,
    )
    this.speedLineRoot.visible = intensity > 0.025
    if (!this.speedLineRoot.visible) return

    this.speedLines.forEach((line) => {
      line.phase += delta * line.speed * (1.2 + intensity * 3.2)
      line.phase -= Math.floor(line.phase)

      const radiusProgress = line.phase * line.phase
      const radius = line.radiusStart + line.radiusSpan * radiusProgress
      const yScale = 0.64
      line.mesh.position.set(line.cos * radius, line.sin * radius * yScale, 0)
      line.mesh.rotation.z = line.angle - Math.PI / 2
      line.mesh.scale.set(
        line.width * (1 + intensity * 2.2),
        line.length * (0.62 + intensity * 1.1) * (0.78 + radiusProgress),
        1,
      )
      line.mesh.material.opacity = intensity * (0.025 + (1 - line.phase) * 0.13)
    })
  }

  private updateDashTrails(): void {
    if (this.reducedMotion) {
      this.dashTrailRoot.visible = false
      return
    }
    const dashRatio = this.getDashRatio()
    this.dashTrailRoot.visible = dashRatio > 0.01
    if (!this.dashTrailRoot.visible) return

    this.dashTrails.forEach((trail) => {
      const shimmer = 0.88 + Math.sin(this.elapsed * 18 + trail.phase) * 0.12
      trail.mesh.position.set(
        trail.baseX + Math.sin(this.elapsed * 12 + trail.phase) * 0.035,
        trail.baseY - dashRatio * 0.22,
        0,
      )
      trail.mesh.rotation.z = trail.rotation
      trail.mesh.scale.set(
        trail.width * (1 + dashRatio * 1.5),
        trail.height * (0.8 + dashRatio * 0.75),
        1,
      )
      trail.mesh.material.opacity = dashRatio * shimmer * 0.38
    })
  }

  private updateHitFlashes(): void {
    if (this.reducedMotion) {
      this.overlayRoot.visible = false
      return
    }
    const hasOverlay =
      this.hitFlashOpacity > 0.002 || this.pickupGlowOpacity > 0.002
    this.overlayRoot.visible = hasOverlay
    if (!hasOverlay) return

    const redFlash = this.hitFlashes[0]
    redFlash.material.opacity = this.hitFlashOpacity

    const cyanGlow = this.hitFlashes[1]
    cyanGlow.material.opacity = this.pickupGlowOpacity
  }

  private restoreLastShake(camera: PerspectiveCamera): void {
    if (this.cameraState.camera !== camera) {
      this.cameraState.camera = camera
      this.cameraState.baseFov = camera.fov
      this.cameraState.lastShake.set(0, 0, 0)
      return
    }

    if (this.cameraState.lastShake.lengthSq() > 0) {
      camera.position.sub(this.cameraState.lastShake)
      this.cameraState.lastShake.set(0, 0, 0)
    }
  }

  private applyFov(camera: PerspectiveCamera): void {
    const dashRatio = this.getDashRatio()
    const speedKick = clamp(this.activeSpeed - 0.45, 0, 1) * 2.4
    const targetFov =
      this.cameraState.baseFov + this.fovPulse + dashRatio * 5.6 + speedKick
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }
  }

  private applyShake(camera: PerspectiveCamera): void {
    if (this.shakeTimer <= 0 || this.shakeDuration <= 0) return

    const falloff = (this.shakeTimer / this.shakeDuration) ** 1.7
    const strength = this.shakeAmplitude * falloff
    this.shakeOffset.set(
      Math.sin(this.elapsed * 63.1) * strength,
      Math.cos(this.elapsed * 51.7) * strength * 0.72,
      0,
    )
    this.shakeOffset.applyQuaternion(camera.quaternion)
    camera.position.add(this.shakeOffset)
    this.cameraState.lastShake.copy(this.shakeOffset)
  }

  private placeCameraSpaceEffects(camera: PerspectiveCamera): void {
    camera.getWorldDirection(this.forward)

    const distance = 8.2
    this.cameraRoot.position
      .copy(camera.position)
      .addScaledVector(this.forward, distance)
    this.cameraRoot.quaternion.copy(camera.quaternion)
    this.speedLineRoot.position.set(0, 0, 0)
    this.dashTrailRoot.position.set(0, 0, 0.02)

    const overlayDistance = 0.34
    this.overlayRoot.position.set(0, 0, distance - overlayDistance)
    const overlayHeight =
      2 * overlayDistance * Math.tan((camera.fov * Math.PI) / 360)
    const overlayWidth = overlayHeight * camera.aspect
    this.hitFlashes.forEach((flash, index) => {
      const scale = index === 0 ? 1.18 : 0.86
      flash.scale.set(overlayWidth * scale, overlayHeight * scale, 1)
      flash.position.z = 0
    })
  }

  private faceWorldBursts(camera: PerspectiveCamera): void {
    this.burstRings.forEach((ring) => {
      if (!ring.mesh.visible) return
      ring.mesh.lookAt(camera.position)
    })
  }

  private getDashRatio(): number {
    if (this.dashTimer <= 0 || this.dashDuration <= 0) return 0
    return clamp(this.dashTimer / this.dashDuration, 0, 1)
  }

  private startShake(duration: number, amplitude: number): void {
    if (duration <= 0 || amplitude <= 0) return

    if (this.shakeTimer <= 0) {
      this.shakeTimer = duration
      this.shakeDuration = Math.max(duration, 0.001)
      this.shakeAmplitude = amplitude
      return
    }

    this.shakeTimer = Math.max(this.shakeTimer, duration)
    if (duration >= this.shakeDuration || amplitude >= this.shakeAmplitude) {
      this.shakeDuration = Math.max(duration, 0.001)
    }
    this.shakeAmplitude = Math.max(this.shakeAmplitude, amplitude)
  }
}
