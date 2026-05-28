import { Activity, Gamepad2, Headphones, Route, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { HanRunnerPhaserGame } from '../../game/han-runner/createHanRunnerGame'
import type { RunnerGameEvent } from '../../game/han-runner/types'

const initialEvent: RunnerGameEvent = { type: 'ready' }

export function HanRunnerGame() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<HanRunnerPhaserGame | null>(null)
  const [event, setEvent] = useState<RunnerGameEvent>(initialEvent)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function mountGame() {
      const mount = mountRef.current
      if (!mount || gameRef.current) return

      try {
        const { createHanRunnerGame } =
          await import('../../game/han-runner/createHanRunnerGame')
        if (cancelled) return
        gameRef.current = createHanRunnerGame(mount, {
          onEvent: setEvent,
        })
      } catch (error) {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : '游戏加载失败')
      }
    }

    void mountGame()

    return () => {
      cancelled = true
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  const status = useMemo(() => getStatusCopy(event), [event])

  return (
    <section className="han-runner-shell" aria-label="韩跑跑御剑滑行游戏">
      <div className="han-runner-cabinet">
        <div className="han-runner-game-mount" ref={mountRef}>
          {loadError ? <p>{loadError}</p> : null}
        </div>
        <aside className="han-runner-sidepanel" aria-label="游戏状态">
          <span className="han-runner-kicker">御剑滑行</span>
          <h2>{status.title}</h2>
          <p>{status.copy}</p>
          <div className="han-runner-stat-grid">
            <StatusItem icon={Route} label="进度" value={status.distance} />
            <StatusItem icon={Sparkles} label="境界" value={status.realm} />
            <StatusItem icon={Activity} label="追击" value={status.pressure} />
            <StatusItem icon={Headphones} label="音乐" value={status.audio} />
          </div>
          <div className="han-runner-control-list">
            <span>
              <Gamepad2 size={15} />
              Space / 点击起势
            </span>
            <span>S / ↓ 俯冲</span>
            <span>Shift 疾冲</span>
            <span>J 剑光</span>
            <span>P 暂停，M 静音</span>
          </div>
        </aside>
      </div>
    </section>
  )
}

function StatusItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route
  label: string
  value: string
}) {
  return (
    <div>
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function getStatusCopy(event: RunnerGameEvent) {
  if (event.type === 'intro') {
    return {
      title: '亲人告别',
      copy: event.caption,
      distance: event.index > 0 ? `${event.index}/${event.total}` : '待启程',
      realm: '-',
      pressure: '-',
      audio: '开场',
    }
  }

  if (event.type === 'running') {
    return {
      title: '踏剑入云',
      copy: '韩立站上飞剑向前滑行，起势、俯冲和剑光之间留一线余地。',
      distance: `${event.distance} 里`,
      realm: event.realm,
      pressure: `${event.pressure}%`,
      audio: event.muted ? '已静音' : '云路',
    }
  }

  if (event.type === 'result') {
    return {
      title: event.title,
      copy: event.cause,
      distance: `${event.distance} 里`,
      realm: event.realm,
      pressure: event.outcome === 'clear' ? '甩开' : '追上',
      audio: event.outcome === 'clear' ? '通关' : '停止',
    }
  }

  return {
    title: '装载中',
    copy: '正在准备开场过场、御剑云路、追击者和音乐。',
    distance: '-',
    realm: '-',
    pressure: '-',
    audio: '-',
  }
}
