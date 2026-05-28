export const matchBoardSize = 7

export type TokenId =
  | 'hanli'
  | 'nangong-wan'
  | 'zi-ling'
  | 'yuan-yao'
  | 'yinyue'
  | 'mo-daifu'
  | 'li-feiyu'
  | 'xin-ruyin'
  | 'xiang-zhili'
  | 'zhangtian-bottle'

export type TokenRank = 1 | 2

export type MatchCell = {
  id: string
  tokenId: TokenId
  rank: TokenRank
}

export type DangerCell = {
  index: number
  turns: number
  source: '危险' | '夺舍'
}

export type SkillLog = {
  title: string
  body: string
  tone: 'gold' | 'jade' | 'cinnabar' | 'moon'
}

export type CharacterMatchState = {
  board: MatchCell[]
  selectedIndex: number | null
  highlighted: number[]
  dangerCells: DangerCell[]
  score: number
  moves: number
  bond: number
  combo: number
  seed: number
  logs: SkillLog[]
}

export type SwapPreview = {
  valid: boolean
  special: boolean
  swappedBoard: MatchCell[]
  clearIndices: number[]
  lineIndices: number[]
}

type MatchGroup = {
  tokenId: TokenId
  indices: number[]
}

type NullableBoard = Array<MatchCell | null>

