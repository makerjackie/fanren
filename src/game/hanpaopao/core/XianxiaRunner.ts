import type { BufferGeometry, Object3D } from 'three'
import {
  AdditiveBlending,
  AmbientLight,
  Box3,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  LinearFilter,
  RepeatWrapping,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  sRGBEncoding,
  TextureLoader,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import type Hud from '../ui/Hud'
import ChasePressure from '../chase/ChasePressure'
import { SoundEffects } from '../audio'
import { GameplayFeedback } from '../effects'
import { AnimatedHeroSprite } from '../player'
import type { HeroSpriteFrameConfig, HeroSpriteState } from '../player'
import { createDefaultXianxiaScenicWorld } from '../world'
import {
  getCollectibleEffect,
  getComboMultiplier,
  getDifficultyProfile,
  getMagnetRadius,
  getMilestoneReward,
  getObstacleImpact,
  getPressureBand,
} from './gameRules'
import {
  readStoredBoolean,
  readStoredNumber,
  removeStoredKeys,
  writeStoredBoolean,
  writeStoredNumber,
} from './storage'
import {
  GAME_CONFIG,
  HEIGHT_LEVELS,
  LANES,
  clampHeight,
  clampLane,
} from '../config/gameConfig'
import type { HeightIndex, LaneIndex } from '../config/gameConfig'
import type {
  CollectibleEntity,
  CollectibleKind,
  GameSnapshot,
  GameState,
  ObstacleEntity,
  ObstacleKind,
  PlayerStats,
} from './types'

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min)
const choose = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)]
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const HERO_ATLAS_URL =
  '/assets/xianxia/characters/generated/atlas/hero-sword-atlas.png'
const HERO_ATLAS_FRAME_SIZE = 512
const HERO_ATLAS_WIDTH = 2048
const HERO_ATLAS_HEIGHT = 1024

const heroAtlasFrame = (
  column: number,
  row: number,
  duration?: number,
): HeroSpriteFrameConfig => ({
  url: HERO_ATLAS_URL,
  duration,
  atlas: {
    x: column * HERO_ATLAS_FRAME_SIZE,
    y: row * HERO_ATLAS_FRAME_SIZE,
    width: HERO_ATLAS_FRAME_SIZE,
    height: HERO_ATLAS_FRAME_SIZE,
    atlasWidth: HERO_ATLAS_WIDTH,
    atlasHeight: HERO_ATLAS_HEIGHT,
    origin: 'top-left',
  },
})

export default class XianxiaRunner {
  readonly scene = new Scene()

  readonly camera: PerspectiveCamera

  readonly renderer: WebGLRenderer

  private readonly hud: Hud

  private readonly chase = new ChasePressure()

  private readonly sound = new SoundEffects()

  private readonly eventCleanups: Array<() => void> = []

  private disposed = false

  private readonly clock = {
    last: performance.now(),
    getDelta: () => {
      const now = performance.now()
      const delta = Math.min(0.045, (now - this.clock.last) / 1000)
      this.clock.last = now
      return delta
    },
    reset: () => {
      this.clock.last = performance.now()
    },
  }

  private state: GameState = 'ready'

  private readonly player = new Group()

  private readonly sword = new Group()

  private shieldAura?: Sprite

  private readonly playerCollider = new Box3()

  private readonly tempBox = new Box3()

  private readonly tempVec = new Vector3()

  private readonly targetVec = new Vector3()

  private readonly trackSegments: Group[] = []

  private readonly clouds: Sprite[] = []

  private readonly islands: Group[] = []

  private readonly scenicSprites: Sprite[] = []

  private readonly obstacles: ObstacleEntity[] = []

  private readonly collectibles: CollectibleEntity[] = []

  private readonly hitEffects: Mesh[] = []

  private readonly seenPickupKinds = new Set<CollectibleKind>()

  private readonly pickupLabelMaterials = new Map<
    CollectibleKind,
    SpriteMaterial
  >()

  private readonly textureLoader = new TextureLoader()

  private readonly scenicWorld = createDefaultXianxiaScenicWorld(
    this.textureLoader,
  )

  private muted = readStoredBoolean(GAME_CONFIG.soundMutedKey, false)

  private reducedMotion = readStoredBoolean(
    GAME_CONFIG.reducedMotionKey,
    prefersReducedMotion(),
  )

  private readonly feedback = new GameplayFeedback({
    reducedMotion: this.reducedMotion,
  })

  private readonly animatedHero = new AnimatedHeroSprite({
    textureLoader: this.textureLoader,
    width: 5.55,
    height: 5.55,
    dashScale: 1,
    maxLeanRotation: 0.16,
    renderOrder: 4,
    defaultFrameDuration: 0.13,
    frames: {
      cruise: [heroAtlasFrame(0, 0), heroAtlasFrame(0, 0, 0.16)],
      leanLeft: [heroAtlasFrame(1, 0)],
      leanRight: [heroAtlasFrame(2, 0)],
      ascend: [heroAtlasFrame(3, 0)],
      descend: [heroAtlasFrame(0, 1)],
      dash: [heroAtlasFrame(1, 1)],
      hit: [heroAtlasFrame(2, 1)],
    },
  })

  private targetLane: LaneIndex = 2

  private targetHeight: HeightIndex = 1

  private speed = GAME_CONFIG.baseSpeed

  private obstacleMeter = 0

  private collectibleMeter = 0

  private graceTimer = GAME_CONFIG.startGraceSeconds

  private dashTimer = 0

  private boostTimer = 0

  private boostHeld = false

  private shieldTimer = 0

  private hitFlashTimer = 0

  private hitInvulnerabilityTimer = 0

  private dangerPromptCooldown = 0

  private pressureBand = 0

  private comboTimer = 0

  private nextMilestone = GAME_CONFIG.milestoneStep

  private gameOverReason = '幽影追上了剑光'

  private stats: PlayerStats = {
    hp: 100,
    qi: 100,
    distance: 0,
    spiritStones: 0,
    elixirs: 0,
    talismans: 0,
    swordEnergy: 0,
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    nearMisses: 0,
    rescueCount: 0,
  }

  private readonly geos = {
    stone: new BoxGeometry(2.15, 0.22, 4.8),
    laneLine: new BoxGeometry(0.08, 0.06, 5.2),
    spiritPath: new PlaneGeometry(15.4, 7.2),
    spiritLane: new PlaneGeometry(0.56, 6.9),
    spiritRail: new PlaneGeometry(0.08, 6.7),
    robe: new CylinderGeometry(0.42, 0.68, 1.7, 10),
    head: new SphereGeometry(0.28, 16, 12),
    hair: new BoxGeometry(0.24, 0.18, 0.42),
    swordBlade: new BoxGeometry(0.22, 0.08, 2.8),
    swordTip: new ConeGeometry(0.22, 0.75, 4),
    rock: new IcosahedronGeometry(1, 1),
    thunder: new CylinderGeometry(0.08, 0.08, 5.6, 8),
    orb: new SphereGeometry(0.82, 18, 12),
    gateRing: new TorusGeometry(1.1, 0.08, 8, 36),
    gateCore: new RingGeometry(0.55, 1.05, 32),
    broken: new BoxGeometry(2.2, 0.7, 3.8),
    crystal: new OctahedronGeometry(0.52, 0),
    elixir: new SphereGeometry(0.45, 16, 10),
    bottle: new CylinderGeometry(0.22, 0.32, 0.88, 12),
    talisman: new PlaneGeometry(0.75, 1.1),
    energy: new ConeGeometry(0.32, 1.5, 4),
    islandRock: new ConeGeometry(2.5, 5.2, 7),
    islandTop: new CylinderGeometry(2.1, 2.45, 0.35, 7),
    temple: new BoxGeometry(1.2, 0.9, 1.2),
    roof: new ConeGeometry(1.1, 0.55, 4),
    collider: new BoxGeometry(1, 1, 1),
    warningRing: new RingGeometry(1.08, 1.28, 40),
    laneWarning: new PlaneGeometry(2.28, 13.5),
    itemHalo: new RingGeometry(0.58, 0.76, 36),
  }

