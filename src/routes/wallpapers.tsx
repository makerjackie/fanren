import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Film, Image as ImageIcon, Sparkles } from 'lucide-react'

import { SiteNav } from '../components/SiteNav'
import { wallpaperSources } from '../data/fanrenWorld'

export const Route = createFileRoute('/wallpapers')({
  component: WallpapersPage,
})

const sourceKinds = [
  '番剧入口',
  '官方壁纸',
  '场景设定',
  '制作方 PV',
  '动态壁纸',
] as const

function WallpapersPage() {
  return (
    <main className="fan-page wallpapers-page">
      <SiteNav />
      <section className="page-hero compact-hero wallpaper-hero">
        <div>
          <p className="seal-line">壁纸洞府</p>
          <h1>图与影，皆以原平台为准。</h1>
          <p>
            道友在这里找番剧入口、官方壁纸、场景设定、制作方 PV 和动态壁纸线索。
          </p>
        </div>
        <a
          className="ink-button"
          href="https://www.bilibili.com/video/BV1VukbYUEZs/"
          target="_blank"
          rel="noreferrer"
        >
          <Film size={17} />
          看定档 PV
        </a>
      </section>

      <section className="wallpaper-feature">
        <div className="bilibili-frame">
          <iframe
            title="《凡人修仙传》慕兰之战定档 PV"
            src="https://player.bilibili.com/player.html?bvid=BV1VukbYUEZs&autoplay=0"
            loading="lazy"
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          />
        </div>
        <div className="wallpaper-preview-copy">
          <Sparkles size={22} />
          <span>慕兰之战</span>
          <h2>6 月 13 日 11:00，请道友回阁。</h2>
          <p>首页倒计时结束后会自然退场，阁名归位，长卷继续展开。</p>
          <a
            href="https://www.bilibili.com/video/BV1VukbYUEZs/"
            target="_blank"
            rel="noreferrer"
          >
            打开来源
            <ExternalLink size={15} />
          </a>
        </div>
      </section>

      <section className="source-kind-grid">
        {sourceKinds.map((kind) => {
          const sources = wallpaperSources.filter(
            (source) => source.kind === kind,
          )
          return (
            <div className="source-kind" key={kind}>
              <h2>
                {kind === '制作方 PV' || kind === '动态壁纸' ? (
                  <Film size={18} />
                ) : (
                  <ImageIcon size={18} />
                )}
                {kind}
              </h2>
              <div className="source-list">
                {sources.map((source) => (
                  <article
                    className="source-card fan-source-card"
                    key={source.id}
                  >
                    <span>{source.kind}</span>
                    <h3>{source.title}</h3>
                    <p>{source.source}</p>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      打开来源
                      <ExternalLink size={15} />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
