import type { CollectibleKind, ObstacleKind } from './types'

export interface DifficultyProfile {
  readonly obstacleSpawnDistance: number
  readonly collectibleSpawnDistance: number
  readonly secondObstacleChance: number
  readonly maxSpeedBonus: number
}

export interface ObstacleImpact {
  readonly pressure: number
  readonly damage: number
  readonly qiDrain: number
}

export interface CollectibleEffect {
  readonly qiGain: number
  readonly hpGain: number
  readonly chaseReduction: number
  readonly comboGain: number
  readonly scoreGain: number
}

export interface MilestoneReward {
  readonly qiGain: number
  readonly hpGain: number
  readonly chaseReduction: number
  readonly comboGain: number
  readonly scoreGain: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const clampPercent = (value: number): number =>
  clamp(Number.isFinite(value) ? value : 0, 0, 100)

export const getPressureBand = (pressure: number): number => {
  const value = clampPercent(pressure)
  if (value >= 88) return 3
  if (value >= 72) return 2
  if (value >= 56) return 1
  return 0
}

export const getComboMultiplier = (combo: number): number => {
  const normalizedCombo = Math.max(
    0,
    Math.floor(Number.isFinite(combo) ? combo : 0),
  )
  return Math.min(2.5, 1 + Math.floor(normalizedCombo / 5) * 0.25)
}

export const getChasePressureDelta = (
  delta: number,
  qi: number,
  speedRatio = 0,
): number => {
  const dt = Math.max(0, Number.isFinite(delta) ? delta : 0)
  const normalizedQi = clampPercent(qi)
  const normalizedSpeed = clamp(
    Number.isFinite(speedRatio) ? speedRatio : 0,
    0,
    1.35,
  )
  const qiPenalty = normalizedQi <= 0 ? 2.2 : normalizedQi < 22 ? 0.7 : 0
  const speedPressure = normalizedSpeed * 0.58
  return (0.52 + speedPressure + qiPenalty) * dt
}

export const getDifficultyProfile = (distance: number): DifficultyProfile => {
  const meters = Math.max(0, Number.isFinite(distance) ? distance : 0)
  const tier = Math.min(1, meters / 1800)
  const earlyRamp = Math.min(1, meters / 520)

  return {
    obstacleSpawnDistance: 31 - earlyRamp * 7 - tier * 3,
    collectibleSpawnDistance: 18 + tier * 2.5,
    secondObstacleChance: clamp(
      0.18 + earlyRamp * 0.24 + tier * 0.2,
      0.18,
      0.62,
    ),
    maxSpeedBonus: tier * 3,
  }
}

export const getObstacleImpact = (
  kind: ObstacleKind,
  protectedHit: boolean,
  penalty: number,
): ObstacleImpact => {
  const normalizedPenalty = Math.max(0, Number.isFinite(penalty) ? penalty : 0)
  const large = kind === 'barrier-gate' || kind === 'broken-platform'
  return {
    pressure: protectedHit
      ? Math.round(normalizedPenalty * 0.22)
      : normalizedPenalty,
    damage: protectedHit ? 4 : large ? 18 : 11,
    qiDrain: protectedHit ? 4 : kind === 'demon-orb' ? 20 : 10,
  }
}

export const getCollectibleEffect = (
  kind: CollectibleKind,
): CollectibleEffect => {
  if (kind === 'elixir') {
    return {
      qiGain: 25,
      hpGain: 8,
      chaseReduction: 15,
      comboGain: 2,
      scoreGain: 95,
    }
  }

  if (kind === 'talisman') {
    return {
      qiGain: 0,
      hpGain: 0,
      chaseReduction: 5,
      comboGain: 2,
      scoreGain: 120,
    }
  }

  if (kind === 'sword-energy') {
    return {
      qiGain: 8,
      hpGain: 0,
      chaseReduction: 10,
      comboGain: 3,
      scoreGain: 140,
    }
  }

  return {
    qiGain: 1.6,
    hpGain: 0,
    chaseReduction: 0,
    comboGain: 1,
    scoreGain: 22,
  }
}

export const getMilestoneReward = (
  milestoneMeters: number,
): MilestoneReward => {
  const tier = Math.min(4, Math.floor(Math.max(0, milestoneMeters) / 900))
  return {
    qiGain: 14 + tier * 2,
    hpGain: tier >= 2 ? 4 : 0,
    chaseReduction: 7 + tier,
    comboGain: 2,
    scoreGain: 240 + tier * 35,
  }
}

export const getMagnetRadius = (dashing: boolean, boosted: boolean): number => {
  if (dashing) return 2.8
  if (boosted) return 2.1
  return 0
}
