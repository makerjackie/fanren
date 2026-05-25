export type JourneyEvent = {
  id: string
  order: string
  title: string
  location: string
  arc: string
  realm: string
  echo: string
  detail: string
  characters: string[]
  artifacts: string[]
  bilibiliLabel: string
  bilibiliUrl: string
  x: number
  y: number
}

export type CharacterNode = {
  id: string
  name: string
  track: string
  firstEventId: string
  firstPlace: string
  echo: string
  intersections: string[]
  x: number
  y: number
}

export type Artifact = {
  id: string
  name: string
  type: string
  symbol: string
  firstEventId: string
  echo: string
  change: string
  tone: string
}

export type WallpaperSource = {
  id: string
  title: string
  source: string
  url: string
  kind: '官方壁纸' | '场景设定' | '制作方 PV' | '动态壁纸' | '番剧入口'
}

export const countdownTarget = '2026-06-13T11:00:00+08:00'

export const navItems = [
  { href: '/timeline', label: '仙途长卷', shortLabel: '长卷' },
  { href: '/relationships', label: '人物星图', shortLabel: '星图' },
  { href: '/artifacts', label: '法宝行囊', shortLabel: '法宝' },
  { href: '/game', label: '韩跑跑', shortLabel: '韩跑跑' },
  { href: '/wallpapers', label: '壁纸洞府', shortLabel: '更多' },
]

export const journeyEvents: JourneyEvent[] = [
  {
    id: 'qixuan',
    order: '壹',
    title: '七玄入门',
    location: '越国镜州，七玄门',
    arc: '凡人少年入局',
    realm: '凡人',
    echo: '七玄门，凡人少年入局。',
    detail:
      '神手谷的门一开，墨大夫的局也跟着开了。韩立第一次明白，活下去比热血更要紧。',
    characters: ['hanli', 'li-feiyu', 'mo-daifu'],
    artifacts: ['zhangtian-bottle'],
    bilibiliLabel: 'B站番剧页 · 七玄门段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 12,
    y: 70,
  },
  {
    id: 'tainan',
    order: '贰',
    title: '太南小会',
    location: '越国散修集',
    arc: '仙门初见',
    realm: '练气',
    echo: '摊位、符箓、升仙令，仙路第一次有了价码。',
    detail:
      '小会不大，却把散修世界的规矩摆在眼前。韩立开始学会用灵石、消息和谨慎换路。',
    characters: ['hanli'],
    artifacts: ['zhangtian-bottle'],
    bilibiliLabel: 'B站番剧页 · 太南小会段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 24,
    y: 55,
  },
  {
    id: 'huangfeng',
    order: '叁',
    title: '黄枫谷修行',
    location: '越国七派，黄枫谷',
    arc: '山门发育',
    realm: '练气后期',
    echo: '药园、洞府、飞剑，谨慎慢慢变成韩立的习惯。',
    detail:
      '进了仙门也不等于安稳。韩立把药园、功法、阵法和人情一件件收进自己的行囊。',
    characters: ['hanli', 'xin-ruyin'],
    artifacts: ['bamboo-swords'],
    bilibiliLabel: 'B站番剧页 · 黄枫谷段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 36,
    y: 65,
  },
  {
    id: 'bloody',
    order: '肆',
    title: '血色初逢',
    location: '越国，血色禁地',
    arc: '禁地花雨',
    realm: '筑基机缘',
    echo: '血色禁地，南宫婉入卷。',
    detail:
      '试炼夺药，禁地生死，一场意外把两个人的仙途拧在一起，也把早期名场面留了下来。',
    characters: ['hanli', 'nangong-wan', 'xiang-zhili'],
    artifacts: ['bamboo-swords'],
    bilibiliLabel: 'B站番剧页 · 血色禁地段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 49,
    y: 48,
  },
  {
    id: 'war',
    order: '伍',
    title: '风紧先走',
    location: '天南乱局',
    arc: '正魔战局',
    realm: '筑基后期',
    echo: '风声不对，韩立先走一步。',
    detail:
      '局势越乱，越能看出韩立的本事：能赢就出手，不能赢就保命，下一章才有得写。',
    characters: ['hanli', 'chen-qiaoqian'],
    artifacts: ['bamboo-swords'],
    bilibiliLabel: 'B站番剧页 · 正魔战局段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 58,
    y: 60,
  },
  {
    id: 'sea',
    order: '陆',
    title: '远遁乱星海',
    location: '乱星海，外海诸岛',
    arc: '地图忽然变大',
    realm: '结丹',
    echo: '乱星海一开，地图忽然变大。',
    detail:
      '宗门弟子成了独行修士。洞府、灵虫、丹药、海雾和旧人，把故事换到更广阔的水面上。',
    characters: ['hanli', 'zi-ling', 'yuan-yao'],
    artifacts: ['gold-devourers'],
    bilibiliLabel: 'B站番剧页 · 乱星海段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 71,
    y: 42,
  },
  {
    id: 'xutian',
    order: '柒',
    title: '虚天入局',
    location: '乱星海，虚天殿',
    arc: '高阶牌桌',
    realm: '结丹中后期',
    echo: '虚天殿里，韩立第一次摸到高阶牌桌边。',
    detail:
      '高阶修士互相算计，韩立在夹缝里拿机缘。虚天鼎、乾蓝冰焰和银月线都在这里抬高牌面。',
    characters: ['hanli', 'yinyue', 'man-huzi'],
    artifacts: ['xutian-cauldron', 'ice-flame'],
    bilibiliLabel: 'B站番剧页 · 虚天殿段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 84,
    y: 58,
  },
  {
    id: 'luoyun',
    order: '捌',
    title: '落云成婴',
    location: '天南，落云宗',
    arc: '元婴成型',
    realm: '元婴',
    echo: '回到天南，韩老魔终于坐上自己的位置。',
    detail:
      '飞剑、神雷、灵虫和心性都成了体系。旧情旧债回到眼前，韩立已不是当年的小修士。',
    characters: ['hanli', 'nangong-wan', 'zi-ling'],
    artifacts: ['bamboo-swords', 'exorcism-thunder', 'gold-devourers'],
    bilibiliLabel: 'B站番剧页 · 落云宗段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 67,
    y: 28,
  },
  {
    id: 'kunwu',
    order: '玖',
    title: '昆吾门尽',
    location: '大晋，昆吾山',
    arc: '人界尽头',
    realm: '元婴后期',
    echo: '人界篇的尽头不是结束，是下一扇门亮起来。',
    detail:
      '古魔、化神、空间节点浮出水面。韩立的人界长卷走到尽头，也把灵界的影子照了出来。',
    characters: ['hanli', 'yinyue', 'xiang-zhili'],
    artifacts: ['exorcism-thunder'],
    bilibiliLabel: 'B站番剧页 · 人界后段',
    bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ss28747/',
    x: 55,
    y: 17,
  },
]

