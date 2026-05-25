import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronRight,
  Compass,
  ExternalLink,
  Film,
  Gamepad2,
  Image as ImageIcon,
  Layers,
  Map as MapIcon,
  MapPin,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  dynamicMediaSources,
  gameAssets,
  staticMediaSources,
} from '../data/mediaCatalog'

export const Route = createFileRoute('/')({ component: Home })

type JourneyNode = {
  id: string
  step: string
  label: string
  region: string
  arc: string
  realm: string
  note: string
  pulse: string
  people: string[]
  artifacts: string[]
  women: string[]
  x: number
  y: number
}

type Companion = {
  name: string
  image: string
  nodeId: string
  appearsAt: string
  note: string
}

type Chapter = {
  title: string
  range: string
  note: string
  startIndex: number
}

const journeyNodes: JourneyNode[] = [
  {
    id: 'qixuan',
    step: '01',
    label: '七玄门',
    region: '越国镜州',
    arc: '凡人入局',
    realm: '凡人少年',
    note: '山村少年进了神手谷，小瓶第一次把命数往旁边拨了一下。',
    pulse: '墨大夫设局，余子童夺舍，韩立从江湖门缝里看见了修仙界。',
    people: ['韩立', '厉飞雨', '墨大夫'],
    artifacts: ['掌天瓶', '长春功', '升仙令'],
    women: [],
    x: 18,
    y: 72,
  },
  {
    id: 'tainan',
    step: '02',
    label: '太南小会',
    region: '越国散修集',
    arc: '仙门初见',
    realm: '练气',
    note: '符箓、摊位、升仙令摊在眼前，仙路第一次有了价码。',
    pulse: '这里不是大场面，却把底层修士的规矩交代得很清楚。',
    people: ['韩立', '万小山'],
    artifacts: ['符箓', '升仙令', '灵石'],
    women: [],
    x: 30,
    y: 64,
  },
  {
    id: 'huangfeng',
    step: '03',
    label: '黄枫谷',
    region: '越国七派',
    arc: '山门发育',
    realm: '练气后期',
    note: '药园、洞府、飞剑和师门，韩立把谨慎慢慢练成了习惯。',
    pulse: '辛如音的阵法支线，也在这段把“旧人旧债”留了下来。',
    people: ['韩立', '李化元', '辛如音'],
    artifacts: ['青元剑诀', '符宝', '阵法典籍'],
    women: ['辛如音'],
    x: 42,
    y: 55,
  },
  {
    id: 'bloody',
    step: '04',
    label: '血色禁地',
    region: '越国禁地',
    arc: '禁地花雨',
    realm: '筑基机缘',
    note: '试炼夺药，南宫婉登场，一场意外把两个人的长路拧在一起。',
    pulse: '凡人早期名场面就在这里：活下来，带走资源，也带走一条情线。',
    people: ['韩立', '南宫婉', '向之礼'],
    artifacts: ['筑基丹', '灵草', '符宝'],
    women: ['南宫婉'],
    x: 51,
    y: 66,
  },
  {
    id: 'war',
    step: '05',
    label: '正魔战局',
    region: '天南乱局',
    arc: '先跑为敬',
    realm: '筑基后期',
    note: '风声不对，韩立不站在原地等情怀，先把命留到下一章。',
    pulse: '“韩跑跑”的味道从这里变得鲜明：能赢就赢，不能赢就走。',
    people: ['韩立', '陈巧倩', '令狐老祖'],
    artifacts: ['古传送阵', '傀儡', '遁术'],
    women: ['陈巧倩'],
    x: 60,
    y: 50,
  },
  {
    id: 'sea',
    step: '06',
    label: '乱星海',
    region: '外海诸岛',
    arc: '地图打开',
    realm: '结丹',
    note: '海雾一开，宗门弟子变成独行修士，灵虫、丹药、洞府全换了量级。',
    pulse: '紫灵、元瑶先后入场，星海这段很像另一部新书。',
    people: ['韩立', '紫灵', '元瑶'],
    artifacts: ['噬金虫', '曲魂', '阵盘'],
    women: ['紫灵', '元瑶'],
    x: 75,
    y: 67,
  },
  {
    id: 'xutian',
    step: '07',
    label: '虚天殿',
    region: '乱星海秘境',
    arc: '高阶牌桌',
    realm: '结丹中后期',
    note: '一群高阶修士互相算计，韩立在夹缝里把关键机缘拿到手。',
    pulse: '虚天鼎、乾蓝冰焰、银月线出现，人界篇的牌面往上抬了一层。',
    people: ['韩立', '银月', '蛮胡子'],
    artifacts: ['虚天鼎', '乾蓝冰焰', '青竹蜂云剑'],
    women: ['银月'],
    x: 84,
    y: 48,
  },
  {
    id: 'luoyun',
    step: '08',
    label: '落云宗',
    region: '天南归来',
    arc: '元婴成型',
    realm: '元婴',
    note: '回到天南时，旧日小修已经成了能坐上牌桌的韩老魔。',
    pulse: '南宫婉线回收，飞剑、神雷、灵虫也组成了完整战斗体系。',
    people: ['韩立', '南宫婉', '紫灵'],
    artifacts: ['辟邪神雷', '青竹蜂云剑', '大衍诀'],
    women: ['南宫婉', '紫灵'],
    x: 68,
    y: 34,
  },
  {
    id: 'kunwu',
    step: '09',
    label: '昆吾山',
    region: '大晋古山',
    arc: '人界门尽',
    realm: '元婴后期',
    note: '化神、古魔、空间节点浮出水面，飞升不再只是传说。',
    pulse: '人界篇的尽头不是结束，是下一扇门在山雾里亮了起来。',
    people: ['韩立', '银月', '向之礼'],
    artifacts: ['空间节点', '八灵尺', '古魔封印'],
    women: ['银月'],
    x: 56,
    y: 18,
  },
]

