# 凡人时间线素材库与爬取计划

## 范围

本计划只覆盖 `src/routes/index.tsx` 首页时间线素材，不改首页 UI 和样式。素材入库位置优先沿用 `public/media/images`，来源、授权和使用状态记录在 `docs/assets/fanren-asset-manifest.json`。

现有首页时间线节点：

| event_id        | 阶段              | 境界       | 当前主素材状态                                                        |
| --------------- | ----------------- | ---------- | --------------------------------------------------------------------- |
| `wili-gou`      | 五里沟 / 少年韩立 | 凡人       | 有通用韩立、张铁、低清 B 站帧；缺少年韩立专属形象                     |
| `qixuan-men`    | 七玄门            | 凡人       | 有通用韩立、厉飞雨、张铁、山门/地图背景；缺七玄门韩立专属形象         |
| `mo-daifu`      | 神手谷危局        | 凡人       | 有墨大夫、曲魂、墨彩环、低清 B 站帧                                   |
| `green-bottle`  | 小绿瓶            | 练气       | 有掌天瓶生成图；缺瓶子官方参考、练气韩立形象                          |
| `huangfeng-gu`  | 黄枫谷            | 练气后期   | 有通用韩立、辛如音、李化元、陈巧倩、黄枫谷背景；缺黄枫谷韩立专属形象  |
| `bloody-land`   | 血色禁地          | 筑基机缘   | 有南宫婉、向之礼、菡云芝、战斗参考；缺血色禁地场景帧和韩立试炼形象    |
| `foundation`    | 筑基              | 筑基       | 有通用韩立、菡云芝、境界灵光；缺筑基韩立形象和筑基丹/突破动效         |
| `star-sea`      | 乱星海            | 结丹前后   | 有紫灵、元瑶、凌玉灵、风希、星海背景；缺乱星海韩立形象、海域/洞府帧   |
| `gold-core`     | 结丹              | 结丹       | 有金丹生成图；缺结丹韩立形象、金丹成型动效                            |
| `xutian-palace` | 虚天殿            | 结丹中后期 | 有银月、蛮胡子、万天明、玄骨上人、古殿背景；缺虚天鼎/乾蓝冰焰         |
| `nascent-soul`  | 元婴              | 元婴       | 有元婴生成图、南宫婉、通用韩立；缺元婴期韩立形象、青竹蜂云剑/辟邪神雷 |
| `spirit-world`  | 飞升灵界          | 化神之后   | 有向之礼、银月、慕沛灵、星空背景；缺大晋/飞升前韩立形象、空间节点帧   |

## 韩立阶段形象拆分

| stage                       | 对应 event_ids                 | 需要素材                                   | 当前可用                                                         | 缺口优先级 |
| --------------------------- | ------------------------------ | ------------------------------------------ | ---------------------------------------------------------------- | ---------- |
| `hanli-young-wiligou`       | `wili-gou`                     | 少年韩立半身/全身、村路、离家背影          | `characters/hanli.webp` 只能临时代替                             | P0         |
| `hanli-qixuan-shenshougu`   | `qixuan-men`, `mo-daifu`       | 七玄门服饰、神手谷药炉旁韩立、低武江湖质感 | `characters/hanli.webp`, `sourced/aigei-hanli-turn.jpg` 临时代替 | P0         |
| `hanli-qi-refining`         | `green-bottle`, `huangfeng-gu` | 练气期韩立、药园、洞府、灵草培育           | 缺专属形象                                                       | P0         |
| `hanli-huangfeng-valley`    | `huangfeng-gu`                 | 黄枫谷门派装、飞剑、阵法、药园场景         | `bg/timeline-poster.jpg` 可作背景                                | P1         |
| `hanli-bloody-trial`        | `bloody-land`                  | 血色禁地试炼韩立、红雾、禁地斗法           | 缺                                                               | P0         |
| `hanli-foundation`          | `foundation`                   | 筑基后韩立、筑基丹、突破灵光               | `generated/gold-core.png` 临时代替                               | P1         |
| `hanli-star-sea`            | `star-sea`                     | 乱星海独行修士形象、外海洞府、星宫/海雾    | `bg/galaxy-bg.webp` 可作背景                                     | P0         |
| `hanli-gold-core`           | `gold-core`, `xutian-palace`   | 结丹期韩立、金丹、飞剑体系、虚天殿参会形象 | `generated/gold-core.png` 可作法宝/境界图                        | P1         |
| `hanli-xutian-palace`       | `xutian-palace`                | 虚天殿韩立、古殿、虚天鼎、乾蓝冰焰         | `bg/timeline-full.webp` 可作背景                                 | P1         |
| `hanli-nascent-soul`        | `nascent-soul`                 | 元婴期韩立、元婴离体、青竹蜂云剑、辟邪神雷 | `generated/nascent-spirit-v2.png` 仅为生成参考                   | P1         |
| `hanli-dajin-pre-ascension` | `spirit-world`                 | 大晋/飞升前韩立、空间节点、化神后气质      | 缺                                                               | P0         |