const tokenBag: TokenId[] = [
  'hanli',
  'hanli',
  'nangong-wan',
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

const logLimit = 5

export function createInitialCharacterMatchState(
  seed = 20260613,
): CharacterMatchState {
  const playableBoard = createPlayableBoard(seed)
  const dangerResult = pickDangerCells(
    playableBoard.board,
    playableBoard.seed,
    3,
  )

  return {
    board: playableBoard.board,
    selectedIndex: null,
    highlighted: [],
    dangerCells: dangerResult.dangers,
    score: 0,
    moves: 0,
    bond: 0,
    combo: 0,
    seed: dangerResult.seed,
    logs: [
      {
        title: '开始',
        body: '交换相邻棋子，三个一样就消除。',
        tone: 'gold',
      },
    ],
  }
}

export function chooseMatchCell(
  state: CharacterMatchState,
  index: number,
): CharacterMatchState {
  if (state.selectedIndex === null) {
    return { ...state, selectedIndex: index, highlighted: [] }
  }

  if (state.selectedIndex === index) {
    return { ...state, selectedIndex: null, highlighted: [] }
  }

  if (!areAdjacent(state.selectedIndex, index)) {
    return { ...state, selectedIndex: index, highlighted: [] }
  }

  return applySwap(state, state.selectedIndex, index)
}

export function applySwap(
  state: CharacterMatchState,
  from: number,
  to: number,
): CharacterMatchState {
  const swappedBoard = swapCells(state.board, from, to)
  const fromToken = state.board[from]?.tokenId
  const toToken = state.board[to]?.tokenId

  if (isHanliBottlePair(fromToken, toToken)) {
    const clearSet = new Set<number>([
      ...lineIndices(from, to),
      ...lineIndices(to, from),
    ])
    const resolved = resolveBoard(
      {
        ...state,
        board: swappedBoard,
        selectedIndex: null,
        highlighted: [from, to],
        moves: state.moves + 1,
      },
      clearSet,
    )

    return {
      ...resolved,
      logs: pushLog(resolved.logs, {
        title: '韩立 + 掌天瓶',
        body: '清一行一列。',
        tone: 'jade',
      }),
    }
  }

  const matches = findMatches(swappedBoard)

  if (matches.length === 0) {
    return {
      ...state,
      selectedIndex: null,
      highlighted: [from, to],
      logs: pushLog(state.logs, {
        title: '没有消除',
        body: '这一步没有三消。',
        tone: 'moon',
      }),
    }
  }

  return resolveBoard({
    ...state,
    board: swappedBoard,
    selectedIndex: null,
    highlighted: [from, to],
    moves: state.moves + 1,
  })
}

export function revealHint(state: CharacterMatchState): CharacterMatchState {
  const hint = findHint(state.board)

  if (!hint) {
    return reshuffleBoard(state, '棋盘重排', '没有可消的一步，已重排。')
  }

  return {
    ...state,
    highlighted: hint,
    selectedIndex: null,
    logs: pushLog(state.logs, {
      title: '提示',
      body: '这两个棋子可以交换。',
      tone: 'gold',
    }),
  }
}

export function reshuffleBoard(
  state: CharacterMatchState,
  title = '重排',
  body = '棋子已重新排列。',
): CharacterMatchState {
  const playableBoard = createPlayableBoard(state.seed + 97)

  return {
    ...state,
    board: playableBoard.board,
    selectedIndex: null,
    highlighted: [],
    seed: playableBoard.seed,
    combo: 0,
    logs: pushLog(state.logs, {
      title,
      body,
      tone: 'moon',
    }),
  }
}

export function findMatches(board: MatchCell[]): MatchGroup[] {
  const groups: MatchGroup[] = []

  for (let row = 0; row < matchBoardSize; row += 1) {
    let start = row * matchBoardSize
    while (start < (row + 1) * matchBoardSize) {
      const tokenId = board[start]?.tokenId
      let end = start + 1
      while (
        end < (row + 1) * matchBoardSize &&
        board[end]?.tokenId === tokenId
      ) {
        end += 1
      }
      if (end - start >= 3) {
        groups.push({
          tokenId,
          indices: range(start, end),
        })
      }
      start = end
    }
  }

  for (let col = 0; col < matchBoardSize; col += 1) {
    let row = 0
    while (row < matchBoardSize) {
      const start = row * matchBoardSize + col
      const tokenId = board[start]?.tokenId
      let endRow = row + 1
      while (
        endRow < matchBoardSize &&
        board[endRow * matchBoardSize + col]?.tokenId === tokenId
      ) {
        endRow += 1
      }
      if (endRow - row >= 3) {
        groups.push({
          tokenId,
          indices: range(row, endRow).map(
            (currentRow) => currentRow * matchBoardSize + col,
          ),
        })
      }
      row = endRow
    }
  }

  return groups
}

export function findHint(board: MatchCell[]): [number, number] | null {
  for (let index = 0; index < board.length; index += 1) {
    const right = index + 1
    const down = index + matchBoardSize

    if (right < board.length && areAdjacent(index, right)) {
      if (isHanliBottlePair(board[index]?.tokenId, board[right]?.tokenId)) {
        return [index, right]
      }
      if (findMatches(swapCells(board, index, right)).length > 0) {
        return [index, right]
      }
    }

    if (down < board.length) {
      if (isHanliBottlePair(board[index]?.tokenId, board[down]?.tokenId)) {
        return [index, down]
      }
      if (findMatches(swapCells(board, index, down)).length > 0) {
        return [index, down]
      }
    }
  }

  return null
}

export function previewSwap(
  state: CharacterMatchState,
  from: number,
  to: number,
): SwapPreview {
  const swappedBoard = swapCells(state.board, from, to)
  const fromToken = state.board[from]?.tokenId
  const toToken = state.board[to]?.tokenId

  if (isHanliBottlePair(fromToken, toToken)) {
    const lineClearSet = new Set<number>([
      ...lineIndices(from, to),
      ...lineIndices(to, from),
    ])

    return {
      valid: true,
      special: true,
      swappedBoard,
      clearIndices: [...lineClearSet],
      lineIndices: [...lineClearSet],
    }
  }

  const matches = findMatches(swappedBoard)
  const clearIndices = [...new Set(matches.flatMap((match) => match.indices))]

  return {
    valid: clearIndices.length > 0,
    special: false,
    swappedBoard,
    clearIndices,
    lineIndices: [],
  }
}

export function areAdjacent(left: number, right: number) {
  const diff = Math.abs(left - right)
  if (diff === matchBoardSize) return true
  if (diff !== 1) return false
  return (
    Math.floor(left / matchBoardSize) === Math.floor(right / matchBoardSize)
  )
}

function resolveBoard(
  state: CharacterMatchState,
  openingClearSet?: Set<number>,
): CharacterMatchState {
  let board: MatchCell[] = [...state.board]
  let seed = state.seed
  let score = state.score
  let bond = state.bond
  let dangerCells = [...state.dangerCells]
  let logs = state.logs
  let combo = 0
  let matches = findMatches(board)
  let pendingClearSet = openingClearSet

  while ((matches.length > 0 || pendingClearSet) && combo < 14) {
    combo += 1
    const clearSet = pendingClearSet ?? new Set<number>()
    pendingClearSet = undefined

    for (const group of matches) {
      for (const index of group.indices) {
        clearSet.add(index)
      }
    }

    const matchedCells = [...clearSet].map((index) => board[index])
    const rankBonus = matchedCells.filter((cell) => cell.rank === 2).length * 18
    const baseScore = clearSet.size * (30 + combo * 5) + rankBonus
    score += baseScore

    const beforeDangerCount = dangerCells.length
    dangerCells = dangerCells.filter((danger) => !clearSet.has(danger.index))
    const clearedDanger = beforeDangerCount - dangerCells.length
    if (clearedDanger > 0) {
      score += clearedDanger * 55
      logs = pushLog(logs, {
        title: '清掉倒计时',
        body: `清掉 ${clearedDanger} 个倒计时格。`,
        tone: 'jade',
      })
    }

    const specialResult = applyMatchedSkills({
      board,
      matches,
      clearSet,
      dangerCells,
      seed,
      score,
      bond,
      logs,
    })
    dangerCells = specialResult.dangerCells
    seed = specialResult.seed
    score = specialResult.score
    bond = specialResult.bond
    logs = specialResult.logs

    const nullableBoard: NullableBoard = board.map((cell, index) =>
      clearSet.has(index) ? null : cell,
    )
    const fillResult = collapseAndFill(nullableBoard, seed)
    board = fillResult.board
    seed = fillResult.seed

    const upgradeResult = applyPendingBottleUpgrades(
      board,
      seed,
      specialResult.bottleUpgradeCount,
    )
    board = upgradeResult.board
    seed = upgradeResult.seed
    if (specialResult.bottleUpgradeCount > 0) {
      score += specialResult.bottleUpgradeCount * 70
    }

    const crisisResult = addPendingCrises(
      dangerCells,
      seed,
      specialResult.crisisCount,
    )
    dangerCells = crisisResult.dangerCells
    seed = crisisResult.seed

    matches = findMatches(board)
  }

  const dangerTick = advanceDangers(dangerCells, score, logs)

  return ensureBoardPlayable({
    ...state,
    board,
    selectedIndex: null,
    highlighted: [],
    dangerCells: dangerTick.dangerCells,
    score: Math.max(0, dangerTick.score),
    moves: state.moves,
    bond,
    combo,
    seed,
    logs: dangerTick.logs,
  })
}

type SkillContext = {
  board: MatchCell[]
  matches: MatchGroup[]
  clearSet: Set<number>
  dangerCells: DangerCell[]
  seed: number
  score: number
  bond: number
  logs: SkillLog[]
}

function applyMatchedSkills(context: SkillContext) {
  const { seed } = context
  let { dangerCells, score, bond, logs } = context
  let bottleUpgradeCount = 0
  let crisisCount = 0

  for (const group of context.matches) {
    const sizeBonus = group.indices.length >= 4 ? 2 : 1
    if (group.tokenId === 'hanli') {
      const sortedDanger = [...dangerCells].sort((left, right) => {
        if (left.turns !== right.turns) return left.turns - right.turns
        return left.index - right.index
      })
      const dangerToClear = sortedDanger.slice(0, sizeBonus)
      if (dangerToClear.length > 0) {
        const dangerIndexes = new Set(
          dangerToClear.map((danger) => danger.index),
        )
        dangerCells = dangerCells.filter(
          (danger) => !dangerIndexes.has(danger.index),
        )
        score += dangerToClear.length * 90
        logs = pushLog(logs, {
          title: '韩立',
          body: `清掉 ${dangerToClear.length} 个危险格。`,
          tone: 'jade',
        })
      } else {
        score += 40
        logs = pushLog(logs, {
          title: '韩立',
          body: '没有危险格，额外加分。',
          tone: 'jade',
        })
      }
    }

    if (group.tokenId === 'nangong-wan') {
      bond += sizeBonus
      logs = pushLog(logs, {
        title: '南宫婉',
        body: `羁绊 ${Math.min(bond, 3)} / 3。`,
        tone: 'cinnabar',
      })

      if (bond >= 3) {
        bond -= 3
        for (const index of plusShape(group.indices[0])) {
          context.clearSet.add(index)
        }
        score += 120
        logs = pushLog(logs, {
          title: '羁绊满了',
          body: '清掉周围几个棋子。',
          tone: 'cinnabar',
        })
      }
    }

    if (group.tokenId === 'mo-daifu') {
      crisisCount += sizeBonus
      logs = pushLog(logs, {
        title: '墨大夫',
        body: `增加 ${sizeBonus} 个倒计时格。`,
        tone: 'moon',
      })
    }

    if (group.tokenId === 'zhangtian-bottle') {
      bottleUpgradeCount += sizeBonus
      logs = pushLog(logs, {
        title: '掌天瓶',
        body: `升级 ${sizeBonus} 个角色棋子。`,
        tone: 'gold',
      })
    }
  }

  return {
    dangerCells,
    seed,
    score,
    bond,
    logs,
    bottleUpgradeCount,
    crisisCount,
  }
}

function collapseAndFill(board: NullableBoard, seed: number) {
  const nextBoard: NullableBoard = Array.from(
    { length: board.length },
    () => null,
  )
  let nextSeed = seed

  for (let col = 0; col < matchBoardSize; col += 1) {
    const kept: MatchCell[] = []
    for (let row = matchBoardSize - 1; row >= 0; row -= 1) {
      const cell = board[row * matchBoardSize + col]
      if (cell) kept.push(cell)
    }

    let cursor = matchBoardSize - 1
    for (const cell of kept) {
      nextBoard[cursor * matchBoardSize + col] = cell
      cursor -= 1
    }

    while (cursor >= 0) {
      const pick = pickWeightedToken(nextSeed)
      nextSeed = pick.seed
      nextBoard[cursor * matchBoardSize + col] = makeCell(
        pick.tokenId,
        cursor * matchBoardSize + col,
        nextSeed,
      )
      cursor -= 1
    }
  }

  return {
    board: nextBoard.filter(Boolean) as MatchCell[],
    seed: nextSeed,
  }
}

function applyPendingBottleUpgrades(
  board: MatchCell[],
  seed: number,
  count: number,
) {
  let nextBoard = board
  let nextSeed = seed

  for (let upgrade = 0; upgrade < count; upgrade += 1) {
    const candidates = nextBoard
      .map((cell, index) => ({ cell, index }))
      .filter(
        ({ cell }) => cell.tokenId !== 'zhangtian-bottle' && cell.rank === 1,
      )

    if (candidates.length === 0) break

    const pick = nextRandom(nextSeed)
    nextSeed = pick.seed
    const target = candidates[Math.floor(pick.value * candidates.length)]
    nextBoard = nextBoard.map((cell, index) =>
      index === target.index ? { ...cell, rank: 2 } : cell,
    )
  }

  return { board: nextBoard, seed: nextSeed }
}

function addPendingCrises(
  dangerCells: DangerCell[],
  seed: number,
  count: number,
) {
  let nextDangers = dangerCells
  let nextSeed = seed

  for (let danger = 0; danger < count; danger += 1) {
    const occupied = new Set(nextDangers.map((cell) => cell.index))
    const pick = pickFreeIndex(nextSeed, occupied)
    nextSeed = pick.seed
    nextDangers = [
      ...nextDangers,
      { index: pick.index, turns: 4, source: '夺舍' },
    ]
  }

  return { dangerCells: nextDangers, seed: nextSeed }
}

function advanceDangers(
  dangerCells: DangerCell[],
  score: number,
  logs: SkillLog[],
) {
  const advanced = dangerCells.map((danger) => ({
    ...danger,
    turns: danger.turns - 1,
  }))
  const expired = advanced.filter((danger) => danger.turns <= 0)

  if (expired.length === 0) {
    return { dangerCells: advanced, score, logs }
  }

  return {
    dangerCells: advanced.filter((danger) => danger.turns > 0),
    score: score - expired.length * 120,
    logs: pushLog(logs, {
      title: '倒计时结束',
      body: `${expired.length} 个倒计时格扣分。`,
      tone: 'moon',
    }),
  }
}

function ensureBoardPlayable(state: CharacterMatchState): CharacterMatchState {
  if (findHint(state.board)) return state
  return reshuffleBoard(state, '自动重排', '没有可消的一步，已重排。')
}

function createPlayableBoard(seed: number) {
  let result = createBoard(seed)
  let guard = 0

  while (!findHint(result.board) && guard < 12) {
    result = createBoard(result.seed + guard + 11)
    guard += 1
  }

  return result
}

function createBoard(seed: number) {
  const board: MatchCell[] = []
  let nextSeed = seed

  for (let index = 0; index < matchBoardSize * matchBoardSize; index += 1) {
    let pick = pickWeightedToken(nextSeed)
    let tokenId = pick.tokenId
    nextSeed = pick.seed
    let guard = 0

    while (wouldCreateImmediateMatch(board, index, tokenId) && guard < 18) {
      pick = pickWeightedToken(nextSeed)
      tokenId = pick.tokenId
      nextSeed = pick.seed
      guard += 1
    }

    board.push(makeCell(tokenId, index, nextSeed))
  }

  return { board, seed: nextSeed }
}

function pickDangerCells(board: MatchCell[], seed: number, count: number) {
  const dangers: DangerCell[] = []
  let nextSeed = seed
  const occupied = new Set<number>()
  const validIndexes = new Set(
    board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell.tokenId !== 'zhangtian-bottle')
      .map(({ index }) => index),
  )

  for (let danger = 0; danger < count; danger += 1) {
    let pick = pickFreeIndex(nextSeed, occupied)
    nextSeed = pick.seed
    let guard = 0
    while (!validIndexes.has(pick.index) && guard < 18) {
      pick = pickFreeIndex(nextSeed, occupied)
      nextSeed = pick.seed
      guard += 1
    }
    occupied.add(pick.index)
    dangers.push({ index: pick.index, turns: 6 - danger, source: '危险' })
  }

  return { dangers, seed: nextSeed }
}

