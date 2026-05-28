import * as Phaser from 'phaser'

import { assetKeys, gameSize } from '../config/assets'
import { flightPropFrames, slopeRiderFrames } from '../config/frames'
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
  thunderCloud: { w: 214, h: 108, ox: 88, oy: 156, scale: 0.34 },
  runeRing: { w: 180, h: 180, ox: 110, oy: 110, scale: 0.3 },
  swordLight: { w: 236, h: 92, ox: 82, oy: 146, scale: 0.3 },
}

const pickupFrames: Record<PickupKind, number> = {
  bottle: flightPropFrames.bottle,
  talisman: flightPropFrames.talisman,
  pill: flightPropFrames.pill,
  stone: flightPropFrames.spiritStone,
}

const pickupScale: Record<PickupKind, number> = {
  bottle: 0.18,
  talisman: 0.17,
  pill: 0.17,
  stone: 0.18,
}

const terrainStep = 24
const maxSlopeAngle = 0.78

export class VillageRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private sword!: Phaser.GameObjects.Sprite
  private trail!: Phaser.GameObjects.Graphics
  private terrain!: Phaser.GameObjects.Graphics
  private ridge!: Phaser.GameObjects.Graphics
  private obstacles!: Phaser.Physics.Arcade.Group
  private pickups!: Phaser.Physics.Arcade.Group
  private keys!: ControlKeys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private panorama!: Phaser.GameObjects.TileSprite
  private mist!: Phaser.GameObjects.TileSprite
  private boss!: Phaser.GameObjects.Sprite
  private hudText!: Phaser.GameObjects.Text
  private pressureBar!: Phaser.GameObjects.Rectangle
  private hp = 4
  private shield = 0
  private stones = 0
  private pressure = 16
  private invincibleUntil = 0
  private boostUntil = 0
  private boostReadyAt = 0
  private slashReadyAt = 0
  private nextHitAt = 0
  private vx = 318
  private vy = 0
  private boardAngle = 0
  private grounded = true
  private diving = false
  private landPoseUntil = 0
  private hitPoseUntil = 0
  private ended = false
  private paused = false
  private musicMode: 'run' | 'danger' = 'run'
  private mobileDive = false
  private mobileDiveUntil = 0
  private mobileJumpQueued = false
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

    const dt = Math.min(deltaMs / 1000, 0.033)
    this.updateBackground()
    this.updatePlayer(time, dt)
    this.updateBoard()
    this.updatePressure(time, dt)
    this.updateHud()
    this.checkFinish()
  }

  private resetState() {
    this.hp = 4
    this.shield = 0
    this.stones = 0
    this.pressure = 16
    this.invincibleUntil = 0
    this.boostUntil = 0
    this.boostReadyAt = 0
    this.slashReadyAt = 0
    this.nextHitAt = 0
    this.vx = 318
    this.vy = 0
    this.boardAngle = 0
    this.grounded = true
    this.diving = false
    this.landPoseUntil = 0
    this.hitPoseUntil = 0
    this.ended = false
    this.paused = false
    this.musicMode = 'run'
    this.mobileDive = false
    this.mobileDiveUntil = 0
    this.mobileJumpQueued = false
    this.mobileBoostQueued = false
    this.mobileSlashQueued = false
  }

  private createWorld() {
    const { width, height } = gameSize
    this.cameras.main.setBounds(0, 0, levelConfig.worldWidth, height)
    this.physics.world.setBounds(0, 0, levelConfig.worldWidth, height)

    this.panorama = this.add
      .tileSprite(0, 0, width, height, assetKeys.flightPanorama)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(0)
    this.panorama.tilePositionY = 56

    this.mist = this.add
      .tileSprite(0, height - 150, width, 170, assetKeys.flightPanorama)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(2)
      .setAlpha(0.2)
      .setTint(0xe7fff6)
    this.mist.tileScaleX = 0.72
    this.mist.tileScaleY = 0.28
    this.mist.tilePositionY = 412

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x050608, 0.06)
      .setScrollFactor(0)
      .setDepth(3)
    this.add
      .rectangle(width / 2, 34, width, 68, 0x050608, 0.34)
      .setScrollFactor(0)
      .setDepth(4)
    this.add
      .rectangle(width / 2, height - 18, width, 36, 0x050608, 0.28)
      .setScrollFactor(0)
      .setDepth(12)

    this.terrain = this.add.graphics().setDepth(5)
    this.ridge = this.add.graphics().setDepth(6)
    this.drawTerrain()

    for (const chapter of flightChapters) {
      this.add
        .text(chapter.x, 82, chapter.title, {
          color: 'rgba(255,243,201,0.78)',
          fontFamily: '"Songti SC", "Noto Serif SC", serif',
          fontSize: '18px',
        })
        .setOrigin(0.5)
        .setDepth(7)
    }
  }

  private drawTerrain() {
    const { height } = gameSize
    this.terrain.clear()
    this.terrain.fillStyle(0x15110d, 0.86)
    this.terrain.beginPath()
    this.terrain.moveTo(0, height + 80)
    for (
      let x = 0;
      x <= levelConfig.worldWidth + terrainStep;
      x += terrainStep
    ) {
      this.terrain.lineTo(x, this.terrainY(x))
    }
    this.terrain.lineTo(levelConfig.worldWidth + 180, height + 80)
    this.terrain.closePath()
    this.terrain.fillPath()

    this.ridge.clear()
    this.ridge.lineStyle(4, 0xf5d889, 0.38)
    this.ridge.beginPath()
    this.ridge.moveTo(0, this.terrainY(0))
    for (let x = terrainStep; x <= levelConfig.worldWidth; x += terrainStep) {
      this.ridge.lineTo(x, this.terrainY(x))
    }
    this.ridge.strokePath()
    this.ridge.lineStyle(1, 0x9ff5ff, 0.28)
    this.ridge.beginPath()
    this.ridge.moveTo(0, this.terrainY(0) - 9)
    for (let x = terrainStep; x <= levelConfig.worldWidth; x += terrainStep) {
      this.ridge.lineTo(x, this.terrainY(x) - 9)
    }
    this.ridge.strokePath()
  }

  private createAnimations() {
    const createRiderAnim = (
      key: string,
      frames: number[],
      frameRate: number,
      repeat = -1,
    ) => {
      if (this.anims.exists(key)) return
      this.anims.create({
        key,
        frames: frames.map((frame) => ({ key: assetKeys.slopeRider, frame })),
        frameRate,
        repeat,
      })
    }

    createRiderAnim('rider-glide', [slopeRiderFrames.glide], 1)
    createRiderAnim('rider-dive', [slopeRiderFrames.dive], 1)
    createRiderAnim('rider-jump', [slopeRiderFrames.jump], 1)
    createRiderAnim('rider-air', [slopeRiderFrames.air], 1)
    createRiderAnim('rider-land', [slopeRiderFrames.land], 1, 0)
    createRiderAnim('rider-hit', [slopeRiderFrames.hit], 1, 0)
  }

  private createPlayer() {
    this.trail = this.add.graphics().setDepth(8)
    const startGround = this.terrainY(levelConfig.playerStartX)
    this.sword = this.add
      .sprite(
        levelConfig.playerStartX,
        startGround - 20,
        assetKeys.flightProps,
        flightPropFrames.flyingSword,
      )
      .setScale(0.3)
      .setDepth(9)
      .setVisible(false)

    this.player = this.physics.add
      .sprite(
        levelConfig.playerStartX,
        startGround - levelConfig.riderOffsetY,
        assetKeys.slopeRider,
        slopeRiderFrames.glide,
      )
      .setScale(0.28)
      .setDepth(11)
      .setCollideWorldBounds(false)

    this.player.body?.setAllowGravity(false)
    this.player.body?.setSize(188, 178).setOffset(70, 276)
    this.player.play('rider-glide')
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -260, 0)
    this.cameras.main.setDeadzone(210, 110)
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
      const y = this.terrainY(obstacle.x) + obstacle.offsetY
      const sprite = this.obstacles
        .create(
          obstacle.x,
          y,
          assetKeys.flightProps,
          obstacleFrames[obstacle.kind],
        )
        .setScale(body.scale)
        .setDepth(
          obstacle.kind === 'swordLight' ? 10 : 7,
        ) as Phaser.Physics.Arcade.Sprite
      sprite.setData('kind', obstacle.kind)
      sprite.body?.setAllowGravity(false)
      sprite.body?.setSize(body.w, body.h).setOffset(body.ox, body.oy)
      this.tweens.add({
        targets: sprite,
        y: sprite.y + (obstacle.kind === 'runeRing' ? 10 : 7),
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
          this.terrainY(pickup.x) + pickup.offsetY,
          assetKeys.flightProps,
          pickupFrames[pickup.kind],
        )
        .setScale(pickupScale[pickup.kind])
        .setDepth(10) as Phaser.Physics.Arcade.Sprite
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

    makeButton(52, '跃', () => (this.mobileJumpQueued = true))
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
      this.mobileJumpQueued = true
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
    this.panorama.tilePositionX = scrollX * 0.26
    this.mist.tilePositionX = scrollX * 0.74
  }

  private updatePlayer(time: number, dt: number) {
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      this.mobileJumpQueued
    const dive =
      this.keys.S.isDown ||
      this.cursors.down.isDown ||
      this.mobileDive ||
      time < this.mobileDiveUntil
    const boostPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) || this.mobileBoostQueued
    const slashPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.J) || this.mobileSlashQueued
    this.diving = dive

    this.mobileJumpQueued = false
    this.mobileBoostQueued = false
    this.mobileSlashQueued = false

    if (boostPressed && time >= this.boostReadyAt) {
      this.boostUntil = time + 680
      this.boostReadyAt = time + 1500
      this.vx += 92
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

    if (this.grounded) {
      this.updateGroundedPlayer(time, dt, jumpPressed, dive)
    } else {
      this.updateAirbornePlayer(dt, dive)
    }

    this.vx = Phaser.Math.Clamp(
      this.vx,
      230,
      time < this.boostUntil ? 690 : 590,
    )
    this.player.x += this.vx * dt
    this.player.body?.updateFromGameObject()
  }

  private updateGroundedPlayer(
    time: number,
    dt: number,
    jumpPressed: boolean,
    dive: boolean,
  ) {
    const terrainY = this.terrainY(this.player.x)
    const slope = this.terrainSlope(this.player.x)
    const slopeAngle = Phaser.Math.Clamp(
      Math.atan(slope),
      -maxSlopeAngle,
      maxSlopeAngle,
    )
    this.boardAngle = Phaser.Math.Linear(this.boardAngle, slopeAngle, 0.2)
    this.player.y = terrainY - levelConfig.riderOffsetY
    this.vy = 0

    const downhill = Math.sin(slopeAngle) * 760
    const drag = dive ? 10 : 34
    this.vx += (downhill - drag) * dt
    if (dive) this.vx += 42 * dt

    if (jumpPressed) {
      this.grounded = false
      this.vy = -360 - Math.max(0, this.vx - 300) * 0.22
      this.vx += Math.max(0, Math.sin(slopeAngle)) * 70
      this.player.y -= 4
      this.spawnEffect(
        this.player.x - 38,
        this.player.y + 72,
        flightPropFrames.dustBurst,
        0.22,
      )
      getAudio(this.registry).jump()
    }

    if (dive && time % 130 < 18) {
      this.spawnTinyDust()
    }
  }

  private updateAirbornePlayer(dt: number, dive: boolean) {
    const gravity = dive ? 1320 : 840
    this.vy = Phaser.Math.Clamp(this.vy + gravity * dt, -620, 920)
    this.player.y += this.vy * dt
    this.boardAngle += (dive ? 2.8 : 0.9) * dt

    const landingY = this.terrainY(this.player.x) - levelConfig.riderOffsetY
    if (this.player.y >= landingY) {
      this.player.y = landingY
      this.landOnSlope()
    }
  }

  private landOnSlope() {
    const slopeAngle = Phaser.Math.Clamp(
      Math.atan(this.terrainSlope(this.player.x)),
      -maxSlopeAngle,
      maxSlopeAngle,
    )
    const mismatch = Math.abs(
      Phaser.Math.Angle.Wrap(this.boardAngle - slopeAngle),
    )
    this.grounded = true
    this.boardAngle = slopeAngle

    if (mismatch < 0.42 && this.vy < 850) {
      this.vx += 78
      this.pressure = Math.max(0, this.pressure - 4)
      this.landPoseUntil = this.time.now + 240
      this.spawnEffect(
        this.player.x - 34,
        this.player.y + 72,
        flightPropFrames.dustBurst,
        0.24,
      )
      getAudio(this.registry).pickup()
      return
    }

    this.vx = Math.max(245, this.vx - 92)
    this.pressure = Math.min(99, this.pressure + 9)
    this.spawnEffect(
      this.player.x - 26,
      this.player.y + 72,
      flightPropFrames.dustBurst,
      0.22,
    )
    getAudio(this.registry).hit()
  }

  private updateBoard() {
    const angle = Phaser.Math.RadToDeg(this.boardAngle)
    this.sword
      .setPosition(this.player.x + 4, this.player.y + 58)
      .setAngle(angle)
      .setScale(this.time.now < this.boostUntil ? 0.36 : 0.3)
    this.player.setAngle(angle * 0.82)

    if (this.time.now < this.hitPoseUntil) this.player.play('rider-hit', true)
    else if (this.time.now < this.landPoseUntil)
      this.player.play('rider-land', true)
    else if (this.grounded && this.diving) this.player.play('rider-dive', true)
    else if (this.grounded) this.player.play('rider-glide', true)
    else if (this.vy < -90) this.player.play('rider-jump', true)
    else this.player.play('rider-air', true)

    this.trail.clear()
    const glow = this.time.now < this.boostUntil ? 0.88 : 0.5
    this.trail.lineStyle(3, 0xa6f7ff, glow)
    this.trail.beginPath()
    this.trail.moveTo(this.sword.x - 50, this.sword.y + 2)
    this.trail.lineTo(this.sword.x - 120, this.sword.y + 18)
    this.trail.lineTo(this.sword.x - 190, this.sword.y + 8)
    this.trail.strokePath()
    this.trail.lineStyle(1, 0xf5d889, 0.42)
    this.trail.beginPath()
    this.trail.moveTo(this.sword.x - 38, this.sword.y - 12)
    this.trail.lineTo(this.sword.x - 152, this.sword.y - 24)
    this.trail.strokePath()
  }

  private updatePressure(time: number, dt: number) {
    const distance = this.distance()
    this.pressure = Math.min(99, this.pressure + dt * (0.62 + distance / 5200))
    if (this.vx < 275) this.pressure = Math.min(99, this.pressure + dt * 2.4)
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
      `境界 ${this.realmFor(distance)}    灵石 ${this.stones}    护符 ${this.shield}    速度 ${Math.round(this.vx)}`,
    )
    this.pressureBar.width = 300 * (this.pressure / 100)
    this.publishRunning()
  }

  private checkFinish() {
    if (this.player.x >= levelConfig.finishX) {
      this.finish('clear', '一线剑光顺坡掠过雷云，暂时把追兵甩在身后。')
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
      this.vx += 110
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
    this.vx = Math.max(220, this.vx - 86)
    this.pressure = Math.min(100, this.pressure + 12)
    this.player.setTint(0xffb6a0)
    this.hitPoseUntil = this.time.now + 420
    this.player.play('rider-hit', true)
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

  private spawnTinyDust() {
    if (!this.grounded) return
    const dot = this.add
      .circle(this.sword.x - 52, this.sword.y + 10, 3, 0xf5d889, 0.42)
      .setDepth(8)
    this.tweens.add({
      targets: dot,
      x: dot.x - 46,
      y: dot.y + 16,
      alpha: 0,
      duration: 360,
      onComplete: () => dot.destroy(),
    })
  }

  private finish(outcome: 'clear' | 'caught', cause: string) {
    if (this.ended) return
    this.ended = true
    this.player.setAngle(0)
    this.sword.setAngle(0)
    this.trail.clear()
    this.player.play(outcome === 'clear' ? 'rider-glide' : 'rider-hit', true)
    getAudio(this.registry).stop()
    if (outcome === 'clear') getAudio(this.registry).clear()
    const event: RunnerGameEvent = {
      type: 'result',
      outcome,
      distance: this.distance(),
      hp: this.hp,
      stones: this.stones,
      realm: this.realmFor(this.distance()),
      title: outcome === 'clear' ? '御剑掠过这一程' : '风紧，剑势乱了半拍',
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
      .text(0, -44, '坡上收势', {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '34px',
      })
      .setOrigin(0.5)
    const resume = this.makeButton(-74, 42, '继续', () => {
      panel.destroy()
      this.paused = false
      void getAudio(this.registry).play(this.musicMode)
    })
    const restart = this.makeButton(82, 42, '重开', () => {
      panel.destroy()
      this.paused = false
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

  private terrainY(x: number) {
    const points = levelConfig.terrain
    const clampedX = Phaser.Math.Clamp(
      x,
      points[0].x,
      points[points.length - 1].x,
    )
    const nextIndex = points.findIndex((point) => point.x >= clampedX)
    const rightIndex = Phaser.Math.Clamp(
      nextIndex <= 0 ? 1 : nextIndex,
      1,
      points.length - 1,
    )
    const leftIndex = rightIndex - 1
    const left = points[leftIndex]
    const right = points[rightIndex]
    const t = Phaser.Math.Clamp((clampedX - left.x) / (right.x - left.x), 0, 1)
    const eased = t * t * (3 - 2 * t)

    return Phaser.Math.Linear(left.y, right.y, eased)
  }

  private terrainSlope(x: number) {
    const delta = 8
    return (this.terrainY(x + delta) - this.terrainY(x - delta)) / (delta * 2)
  }

  private causeFor(kind: FlightObstacleKind) {
    if (kind === 'thunderCloud') return '雷云压顶，御剑也要绕着天威走。'
    if (kind === 'runeRing') return '落地角度乱了，阵环趁势扣住去路。'
    return '剑光横扫，谨慎了一路还是擦着锋芒。'
  }
}
