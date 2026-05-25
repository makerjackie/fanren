# 媒体资源落地流程

## 资源分层

- 自生成素材：放在 `public/media/game`，用于互动地图、游戏化卡片和后续小关卡。
- 自有或已授权视频：放在 `public/media/videos`，首屏使用低码率预览版，再延迟切换高清版。
- 官方壁纸、PV、动态壁纸线索：先进入来源目录和页面卡片，不下载、不搬运、不自托管。

## 首屏视频双轨

- `public/media/videos/hero-preview.mp4`：首屏快速加载版本，当前为 6 秒、480p、约 296 KB。
- `public/media/videos/hero.mp4`：页面空闲后加载的高质量版本。当前仓库里是 720p 压缩版；拿到授权 4K 源后，可以直接替换为同名压缩 4K 文件。
- 页面运行时会避开省流量模式和减少动态偏好，不强行加载高质量版本。

## 授权素材进入 R2 的条件

只有拿到明确授权后，才把壁纸、动态壁纸或 PV 文件上传到 Cloudflare R2。上传前需要记录：

- 来源 URL
- 授权方和授权范围
- 可展示清晰度
- 是否允许裁切、压缩、转码
- 授权期限
- 署名格式

建议对象路径：

```text
fanren/wallpapers/static/<source-slug>/<asset-name>.webp
fanren/wallpapers/live/<source-slug>/<asset-name>.mp4
fanren/videos/hero/<version>/hero-4k-compressed.mp4
```

页面数据仍保留原始来源链接，R2 URL 只作为已授权的站内展示文件。
