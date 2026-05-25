# 凡人修仙传 · 韩跑跑行迹图

一个面向《凡人修仙传》读者的轻交互网页：叩开洞府，沿着地图点亮韩立在人界篇走过的地方。

线上地址：<https://fanren.01mvp.com>

## 功能

- 点击“叩开洞府”进入首屏，并播放《不凡》作为背景音乐。
- 在人界篇地图上点亮七玄门、黄枫谷、血色禁地、乱星海、虚天殿、昆吾山等地点。
- 地图节点会同步切换境界、同行人物、法宝和一小段剧情回声。
- 重要人物卡片支持点击跳回对应地点。
- 底部保留一个很弱的 01MVP 链接。

## 技术栈

- TanStack Start
- TanStack Router
- React 19
- Tailwind CSS 4
- Cloudflare Workers
- Wrangler

## 本地开发

```bash
pnpm install
pnpm dev
```

## 质量检查

```bash
pnpm lint
pnpm check
pnpm build
```

## 部署

```bash
pnpm run deploy
```

部署目标由 `wrangler.jsonc` 配置，当前 custom domain 为 `fanren.01mvp.com`。

## 素材备注

页面地图为生成素材，站内图片、视频、音频发布前需要确认来源和使用权限。代码按 MIT License 开源；第三方媒体素材、角色名称、故事设定和相关 IP 不包含在代码授权范围内。