## 爬取源优先级

| 优先级 | 来源                         | 目标素材                             | 处理方式                                             | 许可/来源风险                                   |
| ------ | ---------------------------- | ------------------------------------ | ---------------------------------------------------- | ----------------------------------------------- |
| P0     | fanren-website characters    | 人物头像、角色立绘、官方角色图       | 只记录来源 URL；确认可用范围后再自托管               | 中。通常属于官方/平台素材，需保留来源和用途说明 |
| P0     | B 站 readlist / 正片 / PV    | 时间线背景帧、剧情节点截图、动效参考 | 截图只做内部参考；公开使用前确认授权或仅外链来源     | 高。视频截图、PV 帧一般不应直接自托管公开复用   |
| P1     | Aigei                        | 参考图、战斗氛围、转身/武器素材      | 记录页面、作者、授权条款；优先找可商用或明确授权资源 | 中到高。不同素材授权差异大，必须逐条记录        |
| P1     | 官方壁纸 / 官网活动页 / 百科 | 背景图、人物关系补全、法宝设定       | 优先外链和引用；自托管前记录授权范围                 | 中。百科文图来源复杂，需追溯原始出处            |
| P2     | 视频截图重绘 / 自生成        | 缺口阶段形象、法宝、动效贴图         | 用截图作参考，输出自生成或重绘版本并标注衍生风险     | 中。仍需避免高度复刻官方帧                      |

建议爬取顺序：

1. 先补韩立阶段形象：少年、七玄门/神手谷、练气、血色禁地、乱星海、大晋/飞升前。
2. 再补关键法宝：掌天瓶、筑基丹、金丹、虚天鼎、乾蓝冰焰、青竹蜂云剑、辟邪神雷。
3. 最后补背景帧和动效素材：村路、七玄门山门、神手谷药炉、药园、血色禁地红雾、乱星海外海、虚天殿古殿、空间节点。

## Metadata schema

所有素材条目使用同一 schema，便于后续脚本校验、去重和生成页面数据。

```json
{
  "id": "string, stable slug",
  "source_url": "string | null",
  "local_path": "string | null",
  "stage": "string",
  "event_ids": ["string"],
  "character_names": ["string"],
  "realm": "string | null",
  "asset_type": "character | relationship | artifact | background_frame | motion | reference",
  "description": "string",
  "license_note": "string",
  "source_risk": "low | medium | high | unknown",
  "usage_status": "in_use | candidate | missing | reference_only | needs_license_review | approved",
  "hash": "string | null",
  "dimensions": {
    "width": "number | null",
    "height": "number | null"
  },
  "crawl_priority": "P0 | P1 | P2",
  "notes": "string"
}
```

字段约定：