const companions: Companion[] = [
  {
    name: '南宫婉',
    image: '/media/images/characters/nangong-wan.webp',
    nodeId: 'bloody',
    appearsAt: '血色禁地',
    note: '早期最有记忆点的一场相逢，后来变成韩立人界篇最重的一条牵挂。',
  },
  {
    name: '辛如音',
    image: '/media/images/characters/xin-ruyin.webp',
    nodeId: 'huangfeng',
    appearsAt: '黄枫谷外',
    note: '阵法、旧宅、遗愿，她的支线不喧哗，却很像凡人世界里的余温。',
  },
  {
    name: '紫灵',
    image: '/media/images/characters/zi-ling.webp',
    nodeId: 'sea',
    appearsAt: '乱星海',
    note: '星海篇的明艳人物，和韩立之间总有一点近又远的味道。',
  },
  {
    name: '元瑶',
    image: '/media/images/characters/yuanyao.webp',
    nodeId: 'sea',
    appearsAt: '乱星海',
    note: '鬼修线把乱星海写得更冷，也让韩立少见地留下了几分柔软。',
  },
  {
    name: '银月',
    image: '/media/images/characters/yinyue.webp',
    nodeId: 'xutian',
    appearsAt: '虚天殿后',
    note: '从器灵到身世伏笔，她把人界故事自然牵向更大的世界。',
  },
]

