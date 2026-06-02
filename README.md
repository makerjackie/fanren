# 凡人修仙传 · 韩跑跑行迹图

一个面向《凡人修仙传》读者的轻交互网页：把韩立的人界路线做成可玩的数据地图，并整理官方壁纸、制作方 PV 与动态壁纸来源。

线上地址：<https://fanren.01mvp.com>

## 创意来源

交互创意与设计灵感来源于 B 站 UP 主 [@鄙人翔某](https://www.bilibili.com/video/BV1SZGi6pEUF/)，感谢其优秀的原型启发。

## 素材来源

| 类型 | 来源 |
|------|------|
| 网站背景视频 | B 站 UP 主 [@落雨无声AI](https://www.bilibili.com) |
| 壁纸（含韩立水墨等） | B 站 UP 主 [@天南第一深情hero](https://www.bilibili.com) |
| 韩立走动素材 | B 站 UP 主 [@IM 闪电](https://www.bilibili.com) |


具体来源记录见 `docs/research/` 目录。

## 功能

- 点击"叩开洞府"进入首屏，并播放《不凡》作为背景音乐。
- 首页定位为两个核心功能：互动行迹图、壁纸与动态壁纸来源库。
- 在人界篇地图上点亮七玄门、黄枫谷、血色禁地、乱星海、虚天殿、昆吾山等地点。
- 地图节点会同步切换境界、同行人物、法宝和一段剧情回声。
- 使用 AI 图像生成制作横版游戏背景、主角 Sprite Sheet、敌人 Sprite Sheet、攻击特效、道具图标和小元婴跑步动画素材。
- 首屏视频先加载 `hero-preview.mp4`，页面稳定后再切到 `hero.mp4`。
- 壁纸与动态壁纸区只展示来源链接或 B 站播放器，未授权素材不自托管。
- 重要人物卡片支持点击跳回对应地点。
- 底部保留一个 01MVP 链接。

## 技术栈

- **框架**：[TanStack Start](https://tanstack.com/start/latest)（基于 Vite 的全栈 React 框架）
- **路由**：[TanStack Router](https://tanstack.com/router/latest)（类型安全的路由）
- **UI**：React 19 + Tailwind CSS 4
- **服务器**：[Cloudflare Workers](https://workers.cloudflare.com/)（通过 `@cloudflare/vite-plugin` 本地 + 部署 SSR）
- **游戏引擎**：Phaser 3（行迹图交互）、Three.js（3D 场景元素）
- **构建工具**：Vite 8 + `@vitejs/plugin-react`
- **部署**：Wrangler + Cloudflare Pages/Workers

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。

## 质量检查

```bash
pnpm lint       # ESLint 检查
pnpm check      # Prettier 格式检查
pnpm build      # 构建验证
```

## 部署

```bash
pnpm run deploy
```

部署目标由 `wrangler.jsonc` 配置，当前 custom domain 为 `fanren.01mvp.com`。

## 素材备注

`public/media/game` 下的游戏化素材为本项目使用 AI 生成。第三方壁纸、PV、动态壁纸来源记录在 `docs/research/static-wallpapers.md` 和 `docs/research/dynamic-wallpapers-and-video.md`，默认只做链接或官方播放器嵌入；如需自托管高清版本，先确认授权范围。

## 许可

代码按 MIT License 开源；第三方媒体素材、角色名称、故事设定和相关 IP 不包含在代码授权范围内。
