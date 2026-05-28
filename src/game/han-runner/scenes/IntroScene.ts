import * as Phaser from 'phaser'

import { assetKeys, gameSize } from '../config/assets'
import { getAudio, getCallbacks } from '../systems/GameRegistry'

const frames = [
  {
    key: assetKeys.intro1,
    caption: '五里沟清晨，亲人把路送到村口。',
  },
  {
    key: assetKeys.intro2,
    caption: '少年回头看了一眼，山外还有更长的命数。',
  },
  {
    key: assetKeys.intro3,
    caption: '挥手之后，江湖和仙门都不会等人。',
  },
  {
    key: assetKeys.intro4,
    caption: '风声一起，韩立踏剑入云。',
  },
]

export class IntroScene extends Phaser.Scene {
  private frameImage?: Phaser.GameObjects.Image
  private caption?: Phaser.GameObjects.Text
  private index = 0
  private playing = false
  private canSkipAt = Number.POSITIVE_INFINITY
  private timers: Phaser.Time.TimerEvent[] = []

  constructor() {
    super('IntroScene')
  }

  create() {
    const { width, height } = gameSize
    this.cameras.main.setBackgroundColor('#090807')
    getCallbacks(this.registry)?.onEvent?.({
      type: 'intro',
      caption: '挥手之后，云路就在脚下。',
      index: 0,
      total: frames.length,
    })

    this.add
      .text(width / 2, 86, '开场', {
        color: '#d8b35f',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '18px',
        letterSpacing: 4,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 136, '亲人告别', {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '58px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 196, '挥手之后，云路就在脚下。', {
        color: 'rgba(255,243,201,0.72)',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '20px',
      })
      .setOrigin(0.5)

    const startButton = this.add
      .text(width / 2, height - 128, '启程', {
        backgroundColor: '#d8b35f',
        color: '#1d1007',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '26px',
        padding: { x: 30, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const skip = this.add
      .text(width / 2, height - 72, 'Space / 点击跳过过场', {
        color: 'rgba(255,243,201,0.58)',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '16px',
      })
      .setOrigin(0.5)

    const start = () => {
      if (this.playing) return
      this.playing = true
      this.canSkipAt = this.time.now + 420
      startButton.destroy()
      skip.destroy()
      void getAudio(this.registry).play('intro')
      this.playCutscene()
    }

    startButton.on('pointerdown', start)
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.playing) start()
      else if (this.time.now >= this.canSkipAt) this.startRun()
    })
    this.input.on('pointerdown', () => {
      if (!this.playing) start()
      else if (this.time.now >= this.canSkipAt) this.startRun()
    })
  }

  private playCutscene() {
    this.showFrame(0)
    for (let i = 1; i < frames.length; i += 1) {
      this.timers.push(
        this.time.delayedCall(i * 1900, () => {
          this.showFrame(i)
        }),
      )
    }
    this.timers.push(
      this.time.delayedCall(frames.length * 1900 + 400, () => this.startRun()),
    )
  }

  private showFrame(index: number) {
    const { width, height } = gameSize
    this.index = index
    this.frameImage?.destroy()
    this.caption?.destroy()

    this.frameImage = this.add
      .image(width / 2, height / 2 - 8, frames[index].key)
      .setDisplaySize(820, 369)
      .setAlpha(0)
    this.tweens.add({ targets: this.frameImage, alpha: 1, duration: 280 })

    this.caption = this.add
      .text(width / 2, height - 64, frames[index].caption, {
        color: '#fff3c9',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '23px',
      })
      .setOrigin(0.5)
      .setAlpha(0)
    this.tweens.add({
      targets: this.caption,
      alpha: 1,
      duration: 260,
      delay: 100,
    })
    getCallbacks(this.registry)?.onEvent?.({
      type: 'intro',
      caption: frames[index].caption,
      index: index + 1,
      total: frames.length,
    })
  }

  private startRun() {
    for (const timer of this.timers) timer.remove(false)
    this.scene.start('VillageRunScene')
  }
}
