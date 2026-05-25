import { createFileRoute } from '@tanstack/react-router'
import { MapPin, Route as RouteIcon, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SiteNav } from '../components/SiteNav'
import {
  characters,
  getCharacterById,
  getEventById,
  journeyEvents,
} from '../data/fanrenWorld'

export const Route = createFileRoute('/relationships')({
  component: RelationshipsPage,
})

function RelationshipsPage() {
  const [activeId, setActiveId] = useState(characters[0].id)
  const activeCharacter = getCharacterById(activeId)
  const firstEvent = getEventById(activeCharacter.firstEventId)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const person = params.get('person')
    if (person && characters.some((character) => character.id === person)) {
      setActiveId(person)
    }
  }, [])

  const chooseCharacter = (id: string) => {
    setActiveId(id)
    const url = new URL(window.location.href)
    url.searchParams.set('person', id)
    window.history.replaceState(null, '', url)
  }

  return (
    <main className="fan-page relationships-page">
      <SiteNav />
      <section className="page-hero compact-hero">
        <div>
          <p className="seal-line">人物星图</p>
          <h1>谁在韩立哪段路上亮过。</h1>
          <p>
            星位不写长传，只看初逢、章节轨道和交集。道友点一颗星，下方长卷会亮到她入卷的地方。
          </p>
        </div>
        <a className="ink-button" href={`/timeline?event=${firstEvent.id}`}>
          <RouteIcon size={17} />
          去初逢处
        </a>
      </section>

      <section className="star-layout">
        <div className="star-map" aria-label="人物关系星图">
          <img src="/media/images/bg/galaxy-bg.webp" alt="" />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {characters.map((character) => (
              <line
                key={character.id}
                x1="50"
                y1="50"
                x2={character.x}
                y2={character.y}
                className={character.id === activeId ? 'active' : undefined}
              />
            ))}
          </svg>
          <button className="han-star" type="button" aria-label="韩立">
            韩立
          </button>
          {characters.map((character) => (
            <button
              key={character.id}
              type="button"
              className={`person-star ${
                character.id === activeId ? 'active' : ''
              }`}
              style={{ left: `${character.x}%`, top: `${character.y}%` }}
              onClick={() => chooseCharacter(character.id)}
            >
              <span>{character.name.slice(0, 1)}</span>
              <em>{character.name}</em>
            </button>
          ))}
        </div>

        <aside className="person-scroll-card" aria-live="polite">
          <span>{activeCharacter.track}</span>
          <h2>{activeCharacter.name}</h2>
          <p className="person-place">
            <MapPin size={15} />
            初登场，{activeCharacter.firstPlace}
          </p>
          <blockquote>{activeCharacter.echo}</blockquote>
          <div className="intersections">
            <strong>交集片段</strong>
            {activeCharacter.intersections.map((eventId) => {
              const event = getEventById(eventId)
              return (
                <a key={event.id} href={`/timeline?event=${event.id}`}>
                  {event.title}
                </a>
              )
            })}
          </div>
        </aside>
      </section>

      <section className="mini-scroll" aria-label="初登场长卷定位">
        {journeyEvents.map((event) => {
          const first = event.id === activeCharacter.firstEventId
          const intersects = activeCharacter.intersections.includes(event.id)
          return (
            <a
              key={event.id}
              href={`/timeline?event=${event.id}`}
              className={`${first ? 'first' : ''} ${intersects ? 'lit' : ''}`}
            >
              <span>{event.order}</span>
              <strong>{event.title}</strong>
            </a>
          )
        })}
      </section>

      <section className="relationship-note">
        <Sparkles size={18} />
        <p>
          当前亮起的是 {activeCharacter.name}{' '}
          与韩立的交集。道友可点亮其他星位，再回长卷补那一幕。
        </p>
      </section>
    </main>
  )
}
