export type FlightObstacleKind = 'thunderCloud' | 'runeRing' | 'swordLight'

export type PickupKind = 'bottle' | 'talisman' | 'pill' | 'stone'

export type FlightObstacle = {
  kind: FlightObstacleKind
  x: number
  offsetY: number
}

export type LevelPickup = {
  kind: PickupKind
  x: number
  offsetY: number
}

export type TerrainPoint = {
  x: number
  y: number
}

export const realmStops = [
  { distance: 0, label: '凡人' },
  { distance: 900, label: '练气' },
  { distance: 1900, label: '筑基' },
  { distance: 3150, label: '结丹' },
  { distance: 4550, label: '元婴' },
]

export const flightChapters = [
  { x: 420, title: '七玄门山色' },
  { x: 1280, title: '黄枫谷云台' },
  { x: 2360, title: '血色禁地' },
  { x: 3580, title: '乱星海潮' },
  { x: 4920, title: '雷云古殿' },
]

export const levelConfig = {
  worldWidth: 6200,
  finishX: 5850,
  playerStartX: 120,
  playerStartY: 306,
  flightTopY: 108,
  flightBottomY: 438,
  riderOffsetY: 92,
  terrain: [
    { x: 0, y: 430 },
    { x: 280, y: 426 },
    { x: 620, y: 382 },
    { x: 940, y: 404 },
    { x: 1240, y: 350 },
    { x: 1580, y: 424 },
    { x: 1960, y: 466 },
    { x: 2360, y: 414 },
    { x: 2740, y: 360 },
    { x: 3160, y: 448 },
    { x: 3540, y: 474 },
    { x: 3960, y: 402 },
    { x: 4380, y: 356 },
    { x: 4780, y: 430 },
    { x: 5200, y: 468 },
    { x: 5660, y: 390 },
    { x: 6200, y: 420 },
  ] satisfies TerrainPoint[],
  obstacles: [
    { kind: 'thunderCloud', x: 1280, offsetY: -166 },
    { kind: 'runeRing', x: 1700, offsetY: -88 },
    { kind: 'swordLight', x: 1960, offsetY: -126 },
    { kind: 'runeRing', x: 2240, offsetY: -184 },
    { kind: 'swordLight', x: 2700, offsetY: -88 },
    { kind: 'thunderCloud', x: 3120, offsetY: -160 },
    { kind: 'runeRing', x: 3550, offsetY: -78 },
    { kind: 'swordLight', x: 3980, offsetY: -156 },
    { kind: 'thunderCloud', x: 4410, offsetY: -96 },
    { kind: 'runeRing', x: 4860, offsetY: -138 },
    { kind: 'swordLight', x: 5320, offsetY: -92 },
  ] satisfies FlightObstacle[],
  pickups: [
    { kind: 'stone', x: 430, offsetY: -94 },
    { kind: 'talisman', x: 760, offsetY: -142 },
    { kind: 'stone', x: 1040, offsetY: -104 },
    { kind: 'pill', x: 1280, offsetY: -154 },
    { kind: 'pill', x: 1580, offsetY: -164 },
    { kind: 'stone', x: 1970, offsetY: -96 },
    { kind: 'bottle', x: 2440, offsetY: -204 },
    { kind: 'stone', x: 2850, offsetY: -104 },
    { kind: 'talisman', x: 3280, offsetY: -172 },
    { kind: 'stone', x: 3700, offsetY: -96 },
    { kind: 'pill', x: 4160, offsetY: -168 },
    { kind: 'stone', x: 4620, offsetY: -104 },
    { kind: 'bottle', x: 5100, offsetY: -194 },
    { kind: 'stone', x: 5520, offsetY: -112 },
  ] satisfies LevelPickup[],
}
