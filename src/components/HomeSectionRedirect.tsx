import { useEffect } from 'react'

import { SiteNav } from './SiteNav'

type HomeSectionRedirectProps = {
  sectionId: 'hanli-timeline' | 'fanren-index'
  label: string
}

export function HomeSectionRedirect({
  sectionId,
  label,
}: HomeSectionRedirectProps) {
  const target = `/#${sectionId}`

  useEffect(() => {
    window.location.replace(target)
  }, [target])

  return (
    <main className="fan-page legacy-redirect-page">
      <SiteNav />
      <section className="page-hero compact-hero legacy-redirect-panel">
        <div>
          <p className="seal-line">凡人修仙阁</p>
          <h1>这一卷已并入首页。</h1>
          <p>剧情、人物和法宝都集中在首页长卷里，读起来更顺。</p>
        </div>
        <a className="ink-button primary" href={target}>
          {label}
        </a>
      </section>
    </main>
  )
}
