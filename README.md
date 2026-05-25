# 凡人修仙传人界篇断章寻踪

一个非官方粉丝向互动网页：选择自己最后记得的剧情节点，把人界篇主线、人物命线和下一段看点接回来。

线上地址：<https://fanren.01mvp.com>

## 功能

- 点击启封旧卷后进入首屏，并播放原创环境声。
- 选择剧情断点，生成当前记忆状态和接回路线。
- 展示人界篇进度、关键人物、法宝和下一段看点。
- 人物命线支持点击切换。
- 页面保留弱署名链接，不做付费转化入口。

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

## 素材说明

这是非官方粉丝项目。剧情线索为个人重读整理，站内视频和图片仅作氛围展示。

当前背景声是原创环境音。若要使用《不凡》等商业歌曲，需要先取得可公开发布的授权音频文件，再替换 `public/media/audio/ambient.mp3` 或调整页面里的音频路径。

## 版权与边界

- 不提供正片播放、下载、网盘、搬运切片或音乐资源。
- 不以凡人 IP 做付费观看、广告合作、商品售卖、商单承接或课程转化。
- 不使用“官方”“授权”“同款商业网站”等容易造成误解的表述。
- 如继续迭代，优先替换为原创插画、原创音频、自己整理的剧情结构和可删除的外部素材引用。

## License

Code is MIT licensed. Third-party media assets, character images, video, audio, trademarks, and story/IP references are excluded from the code license.