export const characters: CharacterNode[] = [
  {
    id: 'nangong-wan',
    name: '南宫婉',
    track: '血色禁地',
    firstEventId: 'bloody',
    firstPlace: '血色禁地',
    echo: '血色禁地一场意外，把两个人的仙途拧在了一起。',
    intersections: ['bloody', 'luoyun'],
    x: 50,
    y: 16,
  },
  {
    id: 'zi-ling',
    name: '紫灵',
    track: '乱星海',
    firstEventId: 'sea',
    firstPlace: '乱星海',
    echo: '乱星海里的明艳一笔，近又远，亮又飘。',
    intersections: ['sea', 'luoyun'],
    x: 78,
    y: 36,
  },
  {
    id: 'yuan-yao',
    name: '元瑶',
    track: '乱星海',
    firstEventId: 'sea',
    firstPlace: '乱星海',
    echo: '鬼修线让乱星海更冷，也让韩立少见地留下几分柔软。',
    intersections: ['sea'],
    x: 80,
    y: 66,
  },
  {
    id: 'yinyue',
    name: '银月',
    track: '虚天殿后',
    firstEventId: 'xutian',
    firstPlace: '虚天殿',
    echo: '从器灵到身世伏笔，她把人界故事自然牵向更大的世界。',
    intersections: ['xutian', 'kunwu'],
    x: 52,
    y: 82,
  },
  {
    id: 'xin-ruyin',
    name: '辛如音',
    track: '初入仙途',
    firstEventId: 'huangfeng',
    firstPlace: '黄枫谷外',
    echo: '阵法、旧宅、遗愿，她的支线不喧哗，却很有凡人味。',
    intersections: ['huangfeng'],
    x: 22,
    y: 62,
  },
  {
    id: 'li-feiyu',
    name: '厉飞雨',
    track: '七玄门',
    firstEventId: 'qixuan',
    firstPlace: '七玄门',
    echo: '少年旧友，是韩立踏入江湖门缝时少见的亮色。',
    intersections: ['qixuan'],
    x: 18,
    y: 32,
  },
  {
    id: 'xiang-zhili',
    name: '向之礼',
    track: '血色禁地',
    firstEventId: 'bloody',
    firstPlace: '血色禁地',
    echo: '看似闲散，实则把人界上限悄悄埋进早期剧情。',
    intersections: ['bloody', 'kunwu'],
    x: 32,
    y: 84,
  },
]