- `source_url`: 原始页面 URL，不填搜索结果页；视频截图要记录具体集数、时间戳或 BV/ep。
- `local_path`: 仓库内路径，公开自托管素材必须填写。
- `stage`: 使用韩立阶段或时间线阶段 slug，例如 `hanli-star-sea`、`xutian-palace`。
- `event_ids`: 对应首页 `homeTimelineNodes` 的 `id`。
- `asset_type`: `character` 用于人物，`relationship` 用于人物关系图/组合图，`artifact` 用于法宝，`background_frame` 用于场景帧，`motion` 用于动态贴图/视频，`reference` 用于仅参考资源。
- `usage_status`: `in_use` 表示已被首页引用；`missing` 表示待爬取；`reference_only` 表示不可直接公开使用；`needs_license_review` 表示入库前必须复核授权。
- `hash`: 推荐使用 SHA-256，爬虫落盘后再补。
- `dimensions`: 宽高未知时填 null，落盘后通过 `file` 或图片库补全。

## 已有素材汇总

### 人物素材

| local_path                                        | dimensions       | 当前覆盖                                   | 风险/备注                        |
| ------------------------------------------------- | ---------------- | ------------------------------------------ | -------------------------------- |
| `public/media/images/characters/hanli.webp`       | 551x786          | 通用韩立，多节点临时代替                   | 需要拆分阶段版本                 |
| `public/media/images/characters/mo-daifu.webp`    | 600x582          | `mo-daifu`                                 | 需补来源 URL                     |
| `public/media/images/characters/nangong-wan.webp` | 517x689          | `bloody-land`, `nascent-soul`              | 需补来源 URL                     |
| `public/media/images/characters/zi-ling.webp`     | 474x338          | `star-sea`                                 | 横图，不适合所有人物卡           |
| `public/media/images/characters/xin-ruyin.webp`   | 552x656          | `huangfeng-gu`                             | 需补来源 URL                     |
| `public/media/images/characters/yuanyao.webp`     | 486x860          | `star-sea`                                 | 需补来源 URL                     |
| `public/media/images/characters/li-feyu.webp`     | 377x419          | `qixuan-men`                               | 分辨率偏低                       |
| `public/media/images/characters/xiang-zhili.webp` | 487x775          | `bloody-land`, `spirit-world`              | 需补来源 URL                     |
| `public/media/images/characters/yinyue.webp`      | 600x624          | `xutian-palace`, `spirit-world`            | 需补来源 URL                     |
| `public/media/images/characters/wang-chan.webp`   | 600x653          | 未被首页 timeline 引用                     | 可用于后续人物关系               |
| `public/media/images/characters-extra/*.webp`     | 474-600px 宽为主 | 张铁、菡云芝、李化元、陈巧倩、凌玉灵等配角 | 多数可用于关系图，需统一来源记录 |

### 背景、截图、生成素材

