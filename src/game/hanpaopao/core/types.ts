import type { Box3, Group, Object3D } from 'three'
import type { HeightIndex, LaneIndex } from '../config/gameConfig'

export type GameState = 'story' | 'ready' | 'running' | 'paused' | 'over'

export type ObstacleKind =
  | 'floating-rock'
  | 'thunder-gate'
  | 'barrier-gate'
  | 'demon-orb'
  | 'broken-platform'

export type CollectibleKind =
  | 'spirit-stone'
  | 'elixir'
  | 'talisman'
  | 'sword-energy'

export interface ObstacleEntity {
  id: number
  kind: ObstacleKind
  group: Group
  colliders: Object3D[]
  box: Box3
  active: boolean
  lane: LaneIndex
  level: HeightIndex
  penalty: number
  large: boolean
  spin: number
  warned: boolean
  passed: boolean
}

export interface CollectibleEntity {
  id: number
  kind: CollectibleKind
  object: Object3D
  box: Box3
  active: boolean
  spin: number
}

export interface PlayerStats {
  hp: number
  qi: number
  distance: number
  spiritStones: number
  elixirs: number
  talismans: number
  swordEnergy: number
  score: number
  combo: number
  comboMultiplier: number
  nearMisses: number
  rescueCount: number
}

export interface GameSnapshot extends PlayerStats {
  chasePressure: number
  bestDistance: number
  bestScore: number
  nextMilestone: number
  shieldSeconds: number
  dashSeconds: number
  boostSeconds: number
  gameOverReason: string
  muted: boolean
  reducedMotion: boolean
  paused: boolean
  over: boolean
}
