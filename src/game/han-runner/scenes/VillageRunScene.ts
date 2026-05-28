import * as Phaser from 'phaser'

import { assetKeys, gameSize } from '../config/assets'
import { flightPropFrames, runnerFrames } from '../config/frames'
import { flightChapters, levelConfig, realmStops } from '../config/level'
import { getAudio, getCallbacks } from '../systems/GameRegistry'
import type { RunnerGameEvent } from '../types'
import type { FlightObstacleKind, PickupKind } from '../config/level'

type ControlKeys = {
  J: Phaser.Input.Keyboard.Key
  SHIFT: Phaser.Input.Keyboard.Key
  SPACE: Phaser.Input.Keyboard.Key
  W: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  P: Phaser.Input.Keyboard.Key
  M: Phaser.Input.Keyboard.Key
}

const obstacleFrames: Record<FlightObstacleKind, number> = {
  thunderCloud: flightPropFrames.thunderCloud,
  runeRing: flightPropFrames.runeRing,
  swordLight: flightPropFrames.swordLight,
}

const obstacleBodies: Record<
  FlightObstacleKind,
  { w: number; h: number; ox: number; oy: number; scale: number }
> = {
  thunderCloud: { w: 214, h: 108, ox: 88, oy: 156, scale: 0.42 },
  runeRing: { w: 180, h: 180, ox: 110, oy: 110, scale: 0.34 },
  swordLight: { w: 236, h: 92, ox: 82, oy: 146, scale: 0.34 },
}

const pickupFrames: Record<PickupKind, number> = {
  bottle: flightPropFrames.bottle,
  talisman: flightPropFrames.talisman,
  pill: flightPropFrames.pill,
  stone: flightPropFrames.spiritStone,
}

const pickupScale: Record<PickupKind, number> = {
  bottle: 0.22,
  talisman: 0.2,
  pill: 0.2,
  stone: 0.2,
}