const chapters: Chapter[] = [
  {
    title: '江湖门缝',
    range: '七玄门 -> 太南小会',
    note: '凡人出身、瓶子现身，韩立第一次知道仙路不是梦，是局。',
    startIndex: 0,
  },
  {
    title: '山门岁月',
    range: '黄枫谷 -> 血色禁地',
    note: '宗门、筑基、禁地、南宫婉，早期名场面都压在这一段。',
    startIndex: 2,
  },
  {
    title: '风紧就走',
    range: '正魔战局 -> 乱星海',
    note: '韩跑跑这个称呼不是怂，是在残酷规则里把下一章跑出来。',
    startIndex: 4,
  },
  {
    title: '高阶入席',
    range: '虚天殿 -> 落云宗',
    note: '结丹、元婴、飞剑神雷，韩立开始拥有自己的牌桌位置。',
    startIndex: 6,
  },
  {
    title: '人界门尽',
    range: '昆吾山之后',
    note: '世界上限抬起来，空间节点亮起来，飞升路终于露出轮廓。',
    startIndex: 8,
  },
]

const particles = [
  [8, 22, 3],
  [14, 68, 9],
  [21, 38, 1],
  [29, 82, 7],
  [37, 18, 5],
  [46, 58, 11],
  [54, 29, 4],
  [63, 76, 12],
  [72, 16, 8],
  [81, 49, 2],
  [89, 72, 10],
  [94, 34, 6],
]

const routePoints = journeyNodes.map((node) => `${node.x},${node.y}`).join(' ')