  private readonly textures = {
    cloudsea: this.loadTexture(
      '/assets/xianxia/environment/cloudsea-perspective-panorama.png',
    ),
    heroSword: this.loadTexture(
      '/assets/xianxia/characters/generated/hero-sword-cutout.png',
    ),
    floatingIsland: this.loadTexture(
      '/assets/xianxia/environment/floating-island-cutout.png',
    ),
    stonePath: this.loadTexture(
      '/assets/xianxia/textures/stone-path.png',
      true,
    ),
    spiritTrack: this.createSpiritTrackTexture(),
    spiritStone: this.loadTexture(
      '/assets/xianxia/items/gameplay/spirit-stone.png',
    ),
    elixirItem: this.loadTexture('/assets/xianxia/items/gameplay/elixir.png'),
    talismanItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/talisman.png',
    ),
    swordEnergyItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/sword-energy.png',
    ),
    thunderGateItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/thunder-gate.png',
    ),
    barrierGateItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/barrier-gate.png',
    ),
    brokenPlatformItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/broken-platform.png',
    ),
    demonOrbItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/demon-orb.png',
    ),
    floatingRockItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/floating-rock.png',
    ),
    shieldAuraItem: this.loadTexture(
      '/assets/xianxia/items/gameplay/shield-aura.png',
    ),
  }

  private readonly mats = {
    stone: new MeshStandardMaterial({
      color: 0xcdd4d4,
      map: this.textures.stonePath,
      roughness: 0.88,
      metalness: 0.03,
    }),
    stoneDark: new MeshStandardMaterial({
      color: 0xaeb8b8,
      map: this.textures.stonePath,
      roughness: 0.9,
      metalness: 0.02,
    }),
    laneLine: new MeshBasicMaterial({
      color: 0x7eeeff,
      transparent: true,
      opacity: 0.48,
    }),
    spiritPath: new MeshBasicMaterial({
      color: 0x3edcff,
      map: this.textures.spiritTrack,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    }),
    spiritLane: new MeshBasicMaterial({
      color: 0xbffbff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    }),
    spiritRail: new MeshBasicMaterial({
      color: 0x8cf7ff,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    }),
    panorama: new MeshBasicMaterial({
      map: this.textures.cloudsea,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      fog: false,
    }),
    heroSprite: new SpriteMaterial({
      map: this.textures.heroSword,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    islandSprite: new SpriteMaterial({
      map: this.textures.floatingIsland,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    spiritStoneSprite: new SpriteMaterial({
      map: this.textures.spiritStone,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    elixirSprite: new SpriteMaterial({
      map: this.textures.elixirItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    talismanSprite: new SpriteMaterial({
      map: this.textures.talismanItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    swordEnergySprite: new SpriteMaterial({
      map: this.textures.swordEnergyItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    thunderGateSprite: new SpriteMaterial({
      map: this.textures.thunderGateItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    barrierGateSprite: new SpriteMaterial({
      map: this.textures.barrierGateItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    brokenPlatformSprite: new SpriteMaterial({
      map: this.textures.brokenPlatformItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    demonOrbSprite: new SpriteMaterial({
      map: this.textures.demonOrbItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    floatingRockSprite: new SpriteMaterial({
      map: this.textures.floatingRockItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    shieldAuraSprite: new SpriteMaterial({
      map: this.textures.shieldAuraItem,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.03,
    }),
    robe: new MeshStandardMaterial({
      color: 0x0e7d84,
      roughness: 0.72,
      metalness: 0.04,
    }),
    robeLight: new MeshStandardMaterial({ color: 0xe9f7ef, roughness: 0.65 }),
    skin: new MeshStandardMaterial({ color: 0xf0cfb2, roughness: 0.7 }),
    hair: new MeshStandardMaterial({ color: 0x141419, roughness: 0.88 }),
    sword: new MeshStandardMaterial({
      color: 0xb7f8ff,
      emissive: 0x38d9ff,
      emissiveIntensity: 0.9,
      metalness: 0.65,
      roughness: 0.24,
    }),
    swordGlow: new MeshBasicMaterial({
      color: 0x66eaff,
      transparent: true,
      opacity: 0.28,
    }),
    rock: new MeshStandardMaterial({ color: 0x53616b, roughness: 0.95 }),
    rockRune: new MeshBasicMaterial({
      color: 0x8f65ff,
      transparent: true,
      opacity: 0.7,
    }),
    thunder: new MeshBasicMaterial({
      color: 0xb15cff,
      transparent: true,
      opacity: 0.86,
    }),
    orb: new MeshBasicMaterial({
      color: 0x50206f,
      transparent: true,
      opacity: 0.78,
    }),
    barrier: new MeshBasicMaterial({
      color: 0xc686ff,
      transparent: true,
      opacity: 0.46,
      side: DoubleSide,
    }),
    broken: new MeshStandardMaterial({ color: 0x564f4b, roughness: 0.9 }),
    crystal: new MeshStandardMaterial({
      color: 0x49eaff,
      emissive: 0x0087ff,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.18,
    }),
    elixir: new MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0x8a5a00,
      emissiveIntensity: 0.35,
      roughness: 0.32,
    }),
    talisman: new MeshBasicMaterial({
      color: 0xffe08a,
      side: DoubleSide,
      transparent: true,
      opacity: 0.95,
    }),
    energy: new MeshBasicMaterial({
      color: 0x8ff8ff,
      transparent: true,
      opacity: 0.88,
    }),
    grass: new MeshLambertMaterial({ color: 0x405d48 }),
    island: new MeshLambertMaterial({ color: 0x344954 }),
    temple: new MeshLambertMaterial({ color: 0xdbc48f }),
    roof: new MeshLambertMaterial({ color: 0x3d9a92 }),
    waterfall: new MeshBasicMaterial({
      color: 0x9ceeff,
      transparent: true,
      opacity: 0.38,
      side: DoubleSide,
    }),
    hit: new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      side: DoubleSide,
    }),
    collider: new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    obstacleWarning: new MeshBasicMaterial({
      color: 0xff54d9,
      transparent: true,
      opacity: 0.58,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    laneDanger: new MeshBasicMaterial({
      color: 0xff3fa6,
      transparent: true,
      opacity: 0.34,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    itemHalo: new MeshBasicMaterial({
      color: 0x8ff8ff,
      transparent: true,
      opacity: 0.38,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  }

  constructor(canvas: HTMLCanvasElement, hud: Hud) {
    this.hud = hud
    this.sound.setMuted(this.muted)
    this.feedback.setReducedMotion(this.reducedMotion)
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      precision: 'mediump',
    })
    const { width, height } = this.getViewportSize()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    this.renderer.setSize(width, height, false)

    this.camera = new PerspectiveCamera(62, width / height, 0.1, 420)
    this.camera.position.set(0, 5.4, 13)
    this.camera.lookAt(0, 2.1, -12)

    this.initializeScene()
    this.scene.add(this.scenicWorld.getRoot(), this.feedback.getRoot())
    this.createWorld()
    this.createPlayer()
    this.createObstaclePool()
    this.createCollectiblePool()
    this.createHitEffects()
    this.bindEvents()
    this.resize()
    this.hud.hideHud()
    this.hud.update(this.snapshot)
  }

  get snapshot(): GameSnapshot {
    return {
      ...this.stats,
      chasePressure: this.chase.value,
      bestDistance: readStoredNumber(GAME_CONFIG.bestDistanceKey, 0),
      bestScore: readStoredNumber(GAME_CONFIG.bestScoreKey, 0),
      nextMilestone: this.nextMilestone,
      shieldSeconds: this.shieldTimer,
      dashSeconds: this.dashTimer,
      boostSeconds: this.isBoosting() ? Math.max(this.boostTimer, 0.4) : 0,
      gameOverReason: this.gameOverReason,
      muted: this.muted,
      reducedMotion: this.reducedMotion,
      paused: this.state === 'paused',
      over: this.state === 'over',
    }
  }

  getDebugState() {
    return {
      state: this.state,
      targetLane: this.targetLane,
      targetHeight: this.targetHeight,
      score: this.stats.score,
      combo: this.stats.combo,
      nextMilestone: this.nextMilestone,
      player: {
        x: this.player.position.x,
        y: this.player.position.y,
      },
      nearestObstacles: this.obstacles
        .filter((obstacle) => obstacle.active && obstacle.group.position.z < 4)
        .sort((a, b) => b.group.position.z - a.group.position.z)
        .slice(0, 6)
        .map((obstacle) => ({
          kind: obstacle.kind,
          lane: obstacle.lane,
          level: obstacle.level,
          z: obstacle.group.position.z,
        })),
    }
  }

  start() {
    this.reset()
    this.state = 'running'
    this.sound.playStart()
    this.sound.setRunning(true)
    this.hud.hideGameOver()
    this.hud.hidePause()
    this.hud.showHud()
    this.hud.announce('紫色光带是危险航道，收集道具甩开追杀')
    this.clock.reset()
  }

  restart() {
    this.start()
  }

  pause() {
    if (this.state !== 'running') return
    this.state = 'paused'
    this.boostHeld = false
    this.sound.setRunning(false)
    this.saveBestDistance()
    this.hud.showPause()
  }

  resume() {
    if (this.state !== 'paused') return
    this.state = 'running'
    this.sound.setRunning(true)
    this.clock.reset()
    this.hud.hidePause()
  }

  togglePause() {
    if (this.state === 'running') {
      this.pause()
    } else if (this.state === 'paused') {
      this.resume()
    }
  }

  moveLeft() {
    if (this.state !== 'running') return
    const previous = this.targetLane
    this.targetLane = clampLane(this.targetLane - 1)
    if (this.targetLane !== previous) this.sound.playMove(false)
  }

  moveRight() {
    if (this.state !== 'running') return
    const previous = this.targetLane
    this.targetLane = clampLane(this.targetLane + 1)
    if (this.targetLane !== previous) this.sound.playMove(false)
  }

  moveUp() {
    if (this.state !== 'running') return
    const previous = this.targetHeight
    this.targetHeight = clampHeight(this.targetHeight + 1)
    if (this.targetHeight !== previous) this.sound.playMove(true)
  }

  moveDown() {
    if (this.state !== 'running') return
    const previous = this.targetHeight
    this.targetHeight = clampHeight(this.targetHeight - 1)
    if (this.targetHeight !== previous) this.sound.playMove(true)
  }

  dash() {
    if (this.state !== 'running' || this.dashTimer > 0.1) return
    if (this.stats.qi < 8) {
      this.hud.announce('灵力不足')
      return
    }
    this.stats.qi = Math.max(0, this.stats.qi - 8)
    this.dashTimer = GAME_CONFIG.dashDuration
    this.chase.reduce(8)
    this.feedback.triggerDash(GAME_CONFIG.dashDuration)
    this.sound.playDash()
    this.hud.announce('冲刺：消耗灵力，追杀下降')
  }

  boostFor(seconds = 2.4) {
    if (this.state !== 'running') return
    this.boostTimer = Math.max(this.boostTimer, seconds)
  }

  setBoostHeld(isHeld: boolean) {
    if (isHeld && !this.boostHeld && this.state === 'running') {
      this.sound.playBoostStart()
    }
    this.boostHeld = isHeld
  }

  toggleMuted() {
    this.muted = !this.muted
    writeStoredBoolean(GAME_CONFIG.soundMutedKey, this.muted)
    this.sound.setMuted(this.muted)
    this.hud.update(this.snapshot)
    this.hud.announce(this.muted ? '音效已关闭' : '音效已开启')
  }

  toggleReducedMotion() {
    this.reducedMotion = !this.reducedMotion
    writeStoredBoolean(GAME_CONFIG.reducedMotionKey, this.reducedMotion)
    this.feedback.setReducedMotion(this.reducedMotion)
    this.hud.update(this.snapshot)
    this.hud.announce(this.reducedMotion ? '动态效果已降低' : '动态效果已恢复')
  }

  resetRecords() {
    removeStoredKeys([GAME_CONFIG.bestDistanceKey, GAME_CONFIG.bestScoreKey])
    this.hud.update(this.snapshot)
    this.hud.announce('最高纪录已清除')
  }

  update() {
    if (this.disposed) return

    const delta = this.clock.getDelta()
    if (this.state === 'running') {
      this.updateRunning(delta)
    } else {
      this.animateIdle(delta)
    }
    this.feedback.update(delta)
    this.feedback.applyCamera(this.camera)
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const { width, height } = this.getViewportSize()
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    this.renderer.setSize(width, height, false)
  }

  destroy() {
    if (this.disposed) return

    this.disposed = true
    this.state = 'paused'
    this.boostHeld = false
    this.eventCleanups.splice(0).forEach((cleanup) => cleanup())
    this.sound.dispose()
    this.disposeSceneResources()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  private getViewportSize() {
    const canvas = this.renderer.domElement
    const host = canvas.parentElement ?? canvas
    const rect = host.getBoundingClientRect()

    return {
      width: Math.max(1, Math.floor(rect.width || window.innerWidth)),
      height: Math.max(1, Math.floor(rect.height || window.innerHeight)),
    }
  }

  private bindEvent(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) {
    target.addEventListener(type, listener)
    this.eventCleanups.push(() => target.removeEventListener(type, listener))
  }

  private disposeSceneResources() {
    const geometries = new Set<{ dispose: () => void }>()
    const materials = new Set<{
      dispose: () => void
      map?: { dispose: () => void } | null
    }>()

    this.scene.traverse((object) => {
      if (object instanceof Mesh) {
        geometries.add(object.geometry)
        const materialsForMesh = Array.isArray(object.material)
          ? object.material
          : [object.material]
        materialsForMesh.forEach((material) => materials.add(material))
      }

      if (object instanceof Sprite) {
        materials.add(object.material)
      }
    })

    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => {
      material.map?.dispose()
      material.dispose()
    })
  }

  private loadTexture(path: string, repeat = false) {
    const texture = this.textureLoader.load(path)
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    if (repeat) {
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(1.35, 2.4)
    }
    return texture
  }

  private createSpiritTrackTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerGlow = ctx.createLinearGradient(0, 0, canvas.width, 0)
      centerGlow.addColorStop(0, 'rgba(54, 211, 255, 0)')
      centerGlow.addColorStop(0.5, 'rgba(153, 247, 255, 0.22)')
      centerGlow.addColorStop(1, 'rgba(54, 211, 255, 0)')
      ctx.fillStyle = centerGlow
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(190, 255, 255, 0.38)'
      ctx.lineWidth = 4
      for (let x = 84; x <= 428; x += 86) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(76, 224, 255, 0.22)'
      ctx.lineWidth = 2
      for (let y = -80; y < canvas.height + 80; y += 64) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y + 38)
        ctx.stroke()
      }

      for (let i = 0; i < 34; i += 1) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = 14 + Math.random() * 34
        const spark = ctx.createRadialGradient(x, y, 0, x, y, radius)
        spark.addColorStop(0, 'rgba(255, 255, 255, 0.18)')
        spark.addColorStop(1, 'rgba(80, 219, 255, 0)')
        ctx.fillStyle = spark
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }
    }

    const texture = new CanvasTexture(canvas)
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1.9)
    return texture
  }

  private initializeScene() {
    this.scene.background = new Color(0xb8e2f6)
    this.scene.fog = new FogExp2(0xcfeaf5, 0.012)

    const hemi = new HemisphereLight(0xeafaff, 0x5b6770, 2.8)
    this.scene.add(hemi)

    const ambient = new AmbientLight(0xb9d4ff, 0.9)
    this.scene.add(ambient)

    const sun = new DirectionalLight(0xfff2cc, 2.8)
    sun.position.set(-14, 24, 16)
    this.scene.add(sun)

    const rim = new DirectionalLight(0x8dcaff, 1.1)
    rim.position.set(12, 8, -24)
    this.scene.add(rim)
  }

  private createWorld() {
    this.createTrackSegments()
  }

  private createPanorama() {
    const plane = new Mesh(new PlaneGeometry(520, 360), this.mats.panorama)
    plane.position.set(0, 34, -220)
    this.scene.add(plane)
  }

  private createTrackSegments() {
    for (let i = 0; i < 22; i += 1) {
      const segment = new Group()
      segment.position.z = -i * 7.2

      const path = new Mesh(this.geos.spiritPath, this.mats.spiritPath)
      path.rotation.x = -Math.PI / 2
      path.position.y = 0.02
      path.renderOrder = -2
      segment.add(path)

      LANES.forEach((x, laneIndex) => {
        const lane = new Mesh(this.geos.spiritLane, this.mats.spiritLane)
        lane.rotation.x = -Math.PI / 2
        lane.position.set(x, 0.08, 0)
        lane.renderOrder = -1
        segment.add(lane)

        if (laneIndex < LANES.length - 1) {
          const rail = new Mesh(this.geos.spiritRail, this.mats.spiritRail)
          rail.rotation.x = -Math.PI / 2
          rail.position.set((x + LANES[laneIndex + 1]) / 2, 0.12, 0)
          rail.renderOrder = 0
          segment.add(rail)
        }
      })

      this.scene.add(segment)
      this.trackSegments.push(segment)
    }
  }

  private createSmallArch() {
    const arch = new Group()
    const postGeo = new CylinderGeometry(0.1, 0.14, 1.3, 6)
    const material = new MeshLambertMaterial({ color: 0xb9a37a })
    const left = new Mesh(postGeo, material)
    const right = new Mesh(postGeo, material)
    const top = new Mesh(new BoxGeometry(1.25, 0.12, 0.12), material)
    left.position.set(-0.55, 0.65, 0)
    right.position.set(0.55, 0.65, 0)
    top.position.set(0, 1.3, 0)
    arch.add(left, right, top)
    return arch
  }

  private createCloudSea() {
    const texture = this.createCloudTexture()
    for (let i = 0; i < 96; i += 1) {
      const sprite = new Sprite(
        new SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: randomBetween(0.04, 0.12),
          depthWrite: false,
        }),
      )
      sprite.position.set(
        randomBetween(-90, 90),
        randomBetween(-7.6, -4.4),
        randomBetween(-210, 42),
      )
      const scale = randomBetween(18, 42)
      sprite.scale.set(scale, scale * randomBetween(0.16, 0.28), 1)
      this.scene.add(sprite)
      this.clouds.push(sprite)
    }
  }

  private createCloudTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const gradient = ctx.createRadialGradient(128, 70, 8, 128, 70, 118)
    gradient.addColorStop(0, 'rgba(255,255,255,0.92)')
    gradient.addColorStop(0.48, 'rgba(232,247,255,0.55)')
    gradient.addColorStop(1, 'rgba(232,247,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return new CanvasTexture(canvas)
  }

  private createFloatingIslands() {
    // Imagegen billboards carry the main vista; low-poly islands stay disabled as a fallback.
    const lowPolyIslandCount = 0
    for (let i = 0; i < lowPolyIslandCount; i += 1) {
      const island = new Group()
      const rock = new Mesh(this.geos.islandRock, this.mats.island)
      rock.rotation.z = Math.PI
      rock.position.y = -1.9
      const top = new Mesh(this.geos.islandTop, this.mats.grass)
      top.position.y = 0.75
      island.add(rock, top)

      if (i % 3 === 0) {
        const temple = new Mesh(this.geos.temple, this.mats.temple)
        temple.position.set(0, 1.55, 0)
        const roof = new Mesh(this.geos.roof, this.mats.roof)
        roof.position.set(0, 2.25, 0)
        roof.rotation.y = Math.PI / 4
        island.add(temple, roof)
      }

      if (i % 4 === 0) {
        const waterfall = new Mesh(
          new PlaneGeometry(0.8, 5),
          this.mats.waterfall,
        )
        waterfall.position.set(1.3, -2.1, 0.15)
        waterfall.rotation.x = -0.2
        island.add(waterfall)
      }

      const side = i % 2 === 0 ? -1 : 1
      island.position.set(
        side * randomBetween(26, 62),
        randomBetween(3.5, 12),
        randomBetween(-220, -58),
      )
      island.scale.setScalar(randomBetween(0.85, 2.15))
      island.rotation.y = randomBetween(0, Math.PI * 2)
      this.scene.add(island)
      this.islands.push(island)
    }

    for (let i = 0; i < 10; i += 1) {
      const material = this.mats.islandSprite.clone()
      material.opacity = randomBetween(0.52, 0.9)
      const sprite = new Sprite(material)
      const side = i % 3 === 0 ? 0 : i % 2 === 0 ? -1 : 1
      const distanceScale = randomBetween(0.55, 1.45)
      sprite.position.set(
        side === 0 ? randomBetween(-8, 8) : side * randomBetween(24, 58),
        randomBetween(7, 20),
        randomBetween(-205, -75),
      )
      sprite.scale.set(28 * distanceScale, 19 * distanceScale, 1)
      this.scene.add(sprite)
      this.scenicSprites.push(sprite)
    }
  }

  private createPlayer() {
    const robe = new Mesh(this.geos.robe, this.mats.robe)
    robe.position.y = 0.9
    const inner = new Mesh(
      new CylinderGeometry(0.24, 0.38, 1.45, 8),
      this.mats.robeLight,
    )
    inner.position.set(0, 0.92, -0.04)
    inner.scale.x = 0.72
    const head = new Mesh(this.geos.head, this.mats.skin)
    head.position.y = 1.95
    const hair = new Mesh(this.geos.hair, this.mats.hair)
    hair.position.set(0, 2.05, 0.14)
    hair.scale.set(1.1, 1.1, 1.25)

    const sleeveGeo = new BoxGeometry(0.22, 1.05, 0.22)
    const leftSleeve = new Mesh(sleeveGeo, this.mats.robe)
    const rightSleeve = new Mesh(sleeveGeo, this.mats.robe)
    leftSleeve.position.set(-0.56, 1.1, 0)
    rightSleeve.position.set(0.56, 1.1, 0)
    leftSleeve.rotation.z = -0.24
    rightSleeve.rotation.z = 0.24

    this.player.add(robe, inner, head, hair, leftSleeve, rightSleeve)
    this.player.position.set(
      LANES[this.targetLane],
      HEIGHT_LEVELS[this.targetHeight],
      0,
    )
    this.scene.add(this.player)

    const blade = new Mesh(this.geos.swordBlade, this.mats.sword)
    blade.position.set(0, -0.35, -0.25)
    blade.rotation.x = Math.PI / 2
    const tip = new Mesh(this.geos.swordTip, this.mats.sword)
    tip.position.set(0, -0.35, -1.85)
    tip.rotation.x = -Math.PI / 2
    const glow = new Mesh(new PlaneGeometry(1.6, 5.4), this.mats.swordGlow)
    glow.position.set(0, -0.42, -0.5)
    glow.rotation.x = -Math.PI / 2
    this.sword.add(blade, tip, glow)
    this.sword.visible = false
    this.player.add(this.sword)

    this.shieldAura = this.createGameplaySprite(
      this.mats.shieldAuraSprite,
      5.35,
      5.35,
    )
    this.shieldAura.position.set(0, 1.18, -0.18)
    this.shieldAura.renderOrder = 3
    this.shieldAura.visible = false
    this.player.add(this.shieldAura)

    const heroObject = this.animatedHero.getObject3D()
    heroObject.position.set(0, 1.25, -0.08)
    this.player.add(heroObject)
    ;[robe, inner, head, hair, leftSleeve, rightSleeve].forEach((mesh) => {
      mesh.visible = false
    })
  }

  private createObstaclePool() {
    for (let i = 0; i < 34; i += 1) {
      const group = new Group()
      group.visible = false
      this.scene.add(group)
      this.obstacles.push({
        id: i,
        kind: 'floating-rock',
        group,
        colliders: [],
        box: new Box3(),
        active: false,
        lane: 2,
        level: 1,
        penalty: 12,
        large: false,
        spin: randomBetween(-1.2, 1.2),
        warned: false,
        passed: false,
      })
    }
  }

  private createCollectiblePool() {
    for (let i = 0; i < 96; i += 1) {
      const object = new Group()
      object.visible = false
      this.scene.add(object)
      this.collectibles.push({
        id: i,
        kind: 'spirit-stone',
        object,
        box: new Box3(),
        active: false,
        spin: randomBetween(1.6, 3.2),
      })
    }
  }

  private createHitEffects() {
    for (let i = 0; i < 8; i += 1) {
      const ring = new Mesh(new RingGeometry(0.7, 1.35, 32), this.mats.hit)
      ring.visible = false
      ring.rotation.x = -Math.PI / 2
      this.scene.add(ring)
      this.hitEffects.push(ring)
    }
  }

  private createGameplaySprite(
    material: SpriteMaterial,
    width: number,
    height: number,
  ) {
    const sprite = new Sprite(material.clone())
    sprite.scale.set(width, height, 1)
    sprite.renderOrder = 5
    sprite.frustumCulled = false
    return sprite
  }

  private createCollectibleSprite(kind: CollectibleKind) {
    if (kind === 'elixir') {
      return this.createGameplaySprite(this.mats.elixirSprite, 1.62, 1.62)
    }
    if (kind === 'talisman') {
      return this.createGameplaySprite(this.mats.talismanSprite, 1.66, 1.66)
    }
    if (kind === 'sword-energy') {
      return this.createGameplaySprite(this.mats.swordEnergySprite, 1.66, 1.66)
    }
    return this.createGameplaySprite(this.mats.spiritStoneSprite, 1.48, 1.48)
  }

  private createInvisibleCollider(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z = 0,
  ) {
    const collider = new Mesh(this.geos.collider, this.mats.collider)
    collider.position.set(x, y, z)
    collider.scale.set(width, height, depth)
    collider.visible = false
    return collider
  }

  private createObstacleHalo(
    width: number,
    height: number,
    x: number,
    y: number,
  ) {
    const halo = new Mesh(this.geos.warningRing, this.mats.obstacleWarning)
    halo.name = 'obstacle-halo'
    halo.position.set(x, y, -0.36)
    halo.scale.set(width, height, 1)
    halo.renderOrder = 3
    return halo
  }

  private createLaneWarning(x: number, y: number, width = 1) {
    const warning = new Mesh(
      this.geos.laneWarning,
      this.mats.laneDanger.clone(),
    )
    warning.name = 'lane-warning'
    warning.position.set(x, y, 5.4)
    warning.rotation.x = -Math.PI / 2
    warning.scale.x = width
    warning.userData.baseScaleX = width
    warning.renderOrder = 2
    return warning
  }

  private createCollectibleHalo(kind: CollectibleKind) {
    const material = this.mats.itemHalo.clone()
    material.color.setHex(this.getCollectibleFeedbackColor(kind))
    const halo = new Mesh(this.geos.itemHalo, material)
    halo.name = 'collectible-glow'
    halo.position.y = 0.08
    halo.renderOrder = 4
    return halo
  }

  private createPickupLabel(kind: CollectibleKind) {
    const label = new Sprite(this.getPickupLabelMaterial(kind).clone())
    label.name = 'collectible-label'
    label.position.set(0, 1.14, 0.02)
    label.scale.set(1.9, 0.72, 1)
    label.renderOrder = 6
    return label
  }

  private getPickupLabelMaterial(kind: CollectibleKind) {
    const cached = this.pickupLabelMaterials.get(kind)
    if (cached) return cached

    const label = this.getPickupLabelText(kind)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(5, 12, 20, 0.72)'
      ctx.beginPath()
      ctx.moveTo(24, 18)
      ctx.lineTo(232, 18)
      ctx.quadraticCurveTo(246, 18, 246, 32)
      ctx.lineTo(246, 64)
      ctx.quadraticCurveTo(246, 78, 232, 78)
      ctx.lineTo(24, 78)
      ctx.quadraticCurveTo(10, 78, 10, 64)
      ctx.lineTo(10, 32)
      ctx.quadraticCurveTo(10, 18, 24, 18)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = label.border
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.fillStyle = label.color
      ctx.font = '700 32px "Songti SC", "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label.text, 128, 49)
    }
    const texture = new CanvasTexture(canvas)
    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      fog: false,
      alphaTest: 0.02,
    })
    this.pickupLabelMaterials.set(kind, material)
    return material
  }

  private getPickupLabelText(kind: CollectibleKind) {
    if (kind === 'elixir')
      return {
        text: '回灵降压',
        color: '#ffdf86',
        border: 'rgba(245, 189, 85, 0.8)',
      }
    if (kind === 'talisman')
      return {
        text: '护盾清障',
        color: '#fff1a8',
        border: 'rgba(255, 224, 138, 0.82)',
      }
    if (kind === 'sword-energy')
      return {
        text: '免费冲刺',
        color: '#a8fbff',
        border: 'rgba(98, 227, 255, 0.82)',
      }
    return {
      text: '补充灵力',
      color: '#bffbff',
      border: 'rgba(98, 227, 255, 0.72)',
    }
  }

  private getCollectibleFeedbackColor(kind: CollectibleKind) {
    if (kind === 'elixir') return 0xffd166
    if (kind === 'talisman') return 0xffe08a
    if (kind === 'sword-energy') return 0x8ff8ff
    return 0x49eaff
  }

  private bindEvents() {
    this.bindEvent(window, 'resize', () => this.resize())
    this.bindEvent(window, 'blur', () => {
      this.setBoostHeld(false)
      if (this.state === 'running') this.pause()
    })
    this.bindEvent(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.setBoostHeld(false)
        if (this.state === 'running') this.pause()
      } else {
        this.clock.reset()
      }
    })
    this.bindEvent(window, 'keydown', (event) => {
      const keyboardEvent = event as KeyboardEvent
      const target = event.target as HTMLElement | null
      const isFormTarget = target?.closest(
        'button, input, textarea, select, [contenteditable="true"]',
      )
      const key = keyboardEvent.key.toLowerCase()
      const isControlKey =
        [
          'arrowleft',
          'arrowright',
          'arrowup',
          'arrowdown',
          'a',
          'd',
          'w',
          's',
          ' ',
          'shift',
          'escape',
          'p',
          'r',
          'm',
        ].includes(key) || keyboardEvent.code === 'Space'
      if (isControlKey && !isFormTarget) keyboardEvent.preventDefault()
      if (keyboardEvent.repeat) return
      if (keyboardEvent.key === 'ArrowLeft' || key === 'a') this.moveLeft()
      if (keyboardEvent.key === 'ArrowRight' || key === 'd') this.moveRight()
      if (keyboardEvent.key === 'ArrowUp' || key === 'w') this.moveUp()
      if (keyboardEvent.key === 'ArrowDown' || key === 's') this.moveDown()
      if (keyboardEvent.code === 'Space') this.dash()
      if (keyboardEvent.key === 'Shift') this.setBoostHeld(true)
      if (keyboardEvent.key === 'Escape' || key === 'p') this.togglePause()
      if (key === 'r' && (this.state === 'paused' || this.state === 'over'))
        this.restart()
      if (key === 'm') this.toggleMuted()
    })
    this.bindEvent(window, 'keyup', (event) => {
      if ((event as KeyboardEvent).key === 'Shift') this.setBoostHeld(false)
    })

    const bindClick = (selector: string, handler: () => void) => {
      const element = document.querySelector(selector)
      if (element) this.bindEvent(element, 'click', handler)
    }

    bindClick('#pause-button', () => this.togglePause())
    bindClick('#resume-button', () => this.resume())
    bindClick('#restart-button', () => this.restart())
    bindClick('#restart-from-pause', () => this.restart())
    bindClick('#mute-toggle', () => this.toggleMuted())
    bindClick('#motion-toggle', () => this.toggleReducedMotion())
    bindClick('#reset-records-button', () => this.resetRecords())
    bindClick('#dash-button', () => this.dash())

    const boostButton =
      document.querySelector<HTMLButtonElement>('#boost-button')
    if (boostButton) {
      this.bindEvent(boostButton, 'pointerdown', (event) => {
        const pointerEvent = event as PointerEvent
        boostButton.setPointerCapture(pointerEvent.pointerId)
        this.setBoostHeld(true)
        this.boostFor(1.5)
      })
      this.bindEvent(boostButton, 'pointerup', () => this.setBoostHeld(false))
      this.bindEvent(boostButton, 'pointercancel', () =>
        this.setBoostHeld(false),
      )
      this.bindEvent(boostButton, 'lostpointercapture', () =>
        this.setBoostHeld(false),
      )
      this.bindEvent(boostButton, 'pointerleave', () =>
        this.setBoostHeld(false),
      )
    }

    bindClick('#touch-left', () => this.moveLeft())
    bindClick('#touch-right', () => this.moveRight())
    bindClick('#touch-up', () => this.moveUp())
    bindClick('#touch-down', () => this.moveDown())
  }

  private reset() {
    this.targetLane = 2
    this.targetHeight = 1
    this.speed = GAME_CONFIG.baseSpeed
    this.obstacleMeter = 0
    this.collectibleMeter = 0
    this.graceTimer = GAME_CONFIG.startGraceSeconds
    this.dashTimer = 0
    this.boostTimer = 0
    this.boostHeld = false
    this.shieldTimer = 0
    this.hitFlashTimer = 0
    this.hitInvulnerabilityTimer = 0
    this.dangerPromptCooldown = 0
    this.pressureBand = 0
    this.comboTimer = 0
    this.nextMilestone = GAME_CONFIG.milestoneStep
    this.gameOverReason = '幽影追上了剑光'
    this.seenPickupKinds.clear()
    this.stats = {
      hp: 100,
      qi: 100,
      distance: 0,
      spiritStones: 0,
      elixirs: 0,
      talismans: 0,
      swordEnergy: 0,
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      nearMisses: 0,
      rescueCount: 0,
    }
    this.chase.reset()
    this.scenicWorld.reset()
    this.feedback.setActiveSpeed(0)
    this.animatedHero.setDash(false)
    this.animatedHero.setLean(0)
    this.animatedHero.setState('cruise')
    this.player.position.set(
      LANES[this.targetLane],
      HEIGHT_LEVELS[this.targetHeight],
      0,
    )
    this.player.rotation.set(0, 0, 0)
    this.obstacles.forEach((obstacle) => this.deactivateObstacle(obstacle))
    this.collectibles.forEach((collectible) =>
      this.deactivateCollectible(collectible),
    )
    this.hitEffects.forEach((effect) => {
      effect.visible = false
      const material = effect.material as MeshBasicMaterial
      material.opacity = 0.55
      effect.scale.setScalar(1)
    })
    this.hud.update(this.snapshot)
  }

  private updateRunning(delta: number) {
    const boosted = this.isBoosting()
    const dashing = this.dashTimer > 0
    const difficulty = getDifficultyProfile(this.stats.distance)
    const effectiveSpeed =
      this.speed *
      (dashing ? GAME_CONFIG.dashMultiplier : 1) *
      (boosted ? GAME_CONFIG.boostMultiplier : 1)

    this.feedback.setActiveSpeed(effectiveSpeed / GAME_CONFIG.maxSpeed)
    this.sound.setSpeedRatio(effectiveSpeed / GAME_CONFIG.maxSpeed)

    this.speed = Math.min(
      GAME_CONFIG.maxSpeed + difficulty.maxSpeedBonus,
      this.speed + GAME_CONFIG.speedRampPerSecond * delta,
    )
    this.stats.distance += effectiveSpeed * delta
    this.stats.score +=
      effectiveSpeed * delta * (1 + (this.stats.comboMultiplier - 1) * 0.55)
    this.stats.qi = Math.min(100, this.stats.qi + (dashing ? 0 : 4.8 * delta))

    if (boosted) {
      this.stats.qi = Math.max(
        0,
        this.stats.qi - GAME_CONFIG.boostSpiritCostPerSecond * delta,
      )
    }

    this.chase.update(
      delta,
      this.stats.qi,
      effectiveSpeed / GAME_CONFIG.maxSpeed,
    )

    this.dashTimer = Math.max(0, this.dashTimer - delta)
    this.boostTimer = Math.max(0, this.boostTimer - delta)
    this.shieldTimer = Math.max(0, this.shieldTimer - delta)
    this.hitFlashTimer = Math.max(0, this.hitFlashTimer - delta)
    this.hitInvulnerabilityTimer = Math.max(
      0,
      this.hitInvulnerabilityTimer - delta,
    )
    this.graceTimer = Math.max(0, this.graceTimer - delta)
    this.dangerPromptCooldown = Math.max(0, this.dangerPromptCooldown - delta)
    this.updateComboTimer(delta)

    this.updatePlayer(delta, dashing, boosted)
    this.moveWorld(delta, effectiveSpeed)
    this.updateSpawning(delta, effectiveSpeed)
    this.updateObstacles(delta, effectiveSpeed)
    this.updateCollectibles(delta, effectiveSpeed)
    this.updateEffects(delta)
    this.updateCamera(delta)
    this.detectCollisions()
    this.updateNearMisses()
    this.updateDangerPrompts()
    this.updateMilestoneProgress()

    if (this.chase.isCaught || this.stats.hp <= 0) {
      const reason =
        this.stats.hp <= 0
          ? '气血耗尽，剑势坠散'
          : '追杀进度满溢，幽影追上了剑光'
      if (!this.tryAutoRescue(reason)) {
        this.gameOverReason = reason
        this.gameOver()
      }
    }

    this.hud.update(this.snapshot)
  }

  private animateIdle(delta: number) {
    this.feedback.setActiveSpeed(0.08)
    this.scenicWorld.update(
      delta,
      GAME_CONFIG.baseSpeed * 0.22,
      this.stats.distance,
    )
    this.animatedHero.setDash(false)
    this.animatedHero.setLean(Math.sin(performance.now() * 0.0016) * 0.18)
    this.animatedHero.setVerticalMotion(
      Math.sin(performance.now() * 0.0012) * 0.12,
    )
    this.animatedHero.setSpeedIntensity(0.08)
    this.animatedHero.setState('cruise')
    this.animatedHero.update(delta)
    this.sword.rotation.z += delta * 0.8
    this.clouds.forEach((cloud) => {
      cloud.position.x +=
        Math.sin(performance.now() * 0.00008 + cloud.position.z) * delta * 0.16
    })
    this.updateEffects(delta)
  }

  private isBoosting() {
    return (this.boostHeld || this.boostTimer > 0) && this.stats.qi > 0
  }

  private updatePlayer(delta: number, dashing: boolean, boosted: boolean) {
    this.targetVec.set(
      LANES[this.targetLane],
      HEIGHT_LEVELS[this.targetHeight],
      0,
    )
    this.player.position.lerp(this.targetVec, Math.min(1, delta * 9.5))

    const laneDelta = LANES[this.targetLane] - this.player.position.x
    const heightDelta =
      HEIGHT_LEVELS[this.targetHeight] - this.player.position.y
    this.player.rotation.set(0, 0, 0)

    let heroState: HeroSpriteState = 'cruise'
    if (heightDelta > 0.16) {
      heroState = 'ascend'
    } else if (heightDelta < -0.16) {
      heroState = 'descend'
    } else if (laneDelta < -0.28) {
      heroState = 'leanLeft'
    } else if (laneDelta > 0.28) {
      heroState = 'leanRight'
    }
    this.animatedHero.setLean(Math.max(-1, Math.min(1, laneDelta / 2.4)))
    this.animatedHero.setVerticalMotion(
      Math.max(-1, Math.min(1, heightDelta / 1.45)),
    )
    this.animatedHero.setSpeedIntensity(
      dashing ? 1.35 : boosted ? 1.05 : this.speed / GAME_CONFIG.maxSpeed,
    )
    this.animatedHero.setDash(dashing)
    this.animatedHero.setState(heroState)
    this.animatedHero.update(delta)

    const swordPulse = dashing ? 1.26 : boosted ? 1.14 : 1
    this.sword.scale.set(1, 1, swordPulse)
    const glow = this.sword.children[2] as Mesh<
      BufferGeometry,
      MeshBasicMaterial
    >
    glow.material.opacity = dashing ? 0.62 : this.shieldTimer > 0 ? 0.46 : 0.28
    this.updateShieldAura(delta)

    this.tempVec.set(
      this.player.position.x,
      this.player.position.y + 1.05,
      this.player.position.z - 0.1,
    )
    this.playerCollider.setFromCenterAndSize(
      this.tempVec,
      new Vector3(GAME_CONFIG.playerRadius * 1.5, 2.0, 2.4),
    )
  }

  private updateShieldAura(delta: number) {
    if (!this.shieldAura) return
    const material = this.shieldAura.material
    if (this.shieldTimer <= 0) {
      this.shieldAura.visible = false
      material.opacity = 0
      return
    }

    const pulse = Math.sin(performance.now() * 0.008) * 0.5 + 0.5
    const scale = 5.15 + pulse * 0.18
    this.shieldAura.visible = true
    this.shieldAura.scale.set(scale, scale, 1)
    material.opacity = 0.34 + pulse * 0.18
    material.rotation += delta * 0.85
  }

  private moveWorld(delta: number, speed: number) {
    const trackMove = speed * delta
    this.trackSegments.forEach((segment) => {
      segment.position.z += trackMove
      if (segment.position.z > 14) {
        segment.position.z -= this.trackSegments.length * 7.2
        segment.position.x = 0
      }
    })

    this.clouds.forEach((cloud) => {
      cloud.position.z += trackMove * 0.14
      cloud.position.x +=
        Math.sin((this.stats.distance + cloud.position.z) * 0.04) * delta * 0.25
      if (cloud.position.z > GAME_CONFIG.worldResetZ) {
        cloud.position.z = randomBetween(-210, -145)
        cloud.position.x = randomBetween(-90, 90)
        cloud.position.y = randomBetween(-7.6, -4.4)
      }
    })

    this.islands.forEach((island) => {
      island.position.z += trackMove * 0.26
      island.rotation.y += delta * 0.025
      if (island.position.z > GAME_CONFIG.worldResetZ) {
        const side = Math.random() > 0.5 ? -1 : 1
        island.position.set(
          side * randomBetween(26, 62),
          randomBetween(3.5, 12),
          randomBetween(-230, -155),
        )
        island.scale.setScalar(randomBetween(0.85, 2.15))
      }
    })

    this.scenicSprites.forEach((sprite, index) => {
      sprite.position.z += trackMove * (index % 3 === 0 ? 0.19 : 0.13)
      sprite.position.y +=
        Math.sin((this.stats.distance + index * 39) * 0.008) * delta * 0.22
      if (sprite.position.z > 44) {
        const side = index % 3 === 0 ? 0 : Math.random() > 0.5 ? -1 : 1
        const distanceScale = randomBetween(0.5, 1.35)
        sprite.position.set(
          side === 0 ? randomBetween(-10, 10) : side * randomBetween(26, 62),
          randomBetween(8, 22),
          randomBetween(-230, -165),
        )
        sprite.scale.set(28 * distanceScale, 19 * distanceScale, 1)
      }
    })

    this.scenicWorld.update(delta, speed, this.stats.distance)
  }

  private updateSpawning(delta: number, speed: number) {
    if (this.graceTimer > 0) return
    this.obstacleMeter += speed * delta
    this.collectibleMeter += speed * delta

    const difficulty = getDifficultyProfile(this.stats.distance)
    if (this.obstacleMeter > difficulty.obstacleSpawnDistance) {
      this.spawnObstacleWave()
      this.obstacleMeter = 0
    }

    if (this.collectibleMeter > difficulty.collectibleSpawnDistance) {
      this.spawnCollectiblePattern()
      this.collectibleMeter = 0
    }
  }

  private updateObstacles(delta: number, speed: number) {
    this.obstacles.forEach((obstacle) => {
      if (!obstacle.active) return
      obstacle.group.position.z += speed * delta
      this.animateObstacleSprites(obstacle, delta)
      if (obstacle.group.position.z > GAME_CONFIG.despawnZ) {
        this.deactivateObstacle(obstacle)
      }
    })
  }

  private animateObstacleSprites(obstacle: ObstacleEntity, delta: number) {
    const pulse = Math.sin(performance.now() * 0.008 + obstacle.id) * 0.5 + 0.5
    obstacle.group.children.forEach((child) => {
      if (child instanceof Mesh && child.name === 'lane-warning') {
        const material = child.material as MeshBasicMaterial
        material.opacity = 0.24 + pulse * 0.28
        child.scale.x = (child.userData.baseScaleX ?? 1) * (0.92 + pulse * 0.12)
        return
      }
      if (child instanceof Mesh && child.name === 'obstacle-halo') {
        const material = child.material as MeshBasicMaterial
        material.opacity = 0.46 + pulse * 0.28
        child.scale.z = 1
        return
      }
      if (!(child instanceof Sprite)) return
      const material = child.material
      if (
        obstacle.kind === 'thunder-gate' ||
        obstacle.kind === 'barrier-gate'
      ) {
        material.opacity = 0.86 + pulse * 0.12
      }
      if (obstacle.kind === 'floating-rock' || obstacle.kind === 'demon-orb') {
        material.rotation += obstacle.spin * delta * 0.16
      }
    })
  }

  private updateCollectibles(delta: number, speed: number) {
    this.collectibles.forEach((collectible) => {
      if (!collectible.active) return
      const pulse =
        Math.sin(performance.now() * 0.006 + collectible.id) * 0.5 + 0.5
      collectible.object.position.z += speed * delta
      collectible.object.rotation.y += collectible.spin * delta
      collectible.object.position.y +=
        Math.sin(performance.now() * 0.004 + collectible.id) * delta * 0.26
      ;(collectible.object as Group).children.forEach((child) => {
        if (child instanceof Mesh && child.name === 'collectible-glow') {
          const material = child.material as MeshBasicMaterial
          material.opacity = 0.28 + pulse * 0.26
          child.scale.setScalar(0.86 + pulse * 0.18)
        }
        if (child instanceof Sprite && child.name === 'collectible-label') {
          const material = child.material
          material.opacity = 0.74 + pulse * 0.22
          child.position.y = 1.08 + pulse * 0.08
        }
      })
      if (collectible.object.position.z > GAME_CONFIG.despawnZ) {
        this.deactivateCollectible(collectible)
      }
    })
  }

  private updateEffects(delta: number) {
    this.hitEffects.forEach((effect) => {
      if (!effect.visible) return
      effect.scale.addScalar(delta * 3.2)
      const material = effect.material as MeshBasicMaterial
      material.opacity = Math.max(0, material.opacity - delta * 1.5)
      if (material.opacity <= 0) effect.visible = false
    })
  }

  private updateCamera(delta: number) {
    const cameraTarget = new Vector3(
      this.player.position.x * 0.42,
      this.player.position.y + 4.5,
      12.5,
    )
    this.camera.position.lerp(cameraTarget, Math.min(1, delta * 3.6))
    this.camera.lookAt(
      this.player.position.x * 0.42,
      this.player.position.y + 1.1,
      -17,
    )
  }

  private updateComboTimer(delta: number) {
    if (this.stats.combo <= 0) return
    this.comboTimer = Math.max(0, this.comboTimer - delta)
    if (this.comboTimer <= 0) {
      this.resetCombo()
    }
  }

  private addCombo(amount: number) {
    const previousMultiplier = this.stats.comboMultiplier
    this.stats.combo += amount
    this.comboTimer = GAME_CONFIG.comboWindowSeconds
    this.stats.comboMultiplier = this.getComboMultiplier()
    if (this.stats.comboMultiplier > previousMultiplier) {
      this.sound.playCombo(this.stats.comboMultiplier)
      this.hud.announce(`连击提升 x${this.stats.comboMultiplier.toFixed(2)}`)
    }
  }

  private resetCombo() {
    this.stats.combo = 0
    this.stats.comboMultiplier = 1
    this.comboTimer = 0
  }

  private getComboMultiplier() {
    return getComboMultiplier(this.stats.combo)
  }

  private addScore(amount: number) {
    this.stats.score += amount * this.stats.comboMultiplier
  }

  private updateMilestoneProgress() {
    while (this.stats.distance >= this.nextMilestone) {
      const reached = this.nextMilestone
      this.nextMilestone += GAME_CONFIG.milestoneStep
      const reward = getMilestoneReward(reached)
      this.stats.qi = Math.min(100, this.stats.qi + reward.qiGain)
      this.stats.hp = Math.min(100, this.stats.hp + reward.hpGain)
      this.chase.reduce(reward.chaseReduction)
      this.addCombo(reward.comboGain)
      this.addScore(reward.scoreGain)
      this.feedback.triggerPickup(
        {
          x: this.player.position.x,
          y: this.player.position.y + 1.1,
          z: this.player.position.z,
        },
        0xf5bd55,
      )
      this.sound.playMilestone()
      this.hud.announce(`突破 ${reached} 米：灵力回升，追杀下降`)
    }
  }

  private updateNearMisses() {
    this.obstacles.forEach((obstacle) => {
      if (
        !obstacle.active ||
        obstacle.passed ||
        obstacle.group.position.z < 0.8
      )
        return
      obstacle.passed = true
      const nearMiss = obstacle.colliders.some((collider) =>
        this.isNearMissCollider(collider),
      )
      if (!nearMiss) return
      this.stats.nearMisses += 1
      this.stats.qi = Math.min(100, this.stats.qi + 4)
      this.chase.reduce(3)
      this.addCombo(2)
      this.addScore(86)
      this.feedback.triggerPickup(
        {
          x: this.player.position.x,
          y: this.player.position.y + 1.05,
          z: this.player.position.z,
        },
        0xff54d9,
      )
      this.sound.playNearMiss()
      if (this.stats.nearMisses === 1 || this.stats.nearMisses % 4 === 0) {
        this.hud.announce('贴身闪避：连击上升，追杀下降')
      }
    })
  }

  private isNearMissCollider(collider: Object3D) {
    this.tempBox.setFromObject(collider)
    if (this.playerCollider.intersectsBox(this.tempBox)) return false
    this.tempBox.getCenter(this.tempVec)
    const dx = Math.abs(this.tempVec.x - this.player.position.x)
    const dy = Math.abs(this.tempVec.y - (this.player.position.y + 1.05))
    const dz = Math.abs(this.tempVec.z - this.player.position.z)
    return dz < 4.4 && dx < 3.2 && dy < 2.2
  }

  private tryAutoRescue(reason: string) {
    if (this.stats.talismans <= 0) return false
    this.stats.talismans -= 1
    this.stats.rescueCount += 1
    this.stats.hp = Math.max(this.stats.hp, 42)
    this.stats.qi = Math.max(this.stats.qi, 42)
    if (this.chase.value > 58) {
      this.chase.reduce(this.chase.value - 58)
    }
    this.shieldTimer = Math.max(
      this.shieldTimer,
      GAME_CONFIG.rescueShieldSeconds,
    )
    this.dashTimer = Math.max(this.dashTimer, 0.55)
    this.clearNearbyObstacles(70)
    this.feedback.triggerDash(0.55)
    this.sound.playRescue()
    this.gameOverReason = reason
    this.hud.announce('救命符燃尽：气血回稳，护盾展开')
    return true
  }

  private updateDangerPrompts() {
    const nextBand = this.getPressureBand(this.chase.value)
    if (nextBand > this.pressureBand && this.dangerPromptCooldown <= 0) {
      this.sound.playWarning(nextBand)
      this.hud.announce(
        nextBand >= 3 ? '魔影贴近，马上变道冲刺' : '追杀逼近，别撞禁制',
      )
      this.dangerPromptCooldown = nextBand >= 3 ? 2.1 : 2.8
    }
    this.pressureBand = nextBand

    if (this.dangerPromptCooldown > 0) return
    if (this.stats.qi < 18) {
      this.hud.announce('灵力将尽：松开加速或拾取灵石')
      this.sound.playWarning(1)
      this.dangerPromptCooldown = 3.2
      return
    }

    const incoming = this.obstacles.reduce<ObstacleEntity | null>(
      (nearest, obstacle) => {
        if (
          !obstacle.active ||
          obstacle.warned ||
          obstacle.group.position.z <= -42
        ) {
          return nearest
        }

        if (!nearest || obstacle.group.position.z > nearest.group.position.z) {
          return obstacle
        }

        return nearest
      },
      null,
    )
    if (incoming === null) return

    incoming.warned = true
    this.hud.announce(this.getObstacleHint(incoming.kind))
    this.sound.playWarning(incoming.large ? 2 : 1)
    this.dangerPromptCooldown = incoming.large ? 2.5 : 2.1
  }

  private getPressureBand(pressure: number) {
    return getPressureBand(pressure)
  }

  private getObstacleHint(kind: ObstacleKind) {
    if (kind === 'barrier-gate') return '禁门封路，找空出的剑道'
    if (kind === 'broken-platform') return '断台横拦，提前上下闪避'
    if (kind === 'thunder-gate') return '雷门将至，避开紫色光带'
    if (kind === 'demon-orb') return '魔珠吸灵，别硬撞'
    return '浮岩逼近，换道绕开'
  }

  private spawnObstacleWave() {
    const available = this.obstacles.find((obstacle) => !obstacle.active)
    if (!available) return
    const difficulty = getDifficultyProfile(this.stats.distance)
    const kinds: ObstacleKind[] = [
      'floating-rock',
      'thunder-gate',
      'barrier-gate',
      'demon-orb',
      'broken-platform',
    ]
    const kind = choose(kinds)
    const lane = clampLane(Math.floor(Math.random() * LANES.length))
    const level = clampHeight(Math.floor(Math.random() * HEIGHT_LEVELS.length))
    const z = randomBetween(GAME_CONFIG.spawnZMax, GAME_CONFIG.spawnZMin)
    this.prepareObstacle(available, kind, lane, level, z)

    if (
      this.stats.distance > 260 &&
      Math.random() < difficulty.secondObstacleChance
    ) {
      const second = this.obstacles.find((obstacle) => !obstacle.active)
      if (!second) return
      const secondLane = clampLane((lane + choose([1, 2, 3])) % LANES.length)
      const secondLevel = clampHeight(
        (level + choose([0, 1, 2])) % HEIGHT_LEVELS.length,
      )
      this.prepareObstacle(
        second,
        choose(['floating-rock', 'demon-orb', 'thunder-gate']),
        secondLane,
        secondLevel,
        z - randomBetween(6, 10),
      )
    }
  }

  private prepareObstacle(
    obstacle: ObstacleEntity,
    kind: ObstacleKind,
    lane: LaneIndex,
    level: HeightIndex,
    z: number,
  ) {
    obstacle.group.clear()
    obstacle.kind = kind
    obstacle.lane = lane
    obstacle.level = level
    obstacle.penalty =
      kind === 'barrier-gate' || kind === 'broken-platform' ? 20 : 12
    obstacle.large = kind === 'barrier-gate' || kind === 'broken-platform'
    obstacle.spin = randomBetween(-1.2, 1.2)
    obstacle.warned = false
    obstacle.passed = false
    obstacle.colliders = []
    obstacle.group.visible = true
    obstacle.active = true
    obstacle.group.position.set(0, 0, z)
    obstacle.group.rotation.set(0, 0, 0)
    obstacle.group.scale.setScalar(1)

    if (kind === 'floating-rock') {
      const sprite = this.createGameplaySprite(
        this.mats.floatingRockSprite,
        3.55,
        3.55,
      )
      sprite.position.set(LANES[lane], HEIGHT_LEVELS[level] + 0.8, -0.18)
      const warning = this.createLaneWarning(
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.18,
      )
      const halo = this.createObstacleHalo(
        1.18,
        1.18,
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.8,
      )
      const collider = this.createInvisibleCollider(
        1.9,
        1.9,
        1.2,
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.75,
      )
      obstacle.group.add(warning, halo, sprite, collider)
      obstacle.colliders.push(collider)
    }

    if (kind === 'thunder-gate') {
      const x = LANES[lane]
      const gate = this.createGameplaySprite(
        this.mats.thunderGateSprite,
        4.85,
        4.85,
      )
      gate.position.set(x, HEIGHT_LEVELS[level] + 1.2, -0.28)
      const warning = this.createLaneWarning(
        x,
        HEIGHT_LEVELS[level] + 0.2,
        1.12,
      )
      const halo = this.createObstacleHalo(
        1.42,
        1.42,
        x,
        HEIGHT_LEVELS[level] + 1.2,
      )
      const collider = this.createInvisibleCollider(
        2.05,
        3.05,
        1.2,
        x,
        HEIGHT_LEVELS[level] + 1.2,
      )
      obstacle.group.add(warning, halo, gate, collider)
      obstacle.colliders.push(collider)
    }

    if (kind === 'barrier-gate') {
      const safeLane = lane
      const gateLevel = level
      LANES.forEach((x, index) => {
        if (index === safeLane) return
        const seal = this.createGameplaySprite(
          this.mats.barrierGateSprite,
          3.6,
          3.6,
        )
        seal.position.set(x, HEIGHT_LEVELS[gateLevel] + 0.8, -0.22)
        const warning = this.createLaneWarning(
          x,
          HEIGHT_LEVELS[gateLevel] + 0.18,
          0.94,
        )
        const halo = this.createObstacleHalo(
          1.24,
          1.24,
          x,
          HEIGHT_LEVELS[gateLevel] + 0.8,
        )
        const collider = this.createInvisibleCollider(
          2,
          2.35,
          1.2,
          x,
          HEIGHT_LEVELS[gateLevel] + 0.75,
        )
        obstacle.group.add(warning, halo, seal, collider)
        obstacle.colliders.push(collider)
      })
    }

    if (kind === 'demon-orb') {
      const sprite = this.createGameplaySprite(
        this.mats.demonOrbSprite,
        3.55,
        3.55,
      )
      sprite.position.set(LANES[lane], HEIGHT_LEVELS[level] + 0.72, -0.22)
      const warning = this.createLaneWarning(
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.16,
      )
      const halo = this.createObstacleHalo(
        1.18,
        1.18,
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.72,
      )
      const collider = this.createInvisibleCollider(
        1.75,
        1.75,
        1.2,
        LANES[lane],
        HEIGHT_LEVELS[level] + 0.68,
      )
      obstacle.group.add(warning, halo, sprite, collider)
      obstacle.colliders.push(collider)
    }

    if (kind === 'broken-platform') {
      const x = LANES[lane]
      const platformY = HEIGHT_LEVELS[Math.min(level, 1)] + 0.2
      const sprite = this.createGameplaySprite(
        this.mats.brokenPlatformSprite,
        4.45,
        3.6,
      )
      sprite.position.set(x, platformY + 0.35, -0.24)
      sprite.material.opacity = 0.92
      const warning = this.createLaneWarning(x, platformY + 0.05, 1.2)
      const halo = this.createObstacleHalo(1.32, 0.92, x, platformY + 0.35)
      const collider = this.createInvisibleCollider(
        2.1,
        1.15,
        3,
        x,
        platformY + 0.1,
      )
      obstacle.group.add(warning, halo, sprite, collider)
      obstacle.colliders.push(collider)
    }
  }

  private spawnCollectiblePattern() {
    const lane = clampLane(Math.floor(Math.random() * LANES.length))
    const level = clampHeight(Math.floor(Math.random() * HEIGHT_LEVELS.length))
    const baseZ = randomBetween(
      GAME_CONFIG.spawnZMax + 8,
      GAME_CONFIG.spawnZMin,
    )
    const patternLength = Math.random() > 0.35 ? 5 : 3

    for (let i = 0; i < patternLength; i += 1) {
      const kind: CollectibleKind =
        i === patternLength - 1 && Math.random() > 0.35
          ? choose(['elixir', 'talisman', 'sword-energy'])
          : 'spirit-stone'
      const offsetLane = clampLane(
        lane + (Math.random() > 0.7 ? choose([-1, 1]) : 0),
      )
      const offsetLevel = clampHeight(
        level + (Math.random() > 0.75 ? choose([-1, 1]) : 0),
      )
      const collectible = this.collectibles.find((item) => !item.active)
      if (!collectible) return
      this.prepareCollectible(
        collectible,
        kind,
        LANES[offsetLane],
        HEIGHT_LEVELS[offsetLevel] + 0.82,
        baseZ - i * 4.2,
      )
    }
  }

  private prepareCollectible(
    collectible: CollectibleEntity,
    kind: CollectibleKind,
    x: number,
    y: number,
    z: number,
  ) {
    const group = collectible.object as Group
    group.clear()
    collectible.kind = kind
    collectible.active = true
    collectible.spin = kind === 'spirit-stone' ? 3 : 1.8
    group.visible = true
    group.position.set(x, y, z)

    const sprite = this.createCollectibleSprite(kind)
    sprite.position.y = 0.08
    const halo = this.createCollectibleHalo(kind)
    const collider = this.createInvisibleCollider(1.25, 1.25, 1, 0, 0.08)
    collider.name = 'collectible-collider'
    group.add(halo, sprite)
    if (kind !== 'spirit-stone') {
      group.add(this.createPickupLabel(kind))
    }
    group.add(collider)
  }

  private deactivateObstacle(obstacle: ObstacleEntity) {
    obstacle.active = false
    obstacle.group.visible = false
    obstacle.group.position.z = 999
    obstacle.colliders = []
  }

  private deactivateCollectible(collectible: CollectibleEntity) {
    collectible.active = false
    collectible.object.visible = false
    collectible.object.position.z = 999
  }

  private detectCollisions() {
    const magnetRadius = getMagnetRadius(this.dashTimer > 0, this.isBoosting())
    this.obstacles.forEach((obstacle) => {
      if (!obstacle.active) return
      const hit = obstacle.colliders.some((collider) => {
        this.tempBox.setFromObject(collider)
        return this.playerCollider.intersectsBox(this.tempBox)
      })
      if (!hit) return
      this.handleObstacleHit(obstacle)
    })

    this.collectibles.forEach((collectible) => {
      if (!collectible.active) return
      const collider =
        (collectible.object as Group).children.find(
          (child) => child.name === 'collectible-collider',
        ) ?? collectible.object
      collectible.box.setFromObject(collider)
      if (!this.playerCollider.intersectsBox(collectible.box)) {
        if (magnetRadius <= 0) return
        const dx = Math.abs(
          collectible.object.position.x - this.player.position.x,
        )
        const dy = Math.abs(
          collectible.object.position.y - (this.player.position.y + 1.05),
        )
        const dz = Math.abs(
          collectible.object.position.z - this.player.position.z,
        )
        if (dx > magnetRadius || dy > magnetRadius || dz > 3.4) return
      }
      this.collect(collectible)
    })
  }

  private handleObstacleHit(obstacle: ObstacleEntity) {
    if (this.graceTimer > 0) {
      this.deactivateObstacle(obstacle)
      return
    }

    if (this.hitInvulnerabilityTimer > 0) {
      this.deactivateObstacle(obstacle)
      return
    }

    const protectedHit = this.shieldTimer > 0 || this.dashTimer > 0
    const impact = getObstacleImpact(
      obstacle.kind,
      protectedHit,
      obstacle.penalty,
    )
    this.chase.add(impact.pressure)
    this.stats.hp = Math.max(0, this.stats.hp - impact.damage)
    this.stats.qi = Math.max(0, this.stats.qi - impact.qiDrain)
    if (protectedHit) {
      this.sound.playShield()
    } else {
      this.sound.playHit()
      this.resetCombo()
    }
    this.hitFlashTimer = 0.35
    this.hitInvulnerabilityTimer = GAME_CONFIG.hitInvulnerabilitySeconds
    this.animatedHero.setHitFlash(0.35)
    this.feedback.triggerHit({
      x: LANES[obstacle.lane],
      y: HEIGHT_LEVELS[obstacle.level] + 1.0,
      z: obstacle.group.position.z,
    })
    this.playHitEffect(
      LANES[obstacle.lane],
      HEIGHT_LEVELS[obstacle.level] + 1.0,
      obstacle.group.position.z,
    )
    this.hud.announce(protectedHit ? '护体灵光化解冲击' : '追杀压力上升')
    this.deactivateObstacle(obstacle)
  }

  private collect(collectible: CollectibleEntity) {
    this.feedback.triggerPickup(
      collectible.object.position,
      this.getCollectibleFeedbackColor(collectible.kind),
    )
    this.sound.playPickup(collectible.kind)
    const firstPickup = !this.seenPickupKinds.has(collectible.kind)
    this.seenPickupKinds.add(collectible.kind)
    const effect = getCollectibleEffect(collectible.kind)
    this.stats.qi = Math.min(100, this.stats.qi + effect.qiGain)
    this.stats.hp = Math.min(100, this.stats.hp + effect.hpGain)
    this.chase.reduce(effect.chaseReduction)

    if (collectible.kind === 'spirit-stone') {
      this.stats.spiritStones += 1
      this.addCombo(effect.comboGain)
      this.addScore(effect.scoreGain)
      if (firstPickup) {
        this.hud.announce('灵石：补充灵力并计分')
      }
    }

    if (collectible.kind === 'elixir') {
      this.stats.elixirs += 1
      this.addCombo(effect.comboGain)
      this.addScore(effect.scoreGain)
      this.hud.announce('清心丹：气血与灵力回升，追杀下降')
    }

    if (collectible.kind === 'talisman') {
      this.stats.talismans += 1
      this.shieldTimer = GAME_CONFIG.shieldDuration
      this.clearNearbyObstacles(40)
      this.sound.playShield()
      this.addCombo(effect.comboGain)
      this.addScore(effect.scoreGain)
      this.hud.announce('符箓：护盾展开，保留一次救场')
    }

    if (collectible.kind === 'sword-energy') {
      this.stats.swordEnergy += 1
      this.dashTimer = GAME_CONFIG.dashDuration
      this.feedback.triggerDash(GAME_CONFIG.dashDuration)
      this.sound.playDash()
      this.addCombo(effect.comboGain)
      this.addScore(effect.scoreGain)
      this.hud.announce('剑气：免费冲刺，甩开追杀')
    }

    this.deactivateCollectible(collectible)
  }

  private clearNearbyObstacles(distance: number) {
    this.obstacles.forEach((obstacle) => {
      if (!obstacle.active) return
      if (
        obstacle.group.position.z > -distance &&
        obstacle.group.position.z < 8
      ) {
        this.playHitEffect(
          LANES[obstacle.lane],
          HEIGHT_LEVELS[obstacle.level] + 1,
          obstacle.group.position.z,
        )
        this.feedback.triggerHit({
          x: LANES[obstacle.lane],
          y: HEIGHT_LEVELS[obstacle.level] + 1,
          z: obstacle.group.position.z,
        })
        this.deactivateObstacle(obstacle)
      }
    })
  }

  private playHitEffect(x: number, y: number, z: number) {
    const effect = this.hitEffects.find((item) => !item.visible)
    if (!effect) return
    effect.position.set(x, y, z)
    effect.scale.setScalar(1)
    const material = effect.material as MeshBasicMaterial
    material.opacity = 0.55
    effect.visible = true
  }

  private gameOver() {
    if (this.state === 'over') return
    this.state = 'over'
    this.boostHeld = false
    this.feedback.setActiveSpeed(0)
    this.sound.playGameOver()
    this.saveBestDistance()
    this.hud.showGameOver(this.snapshot)
  }

  private saveBestDistance() {
    const best = readStoredNumber(GAME_CONFIG.bestDistanceKey, 0)
    if (this.stats.distance > best) {
      writeStoredNumber(GAME_CONFIG.bestDistanceKey, this.stats.distance)
    }
    const bestScore = readStoredNumber(GAME_CONFIG.bestScoreKey, 0)
    if (this.stats.score > bestScore) {
      writeStoredNumber(GAME_CONFIG.bestScoreKey, this.stats.score)
    }
  }
}