function wouldCreateImmediateMatch(
  board: MatchCell[],
  index: number,
  tokenId: TokenId,
) {
  const col = index % matchBoardSize
  const row = Math.floor(index / matchBoardSize)
  const horizontal =
    col >= 2 &&
    board[index - 1]?.tokenId === tokenId &&
    board[index - 2]?.tokenId === tokenId
  const vertical =
    row >= 2 &&
    board[index - matchBoardSize]?.tokenId === tokenId &&
    board[index - matchBoardSize * 2]?.tokenId === tokenId

  return horizontal || vertical
}

function pickWeightedToken(seed: number) {
  const random = nextRandom(seed)
  return {
    tokenId: tokenBag[Math.floor(random.value * tokenBag.length)],
    seed: random.seed,
  }
}

function nextRandom(seed: number) {
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0
  return {
    seed: nextSeed,
    value: nextSeed / 4294967296,
  }
}

function pickFreeIndex(seed: number, occupied: Set<number>) {
  let nextSeed = seed
  let index = 0
  let guard = 0

  do {
    const random = nextRandom(nextSeed)
    nextSeed = random.seed
    index = Math.floor(random.value * matchBoardSize * matchBoardSize)
    guard += 1
  } while (occupied.has(index) && guard < 80)

  return { index, seed: nextSeed }
}

