import { useRouterState } from '@tanstack/react-router'
import { Github } from 'lucide-react'
import type { ReactNode } from 'react'

import { navItems } from '../data/fanrenWorld'

const GITHUB_URL = 'https://github.com/makerjackie/fanren'

type SiteNavProps = {
  actions?: ReactNode
}

export function SiteNav({ actions }: SiteNavProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="fan-nav" aria-label="凡人修仙阁">
      <a className="fan-brand" href="/" aria-label="返回凡人修仙阁首页">
        <img
          className="fan-brand-mark"
          src="/icon.svg"
          alt=""
          aria-hidden="true"
        />
        <span>凡人修仙阁</span>
      </a>
      <nav>
        {navItems.map((item) => {
          const [itemPath] = item.href.split('#')
          const isActive = pathname === itemPath

          return (
            <a
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={isActive ? 'active' : undefined}
            >
              <span className="nav-full">{item.label}</span>
              <span className="nav-short" aria-hidden="true">
                {item.shortLabel}
              </span>
            </a>
          )
        })}
      </nav>
      <div className="fan-nav-actions">
        {actions}
        <a
          className="nav-github-link"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="在 GitHub 查看源码"
        >
          <Github size={18} />
        </a>
      </div>
    </header>
  )
}