function Home() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [entered, setEntered] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [heroHighSource, setHeroHighSource] = useState<string | null>(null)
  const [heroHighReady, setHeroHighReady] = useState(false)
  const [activeNodeId, setActiveNodeId] = useState(journeyNodes[0].id)
  const [pulseKey, setPulseKey] = useState(0)

  const activeIndex = Math.max(
    journeyNodes.findIndex((node) => node.id === activeNodeId),
    0,
  )
  const activeNode = journeyNodes[activeIndex]
  const routeProgress = activeIndex / (journeyNodes.length - 1)

  const activeCompanions = useMemo(
    () =>
      companions.filter(
        (companion) =>
          companion.nodeId === activeNode.id ||
          activeNode.women.includes(companion.name),
      ),
    [activeNode],
  )

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection

    if (motionQuery.matches || connection?.saveData) {
      return
    }

    const loadHighVideo = () => setHeroHighSource('/media/videos/hero.mp4')
    const requestIdle = Reflect.get(window, 'requestIdleCallback') as
      | ((callback: () => void, options?: { timeout: number }) => number)
      | undefined
    const cancelIdle = Reflect.get(window, 'cancelIdleCallback') as
      | ((id: number) => void)
      | undefined

    if (requestIdle) {
      const idleId = requestIdle(loadHighVideo, {
        timeout: 2600,
      })
      return () => cancelIdle?.(idleId)
    }

    const timerId = window.setTimeout(loadHighVideo, 1600)
    return () => window.clearTimeout(timerId)
  }, [])

  const chooseNode = (nodeId: string) => {
    setActiveNodeId(nodeId)
    setPulseKey((current) => current + 1)
  }

  const advanceJourney = () => {
    const next = journeyNodes[(activeIndex + 1) % journeyNodes.length]
    chooseNode(next.id)
  }

  const enterSite = () => {
    setEntered(true)
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.36
    audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  const toggleSound = () => {
    const audio = audioRef.current
    if (!audio) return

    if (soundOn) {
      audio.pause()
      setSoundOn(false)
      return
    }

    audio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  return (
    <main className={`site-shell ${entered ? 'is-entered' : ''}`}>
      <audio ref={audioRef} src="/media/audio/bufan.mp3" preload="auto" loop />
      <span className="world-flash" aria-hidden="true" />

      <section className="hero-section" aria-label="凡人修仙传入口">
        <div className="hero-media" aria-hidden="true">
          <video
            className={`hero-video hero-video-preview ${
              heroHighReady ? 'is-faded' : ''
            }`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/media/images/bg/hero-poster.jpg"
          >
            <source src="/media/videos/hero-preview.mp4" type="video/mp4" />
          </video>
          {heroHighSource ? (
            <video
              className={`hero-video hero-video-high ${
                heroHighReady ? 'is-ready' : ''
              }`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onCanPlay={() => setHeroHighReady(true)}
            >
              <source src={heroHighSource} type="video/mp4" />
            </video>
          ) : null}
        </div>
        <div className="hero-scrim" />
        <div className="spirit-layer" aria-hidden="true">
          {particles.map(([x, y, delay], index) => (
            <span
              key={`${x}-${y}`}
              style={
                {
                  '--x': `${x}%`,
                  '--y': `${y}%`,
                  '--delay': `${delay * 0.31}s`,
                } as CSSProperties
              }
              className={`spirit-dot spirit-dot-${index % 3}`}
            />
          ))}
        </div>

        <button
          className="sound-toggle"
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? '关闭背景声' : '播放背景声'}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div className="hero-content">
          <h1>
            凡人修仙传
            <span>交互行迹图与壁纸灵感库</span>
          </h1>
          <p className="hero-copy">
            一边把韩立的人界路线做成可玩的数据地图，一边整理官方壁纸、PV
            和动态壁纸线索，让粉丝能看故事，也能收藏来源。
          </p>
          <div className="hero-actions">
            <a href="#visual-game" className="primary-link">
              <Gamepad2 size={18} />
              玩行迹图
            </a>
            <a href="#wallpapers" className="ghost-link">
              <ImageIcon size={18} />
              看壁纸来源
            </a>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="entry-gate"
        onClick={enterSite}
        aria-hidden={entered}
        tabIndex={entered ? -1 : 0}
      >
        <span className="gate-door gate-door-left" aria-hidden="true" />
        <span className="gate-door gate-door-right" aria-hidden="true" />
        <span className="gate-light" aria-hidden="true" />
        <span className="gate-sky" aria-hidden="true" />
        <span className="gate-ring gate-ring-outer" aria-hidden="true" />
        <span className="gate-ring gate-ring-inner" aria-hidden="true" />
        <span className="gate-sword" aria-hidden="true" />
        <span className="gate-rune gate-rune-left" aria-hidden="true">
          玄
        </span>
        <span className="gate-rune gate-rune-right" aria-hidden="true">
          凡
        </span>
        <span className="gate-title">叩开洞府</span>
        <span className="gate-subtitle">门后有山河，也有旧人</span>
      </button>

      <section className="core-section" aria-label="网站核心功能">
        <article>
          <Gamepad2 size={24} />
          <span>核心功能 01</span>
          <h2>把行迹图做成可玩的数据可视化</h2>
          <p>
            地点、境界、人物、法宝和章节节奏都进同一张地图。点一个节点，路线会亮，韩立会跑，旁边会切出这一站的剧情信息。
          </p>
          <a href="#visual-game">
            进入地图
            <ChevronRight size={17} />
          </a>
        </article>
        <article>
          <Film size={24} />
          <span>核心功能 02</span>
          <h2>整理壁纸、动态壁纸和 PV 来源</h2>
          <p>
            官方壁纸、场景设定、制作方 PV
            和动态壁纸线索都按来源呈现。站内先做目录和播放器，拿到授权后再自托管高清版本。
          </p>
          <a href="#wallpapers">
            查看来源
            <ChevronRight size={17} />
          </a>
        </article>
      </section>

      <section id="visual-game" className="journey-section">
        <div className="section-heading compact">
          <span className="section-kicker">互动数据可视化</span>
          <h2>点一个地方，韩立就跑过去</h2>
          <p>
            地名亮起时，路线、境界、旧人和法宝会一起浮出来。它不是静态年表，而是一张可以玩的修仙路线图。
          </p>
        </div>

        <div className="journey-layout">
          <div className="map-board" aria-label="韩立人界篇路线图">
            <img
              className="map-art"
              src="/media/images/bg/hanli-map.webp"
              alt=""
            />
            <svg
              className="route-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                className="route-line route-line-shadow"
                points={routePoints}
              />
              <polyline
                className="route-line route-line-live"
                points={routePoints}
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1 - routeProgress,
                }}
              />
            </svg>

            {journeyNodes.map((node, index) => (
              <button
                key={node.id}
                className={`map-node ${
                  index <= activeIndex ? 'visited' : ''
                } ${node.id === activeNode.id ? 'active' : ''}`}
                type="button"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
                onClick={() => chooseNode(node.id)}
                aria-label={`前往${node.label}`}
              >
                <span className="map-node-dot" aria-hidden="true" />
                <span className="map-node-label">{node.label}</span>
              </button>
            ))}

            <span
              className="runner-token"
              style={{
                left: `${activeNode.x}%`,
                top: `${activeNode.y}%`,
              }}
              aria-hidden="true"
            >
              韩
            </span>
          </div>

          <aside className="route-panel" aria-live="polite">
            <div className="panel-topline">
              <span>第 {activeNode.step} 站</span>
              <span>{activeNode.realm}</span>
            </div>
            <h3>{activeNode.label}</h3>
            <p className="panel-region">
              <MapPin size={15} />
              {activeNode.region} · {activeNode.arc}
            </p>
            <p className="panel-note">{activeNode.note}</p>
            <div className="memory-plume" key={`${activeNode.id}-${pulseKey}`}>
              {activeNode.pulse}
            </div>
            <div className="route-tags">
              <div>
                <span>同场</span>
                <p>{activeNode.people.join(' / ')}</p>
              </div>
              <div>
                <span>行囊</span>
                <p>{activeNode.artifacts.join(' / ')}</p>
              </div>
            </div>
            <button className="next-run" type="button" onClick={advanceJourney}>
              再跑一段
              <ChevronRight size={18} />
            </button>
          </aside>
        </div>
      </section>

      <section className="asset-lab-section" aria-label="游戏化素材">
        <div className="section-heading">
          <span className="section-kicker">原创游戏素材</span>
          <h2>先把粉丝站做成一段小游戏</h2>
          <p>
            这些素材先服务互动原型：横版场景、主角动作、小怪和道具都可以接入后续的小关卡、成就和路线解锁。
          </p>
        </div>

        <div className="runner-lane" aria-hidden="true">
          <span className="runner-track" />
          <span className="nascent-runner" />
        </div>

        <div className="asset-grid">
          {gameAssets.map((asset) => (
            <article className="asset-card" key={asset.title}>
              <div className="asset-preview">
                <img src={asset.image} alt={asset.title} loading="lazy" />
              </div>
              <div className="asset-copy">
                <span>{asset.label}</span>
                <h3>{asset.title}</h3>
                <p>{asset.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chapter-section">
        <div className="section-heading">
          <span className="section-kicker">五段路</span>
          <h2>一眼扫回人界篇</h2>
          <p>
            每段只留一个味道：进门、筑基、远遁、入席、开下一界。粉丝看到地名，会自己补上风声。
          </p>
        </div>

        <div className="chapter-track">
          {chapters.map((chapter) => (
            <button
              key={chapter.title}
              className={`chapter-card ${
                activeIndex >= chapter.startIndex ? 'active' : ''
              }`}
              type="button"
              onClick={() => chooseNode(journeyNodes[chapter.startIndex].id)}
            >
              <span>{chapter.range}</span>
              <strong>{chapter.title}</strong>
              <p>{chapter.note}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="companions" className="companions-section">
        <div className="section-heading">
          <span className="section-kicker">旧人登场</span>
          <h2>她们出现在哪一站</h2>
          <p>
            不做长百科，只把登场位置放回地图。点一张人物照，路线会跳到那一幕。
          </p>
        </div>

        <div className="companion-layout">
          <div className="companion-grid">
            {companions.map((companion) => {
              const active = activeCompanions.some(
                (item) => item.name === companion.name,
              )

              return (
                <button
                  className={`companion-card ${active ? 'active' : ''}`}
                  key={companion.name}
                  type="button"
                  onClick={() => chooseNode(companion.nodeId)}
                >
                  <img src={companion.image} alt={companion.name} />
                  <div>
                    <span>{companion.appearsAt}</span>
                    <h3>{companion.name}</h3>
                    <p>{companion.note}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <aside className="companion-panel">
            <Compass size={20} />
            <h3>{activeNode.label}</h3>
            {activeCompanions.length > 0 ? (
              <p>
                这一站会遇见{' '}
                {activeCompanions.map((item) => item.name).join('、')}。
              </p>
            ) : (
              <p>这一站更多是韩立自己的路，风声比人声更重。</p>
            )}
            <button type="button" onClick={advanceJourney}>
              沿路往前
              <ChevronRight size={17} />
            </button>
          </aside>
        </div>
      </section>

      <section id="wallpapers" className="wallpaper-section">
        <div className="section-heading">
          <span className="section-kicker">壁纸与动态壁纸</span>
          <h2>只放能追到来源的视觉资源</h2>
          <p>
            静态壁纸、官方场景、制作方 PV
            和动态壁纸线索都保留来源。站内展示以链接和播放器为主，高清自托管留给授权后的版本。
          </p>
        </div>

        <div className="source-feature">
          <div className="bilibili-frame">
            <iframe
              title="《凡人修仙传》新年番定档 PV"
              src="https://player.bilibili.com/player.html?bvid=BV1VukbYUEZs&autoplay=0"
              loading="lazy"
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
            />
          </div>
          <div className="source-feature-copy">
            <Film size={22} />
            <span>制作方 PV</span>
            <h3>PV 用官方播放器，背景视频用授权素材</h3>
            <p>
              首页首屏已经拆成低码率预览和延迟加载高清版本。B站等平台视频不抓源、不转码，适合用播放器或跳转保留来源。
            </p>
            <a
              href="https://www.bilibili.com/video/BV1VukbYUEZs/"
              target="_blank"
              rel="noreferrer"
            >
              打开 B站来源
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="media-policy">
          <ShieldCheck size={20} />
          <p>
            站内原创素材可直接用于互动原型；官方壁纸、PV、动态壁纸先以来源目录呈现，拿到授权后再进入站内高清库或
            R2 存储。
          </p>
        </div>

        <div className="source-columns">
          <div>
            <div className="source-column-heading">
              <ImageIcon size={19} />
              <h3>静态壁纸 / 场景图</h3>
            </div>
            <div className="source-list">
              {staticMediaSources.map((item) => (
                <article className="source-card" key={item.url}>
                  <span>{item.kind}</span>
                  <h4>{item.title}</h4>
                  <p>
                    {item.source} · {item.usage}
                  </p>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    来源
                    <ExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="source-column-heading">
              <Layers size={19} />
              <h3>动态壁纸 / 视频</h3>
            </div>
            <div className="source-list">
              {dynamicMediaSources.map((item) => (
                <article className="source-card" key={item.url}>
                  <span>{item.kind}</span>
                  <h4>{item.title}</h4>
                  <p>
                    {item.source} · {item.usage}
                  </p>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    来源
                    <ExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="oracle-section">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/media/images/bg/oracle-poster.jpg"
        >
          <source src="/media/videos/oracle.mp4" type="video/mp4" />
        </video>
        <div className="oracle-card">
          <h2>门已经开了，路还在往前。</h2>
          <p>山门旧影、禁地花雨、星海长夜，点回地图，换一站再走。</p>
          <a href="#visual-game">
            <MapIcon size={17} />
            回到行迹图
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>凡人修仙传 · 韩跑跑行迹图</strong>
          <span>
            <a href="https://01mvp.com" target="_blank" rel="noreferrer">
              01MVP
            </a>
          </span>
        </div>
        <a href="#visual-game">
          <Play size={15} />
          再走一遍
        </a>
      </footer>
    </main>
  )
}
