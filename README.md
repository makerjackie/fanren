# 凡人修仙传人界篇回坑玉简

一个非官方粉丝向互动网页：复播前选择自己最后记得的剧情节点，生成一份人界篇补课路线。

线上地址：<https://fanren.01mvp.com>

## 功能

- 点击进入洞府后播放背景音乐和动态首屏。
- 选择剧情记忆节点，生成“回坑玉简”。
- 展示 60 秒补课、必记人物、必记法宝、后续爽点。
- 移动端支持横向滑动选择节点。
- 底部引流到 <https://01mvp.com> 的制作过程说明。

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

这是非官方粉丝项目。剧情信息为个人整理，站内视频、图片和音乐仅作为氛围展示使用；如有不妥，请联系移除或替换为原创素材。

## License

Code is MIT licensed. Third-party media assets, character images, video, audio, trademarks, and story/IP references are excluded from the code license.
