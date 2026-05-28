import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: '凡人修仙阁 | 给道友玩的互动仙途长卷',
      },
      {
        name: 'description',
        content:
          '从七玄门到乱星海，翻修仙长卷、看人物法宝索引、跑一段韩跑跑小游戏。',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="fan-page not-found-page">
      <a className="fan-brand not-found-brand" href="/">
        <img
          className="fan-brand-mark"
          src="/icon.svg"
          alt=""
          aria-hidden="true"
        />
        <span>凡人修仙阁</span>
      </a>
      <section className="not-found-panel">
        <span>山雾太深</span>
        <h1>这条小径暂时无门。</h1>
        <p>道友不妨先回阁中，换一卷再翻。</p>
        <a className="ink-button primary" href="/">
          回到洞府
        </a>
      </section>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
