import { useCallback, useEffect, useRef, useState } from 'react'
import type XianxiaRunner from '../../game/hanpaopao/core/XianxiaRunner'

const storyCards = [
  {
    title: '禁门初开',
    text: '归墟云境上空裂开一道古老禁门，紫雷落入群山，沉睡的魔气开始复苏。',
    position: '0% 0%',
  },
  {
    title: '幽影降临',
    text: '幽冥尊者自雷云深处现身，魔雾压过仙桥，整片云海都被迫低伏。',
    position: '100% 0%',
  },
  {
    title: '御剑出鞘',
    text: '陆青唤出本命飞剑，收起迟疑，沿悬天古道冲入翻涌云涛。',
    position: '0% 100%',
  },
  {
    title: '一线生路',
    text: '灵石、符箓和剑气散落前路，唯有穿过雷阵禁制，才能甩开身后的追杀。',
    position: '100% 100%',
  },
]

type DebugWindow = Window & {
  __xianxiaRunner?: XianxiaRunner
}

export function HanpaopaoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const storyScreenRef = useRef<HTMLElement | null>(null)
  const gameRef = useRef<XianxiaRunner | null>(null)
  const pendingStartRef = useRef(false)
  const [storyIndex, setStoryIndex] = useState(0)
  const [storyVisible, setStoryVisible] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let frameId = 0

    async function mountGame() {
      const canvas = canvasRef.current
      if (!canvas || gameRef.current) return

      try {
        const [{ default: Runner }, { default: Hud }] = await Promise.all([
          import('../../game/hanpaopao/core/XianxiaRunner'),
          import('../../game/hanpaopao/ui/Hud'),
        ])

        if (cancelled) return

        const game = new Runner(canvas, new Hud())
        gameRef.current = game
        ;(window as DebugWindow).__xianxiaRunner = game

        if (pendingStartRef.current) {
          pendingStartRef.current = false
          game.start()
        }

        const tick = () => {
          if (cancelled) return
          game.update()
          frameId = window.requestAnimationFrame(tick)
        }

        tick()
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : '游戏加载失败')
        }
      }
    }

    void mountGame()

    return () => {
      cancelled = true
      if (frameId) window.cancelAnimationFrame(frameId)
      gameRef.current?.destroy()
      gameRef.current = null
      delete (window as DebugWindow).__xianxiaRunner
    }
  }, [])

  useEffect(() => {
    storyScreenRef.current?.focus()
  }, [])

  const startGame = useCallback(() => {
    setStoryVisible(false)
    const game = gameRef.current
    if (!game) {
      pendingStartRef.current = true
      return
    }
    game.start()
  }, [])

  const advanceStory = useCallback(() => {
    if (storyIndex < storyCards.length - 1) {
      setStoryIndex((current) => current + 1)
      return
    }

    startGame()
  }, [startGame, storyIndex])

  const handleStoryKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.code === 'Space') {
        event.preventDefault()
        advanceStory()
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        startGame()
      }
    },
    [advanceStory, startGame],
  )

  const storyCard = storyCards[storyIndex]

  return (
    <section className="hanpaopao-game" aria-label="星海御剑逃亡">
      <canvas
        ref={canvasRef}
        className="hanpaopao-canvas"
        aria-label="星海御剑逃亡 3D 游戏画面"
      />

      <section
        ref={storyScreenRef}
        id="story-screen"
        className="screen screen--story"
        tabIndex={-1}
        hidden={!storyVisible}
        onKeyDown={handleStoryKeyDown}
      >
        <div className="story-shell">
          <div
            className="story-art"
            id="story-art"
            role="img"
            aria-label="云海追逃故事分镜"
            style={{ backgroundPosition: storyCard.position }}
          />
          <div className="story-copy">
            <p className="eyebrow">云海秘境</p>
            <h1 id="story-title">{storyCard.title}</h1>
            <p id="story-text">{storyCard.text}</p>
            <div className="story-actions">
              <button
                id="story-skip"
                className="ghost-button"
                type="button"
                onClick={startGame}
              >
                跳过
              </button>
              <button
                id="story-next"
                className="primary-button"
                type="button"
                onClick={advanceStory}
              >
                {storyIndex === storyCards.length - 1
                  ? '开始御剑逃亡'
                  : '下一幕'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="hud" className="hud" aria-live="polite">
        <div className="hud-profile">
          <img
            className="portrait"
            src="/assets/xianxia/characters/hero.webp"
            alt="主角头像"
          />
          <div className="profile-lines">
            <div className="profile-name">陆青 · 炼气七层</div>
            <div className="bar-row">
              <span>气血</span>
              <div
                className="bar"
                id="hp-meter"
                role="progressbar"
                aria-label="气血"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
              >
                <i id="hp-bar" />
              </div>
              <b id="hp-value">100</b>
            </div>
            <div className="bar-row">
              <span>灵力</span>
              <div
                className="bar bar--qi"
                id="qi-meter"
                role="progressbar"
                aria-label="灵力"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
              >
                <i id="qi-bar" />
              </div>
              <b id="qi-value">100</b>
            </div>
          </div>
        </div>

        <div className="distance-pill">
          <span>距离</span>
          <strong id="distance-value">0 米</strong>
          <em>
            功绩 <b id="score-value">0</b>
          </em>
        </div>

        <div id="danger-ribbon" className="danger-ribbon">
          沿灵脉飞行 · 紫色预警代表禁制封路
        </div>
        <div id="combo-badge" className="combo-badge" hidden>
          连击 0 · x1.00
        </div>

        <div className="chase-panel">
          <button
            id="pause-button"
            className="icon-button"
            type="button"
            aria-label="暂停"
          >
            Ⅱ
          </button>
          <img
            className="boss-mark"
            src="/assets/xianxia/bosses/boss.webp"
            alt="追杀者头像"
          />
          <div className="chase-copy">
            <span>追杀进度</span>
            <div
              className="bar bar--chase"
              id="chase-meter"
              role="progressbar"
              aria-label="追杀进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={40}
            >
              <i id="chase-bar" />
            </div>
            <b id="chase-value">40%</b>
          </div>
        </div>

        <div className="objective-panel">
          <h2>仙令</h2>
          <p>紫色光带是危险航道</p>
          <p>上下左右切换剑路</p>
          <p>空格冲刺，Shift 加速</p>
          <div className="item-guide" aria-label="道具效果">
            <span>
              <i className="icon-gem" />
              灵石：补灵计分
            </span>
            <span>
              <i className="icon-elixir" />
              清心丹：回灵降压
            </span>
            <span>
              <i className="icon-talisman" />
              符箓：护盾救场
            </span>
            <span>
              <i className="icon-sword" />
              剑气：免费冲刺
            </span>
          </div>
        </div>

        <div className="status-panel">
          <div>
            <span>下个目标</span>
            <b id="milestone-value">300 米</b>
          </div>
          <div>
            <span>护盾</span>
            <b id="shield-status">待机</b>
          </div>
          <div>
            <span>冲刺</span>
            <b id="dash-status">待机</b>
          </div>
          <div>
            <span>加速</span>
            <b id="boost-status">待机</b>
          </div>
        </div>

        <div className="inventory-strip">
          <div>
            <span className="gem icon-gem" />
            <b id="spirit-count">0</b>
            <small>灵石</small>
            <em>补灵</em>
          </div>
          <div>
            <span className="gem icon-elixir" />
            <b id="elixir-count">0</b>
            <small>清心丹</small>
            <em>降压</em>
          </div>
          <div>
            <span className="gem icon-talisman" />
            <b id="talisman-count">0</b>
            <small>符箓</small>
            <em>护盾</em>
          </div>
          <div>
            <span className="gem icon-sword" />
            <b id="energy-count">0</b>
            <small>剑气</small>
            <em>冲刺</em>
          </div>
        </div>

        <div className="mobile-pad" aria-label="移动方向">
          <button id="touch-up" type="button" aria-label="上浮">
            ▲
          </button>
          <button id="touch-left" type="button" aria-label="左移">
            ◀
          </button>
          <button id="touch-right" type="button" aria-label="右移">
            ▶
          </button>
          <button id="touch-down" type="button" aria-label="下沉">
            ▼
          </button>
        </div>

        <div className="action-pad">
          <button id="dash-button" type="button">
            <span>冲刺</span>
          </button>
          <button id="boost-button" type="button">
            <span>加速</span>
          </button>
        </div>
      </section>

      <section id="pause-modal" className="modal" hidden>
        <div className="modal-card">
          <p className="eyebrow">御剑暂停</p>
          <h2>风息云止</h2>
          <div className="pause-guide">
            <p>方向键 / WASD 切换剑路</p>
            <p>空格冲刺，Shift 长按加速，R 重新开始</p>
            <p>贴近禁制擦身而过会获得连击与降压奖励</p>
          </div>
          <div className="settings-panel" aria-label="游戏设置">
            <button
              id="mute-toggle"
              className="setting-button"
              type="button"
              aria-pressed="false"
            >
              音效 开
            </button>
            <button
              id="motion-toggle"
              className="setting-button"
              type="button"
              aria-pressed="false"
            >
              动态 标准
            </button>
            <button
              id="reset-records-button"
              className="setting-button setting-button--danger"
              type="button"
            >
              清除纪录
            </button>
          </div>
          <button id="resume-button" className="primary-button" type="button">
            继续
          </button>
          <button
            id="restart-from-pause"
            className="ghost-button"
            type="button"
          >
            重新开始
          </button>
        </div>
      </section>

      <section id="game-over-modal" className="modal" hidden>
        <div className="modal-card">
          <p className="eyebrow">追杀已至</p>
          <h2>本次逃亡结束</h2>
          <p id="final-reason" className="final-reason">
            幽影追上了剑光
          </p>
          <dl className="results">
            <div>
              <dt>功绩</dt>
              <dd id="final-score">0</dd>
            </div>
            <div>
              <dt>距离</dt>
              <dd id="final-distance">0 米</dd>
            </div>
            <div>
              <dt>灵石</dt>
              <dd id="final-spirit">0</dd>
            </div>
            <div>
              <dt>擦身</dt>
              <dd id="final-near-miss">0</dd>
            </div>
            <div>
              <dt>最高功绩</dt>
              <dd id="best-score">0</dd>
            </div>
            <div>
              <dt>最高纪录</dt>
              <dd id="best-distance">0 米</dd>
            </div>
          </dl>
          <button id="restart-button" className="primary-button" type="button">
            再入云海
          </button>
        </div>
      </section>

      <div id="toast" className="toast" role="status" aria-live="assertive" />

      {loadError ? (
        <div className="hanpaopao-load-error" role="alert">
          {loadError}
        </div>
      ) : null}
    </section>
  )
}
