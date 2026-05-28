import { RotateCcw, Shuffle, Sparkles, Star, Wand2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import {
  areAdjacent,
  chooseMatchCell,
  createInitialCharacterMatchState,
  matchBoardSize,
  previewSwap,
  revealHint,
  reshuffleBoard,
} from '../../game/character-match/engine'
import type {
  CharacterMatchState,
  MatchCell,
  TokenId,
} from '../../game/character-match/engine'

type MatchToken = {
  id: TokenId
  name: string
  shortName: string
  realm: string
  image: string
}

type FeedbackTone = 'gold' | 'jade' | 'cinnabar' | 'moon'

type MatchFeedback = {
  id: number
  title: string
  detail: string
  delta: number
  combo: number
  pulse: number[]
  tone: FeedbackTone
  boardClass: string
}

type MatchAnimation = {
  id: number
  clearing: number[]
  line: number[]
  special: boolean
}

const matchTokens: MatchToken[] = [
  {
    id: 'hanli',
    name: '韩立',
    shortName: '韩',
    realm: '清格',
    image: '/media/images/characters/hanli.webp',
  },
  {
    id: 'nangong-wan',
    name: '南宫婉',
    shortName: '婉',
    realm: '羁绊',
    image: '/media/images/characters/nangong-wan.webp',
  },
  {
    id: 'zi-ling',
    name: '紫灵',
    shortName: '紫',
    realm: '普通',
    image: '/media/images/characters/zi-ling.webp',
  },
  {
    id: 'yuan-yao',
    name: '元瑶',
    shortName: '瑶',
    realm: '普通',
    image: '/media/images/characters/yuanyao.webp',
  },
  {
    id: 'yinyue',
    name: '银月',
    shortName: '月',
    realm: '普通',
    image: '/media/images/characters/yinyue.webp',
  },
  {
    id: 'mo-daifu',
    name: '墨大夫',
    shortName: '墨',
    realm: '倒计时',
    image: '/media/images/characters/mo-daifu.webp',
  },
  {
    id: 'li-feiyu',
    name: '厉飞雨',
    shortName: '厉',
    realm: '普通',
    image: '/media/images/characters/li-feyu.webp',
  },
  {
    id: 'xin-ruyin',
    name: '辛如音',
    shortName: '辛',
    realm: '普通',
    image: '/media/images/characters/xin-ruyin.webp',
  },
  {
    id: 'xiang-zhili',
    name: '向之礼',
    shortName: '向',
    realm: '普通',
    image: '/media/images/characters/xiang-zhili.webp',
  },
  {
    id: 'zhangtian-bottle',
    name: '掌天瓶',
    shortName: '瓶',
    realm: '升级',
    image: '/media/images/generated/green-bottle.png',
  },
]

const specialTokens: Array<{ id: TokenId; label: string }> = [
  { id: 'hanli', label: '清格' },
  { id: 'nangong-wan', label: '+羁绊' },
  { id: 'mo-daifu', label: '+倒计时' },
  { id: 'zhangtian-bottle', label: '升级' },
]

const clearAnimationMs = 720

const tokenById = Object.fromEntries(
  matchTokens.map((token) => [token.id, token]),
) as Record<TokenId, MatchToken>

export function CharacterMatchGame() {
  const [game, setGame] = useState<CharacterMatchState>(() =>
    createInitialCharacterMatchState(),
  )
  const [visualBoard, setVisualBoard] = useState<MatchCell[]>(() => game.board)
  const [feedback, setFeedback] = useState<MatchFeedback | null>(null)
  const [animation, setAnimation] = useState<MatchAnimation | null>(null)
  const settleTimerRef = useRef<number | null>(null)

  const dangerByIndex = useMemo(
    () => new Map(game.dangerCells.map((danger) => [danger.index, danger])),
    [game.dangerCells],
  )
  const highRankCount = useMemo(
    () => game.board.filter((cell) => cell.rank === 2).length,
    [game.board],
  )
  const selectedToken =
    game.selectedIndex === null ? null : game.board[game.selectedIndex]

  const chooseCell = (index: number) => {
    if (animation) return
    const from = game.selectedIndex
    const next = chooseMatchCell(game, index)

    if (from !== null && from !== index && areAdjacent(from, index)) {
      const preview = previewSwap(game, from, index)
      if (preview.valid) {
        if (settleTimerRef.current) {
          window.clearTimeout(settleTimerRef.current)
        }
        const matchAnimation = {
          id: Date.now(),
          clearing: preview.clearIndices,
          line: preview.lineIndices,
          special: preview.special,
        }
        setVisualBoard(preview.swappedBoard)
        setAnimation(matchAnimation)
        setFeedback(buildFeedback(game, next, preview.clearIndices))
        settleTimerRef.current = window.setTimeout(() => {
          setGame(next)
          setVisualBoard(next.board)
          setAnimation(null)
          settleTimerRef.current = null
        }, clearAnimationMs)
        return
      }
    }

    setGame(next)
    setVisualBoard(next.board)
    setFeedback(
      buildFeedback(game, next, from === null ? [index] : [from, index]),
    )
  }
  const restart = () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    const next = createInitialCharacterMatchState(game.seed + game.moves + 251)
    setGame(next)
    setVisualBoard(next.board)
    setAnimation(null)
    setFeedback(
      makeFeedback({
        title: '重开',
        detail: '重新发牌',
        tone: 'moon',
        boardClass: 'is-shuffling',
      }),
    )
  }
  const hint = () => {
    if (animation) return
    const next = revealHint(game)
    setGame(next)
    setVisualBoard(next.board)
    setFeedback(
      makeFeedback({
        title: '提示',
        detail: '看发光的两个',
        pulse: next.highlighted,
        tone: 'gold',
        boardClass: 'is-hinting',
      }),
    )
  }
  const shuffle = () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    const next = reshuffleBoard(game)
    setGame(next)
    setVisualBoard(next.board)
    setAnimation(null)
    setFeedback(
      makeFeedback({
        title: '重排',
        detail: '棋盘已洗牌',
        tone: 'moon',
        boardClass: 'is-shuffling',
      }),
    )
  }

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 1100)
    return () => window.clearTimeout(timer)
  }, [feedback])

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    }
  }, [])

  return (
    <section className="character-match-shell" aria-label="人物星图消消乐">
      <div className="match-arena">
        <div className="match-board-panel">
          <div className="match-board-meta" aria-live="polite">
            <span>分数 {game.score}</span>
            <span>步数 {game.moves}</span>
            <span>羁绊 {game.bond} / 3</span>
            <span>升级 {highRankCount}</span>
          </div>

          <div
            className={`match-board-wrap ${feedback?.boardClass ?? ''}`}
            data-combo={feedback?.combo ?? 0}
          >
            {feedback ? (
              <div
                key={`feedback-${feedback.id}`}
                className={`match-feedback ${feedback.tone}`}
              >
                <strong>{feedback.title}</strong>
                {feedback.delta > 0 ? <b>+{feedback.delta}</b> : null}
                <span>{feedback.detail}</span>
              </div>
            ) : null}
            {feedback ? (
              <div
                key={`bursts-${feedback.id}`}
                className="match-burst-layer"
                aria-hidden="true"
              >
                {buildBurstPoints(animation?.clearing ?? feedback.pulse).map(
                  (spark) => (
                    <span
                      key={`${spark.index}-${spark.spark}`}
                      style={
                        {
                          '--burst-x': `${spark.x}%`,
                          '--burst-y': `${spark.y}%`,
                          '--burst-delay': `${spark.spark * 48}ms`,
                        } as CSSProperties
                      }
                    />
                  ),
                )}
              </div>
            ) : null}
            {animation ? (
              <div
                key={`clear-${animation.id}`}
                className={`match-clear-layer ${
                  animation.special ? 'special' : ''
                }`}
                aria-hidden="true"
              >
                {animation.clearing.map((index) => (
                  <span
                    key={`clear-${index}`}
                    className="clear-cell"
                    style={
                      {
                        '--cell-x': `${cellCenter(index).x}%`,
                        '--cell-y': `${cellCenter(index).y}%`,
                      } as CSSProperties
                    }
                  />
                ))}
                {animation.line.map((index) => (
                  <span
                    key={`line-${index}`}
                    className="beam-cell"
                    style={
                      {
                        '--cell-x': `${cellCenter(index).x}%`,
                        '--cell-y': `${cellCenter(index).y}%`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            ) : null}
            <div
              className="match-board"
              style={{
                gridTemplateColumns: `repeat(${matchBoardSize}, minmax(0, 1fr))`,
              }}
            >
              {visualBoard.map((cell, index) => {
                const token = tokenById[cell.tokenId]
                const danger = dangerByIndex.get(index)
                const selected = game.selectedIndex === index
                const highlighted = game.highlighted.includes(index)
                const clearing = animation?.clearing.includes(index) ?? false

                return (
                  <button
                    key={cell.id}
                    type="button"
                    className={[
                      'match-tile',
                      selected ? 'selected' : '',
                      highlighted ? 'hinted' : '',
                      feedback?.pulse.includes(index) ? 'burst' : '',
                      clearing ? 'clearing' : '',
                      danger ? 'danger' : '',
                      cell.rank === 2 ? 'rank-2' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-token={cell.tokenId}
                    onClick={() => chooseCell(index)}
                    disabled={animation !== null}
                    style={
                      {
                        '--tile-delay': `${(index % matchBoardSize) * 18}ms`,
                      } as CSSProperties
                    }
                    aria-label={`${token.name}${
                      cell.rank === 2 ? '，升级棋子' : ''
                    }${danger ? `，危险格剩余 ${danger.turns} 步` : ''}`}
                  >
                    <span className="tile-ring" aria-hidden="true" />
                    <span className="tile-portrait">
                      <img src={token.image} alt="" draggable={false} />
                    </span>
                    <span className="tile-name">{token.shortName}</span>
                    {cell.rank === 2 ? (
                      <span className="rank-mark" aria-hidden="true">
                        升
                      </span>
                    ) : null}
                    {danger ? (
                      <span className="danger-mark" aria-hidden="true">
                        {danger.turns}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="match-controls">
            <button className="ink-button primary" type="button" onClick={hint}>
              <Wand2 size={16} />
              提示
            </button>
            <button className="ink-button" type="button" onClick={shuffle}>
              <Shuffle size={16} />
              重排
            </button>
            <button className="ink-button" type="button" onClick={restart}>
              <RotateCcw size={16} />
              重开
            </button>
          </div>
        </div>

        <aside className="match-sidepanel">
          <div className="match-combo-dial" aria-label={`连消 ${game.combo}`}>
            <span>COMBO</span>
            <strong>{game.combo > 0 ? `x${game.combo}` : 'x1'}</strong>
          </div>

          <div className={`match-now ${feedback?.tone ?? 'gold'}`}>
            <span>
              {selectedToken ? tokenById[selectedToken.tokenId].name : '当前'}
            </span>
            <strong>{feedback?.title ?? '三消得分'}</strong>
            <em>{feedback?.detail ?? '红色数字先清掉'}</em>
          </div>

          <div className="match-meter" aria-label={`羁绊 ${game.bond} / 3`}>
            <span>羁绊</span>
            <div>
              {[0, 1, 2].map((pip) => (
                <i key={pip} className={pip < game.bond ? 'filled' : ''} />
              ))}
            </div>
          </div>

          <div
            className="danger-orbits"
            aria-label={`倒计时 ${game.dangerCells.length}`}
          >
            {game.dangerCells.length > 0 ? (
              game.dangerCells.slice(0, 8).map((danger) => (
                <span
                  key={`${danger.source}-${danger.index}`}
                  style={
                    {
                      '--danger-delay': `${danger.index * 37}ms`,
                    } as CSSProperties
                  }
                >
                  {danger.turns}
                </span>
              ))
            ) : (
              <strong>无倒计时</strong>
            )}
          </div>
        </aside>
      </div>

      <div className="token-dock" aria-label="棋子">
        {matchTokens.map((token) => (
          <span
            key={token.id}
            className={token.realm === '普通' ? '' : 'special'}
          >
            <i>
              <img src={token.image} alt="" />
            </i>
            <b>{token.name}</b>
          </span>
        ))}
      </div>

      <div className="match-rules">
        {specialTokens.map((item, index) => {
          const token = tokenById[item.id]
          const Icon = index % 2 === 0 ? Sparkles : Star
          return (
            <span key={item.id}>
              <Icon size={15} />
              {token.name}：{item.label}
            </span>
          )
        })}
      </div>
    </section>
  )
}

function buildFeedback(
  previous: CharacterMatchState,
  next: CharacterMatchState,
  pulse: number[],
): MatchFeedback {
  const latest = next.logs[0]
  const delta = Math.max(0, next.score - previous.score)
  const clearedDangers = previous.dangerCells.length - next.dangerCells.length
  const addedDangers = next.dangerCells.length - previous.dangerCells.length
  const upgraded =
    next.board.filter((cell) => cell.rank === 2).length -
    previous.board.filter((cell) => cell.rank === 2).length

  if (next.selectedIndex !== null && previous.moves === next.moves) {
    return makeFeedback({
      title: tokenById[next.board[next.selectedIndex].tokenId].name,
      detail: '再点相邻棋子',
      pulse,
      tone: 'gold',
      boardClass: 'is-selecting',
    })
  }

  if (next.moves === previous.moves && delta === 0) {
    return makeFeedback({
      title: latest.title,
      detail: latest.body,
      pulse,
      tone: 'moon',
      boardClass: 'is-missing',
    })
  }

  if (latest.title === '韩立 + 掌天瓶') {
    return makeFeedback({
      title: '清一行一列',
      detail: '特殊消除',
      delta,
      combo: next.combo,
      pulse,
      tone: 'jade',
      boardClass: 'is-special',
    })
  }

  if (addedDangers > 0) {
    return makeFeedback({
      title: '+倒计时',
      detail: '先清红色数字',
      delta,
      combo: next.combo,
      pulse,
      tone: 'moon',
      boardClass: 'is-danger-spawn',
    })
  }

  if (clearedDangers > 0) {
    return makeFeedback({
      title: '清掉倒计时',
      detail: `清掉 ${clearedDangers} 个`,
      delta,
      combo: next.combo,
      pulse,
      tone: 'jade',
      boardClass: 'is-clearing',
    })
  }

  if (upgraded > 0) {
    return makeFeedback({
      title: '升级',
      detail: `${upgraded} 个棋子`,
      delta,
      combo: next.combo,
      pulse,
      tone: 'gold',
      boardClass: 'is-upgrading',
    })
  }

  return makeFeedback({
    title: next.combo > 1 ? `连消 x${next.combo}` : '消除',
    detail: next.combo > 1 ? '连消加分' : latest.body,
    delta,
    combo: next.combo,
    pulse,
    tone: 'gold',
    boardClass: next.combo > 1 ? 'is-combo' : 'is-clearing',
  })
}

function makeFeedback(
  feedback: Omit<MatchFeedback, 'id' | 'delta' | 'combo' | 'pulse'> &
    Partial<Pick<MatchFeedback, 'delta' | 'combo' | 'pulse'>>,
): MatchFeedback {
  return {
    id: Date.now(),
    delta: 0,
    combo: 0,
    pulse: [],
    ...feedback,
  }
}

function buildBurstPoints(indices: number[]) {
  const uniqueIndices = [...new Set(indices)].slice(0, 8)
  return uniqueIndices.flatMap((index) => {
    const center = cellCenter(index)
    return [0, 1, 2].map((spark) => ({
      index,
      spark,
      x: center.x + (spark - 1) * 2.8,
      y: center.y + (spark === 1 ? -2.5 : 1.5),
    }))
  })
}

function cellCenter(index: number) {
  const row = Math.floor(index / matchBoardSize)
  const col = index % matchBoardSize

  return {
    x: ((col + 0.5) / matchBoardSize) * 100,
    y: ((row + 0.5) / matchBoardSize) * 100,
  }
}