function makeCell(tokenId: TokenId, index: number, seed: number): MatchCell {
  return {
    id: `${tokenId}-${index}-${seed}`,
    tokenId,
    rank: 1,
  }
}

function swapCells(board: MatchCell[], from: number, to: number): MatchCell[] {
  const nextBoard = [...board]
  const current = nextBoard[from]
  nextBoard[from] = nextBoard[to]
  nextBoard[to] = current
  return nextBoard
}

function isHanliBottlePair(left?: TokenId, right?: TokenId) {
  return (
    (left === 'hanli' && right === 'zhangtian-bottle') ||
    (left === 'zhangtian-bottle' && right === 'hanli')
  )
}

function lineIndices(origin: number, pairedIndex: number) {
  const originRow = Math.floor(origin / matchBoardSize)
  const originCol = origin % matchBoardSize
  const pairedRow = Math.floor(pairedIndex / matchBoardSize)
  const pairedCol = pairedIndex % matchBoardSize
  const indices: number[] = []

  if (originRow === pairedRow) {
    for (let row = 0; row < matchBoardSize; row += 1) {
      indices.push(row * matchBoardSize + originCol)
    }
    return indices
  }

  if (originCol === pairedCol) {
    for (let col = 0; col < matchBoardSize; col += 1) {
      indices.push(originRow * matchBoardSize + col)
    }
    return indices
  }

  return [origin]
}

function plusShape(center: number) {
  const row = Math.floor(center / matchBoardSize)
  const col = center % matchBoardSize
  const candidates = [
    center,
    center - 1,
    center + 1,
    center - matchBoardSize,
    center + matchBoardSize,
  ]

  return candidates.filter((index) => {
    if (index < 0 || index >= matchBoardSize * matchBoardSize) return false
    const currentRow = Math.floor(index / matchBoardSize)
    const currentCol = index % matchBoardSize
    return Math.abs(currentRow - row) + Math.abs(currentCol - col) <= 1
  })
}

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, index) => start + index)
}

function pushLog(logs: SkillLog[], log: SkillLog) {
  return [log, ...logs].slice(0, logLimit)
}