| local_path                                            | dimensions | 当前覆盖                                            | 风险/备注                              |
| ----------------------------------------------------- | ---------- | --------------------------------------------------- | -------------------------------------- |
| `public/media/images/bg/dongfu-gate.webp`             | 1672x941   | `wili-gou` 背景                                     | 阶段语义不完全匹配村路                 |
| `public/media/images/bg/hanli-map.webp`               | 1440x811   | `qixuan-men` 背景                                   | 可作路线/地图背景                      |
| `public/media/images/bg/timeline-poster.jpg`          | 960x540    | `huangfeng-gu` 背景                                 | 需补来源 URL                           |
| `public/media/images/bg/galaxy-bg.webp`               | 1600x1093  | `star-sea`, `spirit-world`                          | 乱星海/飞升可临时代替                  |
| `public/media/images/bg/timeline-full.webp`           | 1600x712   | `xutian-palace` 背景                                | 宽幅适合古殿/长卷                      |
| `public/media/images/sourced/bili-ep1-frame.webp`     | 234x176    | `wili-gou` 帧                                       | 低清，公开使用风险高                   |
| `public/media/images/sourced/bili-ep2-frame.webp`     | 234x176    | `wili-gou`, `qixuan-men` 帧                         | 低清，公开使用风险高                   |
| `public/media/images/sourced/bili-ep3-frame.webp`     | 234x176    | `mo-daifu`, `green-bottle` 帧                       | 低清，公开使用风险高                   |
| `public/media/images/sourced/bili-ep4-frame.webp`     | 234x176    | `mo-daifu`, `huangfeng-gu`, `foundation` 帧         | 低清，公开使用风险高                   |
| `public/media/images/sourced/aigei-hanli-turn.jpg`    | 282x159    | `qixuan-men`, `star-sea`, `spirit-world` 参考       | 需确认 Aigei 条款                      |
| `public/media/images/sourced/aigei-battle.jpg`        | 282x159    | `bloody-land`, `xutian-palace` 参考                 | 需确认 Aigei 条款                      |
| `public/media/images/sourced/aigei-sword.jpg`         | 140x78     | `huangfeng-gu`, `gold-core` 参考                    | 分辨率很低，需替换                     |
| `public/media/images/generated/green-bottle.png`      | 1254x1254  | `green-bottle` 法宝                                 | 自生成，需记录 prompt/参考来源         |
| `public/media/images/generated/gold-core.png`         | 1254x1254  | `foundation`, `gold-core`, `nascent-soul` 法宝/境界 | 自生成，需拆分为筑基/结丹/元婴不同视觉 |
| `public/media/images/generated/nascent-spirit-v2.png` | 1023x1537  | `nascent-soul` 主图                                 | 自生成，需人工审核是否过度贴近参考     |

## 缺口清单

| priority | event_id        | asset_type                 | 需要补齐                              |
| -------- | --------------- | -------------------------- | ------------------------------------- |
| P0       | `wili-gou`      | character                  | 少年韩立专属形象，区别于成年通用韩立  |
| P0       | `qixuan-men`    | character                  | 七玄门时期韩立，低武门派服饰          |
| P0       | `mo-daifu`      | background_frame           | 神手谷药炉、密室、夺舍危机背景帧      |
| P0       | `green-bottle`  | character/artifact         | 练气韩立、掌天瓶官方参考或授权重绘版  |
| P0       | `huangfeng-gu`  | character/background_frame | 黄枫谷韩立、药园、洞府、阵法          |
| P0       | `bloody-land`   | character/background_frame | 血色禁地韩立、红雾禁地、试炼斗法帧    |
| P1       | `foundation`    | artifact/motion            | 筑基丹、突破灵光序列帧                |
| P0       | `star-sea`      | character/background_frame | 乱星海韩立、外海洞府、星宫/海雾背景   |
| P1       | `gold-core`     | character/motion           | 结丹韩立、金丹凝聚动效                |
| P1       | `xutian-palace` | artifact/background_frame  | 虚天鼎、乾蓝冰焰、虚天殿内景          |
| P1       | `nascent-soul`  | character/artifact/motion  | 元婴期韩立、青竹蜂云剑、辟邪神雷      |
| P0       | `spirit-world`  | character/background_frame | 大晋/飞升前韩立、空间节点、飞升前场景 |

## 落地规则

- 未确认授权的官方、B 站、Aigei、百科素材先标为 `reference_only` 或 `needs_license_review`，不要直接扩大使用范围。
- 公开自托管素材必须有 `source_url`、`license_note`、`hash`、`dimensions`。
- 同一个通用韩立图不要继续覆盖所有阶段；新增素材优先以 `hanli-<stage>.webp` 命名。
- 视频截图只作为参考帧入库，除非拿到明确授权。
- 后续若要把 manifest 接入页面，再单独改数据层；当前阶段不改 `src/routes/index.tsx`。
