import * as Phaser from 'phaser'

import { assetManifest, gameSize } from '../config/assets'
import { getCallbacks } from '../systems/GameRegistry'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    const width = gameSize.width
    const height = gameSize.height
    this.cameras.main.setBackgroundColor('#080807')

    const title = this.add
      .text(width / 2, height / 2 - 54, '韩跑跑', {
        color: '#fff1c2',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '54px',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 8, '正在装载飞剑、云海和追兵', {
        color: 'rgba(255,241,194,0.72)',
        fontFamily: '"Songti SC", "Noto Serif SC", serif',
        fontSize: '20px',
      })
      .setOrigin(0.5)

    const barBg = this.add.rectangle(
      width / 2,
      height / 2 + 62,
      420,
      8,
      0x21160d,
    )
    const bar = this.add
      .rectangle(width / 2 - 210, height / 2 + 62, 1, 8, 0xf5d889)
      .setOrigin(0, 0.5)

    this.load.on('progress', (value: number) => {
      bar.width = Math.max(1, 420 * value)
      title.setAlpha(0.7 + value * 0.3)
    })

    for (const sheet of assetManifest.spritesheets) {
      this.load.spritesheet(sheet.key, sheet.url, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      })
    }

    for (const image of assetManifest.images) {
      this.load.image(image.key, image.url)
    }

    this.load.once('complete', () => {
      barBg.destroy()
      getCallbacks(this.registry)?.onEvent?.({ type: 'ready' })
    })
  }

  create() {
    this.scene.start('IntroScene')
  }
}
