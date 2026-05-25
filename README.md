# 凡人修仙传人界篇断章寻踪

一个非官方粉丝向互动网页：选择自己最后记得的剧情节点，把人界篇主线、人物命线和下一段看点接回来。

线上地址：<https://fanren.01mvp.com>

## 功能

- 点击启封旧卷后进入首屏，并播放原创环境声。
- 选择剧情断点，生成当前记忆状态和接回路线。
- 展示人界篇进度、关键人物、法宝和下一段看点。
- 人物命线支持点击切换。
- 底部引流到 <https://01mvp.com> 的制作手记。

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

## License

Code is MIT licensed. Third-party media assets, character images, video, audio, trademarks, and story/IP references are excluded from the code license.
