export const gameSize = {
  width: 960,
  height: 540,
}

export const assetBase = '/media/game/han-runner'
const spriteVersion = 'cutout-v2'
const flightVersion = 'sword-flight-v1'

export const assetKeys = {
  runner: 'runner-arcade',
  atlas: 'arcade-atlas',
  flightProps: 'flight-props',
  flightPanorama: 'flight-panorama',
  far: 'bg-far',
  mid: 'bg-mid',
  near: 'bg-near',
  clearGate: 'bg-clear-gate',
  intro1: 'intro-1',
  intro2: 'intro-2',
  intro3: 'intro-3',
  intro4: 'intro-4',
}

export const assetManifest = {
  spritesheets: [
    {
      key: assetKeys.runner,
      url: `${assetBase}/sprites/runner-arcade-sheet.png?v=${spriteVersion}`,
      frameWidth: 224,
      frameHeight: 224,
    },
    {
      key: assetKeys.atlas,
      url: `${assetBase}/sprites/atlas-arcade-sheet.png?v=${spriteVersion}`,
      frameWidth: 224,
      frameHeight: 224,
    },
    {
      key: assetKeys.flightProps,
      url: `${assetBase}/sprites/flight-props-sheet.png?v=${flightVersion}`,
      frameWidth: 400,
      frameHeight: 400,
    },
  ],
  images: [
    {
      key: assetKeys.flightPanorama,
      url: `${assetBase}/backgrounds/sword-flight-panorama.webp?v=${flightVersion}`,
    },
    { key: assetKeys.far, url: `${assetBase}/backgrounds/far.webp` },
    { key: assetKeys.mid, url: `${assetBase}/backgrounds/mid.webp` },
    { key: assetKeys.near, url: `${assetBase}/backgrounds/near.webp` },
    {
      key: assetKeys.clearGate,
      url: `${assetBase}/backgrounds/sect-gate-clear.webp`,
    },
    { key: assetKeys.intro1, url: `${assetBase}/cutscenes/intro-1.webp` },
    { key: assetKeys.intro2, url: `${assetBase}/cutscenes/intro-2.webp` },
    { key: assetKeys.intro3, url: `${assetBase}/cutscenes/intro-3.webp` },
    { key: assetKeys.intro4, url: `${assetBase}/cutscenes/intro-4.webp` },
  ],
}
