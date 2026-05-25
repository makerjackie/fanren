import { createFileRoute } from '@tanstack/react-router'
import { Footprints, Pause, Play, RotateCcw, Swords } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SiteNav } from '../components/SiteNav'

export const Route = createFileRoute('/game')({ component: GamePage })

type GameStatus = 'ready' | 'running' | 'paused' | 'won' | 'failed'

type Enemy = {
  id: number
  x: number
  y: number
  w: number
  h: number
}

type GameState = {
  status: GameStatus
  hp: number
  stones: number
  distance: number
  x: number
  y: number
  vy: number
  facing: 1 | -1
  attackTimer: number
  invulnerable: number
  enemies: Enemy[]
  nextEnemyId: number
  lastSpawnAt: number
}

type InputState = {
  left: boolean
  right: boolean
  jump: boolean
  attack: boolean
}

const groundY = 314
const finishDistance = 900
const places = ['七玄门山道', '血色禁地边缘', '乱星海渡口', '虚天殿外']

const initialGame: GameState = {
  status: 'ready',
  hp: 3,
  stones: 0,
  distance: 0,
  x: 118,
  y: groundY,
  vy: 0,
  facing: 1,
  attackTimer: 0,
  invulnerable: 0,
  enemies: [{ id: 1, x: 330, y: groundY, w: 64, h: 72 }],
  nextEnemyId: 2,
  lastSpawnAt: 0,
}

