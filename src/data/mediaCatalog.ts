export type GameAsset = {
  title: string
  label: string
  image: string
  note: string
}

export type MediaSource = {
  title: string
  source: string
  url: string
  kind: string
  usage: string
}

export const gameAssets: GameAsset[] = [
  {
    title: '横版场景',
    label: '游戏背景图',
    image: '/media/game/game-background.webp',
    note: '山门、竹林、海岛和灵光分成前后景，适合做横向卷轴或地图关卡。',
  },
  {
    title: '韩跑跑主角',
    label: '站立 / 跑步 / 跳跃 / 攻击',
    image: '/media/game/protagonist-sheet.png',
    note: '一套可继续切帧的主角动作，先用于行迹图角色反馈和小关卡原型。',
  },
  {
    title: '傀影小怪',
    label: '敌人 Sprite Sheet',
    image: '/media/game/enemy-sheet.png',
    note: '面具傀影包含待机、追逐、攻击和受击，适合放进禁地或魔道战局段落。',
  },
  {
    title: '法宝和特效',
    label: '攻击特效 / 道具图标',
    image: '/media/game/effects-icons.png',
    note: '飞剑、灵草、小瓶、阵盘、灵石和传送阵图标可承接数据点奖励。',
  },
]

export const staticMediaSources: MediaSource[] = [
  {
    title: 'B站国创番剧页',
    source: '哔哩哔哩',
    url: 'https://www.bilibili.com/bangumi/play/ss28747/',
    kind: '正版番剧入口',
    usage: '链接 / 官方播放器',
  },
  {
    title: 'BiliBili 国际番剧页',
    source: 'BiliBili',
    url: 'https://www.bilibili.tv/en/play/36571/1000',
    kind: '正版番剧入口',
    usage: '链接',
  },
  {
    title: '三月官方壁纸图组',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/643260726635397145',
    kind: '官方壁纸动态',
    usage: '链接；授权后自托管',
  },
  {
    title: '再别天南官方壁纸',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/656248686185021443',
    kind: '官方壁纸动态',
    usage: '链接；授权后自托管',
  },
  {
    title: '年番开播主视觉',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/592785373249732784',
    kind: '官方宣传物料',
    usage: '链接；授权后自托管',
  },
  {
    title: '播放量纪念海报',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/1116825160664481849',
    kind: '官方纪念海报',
    usage: '链接；授权后自托管',
  },
  {
    title: '2026 年番定档物料',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QzdCce0tV',
    kind: '官方定档物料',
    usage: '微博链接 / 嵌入',
  },
  {
    title: '掩月宗场景概念图',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QEo94nbsZ',
    kind: '官方场景设定',
    usage: '链接；授权后自托管',
  },
  {
    title: '阗天城场景公布',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QE5i50f7V',
    kind: '官方场景设定',
    usage: '链接；授权后自托管',
  },
  {
    title: '丰原国场景概念',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QDMr5km5D',
    kind: '官方场景设定',
    usage: '链接；授权后自托管',
  },
  {
    title: '制作方微博相册',
    source: '万维猫动画',
    url: 'https://weibo.com/u/7599939517?tabtype=album',
    kind: '制作方图文流',
    usage: '逐条确认后链接',
  },
  {
    title: '瀚海迷踪概念海报报道',
    source: 'IT之家',
    url: 'https://www.ithome.com/0/846/580.htm',
    kind: '公开新闻线索',
    usage: '资料链接',
  },
  {
    title: '真人剧优酷正版页',
    source: '优酷',
    url: 'https://v.youku.com/v_show/id_XNjQ5NDU5NjcxNg%3D%3D',
    kind: '正版剧集入口',
    usage: '链接 / 平台播放',
  },
  {
    title: '真人剧定档海报报道',
    source: '中华网娱乐',
    url: 'https://ent.china.com/movie/tv/11015529/20250723/48643592_all.html',
    kind: '公开新闻线索',
    usage: '资料链接',
  },
  {
    title: '瀚海迷踪豆瓣海报页',
    source: '豆瓣电影',
    url: 'https://movie.douban.com/subject/37323503/photos?size=a&sortby=size&start=0&subtype=a&type=R',
    kind: '公开海报索引',
    usage: '低优先级线索',
  },
]

export const dynamicMediaSources: MediaSource[] = [
  {
    title: '凡人修仙传番剧页',
    source: 'bilibili 国创',
    url: 'https://www.bilibili.com/bangumi/play/ss28747/',
    kind: '官方番剧入口',
    usage: '链接 / 官方播放器',
  },
  {
    title: '2025-2026 国创发布会 PV',
    source: '万维猫动画',
    url: 'https://www.bilibili.com/video/BV1ipCyBtE1C/',
    kind: '制作方 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '特别篇 15 秒预告',
    source: '哔哩哔哩国创',
    url: 'https://www.bilibili.com/video/BV14V411a7zm/',
    kind: '官方短预告',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '国创发布会制作方版本',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1LpCyBtEfj/',
    kind: '制作方 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '新年番定档 PV',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1VukbYUEZs/',
    kind: '制作方 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '外海风云定档',
    source: '万维猫动画',
    url: 'https://www.bilibili.com/video/BV1fXkxYDEDf/',
    kind: '制作方 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '风希篇章 PV',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV12nCcY8EDf/',
    kind: '角色 / 篇章 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '魔道争锋定档 PV',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1Mb4y1a7xD/',
    kind: '制作方 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '星海飞驰定档',
    source: '万维猫动画',
    url: 'https://www.bilibili.com/video/BV1Z8411D7oR/',
    kind: '短 PV',
    usage: 'B站播放器 / 链接',
  },
  {
    title: '动画制作流水线花絮',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1bu411272u/',
    kind: '幕后花絮',
    usage: '链接',
  },
  {
    title: '遨游天地先导预告',
    source: '万维猫动画',
    url: 'https://www.bilibili.com/video/BV1ut4y1Z7wy/',
    kind: 'IP 扩展预告',
    usage: '链接',
  },
  {
    title: '动态壁纸合集展示',
    source: 'Wallpaper Engine B站账号',
    url: 'https://www.bilibili.com/video/BV1KjaczVE4Q/',
    kind: '用户创作线索',
    usage: '仅作参考；需授权',
  },
  {
    title: 'Wallpaper Engine 动态壁纸线索',
    source: 'Steam Workshop',
    url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3494567567&l=schinese',
    kind: '用户创作线索',
    usage: '仅作参考；需双重授权',
  },
  {
    title: '韩立结婴背景视频',
    source: '哲风壁纸',
    url: 'https://www.haowallpaper.com/homeViewLook/17790887858654592',
    kind: '动态壁纸线索',
    usage: '仅作参考；需授权',
  },
]
