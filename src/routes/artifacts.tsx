import { createFileRoute } from '@tanstack/react-router'
import { Backpack, Gem, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'

import { SiteNav } from '../components/SiteNav'
import {
  artifacts,
  getArtifactById,
  getEventById,
  journeyEvents,
} from '../data/fanrenWorld'

export const Route = createFileRoute('/artifacts')({ component: ArtifactsPage })

function ArtifactsPage() {
  const [selectedId, setSelectedId] = useState(artifacts[0].id)
  const [equippedIds, setEquippedIds] = useState<string[]>([artifacts[0].id])
  const selectedArtifact = getArtifactById(selectedId)
  const keyEvent = getEventById(selectedArtifact.firstEventId)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const artifact = params.get('artifact')
    if (artifact && artifacts.some((item) => item.id === artifact)) {
      setSelectedId(artifact)
      setEquippedIds((current) =>
        current.includes(artifact)
          ? current
          : [artifact, ...current].slice(0, 3),
      )
    }
  }, [])

  const equipArtifact = (artifactId = selectedId) => {
    setSelectedId(artifactId)
    setEquippedIds((current) => {
      if (current.includes(artifactId)) return current
      return [artifactId, ...current].slice(0, 3)
    })
  }

  const removeArtifact = (artifactId: string) => {
    setEquippedIds((current) => current.filter((id) => id !== artifactId))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const artifactId = event.dataTransfer.getData('text/plain')
    if (artifactId) equipArtifact(artifactId)
  }

  return (
    <main className="fan-page artifacts-page">
      <SiteNav />
      <section className="page-hero compact-hero">
        <div>
          <p className="seal-line">法宝行囊</p>
          <h1>把法宝拖进韩立行囊。</h1>
          <p>
            掌天瓶、青竹蜂云剑、虚天鼎、乾蓝冰焰、辟邪神雷、噬金虫，收入行囊后会亮起它改变处境的那一段。
          </p>
        </div>
        <a className="ink-button" href={`/timeline?event=${keyEvent.id}`}>
          <Sparkles size={17} />
          看关键一役
        </a>
      </section>

      <section className="artifact-workbench">
        <div className="artifact-rack" aria-label="法宝图标">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              type="button"
              draggable
              className={`artifact-token ${
                selectedId === artifact.id ? 'active' : ''
              }`}
              data-tone={artifact.tone}
              onClick={() => setSelectedId(artifact.id)}
              onDragStart={(event) =>
                event.dataTransfer.setData('text/plain', artifact.id)
              }
            >
              <span>{artifact.symbol}</span>
              <strong>{artifact.name}</strong>
              <small>{artifact.type}</small>
            </button>
          ))}
        </div>

        <div
          className="artifact-bag"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          aria-label="韩立行囊"
        >
          <div className="bag-title">
            <Backpack size={19} />
            <span>韩立行囊</span>
          </div>
          <div className="bag-slots">
            {[0, 1, 2].map((slot) => {
              const artifactId = equippedIds[slot]
              const artifact = artifactId ? getArtifactById(artifactId) : null
              return (
                <div className="bag-slot" key={slot}>
                  {artifact ? (
                    <button
                      type="button"
                      className="equipped-token"
                      data-tone={artifact.tone}
                      onClick={() => removeArtifact(artifact.id)}
                      aria-label={`卸下${artifact.name}`}
                    >
                      <span>{artifact.symbol}</span>
                      <strong>{artifact.name}</strong>
                      <X size={14} />
                    </button>
                  ) : (
                    <span>空位</span>
                  )}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            className="ink-button primary equip-button"
            onClick={() => equipArtifact()}
          >
            收入行囊
          </button>
        </div>

        <aside
          className="artifact-vision"
          data-tone={selectedArtifact.tone}
          aria-live="polite"
        >
          <div className="vision-orb" key={selectedArtifact.id}>
            <span>{selectedArtifact.symbol}</span>
            <i />
            <i />
            <i />
          </div>
          <span>{selectedArtifact.type}</span>
          <h2>{selectedArtifact.name}</h2>
          <p>{selectedArtifact.echo}</p>
          <strong>{selectedArtifact.change}</strong>
        </aside>
      </section>

      <section className="artifact-scroll-link" aria-label="法宝对应剧情">
        {journeyEvents.map((event) => {
          const lit = event.id === selectedArtifact.firstEventId
          return (
            <a
              key={event.id}
              className={lit ? 'lit' : undefined}
              href={`/timeline?event=${event.id}`}
            >
              <span>{event.order}</span>
              <strong>{event.title}</strong>
            </a>
          )
        })}
      </section>

      <section className="relationship-note">
        <Gem size={18} />
        <p>
          同时最多收三件，行囊才不乱。点已装备法宝即可卸下，点下方亮起的剧情可回长卷补那一段。
        </p>
      </section>
    </main>
  )
}