function GamePage() {
  const [game, setGame] = useState<GameState>(initialGame)
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    attack: false,
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key))
        inputRef.current.left = true
      if (['ArrowRight', 'd', 'D'].includes(event.key))
        inputRef.current.right = true
      if (event.key === ' ') {
        event.preventDefault()
        inputRef.current.jump = true
      }
      if (['j', 'J'].includes(event.key)) inputRef.current.attack = true
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key))
        inputRef.current.left = false
      if (['ArrowRight', 'd', 'D'].includes(event.key))
        inputRef.current.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    if (game.status !== 'running') return

    let frameId = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.034)
      last = now
      setGame((current) => updateGame(current, inputRef.current, dt))
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [game.status])

  const currentPlace = useMemo(() => {
    const index = Math.min(
      places.length - 1,
      Math.floor((game.distance / finishDistance) * places.length),
    )
    return places[index]
  }, [game.distance])

  const start = () =>
    setGame((current) =>
      current.status === 'paused'
        ? { ...current, status: 'running' }
        : { ...initialGame, status: 'running' },
    )
  const pause = () => setGame((current) => ({ ...current, status: 'paused' }))
  const restart = () => setGame({ ...initialGame, status: 'running' })
  const triggerJump = () => {
    inputRef.current.jump = true
    setGame((current) =>
      current.status === 'running' && current.y >= groundY - 1
        ? { ...current, y: current.y - 1, vy: -560 }
        : current,
    )
  }
  const triggerAttack = () => {
    inputRef.current.attack = true
    setGame((current) => performImmediateAttack(current))
  }

  return (
    <main className="fan-page game-page">
      <SiteNav />
      <section className="page-hero compact-hero">
        <div>
          <p className="seal-line">韩跑跑</p>
          <h1>风声不对，也要跑出来。</h1>
          <p>
            A/D 或方向键移动，空格跳跃，J
            出剑。移动端道友可用下方按钮，一路冲到虚天殿外。
          </p>
        </div>
        <a className="ink-button" href="/timeline">
          <Footprints size={17} />
          回长卷
        </a>
      </section>

      <section className="runner-game">
        <div className="game-hud">
          <span>血量 {game.hp}</span>
          <span>灵石 {game.stones}</span>
          <span>
            距离 {Math.floor(game.distance)} / {finishDistance}
          </span>
          <span>{currentPlace}</span>
        </div>

        <div
          className={`game-stage ${game.status}`}
          aria-label="韩跑跑横版小游戏"
        >
          <div className="stage-parallax far" />
          <div className="stage-parallax near" />
          <div
            className={`hero-sprite ${
              game.attackTimer > 0 ? 'attacking' : ''
            } ${game.y < groundY ? 'jumping' : 'running'} ${
              game.invulnerable > 0 ? 'hurt' : ''
            }`}
            style={{
              left: game.x,
              top: game.y - 96,
              transform: `scaleX(${game.facing})`,
            }}
            aria-label="韩立"
          />
          {game.attackTimer > 0 ? (
            <span
              className="sword-flash"
              style={{
                left: game.x + (game.facing === 1 ? 58 : -68),
                top: game.y - 74,
                transform: `scaleX(${game.facing})`,
              }}
            />
          ) : null}
          {game.enemies.map((enemy) => (
            <span
              key={enemy.id}
              className="enemy-sprite"
              style={{ left: enemy.x, top: enemy.y - enemy.h }}
            />
          ))}
          {game.status !== 'running' ? (
            <div className="game-curtain">
              <h2>{statusTitle(game.status)}</h2>
              <p>{statusCopy(game.status)}</p>
              <div>
                {game.status === 'paused' ? (
                  <button
                    className="ink-button primary"
                    type="button"
                    onClick={start}
                  >
                    <Play size={16} />
                    继续跑
                  </button>
                ) : (
                  <button
                    className="ink-button primary"
                    type="button"
                    onClick={start}
                  >
                    <Play size={16} />
                    韩跑跑出发
                  </button>
                )}
                {game.status !== 'ready' ? (
                  <button
                    className="ink-button"
                    type="button"
                    onClick={restart}
                  >
                    <RotateCcw size={16} />
                    重开
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="game-actions">
          {game.status === 'running' ? (
            <button className="ink-button" type="button" onClick={pause}>
              <Pause size={16} />
              暂停
            </button>
          ) : (
            <button
              className="ink-button primary"
              type="button"
              onClick={start}
            >
              <Play size={16} />
              开始
            </button>
          )}
          <button className="ink-button" type="button" onClick={restart}>
            <RotateCcw size={16} />
            重开
          </button>
        </div>

        <div className="mobile-controls" aria-label="移动端操作">
          <div>
            <HoldButton
              label="左"
              onDown={() => (inputRef.current.left = true)}
              onUp={() => (inputRef.current.left = false)}
            />
            <HoldButton
              label="右"
              onDown={() => (inputRef.current.right = true)}
              onUp={() => (inputRef.current.right = false)}
            />
          </div>
          <div>
            <button
              type="button"
              onPointerDown={() => (inputRef.current.jump = true)}
              onClick={triggerJump}
            >
              跳
            </button>
            <button
              type="button"
              onPointerDown={() => (inputRef.current.attack = true)}
              onClick={triggerAttack}
            >
              <Swords size={16} />
              出剑
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function HoldButton({
  label,
  onDown,
  onUp,
}: {
  label: string
  onDown: () => void
  onUp: () => void
}) {
  return (
    <button
      type="button"
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
    >
      {label}
    </button>
  )
}

function performImmediateAttack(game: GameState): GameState {
  if (game.status !== 'running') return game

  const attackBox = {
    x: game.facing === 1 ? game.x + 40 : game.x - 178,
    y: game.y - 82,
    w: 190,
    h: 50,
  }
  let stones = game.stones
  const enemies = game.enemies.filter((enemy) => {
    const enemyBox = {
      x: enemy.x,
      y: enemy.y - enemy.h,
      w: enemy.w,
      h: enemy.h,
    }
    if (overlaps(attackBox, enemyBox)) {
      stones += 1
      return false
    }
    return true
  })

  return {
    ...game,
    stones,
    enemies,
    attackTimer: 0.34,
  }
}

function updateGame(game: GameState, input: InputState, dt: number): GameState {
  if (game.status !== 'running') return game

  const speed = 230
  const worldSpeed = 96
  const gravity = 1420
  let x = game.x
  let y = game.y
  let vy = game.vy
  let facing = game.facing

  if (input.left) {
    x -= speed * dt
    facing = -1
  }
  if (input.right) {
    x += speed * dt
    facing = 1
  }
  x = Math.max(42, Math.min(820, x))

  if (input.jump && y >= groundY - 1) {
    vy = -560
  }
  input.jump = false

  vy += gravity * dt
  y += vy * dt
  if (y >= groundY) {
    y = groundY
    vy = 0
  }

  let attackTimer = Math.max(0, game.attackTimer - dt)
  if (input.attack) {
    attackTimer = 0.34
  }
  input.attack = false

  const distance = game.distance + (worldSpeed + (input.right ? 70 : 0)) * dt
  const enemies = game.enemies
    .map((enemy) => ({ ...enemy, x: enemy.x - (worldSpeed + 34) * dt }))
    .filter((enemy) => enemy.x > -90)

  let stones = game.stones
  let hp = game.hp
  let invulnerable = Math.max(0, game.invulnerable - dt)
  const playerBox = { x, y: y - 88, w: 52, h: 84 }
  const attackBox =
    attackTimer > 0
      ? {
          x: facing === 1 ? x + 40 : x - 178,
          y: y - 82,
          w: 190,
          h: 50,
        }
      : null

  const remainingEnemies: Enemy[] = []
  for (const enemy of enemies) {
    const enemyBox = {
      x: enemy.x,
      y: enemy.y - enemy.h,
      w: enemy.w,
      h: enemy.h,
    }
    if (attackBox && overlaps(attackBox, enemyBox)) {
      stones += 1
      continue
    }
    if (invulnerable <= 0 && overlaps(playerBox, enemyBox)) {
      hp -= 1
      invulnerable = 1.1
    }
    remainingEnemies.push(enemy)
  }

  let lastSpawnAt = game.lastSpawnAt
  let nextEnemyId = game.nextEnemyId
  if (distance - lastSpawnAt > 155 && remainingEnemies.length < 3) {
    remainingEnemies.push({
      id: nextEnemyId,
      x: 930,
      y: groundY,
      w: 64,
      h: 72,
    })
    nextEnemyId += 1
    lastSpawnAt = distance
  }

  if (hp <= 0) {
    return {
      ...game,
      status: 'failed',
      hp: 0,
      stones,
      distance,
      x,
      y,
      vy,
      facing,
      attackTimer,
      invulnerable,
      enemies: remainingEnemies,
      nextEnemyId,
      lastSpawnAt,
    }
  }

  if (distance >= finishDistance) {
    return {
      ...game,
      status: 'won',
      hp,
      stones,
      distance: finishDistance,
      x,
      y,
      vy,
      facing,
      attackTimer,
      invulnerable,
      enemies: [],
      nextEnemyId,
      lastSpawnAt,
    }
  }

  return {
    ...game,
    hp,
    stones,
    distance,
    x,
    y,
    vy,
    facing,
    attackTimer,
    invulnerable,
    enemies: remainingEnemies,
    nextEnemyId,
    lastSpawnAt,
  }
}

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  )
}

function statusTitle(status: GameStatus) {
  if (status === 'won') return '这一段，跑出来了'
  if (status === 'failed') return '风紧，先撤'
  if (status === 'paused') return '先收一口气'
  return '韩跑跑出发'
}

function statusCopy(status: GameStatus) {
  if (status === 'won') return '灵石入袋，道友可以回长卷看下一段。'
  if (status === 'failed') return '留得青山在，重开再跑。'
  if (status === 'paused') return '山风停一瞬，按继续就走。'
  return '移动、跳跃、出剑，跑过这一段仙途。'
}
