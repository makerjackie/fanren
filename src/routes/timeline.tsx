import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Footprints, Gem, MapPin, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SiteNav } from '../components/SiteNav'
import { artifactById, characterById, journeyEvents } from '../data/fanrenWorld'

export const Route = createFileRoute('/timeline')({ component: TimelinePage })

const routePoints = journeyEvents
  .map((event) => `${event.x},${event.y}`)
  .join(' ')

const fallbackNames: Record<string, string | undefined> = {
  hanli: '韩立',
  'mo-daifu': '墨大夫',
  'chen-qiaoqian': '陈巧倩',
  'man-huzi': '蛮胡子',
}

function TimelinePage() {
  const [activeEventId, setActiveEventId] = useState(journeyEvents[0].id)
  const eventRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const activeIndex = Math.max(
    journeyEvents.findIndex((event) => event.id === activeEventId),
    0,
  )
  const activeEvent = journeyEvents[activeIndex]
  const routeProgress = activeIndex / (journeyEvents.length - 1)
  const activeArtifacts = useMemo(
    () => activeEvent.artifacts.map((id) => artifactById[id]).filter(Boolean),
    [activeEvent],
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const eventId = params.get('event')
    const exists = journeyEvents.some((event) => event.id === eventId)
    if (!eventId || !exists) return

    setActiveEventId(eventId)
    window.setTimeout(() => {
      eventRefs.current[eventId]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }, 80)
  }, [])

  const chooseEvent = (eventId: string) => {
    setActiveEventId(eventId)
    const url = new URL(window.location.href)
    url.searchParams.set('event', eventId)
    window.history.replaceState(null, '', url)
  }

  return (
    <main className="fan-page timeline-page">
      <SiteNav />
      <section className="page-hero compact-hero">
        <div>
          <p className="seal-line">仙途长卷</p>
          <h1>从七玄门，翻到昆吾山。</h1>
          <p>
            道友点一处剧情，韩立就沿着长卷跑过去。地点、境界、同场旧人和行囊法宝会一起亮起。
          </p>
        </div>
        <a className="ink-button" href="/game">
          <Footprints size={17} />
          跑一段
        </a>
      </section>

      <section className="scroll-stage" aria-label="韩立人界篇长卷">
        <div className="scroll-map">
          <img src="/media/images/bg/timeline-full.webp" alt="" />
          <svg
            className="route-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              className="route-line route-line-shadow"
              points={routePoints}
            />
            <polyline
              className="route-line route-line-live"
              points={routePoints}
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1 - routeProgress,
              }}
            />
          </svg>
          {journeyEvents.map((event, index) => (
            <button
              key={event.id}
              type="button"
              className={`scroll-map-node ${
                index <= activeIndex ? 'visited' : ''
              } ${event.id === activeEvent.id ? 'active' : ''}`}
              style={{ left: `${event.x}%`, top: `${event.y}%` }}
              onClick={() => chooseEvent(event.id)}
            >
              <span>{event.order}</span>
              <em>{event.title}</em>
            </button>
          ))}
          <span
            className="runner-token timeline-runner"
            style={{ left: `${activeEvent.x}%`, top: `${activeEvent.y}%` }}
            aria-hidden="true"
          >
            韩
          </span>
        </div>

        <aside className="timeline-focus" aria-live="polite">
          <span>
            {activeEvent.order} · {activeEvent.realm}
          </span>
          <h2>{activeEvent.title}</h2>
          <p className="focus-location">
            <MapPin size={15} />
            {activeEvent.location} · {activeEvent.arc}
          </p>
          <p>{activeEvent.detail}</p>
          <div className="focus-link-row">
            <a href={activeEvent.bilibiliUrl} target="_blank" rel="noreferrer">
              {activeEvent.bilibiliLabel}
              <ExternalLink size={15} />
            </a>
          </div>
        </aside>
      </section>

      <section className="event-river" aria-label="剧情事件卡">
        {journeyEvents.map((event) => {
          const active = event.id === activeEvent.id
          const characters = event.characters.map(
            (id) => characterById[id]?.name ?? fallbackNames[id] ?? id,
          )

          return (
            <button
              key={event.id}
              ref={(node) => {
                eventRefs.current[event.id] = node
              }}
              className={`event-card ${active ? 'active' : ''}`}
              type="button"
              onClick={() => chooseEvent(event.id)}
            >
              <span className="event-order">{event.order}</span>
              <strong>{event.title}</strong>
              <small>{event.location}</small>
              <p>{event.echo}</p>
              <div className="event-tags">
                {characters.map((name, index) => {
                  const id = event.characters[index]
                  return characterById[id] ? (
                    <a key={id} href={`/relationships?person=${id}`}>
                      <Sparkles size={13} />
                      {name}
                    </a>
                  ) : (
                    <span key={id}>{name}</span>
                  )
                })}
              </div>
              <div className="event-tags artifact-tags">
                {event.artifacts.map((id) => {
                  const artifact = artifactById[id]
                  if (!artifact) return null
                  return (
                    <a key={id} href={`/artifacts?artifact=${id}`}>
                      <Gem size={13} />
                      {artifact.name}
                    </a>
                  )
                })}
              </div>
            </button>
          )
        })}
      </section>

      <section className="jade-slip-panel">
        <div>
          <span>这一站行囊</span>
          <h2>{activeArtifacts.map((artifact) => artifact.name).join('、')}</h2>
          <p>
            {activeArtifacts.length > 0
              ? activeArtifacts.map((artifact) => artifact.echo).join(' ')
              : '这一段更像韩立独自赶路，风声比法宝声更重。'}
          </p>
        </div>
        <a className="ink-button primary" href="/artifacts">
          去试法宝
        </a>
      </section>
    </main>
  )
}
