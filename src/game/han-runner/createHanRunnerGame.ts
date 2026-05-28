import * as Phaser from 'phaser'

import { gameSize } from './config/assets'
import { IntroScene } from './scenes/IntroScene'
import { PreloadScene } from './scenes/PreloadScene'
import { VillageRunScene } from './scenes/VillageRunScene'
import { getAudio, setCallbacks } from './systems/GameRegistry'
import type { RunnerGameCallbacks } from './types'

export function createHanRunnerGame(
  parent: HTMLElement,
  callbacks: RunnerGameCallbacks = {},
) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: gameSize.width,
    height: gameSize.height,
    backgroundColor: '#090807',
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameSize.width,
      height: gameSize.height,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1380 },
        debug: false,
      },
    },
    render: {
      antialias: true,
      roundPixels: false,
    },
    scene: [PreloadScene, IntroScene, VillageRunScene],
  })

  setCallbacks(game.registry, callbacks)

  const originalDestroy = game.destroy.bind(game)
  game.destroy = (...args: Parameters<Phaser.Game['destroy']>) => {
    getAudio(game.registry).dispose()
    originalDestroy(...args)
  }

  return game
}

export type HanRunnerPhaserGame = Phaser.Game
