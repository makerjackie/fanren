export const LANES = [-6, -3, 0, 3, 6] as const
export const HEIGHT_LEVELS = [0.8, 2.25, 3.7] as const

export const GAME_CONFIG = {
  baseSpeed: 22,
  maxSpeed: 40,
  speedRampPerSecond: 0.22,
  dashDuration: 1.15,
  dashMultiplier: 1.8,
  boostMultiplier: 1.34,
  boostSpiritCostPerSecond: 12,
  shieldDuration: 4.2,
  obstacleSpawnDistance: 31,
  collectibleSpawnDistance: 18,
  startGraceSeconds: 2.8,
  playerRadius: 0.85,
  despawnZ: 15,
  spawnZMin: -110,
  spawnZMax: -145,
  worldResetZ: 70,
  bestDistanceKey: 'xianxia-runner-best-distance',
  bestScoreKey: 'xianxia-runner-best-score',
  milestoneStep: 300,
  comboWindowSeconds: 4.2,
  rescueShieldSeconds: 6,
  hitInvulnerabilitySeconds: 0.55,
  soundMutedKey: 'xianxia-runner-sound-muted',
  reducedMotionKey: 'xianxia-runner-reduced-motion',
}

export type LaneIndex = 0 | 1 | 2 | 3 | 4
export type HeightIndex = 0 | 1 | 2

export const clampLane = (lane: number): LaneIndex =>
  Math.max(0, Math.min(LANES.length - 1, lane)) as LaneIndex

export const clampHeight = (height: number): HeightIndex =>
  Math.max(0, Math.min(HEIGHT_LEVELS.length - 1, height)) as HeightIndex