export class VillageRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private sword!: Phaser.GameObjects.Sprite
  private trail!: Phaser.GameObjects.Graphics
  private obstacles!: Phaser.Physics.Arcade.Group
  private pickups!: Phaser.Physics.Arcade.Group
  private keys!: ControlKeys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private panorama!: Phaser.GameObjects.TileSprite
  private mist!: Phaser.GameObjects.TileSprite
  private boss!: Phaser.GameObjects.Sprite
  private hudText!: Phaser.GameObjects.Text
  private pressureBar!: Phaser.GameObjects.Rectangle
  private hp = 3
  private shield = 0
  private stones = 0
  private pressure = 16
  private invincibleUntil = 0
  private boostUntil = 0
  private boostReadyAt = 0
  private slashReadyAt = 0
  private liftReadyAt = 0
  private nextHitAt = 0
  private ended = false
  private paused = false
  private musicMode: 'run' | 'danger' = 'run'
  private mobileDive = false
  private mobileDiveUntil = 0
  private mobileLiftQueued = false
  private mobileBoostQueued = false
  private mobileSlashQueued = false

  constructor() {
    super('VillageRunScene')
  }

  create() {
    this.resetState()
    this.createWorld()
    this.createAnimations()
    this.createPlayer()
    this.createFlightObjects()
    this.createHud()
    this.createControls()

    void getAudio(this.registry).play('run')
    this.publishRunning()
  }

  update(time: number, deltaMs: number) {
    if (this.ended || this.paused) return

    const dt = deltaMs / 1000
    this.updateBackground()
    this.updatePlayer(time, dt)
    this.updateBoard()
    this.updatePressure(time, dt)
    this.updateHud()
    this.checkFinish()
  }

  private resetState() {
    this.hp = 3
    this.shield = 0
    this.stones = 0
    this.pressure = 16
    this.invincibleUntil = 0
    this.boostUntil = 0
    this.boostReadyAt = 0
    this.slashReadyAt = 0
    this.liftReadyAt = 0
    this.nextHitAt = 0
    this.ended = false
    this.paused = false
    this.musicMode = 'run'
    this.mobileDive = false
    this.mobileDiveUntil = 0
    this.mobileLiftQueued = false
    this.mobileBoostQueued = false
    this.mobileSlashQueued = false
  }

  private createWorld() {
    const { width, height } = gameSize
    this.cameras.main.setBounds(0, 0, levelConfig.worldWidth, height)
    this.physics.world.setBounds(
      0,
      levelConfig.flightTopY - 44,
      levelConfig.worldWidth,
      levelConfig.flightBottomY - levelConfig.flightTopY + 92,
    )

    this.panorama = this.add
      .tileSprite(0, 0, width, height, assetKeys.flightPanorama)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(0)
    this.panorama.tilePositionY = 72

    this.mist = this.add
      .tileSprite(0, height - 128, width, 160, assetKeys.flightPanorama)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(2)
      .setAlpha(0.22)
      .setTint(0xe7fff6)
    this.mist.tileScaleX = 0.72
    this.mist.tileScaleY = 0.28
    this.mist.tilePositionY = 412

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x050608, 0.08)
      .setScrollFactor(0)
      .setDepth(3)
    this.add
      .rectangle(width / 2, 34, width, 68, 0x050608, 0.34)
      .setScrollFactor(0)
      .setDepth(4)
    this.add
      .rectangle(width / 2, height - 22, width, 44, 0x050608, 0.3)
      .setScrollFactor(0)
      .setDepth(4)

    for (const chapter of flightChapters) {
      this.add
        .text(chapter.x, 82, chapter.title, {
          color: 'rgba(255,243,201,0.78)',
          fontFamily: '"Songti SC", "Noto Serif SC", serif',
          fontSize: '18px',
        })
        .setOrigin(0.5)
        .setDepth(5)
    }
  }

  private createAnimations() {
    const createRunnerAnim = (
      key: string,
      frames: number[],
      frameRate: number,
      repeat = -1,
    ) => {
      if (this.anims.exists(key)) return
      this.anims.create({
        key,
        frames: frames.map((frame) => ({ key: assetKeys.runner, frame })),
        frameRate,
        repeat,
      })
    }

    createRunnerAnim('runner-idle', runnerFrames.idle, 4)
    createRunnerAnim('runner-run', runnerFrames.run, 10)
    createRunnerAnim('runner-jump', runnerFrames.jump, 8)
    createRunnerAnim('runner-crouch', runnerFrames.crouch, 6)
    createRunnerAnim('runner-attack', runnerFrames.attack, 15, 0)
    createRunnerAnim('runner-hit', runnerFrames.hit, 9, 0)
    createRunnerAnim('runner-caught', runnerFrames.caught, 6, 0)
  }

  private createPlayer() {
    this.trail = this.add.graphics().setDepth(7)
    this.sword = this.add
      .sprite(
        levelConfig.playerStartX,
        levelConfig.playerStartY + 58,
        assetKeys.flightProps,
        flightPropFrames.flyingSword,
      )
      .setScale(0.31)
      .setDepth(8)

    this.player = this.physics.add
      .sprite(
        levelConfig.playerStartX,
        levelConfig.playerStartY,
        assetKeys.runner,
        runnerFrames.idle[0],
      )
      .setScale(0.58)
      .setDepth(10)
      .setCollideWorldBounds(true)

    this.player.body?.setAllowGravity(false)
    this.player.body?.setSize(62, 112).setOffset(82, 84)
    this.player.play('runner-run')
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -260, 0)
    this.cameras.main.setDeadzone(190, 120)
  }

  private createFlightObjects() {
    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })
    this.pickups = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })

    for (const obstacle of levelConfig.obstacles) {
      const body = obstacleBodies[obstacle.kind]
      const sprite = this.obstacles
        .create(
          obstacle.x,
          obstacle.y,
          assetKeys.flightProps,
          obstacleFrames[obstacle.kind],
        )
        .setScale(body.scale)
        .setDepth(
          obstacle.kind === 'swordLight' ? 9 : 6,
        ) as Phaser.Physics.Arcade.Sprite
      sprite.setData('kind', obstacle.kind)
      sprite.body?.setAllowGravity(false)
      sprite.body?.setSize(body.w, body.h).setOffset(body.ox, body.oy)
      this.tweens.add({
        targets: sprite,
        y: sprite.y + (obstacle.kind === 'runeRing' ? 12 : 8),
        duration: obstacle.kind === 'swordLight' ? 900 : 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      })
    }

    for (const pickup of levelConfig.pickups) {
      const sprite = this.pickups
        .create(
          pickup.x,
          pickup.y,
          assetKeys.flightProps,
          pickupFrames[pickup.kind],
        )
        .setScale(pickupScale[pickup.kind])
        .setDepth(9) as Phaser.Physics.Arcade.Sprite
      sprite.setData('kind', pickup.kind)
      sprite.body?.setAllowGravity(false)
      sprite.body?.setSize(168, 168).setOffset(116, 116)
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 10,
        angle: pickup.kind === 'stone' ? 10 : 4,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      })
    }

    this.physics.add.overlap(this.player, this.obstacles, (_, obstacle) => {
      this.takeHit(
        (obstacle as Phaser.Physics.Arcade.Sprite).getData(
          'kind',
        ) as FlightObstacleKind,
      )
    })
    this.physics.add.overlap(this.player, this.pickups, (_, pickup) => {
      this.collectPickup(pickup as Phaser.Physics.Arcade.Sprite)
    })
  }

  private createHud() {
    const { width } = gameSize
    this.hudText = this.add
      .text(22, 18, '', {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '18px',
      })
      .setScrollFactor(0)
      .setDepth(50)

    this.add
      .rectangle(width - 178, 28, 300, 12, 0x080807, 0.72)
      .setScrollFactor(0)
      .setDepth(49)
      .setOrigin(0, 0.5)
    this.pressureBar = this.add
      .rectangle(width - 178, 28, 48, 12, 0xb83425, 0.92)
      .setScrollFactor(0)
      .setDepth(50)
      .setOrigin(0, 0.5)

    this.add
      .text(width - 184, 48, '因果追击', {
        color: 'rgba(255,243,201,0.68)',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '14px',
      })
      .setScrollFactor(0)
      .setDepth(50)

    this.boss = this.add
      .sprite(
        58,
        levelConfig.flightBottomY + 2,
        assetKeys.flightProps,
        flightPropFrames.thunderCloud,
      )
      .setScale(0.18)
      .setDepth(48)
      .setScrollFactor(0)
      .setAlpha(0.68)

    this.createMobileButtons()
    this.updateHud()
  }

  private createMobileButtons() {
    const y = gameSize.height - 46
    const makeButton = (
      x: number,
      label: string,
      onDown: () => void,
      onUp?: () => void,
    ) => {
      const circle = this.add
        .circle(x, y, 28, 0xd8b35f, 0.92)
        .setScrollFactor(0)
        .setDepth(55)
      const text = this.add
        .text(x, y, label, {
          color: '#1d1007',
          fontFamily: '"Songti SC", "Noto Serif SC", serif',
          fontSize: '19px',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(56)
      circle.setInteractive({ useHandCursor: true })
      circle.on('pointerdown', onDown)
      circle.on('pointerup', onUp ?? (() => undefined))
      circle.on('pointerout', onUp ?? (() => undefined))
      text.setInteractive({ useHandCursor: true })
      text.on('pointerdown', onDown)
      text.on('pointerup', onUp ?? (() => undefined))
      text.on('pointerout', onUp ?? (() => undefined))
    }

    makeButton(52, '起', () => (this.mobileLiftQueued = true))
    makeButton(
      126,
      '俯',
      () => {
        this.mobileDive = true
        this.mobileDiveUntil = this.time.now + 360
      },
      () => (this.mobileDive = false),
    )
    makeButton(834, '疾', () => (this.mobileBoostQueued = true))
    makeButton(908, '斩', () => (this.mobileSlashQueued = true))

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.ended || this.paused) return
      if (pointer.y > gameSize.height - 102) return
      this.mobileLiftQueued = true
    })
    this.input.on('pointerup', () => {
      this.mobileDive = false
    })
  }

  private createControls() {
    this.keys = this.input.keyboard?.addKeys(
      'J,SHIFT,SPACE,W,S,P,M',
    ) as ControlKeys
    this.cursors =
      this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys
    this.input.keyboard?.on('keydown-P', () => {
      if (this.ended || this.paused) return
      this.paused = true
      this.physics.pause()
      getAudio(this.registry).stop()
      this.addPausePanel()
    })
    this.input.keyboard?.on('keydown-M', () => {
      const muted = getAudio(this.registry).toggleMuted()
      this.publishRunning(muted)
    })
  }

  private updateBackground() {
    const scrollX = this.cameras.main.scrollX
    this.panorama.tilePositionX = scrollX * 0.34
    this.mist.tilePositionX = scrollX * 0.92
  }

  private updatePlayer(time: number, dt: number) {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const distance = this.distance()
    const liftPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      this.mobileLiftQueued
    const dive =
      this.keys.S.isDown ||
      this.cursors.down.isDown ||
      this.mobileDive ||
      time < this.mobileDiveUntil
    const boostPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) || this.mobileBoostQueued
    const slashPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.J) || this.mobileSlashQueued

    this.mobileLiftQueued = false
    this.mobileBoostQueued = false
    this.mobileSlashQueued = false

    if (liftPressed && time >= this.liftReadyAt) {
      body.setVelocityY(-390)
      this.liftReadyAt = time + 170
      this.spawnEffect(
        this.player.x - 48,
        this.player.y + 56,
        flightPropFrames.dustBurst,
        0.22,
      )
      getAudio(this.registry).jump()
    }

    if (boostPressed && time >= this.boostReadyAt) {
      this.boostUntil = time + 620
      this.boostReadyAt = time + 1450
      this.pressure = Math.max(0, this.pressure - 5)
      this.spawnEffect(
        this.player.x - 66,
        this.player.y + 54,
        flightPropFrames.swordLight,
        0.26,
      )
      getAudio(this.registry).attack()
    }

    if (slashPressed && time >= this.slashReadyAt) {
      this.slashReadyAt = time + 1050
      this.spawnSlash()
      getAudio(this.registry).attack()
    }

    const baseSpeed = 260 + Math.min(86, distance / 45)
    const speed = time < this.boostUntil ? baseSpeed + 126 : baseSpeed
    const gravity = dive ? 940 : 310
    body.setVelocityX(speed)
    body.setVelocityY(
      Phaser.Math.Clamp(body.velocity.y + gravity * dt, -470, dive ? 520 : 370),
    )

    if (this.player.y <= levelConfig.flightTopY) {
      this.player.y = levelConfig.flightTopY
      body.setVelocityY(58)
    }
    if (this.player.y >= levelConfig.flightBottomY) {
      this.player.y = levelConfig.flightBottomY
      body.setVelocityY(-92)
      this.pressure = Math.min(100, this.pressure + dt * 7)
    }

    if (dive) this.player.play('runner-crouch', true)
    else if (body.velocity.y < -80) this.player.play('runner-jump', true)
    else this.player.play('runner-run', true)
  }

  private updateBoard() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const angle = Phaser.Math.Clamp(body.velocity.y / 18, -18, 23)
    this.sword
      .setPosition(this.player.x + 2, this.player.y + 58)
      .setAngle(angle)
      .setScale(this.time.now < this.boostUntil ? 0.36 : 0.31)
    this.player.setAngle(angle * 0.16)

    this.trail.clear()
    const glow = this.time.now < this.boostUntil ? 0.88 : 0.52
    this.trail.lineStyle(3, 0xa6f7ff, glow)
    this.trail.beginPath()
    this.trail.moveTo(this.sword.x - 48, this.sword.y + 2)
    this.trail.lineTo(this.sword.x - 118, this.sword.y + 18)
    this.trail.lineTo(this.sword.x - 190, this.sword.y + 8)
    this.trail.strokePath()
    this.trail.lineStyle(1, 0xf5d889, 0.42)
    this.trail.beginPath()
    this.trail.moveTo(this.sword.x - 36, this.sword.y - 12)
    this.trail.lineTo(this.sword.x - 152, this.sword.y - 24)
    this.trail.strokePath()
  }

  private updatePressure(time: number, dt: number) {
    const distance = this.distance()
    this.pressure = Math.min(99, this.pressure + dt * (1.08 + distance / 3600))
    const wantedMode = this.pressure > 68 ? 'danger' : 'run'
    if (wantedMode !== this.musicMode) {
      this.musicMode = wantedMode
      void getAudio(this.registry).play(wantedMode)
    }

    const pressureRatio = this.pressure / 100
    this.boss.x = 36 + pressureRatio * 102
    this.boss.y = levelConfig.flightBottomY + Math.sin(time / 140) * 5
    this.boss
      .setAlpha(0.5 + pressureRatio * 0.42)
      .setScale(0.16 + pressureRatio * 0.08)
      .setAngle(Math.sin(time / 260) * 4)

    if (this.pressure >= 100) {
      this.finish('caught', '跑慢一步，因果贴着剑光追上来了。')
    }
  }

  private updateHud() {
    const distance = this.distance()
    this.hudText.setText(
      `境界 ${this.realmFor(distance)}    灵石 ${this.stones}    护符 ${this.shield}    御剑 ${distance} 里`,
    )
    this.pressureBar.width = 300 * (this.pressure / 100)
    this.publishRunning()
  }

  private checkFinish() {
    if (this.player.x >= levelConfig.finishX) {
      this.finish('clear', '一线剑光掠过雷云，暂时把追兵甩在身后。')
    }
  }

  private spawnSlash() {
    const slash = this.physics.add
      .sprite(
        this.player.x + 120,
        this.player.y + 18,
        assetKeys.flightProps,
        flightPropFrames.swordLight,
      )
      .setScale(0.3)
      .setDepth(13) as Phaser.Physics.Arcade.Sprite
    slash.body.setAllowGravity(false)
    slash.body.setSize(236, 92).setOffset(82, 146)
    slash.setVelocityX(620)

    this.physics.add.overlap(slash, this.obstacles, (_, obstacle) => {
      this.defeatObstacle(obstacle as Phaser.Physics.Arcade.Sprite)
    })

    this.time.delayedCall(280, () => slash.destroy())
  }

  private defeatObstacle(obstacle: Phaser.Physics.Arcade.Sprite) {
    if (!obstacle.active) return
    this.stones += 1
    this.pressure = Math.max(0, this.pressure - 6)
    this.spawnEffect(obstacle.x, obstacle.y, flightPropFrames.dustBurst, 0.3)
    obstacle.destroy()
  }

  private collectPickup(pickup: Phaser.Physics.Arcade.Sprite) {
    if (!pickup.active) return
    const kind = pickup.getData('kind') as PickupKind
    if (kind === 'bottle') {
      this.invincibleUntil = this.time.now + 3200
      this.boostUntil = this.time.now + 900
    }
    if (kind === 'talisman') this.shield = Math.min(2, this.shield + 1)
    if (kind === 'pill') this.pressure = Math.max(0, this.pressure - 20)
    if (kind === 'stone') this.stones += 1
    this.spawnEffect(pickup.x, pickup.y, flightPropFrames.dustBurst, 0.24)
    getAudio(this.registry).pickup()
    pickup.destroy()
  }

  private takeHit(kind: FlightObstacleKind) {
    if (this.ended) return
    if (this.time.now < this.nextHitAt || this.time.now < this.invincibleUntil)
      return
    this.nextHitAt = this.time.now + 920

    if (this.shield > 0) {
      this.shield -= 1
      this.spawnEffect(
        this.player.x,
        this.player.y,
        flightPropFrames.runeRing,
        0.24,
      )
      getAudio(this.registry).hit()
      return
    }

    this.hp -= 1
    this.pressure = Math.min(100, this.pressure + 17)
    this.player.setVelocityY(-160)
    this.player.setTint(0xffb6a0)
    this.player.play('runner-hit', true)
    this.cameras.main.shake(130, 0.006)
    this.spawnEffect(
      this.player.x,
      this.player.y + 34,
      flightPropFrames.dustBurst,
      0.28,
    )
    getAudio(this.registry).hit()
    this.time.delayedCall(180, () => this.player.clearTint())

    if (this.hp <= 0) {
      this.finish('caught', this.causeFor(kind))
    }
  }

  private spawnEffect(x: number, y: number, frame: number, scale = 0.28) {
    const effect = this.add
      .sprite(x, y, assetKeys.flightProps, frame)
      .setScale(scale)
      .setDepth(14)
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: scale * 1.32,
      duration: 360,
      onComplete: () => effect.destroy(),
    })
  }

  private finish(outcome: 'clear' | 'caught', cause: string) {
    if (this.ended) return
    this.ended = true
    this.player.setVelocity(0, 0)
    this.player.setAngle(0)
    this.sword.setAngle(0)
    this.trail.clear()
    this.player.play(
      outcome === 'clear' ? 'runner-idle' : 'runner-caught',
      true,
    )
    this.physics.pause()
    getAudio(this.registry).stop()
    if (outcome === 'clear') getAudio(this.registry).clear()
    const event: RunnerGameEvent = {
      type: 'result',
      outcome,
      distance: this.distance(),
      hp: this.hp,
      stones: this.stones,
      realm: this.realmFor(this.distance()),
      title: outcome === 'clear' ? '御剑掠过这一程' : '风紧，剑光慢了半拍',
      cause,
    }
    getCallbacks(this.registry)?.onEvent?.(event)
    this.addResultPanel(event)
  }

  private addResultPanel(event: Extract<RunnerGameEvent, { type: 'result' }>) {
    const { width, height } = gameSize
    const panel = this.add
      .rectangle(width / 2, height / 2, 570, 292, 0x090807, 0.9)
      .setScrollFactor(0)
      .setDepth(80)
    panel.setStrokeStyle(1, 0xd8b35f, 0.38)
    this.add
      .text(width / 2, height / 2 - 92, event.title, {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)
    this.add
      .text(
        width / 2,
        height / 2 - 18,
        `${event.cause}\n境界 ${event.realm}｜御剑 ${event.distance} 里｜灵石 ${event.stones}｜剩余血量 ${Math.max(0, event.hp)}`,
        {
          align: 'center',
          color: 'rgba(255,243,201,0.78)',
          fontFamily: '"Songti SC", "Noto Serif SC", serif',
          fontSize: '20px',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)
    this.addButton(width / 2 - 76, height / 2 + 94, '重开', () =>
      this.scene.restart(),
    )
    this.addButton(width / 2 + 86, height / 2 + 94, '重播开场', () =>
      this.scene.start('IntroScene'),
    )
  }

  private addPausePanel() {
    const { width, height } = gameSize
    const panel = this.add
      .container(width / 2, height / 2)
      .setScrollFactor(0)
      .setDepth(90)
    const bg = this.add.rectangle(0, 0, 420, 188, 0x090807, 0.9)
    bg.setStrokeStyle(1, 0xd8b35f, 0.38)
    const title = this.add
      .text(0, -44, '云上收势', {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)
    const resume = this.makeButton(-74, 42, '继续', () => {
      panel.destroy()
      this.paused = false
      this.physics.resume()
      void getAudio(this.registry).play(this.musicMode)
    })
    const restart = this.makeButton(82, 42, '重开', () => {
      panel.destroy()
      this.paused = false
      this.physics.resume()
      this.scene.restart()
    })
    panel.add([bg, title, ...resume, ...restart])
  }

  private addButton(x: number, y: number, label: string, action: () => void) {
    const [bg, text] = this.makeButton(x, y, label, action)
    bg.setScrollFactor(0).setDepth(82)
    text.setScrollFactor(0).setDepth(83)
  }

  private makeButton(x: number, y: number, label: string, action: () => void) {
    const bg = this.add
      .rectangle(x, y, 126, 44, 0xd8b35f, 0.96)
      .setInteractive({ useHandCursor: true })
    const text = this.add
      .text(x, y, label, {
        color: '#1d1007',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '20px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    bg.on('pointerdown', action)
    text.on('pointerdown', action)
    return [bg, text] as const
  }

  private publishRunning(muted = getAudio(this.registry).isMuted) {
    const distance = this.distance()
    getCallbacks(this.registry)?.onEvent?.({
      type: 'running',
      distance,
      hp: this.hp,
      shield: this.shield,
      stones: this.stones,
      pressure: Math.round(this.pressure),
      realm: this.realmFor(distance),
      muted,
    })
  }

  private distance() {
    return Math.max(0, Math.floor(this.player.x - levelConfig.playerStartX))
  }

  private realmFor(distance: number) {
    return (
      realmStops
        .slice()
        .reverse()
        .find((realm) => distance >= realm.distance)?.label ??
      realmStops[0].label
    )
  }

  private causeFor(kind: FlightObstacleKind) {
    if (kind === 'thunderCloud') return '雷云压顶，御剑也要绕着天威走。'
    if (kind === 'runeRing') return '阵环扣住去路，慢一步就被困在局里。'
    return '剑光横扫，谨慎了一路还是擦着锋芒。'
  }
}
