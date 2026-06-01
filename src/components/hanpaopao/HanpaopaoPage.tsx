import { SiteNav } from '../SiteNav'
import { HanpaopaoGame } from './HanpaopaoGame'

export function HanpaopaoPage() {
  return (
    <main className="fan-page hanpaopao-route">
      <SiteNav />
      <section className="hanpaopao-shell" aria-label="星海御剑逃亡">
        <HanpaopaoGame />
      </section>
    </main>
  )
}