export const artifacts: Artifact[] = [
  {
    id: 'zhangtian-bottle',
    name: '掌天瓶',
    type: '洞府奇物',
    symbol: '瓶',
    firstEventId: 'qixuan',
    echo: '一只小瓶，让凡人少年第一次有了和命数讨价还价的余地。',
    change: '灵草有了时间，修行有了余量，韩立从此不只靠运气吃饭。',
    tone: 'jade',
  },
  {
    id: 'bamboo-swords',
    name: '青竹蜂云剑',
    type: '本命飞剑',
    symbol: '剑',
    firstEventId: 'huangfeng',
    echo: '飞剑成阵之后，韩立才真正有了自己的战斗章法。',
    change: '从单点出手到剑阵压场，韩立的打法终于像一套完整棋路。',
    tone: 'gold',
  },
  {
    id: 'xutian-cauldron',
    name: '虚天鼎',
    type: '秘境重宝',
    symbol: '鼎',
    firstEventId: 'xutian',
    echo: '虚天殿一役，韩立摸到了高阶修士的牌桌边。',
    change: '拿到的不是一件器物，而是一次越级入局的资格。',
    tone: 'cinnabar',
  },
  {
    id: 'ice-flame',
    name: '乾蓝冰焰',
    type: '寒焰神通',
    symbol: '焰',
    firstEventId: 'xutian',
    echo: '冰焰入手，乱星海的机缘开始变得凶险又值钱。',
    change: '一缕冷焰让韩立在高阶斗法里多了一张不讲情面的底牌。',
    tone: 'ice',
  },
  {
    id: 'exorcism-thunder',
    name: '辟邪神雷',
    type: '雷法底牌',
    symbol: '雷',
    firstEventId: 'luoyun',
    echo: '雷光一起，魔气退避，韩立的底牌又厚了一层。',
    change: '遇到魔气邪物时，韩立终于有了能直接翻盘的硬手段。',
    tone: 'blue',
  },
  {
    id: 'gold-devourers',
    name: '噬金虫',
    type: '灵虫群',
    symbol: '虫',
    firstEventId: 'sea',
    echo: '一群小虫，越养越狠，后来成了韩立身边最不讲道理的杀招之一。',
    change: '养虫是慢功夫，成群之后却能把许多正面难题啃出缺口。',
    tone: 'dark',
  },
]

export const wallpaperSources: WallpaperSource[] = [
  {
    id: 'bangumi',
    title: '凡人修仙传番剧页',
    source: '哔哩哔哩',
    url: 'https://www.bilibili.com/bangumi/play/ss28747/',
    kind: '番剧入口',
  },
  {
    id: 'march-wallpaper',
    title: '三月官方壁纸图组',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/643260726635397145',
    kind: '官方壁纸',
  },
  {
    id: 'tiannan-wallpaper',
    title: '再别天南官方壁纸',
    source: '凡人修仙传动画连续剧',
    url: 'https://www.bilibili.com/opus/656248686185021443',
    kind: '官方壁纸',
  },
  {
    id: 'mulanzhizhan',
    title: '慕兰之战定档 PV',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1VukbYUEZs/',
    kind: '制作方 PV',
  },
  {
    id: 'fanren-pv',
    title: '2025-2026 国创发布会 PV',
    source: '万维猫动画',
    url: 'https://www.bilibili.com/video/BV1ipCyBtE1C/',
    kind: '制作方 PV',
  },
  {
    id: 'force-pv',
    title: '国创发布会制作方版本',
    source: '原力数字科技',
    url: 'https://www.bilibili.com/video/BV1LpCyBtEfj/',
    kind: '制作方 PV',
  },
  {
    id: 'yanyuezong',
    title: '掩月宗场景概念图',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QEo94nbsZ',
    kind: '场景设定',
  },
  {
    id: 'tiantiancheng',
    title: '阗天城场景公布',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QE5i50f7V',
    kind: '场景设定',
  },
  {
    id: 'fengyuan',
    title: '丰原国场景概念',
    source: '凡人修仙传动画剧微博',
    url: 'https://www.weibo.com/7420472445/QDMr5km5D',
    kind: '场景设定',
  },
  {
    id: 'wallpaper-engine',
    title: '动态壁纸合集展示',
    source: 'Wallpaper Engine B站账号',
    url: 'https://www.bilibili.com/video/BV1KjaczVE4Q/',
    kind: '动态壁纸',
  },
  {
    id: 'steam-live',
    title: 'Wallpaper Engine 动态壁纸线索',
    source: 'Steam Workshop',
    url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3494567567&l=schinese',
    kind: '动态壁纸',
  },
  {
    id: 'hanli-wallpaper-video',
    title: '韩立结婴背景视频',
    source: '哲风壁纸',
    url: 'https://www.haowallpaper.com/homeViewLook/17790887858654592',
    kind: '动态壁纸',
  },
]

export function getEventById(id: string | null | undefined) {
  return journeyEvents.find((event) => event.id === id) ?? journeyEvents[0]
}

export function getCharacterById(id: string | null | undefined) {
  return characters.find((character) => character.id === id) ?? characters[0]
}

export function getArtifactById(id: string | null | undefined) {
  return artifacts.find((artifact) => artifact.id === id) ?? artifacts[0]
}

export const artifactById = Object.fromEntries(
  artifacts.map((artifact) => [artifact.id, artifact]),
) as Record<string, Artifact | undefined>

export const characterById = Object.fromEntries(
  characters.map((character) => [character.id, character]),
) as Record<string, CharacterNode | undefined>
