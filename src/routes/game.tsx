import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

import { CharacterMatchGame } from '../components/character-match/CharacterMatchGame'
import { SiteNav } from '../components/SiteNav'

export const Route = createFileRoute('/game')({
  component: CharacterMatchPage,
})

function CharacterMatchPage() {
  return (
    <main className="fan-page character-match-page">
      <SiteNav />
      <section className="page-hero compact-hero match-hero">
        <div>
          <p className="seal-line">人物消消乐</p>
          <h1>人物头像三消</h1>
          <p>
            交换相邻棋子，三个一样就消除。韩立、南宫婉、墨大夫、掌天瓶有特殊效果。
          </p>
        </div>
        <a className="ink-button" href="/relationships">
          <Sparkles size={17} />
          人物星图
        </a>
      </section>
      <CharacterMatchGame />
    </main>
  )
}
