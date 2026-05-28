import type { EnemyKind, LevelObjectKind, PickupKind } from './level'

export const runnerFrames = {
  idle: [0, 1, 2],
  run: [8, 9, 10, 11, 12, 13, 14, 15],
  jump: [16, 17, 18],
  crouch: [19, 20],
  attack: [21, 22, 23],
  hit: [24, 25, 26],
  roll: [27, 28, 29],
  caught: [30, 31],
}

export const atlasFrames = {
  boss: [0, 1, 2, 3],
  enemies: {
    bandit: [4, 5],
    insect: [6, 7],
  } satisfies Record<EnemyKind, number[]>,
  objects: {
    stone: 8,
    spikes: 9,
    flame: 10,
    sword: 11,
    fog: 12,
    thunder: 13,
    crate: 14,
  } satisfies Record<LevelObjectKind, number>,
  pickups: {
    bottle: 16,
    talisman: 17,
    pill: 18,
    stone: 19,
  } satisfies Record<PickupKind, number>,
  effects: {
    swordSlash: 24,
    dust: 25,
    shield: 26,
    bottleAura: 27,
    thunderStrike: 28,
    fogHit: 29,
    pickup: 30,
    clear: 31,
  },
}

export const flightPropFrames = {
  flyingSword: 0,
  tiltedSword: 1,
  bottle: 2,
  talisman: 3,
  pill: 4,
  spiritStone: 5,
  thunderCloud: 6,
  runeRing: 7,
  swordLight: 8,
  dustBurst: 9,
}

export const slopeRiderFrames = {
  glide: 0,
  dive: 1,
  jump: 2,
  air: 3,
  land: 4,
  hit: 5,
}
