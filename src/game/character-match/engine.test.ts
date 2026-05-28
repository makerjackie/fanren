import { describe, expect, it } from 'vitest'

import {
  applySwap,
  createInitialCharacterMatchState,
  findHint,
  findMatches,
  matchBoardSize,
} from './engine'
import type { CharacterMatchState, MatchCell, TokenId } from './engine'

const pool: TokenId[] = [
  'hanli',
  'nangong-wan',
  'zi-ling',
  'yuan-yao',
  'yinyue',
  'mo-daifu',
  'li-feiyu',
  'xin-ruyin',
  'xiang-zhili',
  'zhangtian-bottle',
]

function makeBoard(overrides: Record<number, TokenId> = {}): MatchCell[] {
  return Array.from({ length: matchBoardSize * matchBoardSize }, (_, index) => {
    const row = Math.floor(index / matchBoardSize)
    const tokenId = overrides[index] ?? pool[(row * 3 + index) % pool.length]

    return {
      id: `${tokenId}-${index}`,
      tokenId,
      rank: 1,
    }
  })
}

describe('character match engine', () => {
  it('creates a playable board without opening matches', () => {
    const state = createInitialCharacterMatchState(20260613)

    expect(findMatches(state.board)).toHaveLength(0)
    expect(findHint(state.board)).not.toBeNull()
    expect(state.dangerCells).toHaveLength(3)
  })

  it('detects horizontal matches', () => {
    const board = makeBoard({
      0: 'hanli',
      1: 'hanli',
      2: 'hanli',
    })
    const matches = findMatches(board)

    expect(
      matches.some(
        (match) =>
          match.tokenId === 'hanli' &&
          [0, 1, 2].every((index) => match.indices.includes(index)),
      ),
    ).toBe(true)
  })

  it('triggers the Hanli and bottle story skill on adjacent swap', () => {
    const initial = createInitialCharacterMatchState(17)
    const state: CharacterMatchState = {
      ...initial,
      board: makeBoard({
        0: 'hanli',
        1: 'zhangtian-bottle',
      }),
      dangerCells: [{ index: 7, turns: 3, source: '危险' }],
      score: 0,
      moves: 0,
      logs: [],
    }

    const result = applySwap(state, 0, 1)

    expect(result.moves).toBe(1)
    expect(result.score).toBeGreaterThan(0)
    expect(result.dangerCells).toHaveLength(0)
    expect(result.logs.some((log) => log.title === '韩立 + 掌天瓶')).toBe(true)
  })
})
