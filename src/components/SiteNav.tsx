import { useRouterState } from '@tanstack/react-router'

import { navItems } from '../data/fanrenWorld'

export function SiteNav() {
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
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={pathname === item.href ? 'active' : undefined}
          >
            <span className="nav-full">{item.label}</span>
            <span className="nav-short" aria-hidden="true">
              {item.shortLabel}
            </span>
          </a>
        ))}
      </nav>
    </header>
  )
}
