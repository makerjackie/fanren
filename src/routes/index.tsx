import { createFileRoute } from '@tanstack/react-router'
import {
  Clock3,
  Footprints,
  Gem,
  Image as ImageIcon,
  Map,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { SiteNav } from '../components/SiteNav'
import { countdownTarget } from '../data/fanrenWorld'

export const Route = createFileRoute('/')({ component: Home })

const entranceParticles = [
  [8, 22, 3],
  [14, 68, 9],
  [21, 38, 1],
  [29, 82, 7],
  [37, 18, 5],
  [46, 58, 11],
  [54, 29, 4],
  [63, 76, 12],
  [72, 16, 8],
  [81, 49, 2],
  [89, 72, 10],
  [94, 34, 6],
]

function Home() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [entered, setEntered] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [heroHighSource, setHeroHighSource] = useState<string | null>(null)
  const [heroHighReady, setHeroHighReady] = useState(false)
  const countdown = useCountdown(countdownTarget)
  const countdownActive =
    countdown.remainingMs === null || countdown.remainingMs > 0

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection

    if (motionQuery.matches || connection?.saveData) {
      return
    }

    const loadHighVideo = () => setHeroHighSource('/media/videos/hero.mp4')
    const timerId = window.setTimeout(loadHighVideo, 1800)
    return () => window.clearTimeout(timerId)
  }, [])

  const enterSite = () => {
    setEntered(true)
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.34
    audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  const toggleSound = () => {
    const audio = audioRef.current
    if (!audio) return

    if (soundOn) {
      audio.pause()
      setSoundOn(false)
      return
    }

    audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  return (
    <main className={`home-shell ${entered ? 'is-entered' : ''}`}>
      <audio ref={audioRef} src="/media/audio/bufan.mp3" preload="auto" loop />
      <span className="world-flash" aria-hidden="true" />
      <SiteNav />

      <section className="home-hero" aria-label="凡人修仙阁入口">
        <div className="hero-media" aria-hidden="true">
          <video
            className={`hero-video hero-video-preview ${
              heroHighReady ? 'is-faded' : ''
            }`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/media/images/bg/hero-poster.jpg"
          >
            <source src="/media/videos/hero-preview.mp4" type="video/mp4" />
          </video>
          {heroHighSource ? (
            <video
              className={`hero-video hero-video-high ${
                heroHighReady ? 'is-ready' : ''
              }`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onCanPlay={() => setHeroHighReady(true)}
            >
              <source src={heroHighSource} type="video/mp4" />
            </video>
          ) : null}
        </div>
        <div className="hero-scrim" />
        <div className="spirit-layer" aria-hidden="true">
          {entranceParticles.map(([x, y, delay], index) => (
            <span
              key={`${x}-${y}`}
              style={
                {
                  '--x': `${x}%`,
                  '--y': `${y}%`,
                  '--delay': `${delay * 0.31}s`,
                } as CSSProperties
              }
              className={`spirit-dot spirit-dot-${index % 3}`}
            />
          ))}
        </div>

        <button
          className="sound-toggle"
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? '关闭背景声' : '播放背景声'}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div className="home-hero-copy">
          <p className="seal-line">凡人修仙阁</p>
          <h1>{countdownActive ? '慕兰之战，归期已定' : '凡人修仙阁'}</h1>
          <p className="home-hero-subtitle">
            {countdownActive
              ? '6 月 13 日 11:00，请道友回阁'
              : '七玄门风起，乱星海潮生，请道友翻开韩立这一卷'}
          </p>

          {countdownActive ? (
            <div className="countdown-altar" aria-label="复播倒计时">
              <CountdownUnit label="天" value={countdown.days} />
              <CountdownUnit label="时" value={countdown.hours} />
              <CountdownUnit label="分" value={countdown.minutes} />
              <CountdownUnit label="秒" value={countdown.seconds} />
            </div>
          ) : null}

          <div className="hero-actions">
            <a className="primary-link" href="/timeline">
              <Map size={18} />
              入阁翻卷
            </a>
            <a className="ghost-link" href="/game">
              <Footprints size={18} />
              韩跑跑出发
            </a>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="entry-gate"
        onClick={enterSite}
        aria-hidden={entered}
        tabIndex={entered ? -1 : 0}
      >
        <span className="gate-door gate-door-left" aria-hidden="true" />
        <span className="gate-door gate-door-right" aria-hidden="true" />
        <span className="gate-light" aria-hidden="true" />
        <span className="gate-sky" aria-hidden="true" />
        <span className="gate-ring gate-ring-outer" aria-hidden="true" />
        <span className="gate-ring gate-ring-inner" aria-hidden="true" />
        <span className="gate-sword" aria-hidden="true" />
        <span className="gate-rune gate-rune-left" aria-hidden="true">
          玄
        </span>
        <span className="gate-rune gate-rune-right" aria-hidden="true">
          凡
        </span>
        <span className="gate-title">叩开洞府</span>
        <span className="gate-subtitle">门后有长卷，也有旧人</span>
      </button>

      <section className="home-paths" aria-label="入阁路径">
        <a className="path-tile scroll-tile" href="/timeline">
          <span>
            <Map size={22} />
            仙途长卷
          </span>
          <strong>从七玄门一路翻到昆吾山</strong>
          <p>
            剧情事件浮在卷轴上，点一站就能看地点、境界、同场旧人和 B站入口。
          </p>
        </a>
        <a className="path-tile star-tile" href="/relationships">
          <span>
            <Sparkles size={22} />
            人物星图
          </span>
          <strong>看谁在韩立哪段路上亮过</strong>
          <p>
            南宫婉、紫灵、元瑶、银月、辛如音沿章节轨道出现，一点便回到初逢处。
          </p>
        </a>
        <a className="path-tile bag-tile" href="/artifacts">
          <span>
            <Gem size={22} />
            法宝行囊
          </span>
          <strong>把掌天瓶与飞剑收入行囊</strong>
          <p>拖动法宝落位，右侧异象会亮起，也会指向改变韩立处境的那一段。</p>
        </a>
      </section>

      <section className="home-lower-gate">
        <div>
          <ImageIcon size={20} />
          <h2>壁纸洞府</h2>
          <p>
            图与影，皆以原平台为准。道友可以从这里去找官方壁纸、场景设定与 PV。
          </p>
        </div>
        <a className="ink-button" href="/wallpapers">
          去壁纸洞府
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <strong>凡人修仙阁</strong>
          <span>给道友玩的互动仙途长卷</span>
        </div>
        <a href="/timeline">
          <Clock3 size={15} />
          翻开长卷
        </a>
      </footer>
    </main>
  )
}

function CountdownUnit({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <strong>{value}</strong>
      <em>{label}</em>
    </span>
  )
}

function useCountdown(target: string) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    const targetTime = new Date(target).getTime()
    const tick = () => setRemainingMs(Math.max(targetTime - Date.now(), 0))
    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [target])

  const safeMs = remainingMs ?? 0
  const totalSeconds = Math.floor(safeMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    remainingMs,
    days: remainingMs === null ? '--' : String(days).padStart(2, '0'),
    hours: remainingMs === null ? '--' : String(hours).padStart(2, '0'),
    minutes: remainingMs === null ? '--' : String(minutes).padStart(2, '0'),
    seconds: remainingMs === null ? '--' : String(seconds).padStart(2, '0'),
  }
}
