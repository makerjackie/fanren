# 凡人修仙传 · 韩跑跑行迹图

一个面向《凡人修仙传》读者的轻交互网页：把韩立的人界路线做成可玩的数据地图，并整理官方壁纸、制作方 PV 与动态壁纸来源。

线上地址：<https://fanren.01mvp.com>

## 功能

- 点击“叩开洞府”进入首屏，并播放《不凡》作为背景音乐。
- 首页定位为两个核心功能：互动行迹图、壁纸与动态壁纸来源库。
- 在人界篇地图上点亮七玄门、黄枫谷、血色禁地、乱星海、虚天殿、昆吾山等地点。
- 地图节点会同步切换境界、同行人物、法宝和一小段剧情回声。
- 使用 Image Generation 生成横版游戏背景、主角 Sprite Sheet、敌人 Sprite Sheet、攻击特效、道具图标和小元婴跑步动画素材。
- 首屏视频先加载 `hero-preview.mp4`，页面稳定后再切到 `hero.mp4`。
- 壁纸与动态壁纸区只展示来源链接或 B 站播放器，未授权素材不自托管。
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

`public/media/game` 下的游戏化素材为本项目生成素材。第三方壁纸、PV、动态壁纸来源记录在 `docs/research/static-wallpapers.md` 和 `docs/research/dynamic-wallpapers-and-video.md`，默认只做链接或官方播放器嵌入；如需自托管高清版本，先确认授权范围。代码按 MIT License 开源；第三方媒体素材、角色名称、故事设定和相关 IP 不包含在代码授权范围内。
