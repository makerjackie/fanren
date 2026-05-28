import { createFileRoute } from '@tanstack/react-router'
import {
  CircleDot,
  Clock3,
  Footprints,
  FlaskConical,
  Gem,
  Landmark,
  Leaf,
  Map,
  Mountain,
  ScrollText,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'

import { SiteNav } from '../components/SiteNav'
import { artifacts, characters, countdownTarget } from '../data/fanrenWorld'

export const Route = createFileRoute('/')({ component: Home })

const HERO_PREVIEW_VIDEO = '/media/videos/hero-preview.mp4'
const HERO_HIGH_VIDEO = '/media/videos/hero-compress.mp4'
const HOME_AUDIO_VOLUME = 0.34

let activeHomeAudio: HTMLAudioElement | null = null

function claimHomeAudio(audio: HTMLAudioElement) {
  if (activeHomeAudio !== null && activeHomeAudio !== audio) {
    activeHomeAudio.pause()
  }

  activeHomeAudio = audio
  audio.volume = HOME_AUDIO_VOLUME
  return audio
}

const entranceParticles = [
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

type HomeTimelineNode = {
  id: string
  order: string
  title: string
  phase: string
  realm: string
  summary: string
  tags: string[]
  symbol: string
  visual: string
  image?: string
  characters?: TimelineVisualAsset[]
  artifacts?: TimelineVisualAsset[]
  frames?: TimelineVisualAsset[]
  icon: LucideIcon
}

type TimelineVisualAsset = {
  src: string
  label: string
  variant?: 'lead' | 'support' | 'artifact' | 'frame'
}

const homeTimelineNodes: HomeTimelineNode[] = [
  {
    id: 'wili-gou',
    order: '01',
    title: '五里沟 / 少年韩立',
    phase: '离乡入门',
    realm: '凡人',
    summary:
      '韩立出身五里沟贫寒农家，被七玄门选中收为外门弟子，与张铁一起离开山村，踏上修仙路。',
    tags: ['五里沟', '七玄门', '入门'],
    symbol: '凡',
    visual: 'village',
    image: '/media/images/bg/dongfu-gate.webp',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'lead',
      },
      {
        src: '/media/images/characters-extra/zhang-tie.webp',
        label: '张铁',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/bili-ep1-frame.webp',
        label: '第一集截屏',
        variant: 'frame',
      },
      {
        src: '/media/images/sourced/bili-ep2-frame.webp',
        label: '第二集截屏',
        variant: 'frame',
      },
    ],
    icon: Mountain,
  },
  {
    id: 'qixuan-men',
    order: '02',
    title: '七玄门',
    phase: '初入山门',
    realm: '凡人',
    summary:
      '韩立在七玄门做外门弟子，与厉飞雨结交为友，在门派底层磨砺性子，学会在规矩中求存。',
    tags: ['七玄门', '厉飞雨', '外门弟子'],
    symbol: '门',
    visual: 'gate',
    image: '/media/images/sourced/bili-ep2-frame.webp',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'lead',
      },
      {
        src: '/media/images/characters/li-feyu.webp',
        label: '厉飞雨',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/zhang-tie.webp',
        label: '张铁',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-hanli-turn.jpg',
        label: '韩立镜头参考',
        variant: 'frame',
      },
      {
        src: '/media/images/sourced/bili-ep2-frame.webp',
        label: '七玄门截屏',
        variant: 'frame',
      },
    ],
    icon: Landmark,
  },
  {
    id: 'mo-daifu',
    order: '03',
    title: '墨大夫',
    phase: '夺舍之劫',
    realm: '凡人',
    summary:
      '墨大夫暗中修炼夺舍邪术，临死前企图强占韩立肉身。韩立拼死反击，从此学会不轻信任何人。',
    tags: ['神手谷', '夺舍', '墨大夫'],
    symbol: '墨',
    visual: 'medicine',
    image: '/media/images/sourced/bili-ep3-frame.webp',
    characters: [
      {
        src: '/media/images/characters/mo-daifu.webp',
        label: '墨大夫',
        variant: 'lead',
      },
      {
        src: '/media/images/characters-extra/qu-hun.webp',
        label: '曲魂',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/mo-caihuan.webp',
        label: '墨彩环',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/bili-ep3-frame.webp',
        label: '神手谷截屏',
        variant: 'frame',
      },
      {
        src: '/media/images/sourced/bili-ep4-frame.webp',
        label: '墨大夫截屏',
        variant: 'frame',
      },
    ],
    icon: FlaskConical,
  },
  {
    id: 'green-bottle',
    order: '04',
    title: '小绿瓶',
    phase: '掌天瓶现',
    realm: '练气',
    summary:
      '韩立在神手谷意外获得掌天瓶，发现灵草在瓶中可以加速生长，从此有了提升修炼资源的底牌。',
    tags: ['掌天瓶', '灵草加速', '修炼底牌'],
    symbol: '瓶',
    visual: 'bottle',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'support',
      },
    ],
    artifacts: [
      {
        src: '/media/images/generated/green-bottle.png',
        label: '掌天瓶',
        variant: 'artifact',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/bili-ep3-frame.webp',
        label: '瓶灵截屏',
        variant: 'frame',
      },
    ],
    icon: Leaf,
  },
  {
    id: 'huangfeng-gu',
    order: '05',
    title: '黄枫谷',
    phase: '入谷修行',
    realm: '练气后期',
    summary:
      '韩立加入黄枫谷，管理药园积累资源，结识辛如音习得阵法，青竹蜂云剑初成，飞剑之路正式起步。',
    tags: ['黄枫谷', '药园', '青竹蜂云剑'],
    symbol: '谷',
    visual: 'valley',
    image: '/media/images/bg/timeline-poster.jpg',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'lead',
      },
      {
        src: '/media/images/characters/xin-ruyin.webp',
        label: '辛如音',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/li-huayuan.webp',
        label: '李化元',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/chen-qiaoqian.webp',
        label: '陈巧倩',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-sword.jpg',
        label: '飞剑镜头',
        variant: 'frame',
      },
      {
        src: '/media/images/sourced/bili-ep4-frame.webp',
        label: '黄枫谷截屏',
        variant: 'frame',
      },
    ],
    icon: ScrollText,
  },
  {
    id: 'bloody-land',
    order: '06',
    title: '血色禁地',
    phase: '禁地试炼',
    realm: '筑基机缘',
    summary:
      '七派血色禁地联合试炼，韩立在禁地中与南宫婉意外相遇，共历生死，两人命运从此交织。',
    tags: ['血色禁地', '南宫婉', '七派试炼'],
    symbol: '血',
    visual: 'bloody',
    image: '/media/images/sourced/aigei-battle.jpg',
    characters: [
      {
        src: '/media/images/characters/nangong-wan.webp',
        label: '南宫婉',
        variant: 'lead',
      },
      {
        src: '/media/images/characters/xiang-zhili.webp',
        label: '向之礼',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/han-yunzhi.webp',
        label: '菡云芝',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-battle.jpg',
        label: '禁地战斗参考',
        variant: 'frame',
      },
    ],
    icon: Swords,
  },
  {
    id: 'foundation',
    order: '07',
    title: '筑基',
    phase: '筑基突破',
    realm: '筑基',
    summary:
      '韩立服下筑基丹，突破练气瓶颈，正式踏入筑基期，从底层散修跨入正经修士的门槛。',
    tags: ['筑基丹', '筑基期', '境界突破'],
    symbol: '基',
    visual: 'foundation',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'lead',
      },
      {
        src: '/media/images/characters-extra/han-yunzhi.webp',
        label: '菡云芝',
        variant: 'support',
      },
    ],
    artifacts: [
      {
        src: '/media/images/generated/gold-core.png',
        label: '境界灵光',
        variant: 'artifact',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/bili-ep4-frame.webp',
        label: '突破截屏',
        variant: 'frame',
      },
    ],
    icon: Sparkles,
  },
  {
    id: 'star-sea',
    order: '08',
    title: '乱星海',
    phase: '远赴乱星海',
    realm: '结丹前后',
    summary:
      '天南正魔大战后韩立远遁乱星海，独行外海修行，结识紫灵、元瑶，收服噬金虫群。',
    tags: ['乱星海', '外海', '噬金虫'],
    symbol: '海',
    visual: 'sea',
    image: '/media/images/bg/galaxy-bg.webp',
    characters: [
      {
        src: '/media/images/characters/zi-ling.webp',
        label: '紫灵',
        variant: 'lead',
      },
      {
        src: '/media/images/characters/yuanyao.webp',
        label: '元瑶',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/ling-yuling.webp',
        label: '凌玉灵',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/feng-xi.webp',
        label: '风希',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-hanli-turn.jpg',
        label: '外海镜头',
        variant: 'frame',
      },
    ],
    icon: Waves,
  },
  {
    id: 'gold-core',
    order: '09',
    title: '结丹',
    phase: '金丹凝成',
    realm: '结丹',
    summary:
      '韩立在乱星海闭关结丹，青竹蜂云剑阵、噬金虫群和功法体系成型，正式成为中阶修士。',
    tags: ['金丹', '剑阵', '体系成型'],
    symbol: '丹',
    visual: 'core',
    characters: [
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'support',
      },
    ],
    artifacts: [
      {
        src: '/media/images/generated/gold-core.png',
        label: '金丹',
        variant: 'artifact',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-sword.jpg',
        label: '斗法镜头',
        variant: 'frame',
      },
    ],
    icon: CircleDot,
  },
  {
    id: 'xutian-palace',
    order: '10',
    title: '虚天殿',
    phase: '虚天殿夺宝',
    realm: '结丹中后期',
    summary:
      '虚天殿开启，韩立与蛮胡子、万天明等元婴修士周旋算计，在夹缝中取得虚天鼎和乾蓝冰焰，收服银月。',
    tags: ['虚天鼎', '乾蓝冰焰', '银月'],
    symbol: '殿',
    visual: 'palace',
    image: '/media/images/bg-image/玄骨2.webp',
    characters: [
      {
        src: '/media/images/characters/yinyue.webp',
        label: '银月',
        variant: 'lead',
      },
      {
        src: '/media/images/characters-extra/man-huzi.webp',
        label: '蛮胡子',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/wan-tianming.webp',
        label: '万天明',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/xuangu-shangren.webp',
        label: '玄骨上人',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-battle.jpg',
        label: '虚天殿镜头',
        variant: 'frame',
      },
    ],
    icon: Landmark,
  },
  {
    id: 'nascent-soul',
    order: '11',
    title: '元婴',
    phase: '落云结婴',
    realm: '元婴',
    summary:
      '韩立回到天南加入落云宗，凝结元婴突破大关，飞剑、神雷、灵虫连成完整战斗体系，人称"韩老魔"。',
    tags: ['元婴', '落云宗', '韩老魔'],
    symbol: '婴',
    visual: 'nascent',
    characters: [
      {
        src: '/media/images/generated/nascent-spirit-v2.png',
        label: '韩立元婴',
        variant: 'lead',
      },
      {
        src: '/media/images/characters/nangong-wan.webp',
        label: '南宫婉',
        variant: 'support',
      },
      {
        src: '/media/images/characters/hanli.webp',
        label: '韩立',
        variant: 'support',
      },
    ],
    artifacts: [
      {
        src: '/media/images/generated/gold-core.png',
        label: '元婴灵光',
        variant: 'artifact',
      },
    ],
    icon: Sparkles,
  },
  {
    id: 'spirit-world',
    order: '12',
    title: '飞升灵界',
    phase: '破界飞升',
    realm: '化神之后',
    summary:
      '韩立化神之后找到空间节点，破开人界与灵界的壁障飞升灵界，凡人修仙传人界篇至此完结。',
    tags: ['空间节点', '飞升', '灵界'],
    symbol: '升',
    visual: 'ascend',
    image: '/media/images/bg/oracle-poster.jpg',
    characters: [
      {
        src: '/media/images/characters/xiang-zhili.webp',
        label: '向之礼',
        variant: 'support',
      },
      {
        src: '/media/images/characters/yinyue.webp',
        label: '银月',
        variant: 'support',
      },
      {
        src: '/media/images/characters-extra/mu-peiling.webp',
        label: '慕沛灵',
        variant: 'support',
      },
    ],
    frames: [
      {
        src: '/media/images/sourced/aigei-hanli-turn.jpg',
        label: '飞升前镜头',
        variant: 'frame',
      },
    ],
    icon: Gem,
  },
]

function Home() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const timelineRef = useRef<HTMLElement>(null)
  const timelineSceneRefs = useRef<Array<HTMLElement | null>>([])
  const [entered, setEntered] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [heroHighSource, setHeroHighSource] = useState<string | null>(null)
  const [heroHighReady, setHeroHighReady] = useState(false)
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0)

  useEffect(() => {
    if (!entered || heroHighSource) {
      return
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection

    if (motionQuery.matches || connection?.saveData) {
      return
    }

    const loadHighVideo = () => setHeroHighSource(HERO_HIGH_VIDEO)
    const timerId = window.setTimeout(loadHighVideo, 1200)
    return () => window.clearTimeout(timerId)
  }, [entered, heroHighSource])

  useEffect(() => {
    const section = timelineRef.current
    if (!section) return

    let animationFrame = 0
    let lastProgress = -1

    const writeProgress = (progress: number) => {
      const nextProgress = Math.round(progress * 1000) / 1000
      if (Math.abs(nextProgress - lastProgress) < 0.002) return

      lastProgress = nextProgress
      section.style.setProperty('--timeline-progress', String(nextProgress))
      section.style.setProperty(
        '--timeline-progress-percent',
        `${nextProgress * 100}%`,
      )
    }

    const updateProgress = () => {
      animationFrame = 0
      const rect = section.getBoundingClientRect()
      const scrollableDistance = Math.max(rect.height - window.innerHeight, 1)
      const current = Math.min(Math.max(-rect.top, 0), scrollableDistance)
      writeProgress(current / scrollableDistance)
    }

    const requestUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useEffect(() => {
    const scenes = timelineSceneRefs.current.filter(
      (scene): scene is HTMLElement => scene !== null,
    )
    if (!scenes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        let focusedEntry: IntersectionObserverEntry | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (
            focusedEntry === null ||
            entry.intersectionRatio > focusedEntry.intersectionRatio
          ) {
            focusedEntry = entry
          }
        }
        if (focusedEntry === null) return

        const nextIndex = Number(
          (focusedEntry.target as HTMLElement).dataset.index,
        )

        if (Number.isFinite(nextIndex)) {
          setActiveTimelineIndex((currentIndex) =>
            currentIndex === nextIndex ? currentIndex : nextIndex,
          )
        }
      },
      {
        rootMargin: '-32% 0px -32% 0px',
        threshold: [0.22, 0.36, 0.5, 0.64],
      },
    )

    scenes.forEach((scene) => observer.observe(scene))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = HOME_AUDIO_VOLUME
    const syncSoundState = () => {
      setSoundOn(!audio.paused && !audio.ended)
    }

    audio.addEventListener('play', syncSoundState)
    audio.addEventListener('pause', syncSoundState)
    audio.addEventListener('ended', syncSoundState)

    return () => {
      audio.removeEventListener('play', syncSoundState)
      audio.removeEventListener('pause', syncSoundState)
      audio.removeEventListener('ended', syncSoundState)

      if (activeHomeAudio === audio) {
        audio.pause()
        activeHomeAudio = null
      }
    }
  }, [])

  const playHomeAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    claimHomeAudio(audio)
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  const enterSite = () => {
    if (!entered) {
      setEntered(true)
    }
    playHomeAudio()
  }

  const toggleSound = () => {
    const audio = audioRef.current
    if (!audio) return
    const controlledAudio = claimHomeAudio(audio)

    if (!controlledAudio.paused) {
      controlledAudio.pause()
      setSoundOn(false)
      return
    }

    controlledAudio
      .play()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false))
  }

  return (
    <main className={`home-shell ${entered ? 'is-entered' : ''}`}>
      <audio ref={audioRef} src="/media/audio/bufan.mp3" preload="none" loop />
      <span className="world-flash" aria-hidden="true" />
      <SiteNav
        actions={
          <button
            className="sound-toggle"
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? '关闭背景声' : '播放背景声'}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        }
      />

      <section className="home-hero" aria-label="凡人修仙阁入口">
        <div className="hero-media" aria-hidden="true">
          <video
            className={`hero-video hero-video-preview ${
              heroHighReady ? 'is-faded' : ''
            }`}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/media/images/bg/hero-poster.jpg"
          >
            <source src={HERO_PREVIEW_VIDEO} type="video/mp4" />
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
              preload="auto"
              onCanPlay={() => setHeroHighReady(true)}
            >
              <source src={heroHighSource} type="video/mp4" />
            </video>
          ) : null}
        </div>
        <div className="hero-scrim" />
        <div className="spirit-layer" aria-hidden="true">
          {entranceParticles.map(([x, y, delay], index) => (
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

        <HomeHeroCopy />
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
        <span className="gate-subtitle">门后有长卷，也有旧人</span>
      </button>

      <section
        id="hanli-timeline"
        className="home-cinematic-timeline"
        aria-label="韩立修仙时间线"
        ref={timelineRef}
        style={
          {
            '--active-index': activeTimelineIndex,
          } as CSSProperties
        }
      >
        <div className="timeline-atmosphere" aria-hidden="true" />
        <header className="home-timeline-opening">
          <p className="seal-line">韩立修仙时间线</p>
          <h2>一条随着滚动展开的修仙长卷</h2>
          <p>
            从五里沟的一点微光，到乱星海的深蓝星潮，再到人界尽头的天门裂隙。
          </p>
        </header>

        <div className="cinematic-timeline-frame">
          <aside className="cinematic-rail" aria-hidden="true">
            <div className="cinematic-rail-sticky">
              <span className="rail-line">
                <span className="rail-line-fill" />
              </span>
              <span className="rail-runner" />
              <div className="rail-node-list">
                {homeTimelineNodes.map((node, index) => (
                  <span
                    key={node.id}
                    className={`rail-node ${
                      index < activeTimelineIndex ? 'is-past' : ''
                    } ${index === activeTimelineIndex ? 'is-active' : ''}`}
                  >
                    <span className="rail-node-dot">
                      <span>{node.symbol}</span>
                    </span>
                    <span className="rail-node-copy">
                      <span className="rail-node-title">{node.title}</span>
                      <span className="rail-node-phase">{node.phase}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <div className="cinematic-scenes">
            {homeTimelineNodes.map((node, index) => {
              const Icon = node.icon
              const sceneState =
                index === activeTimelineIndex
                  ? 'is-active'
                  : index < activeTimelineIndex
                    ? 'is-past'
                    : 'is-future'

              return (
                <article
                  key={node.id}
                  className={`cinematic-scene ${sceneState}`}
                  data-index={index}
                  ref={(element) => {
                    timelineSceneRefs.current[index] = element
                  }}
                >
                  <figure
                    className={`scene-visual scene-visual-${node.visual}`}
                    aria-hidden="true"
                  >
                    {node.image ? (
                      <img src={node.image} alt="" loading="lazy" />
                    ) : null}
                    <span className="scene-halo" />
                    <span className="scene-glyph">{node.symbol}</span>
                    {node.frames?.length ? (
                      <span className="scene-frame-strip">
                        {node.frames.map((frame, frameIndex) => (
                          <span
                            key={`${node.id}-${frame.label}`}
                            className="scene-frame"
                            style={{ '--i': frameIndex } as CSSProperties}
                          >
                            <img
                              src={frame.src}
                              alt=""
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <em>{frame.label}</em>
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {node.characters?.length ? (
                      <span className="scene-character-cloud">
                        {node.characters.map((character, characterIndex) => (
                          <span
                            key={`${node.id}-${character.label}`}
                            className={`scene-character scene-character-${
                              character.variant ?? 'support'
                            }`}
                            style={{ '--i': characterIndex } as CSSProperties}
                          >
                            <img
                              src={character.src}
                              alt=""
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <em>{character.label}</em>
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {node.artifacts?.length ? (
                      <span className="scene-artifact-cloud">
                        {node.artifacts.map((artifact, artifactIndex) => (
                          <span
                            key={`${node.id}-${artifact.label}`}
                            className="scene-artifact"
                            style={{ '--i': artifactIndex } as CSSProperties}
                          >
                            <img
                              src={artifact.src}
                              alt=""
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <em>{artifact.label}</em>
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <span className="scene-orbit scene-orbit-one" />
                    <span className="scene-orbit scene-orbit-two" />
                    <span className="scene-particles scene-particles-one" />
                    <span className="scene-particles scene-particles-two" />
                  </figure>

                  <div className="scene-copy">
                    <span className="scene-order">{node.symbol}</span>
                    <p className="scene-phase">{node.phase}</p>
                    <h3>{node.title}</h3>
                    <p>{node.summary}</p>
                    <div className="scene-meta">
                      <span>
                        <Icon size={16} />
                        {node.realm}
                      </span>
                      {node.tags.map((tag) => (
                        <em key={tag}>{tag}</em>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section
        id="fanren-index"
        className="home-index-section"
        aria-label="人物与法宝索引"
      >
        <div className="home-index-inner">
          <header className="home-index-header">
            <p className="seal-line">卷中索引</p>
            <h2>人物和法宝，留在同一卷里看。</h2>
            <p>
              按初逢、支线和关键底牌整理，翻完长卷后可以顺手回看这些熟面孔和重要器物。
            </p>
          </header>

          <div className="home-index-columns">
            <section className="home-index-column" aria-label="主要人物">
              <div className="home-index-column-title">
                <Sparkles size={18} />
                <h3>主要人物</h3>
              </div>
              <div className="home-character-grid">
                {characters.map((character) => (
                  <article className="home-character-card" key={character.id}>
                    <img src={character.image} alt="" loading="lazy" />
                    <div>
                      <span>{character.track}</span>
                      <h4>{character.name}</h4>
                      <p>{character.echo}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="home-index-column" aria-label="关键法宝">
              <div className="home-index-column-title">
                <Gem size={18} />
                <h3>关键法宝</h3>
              </div>
              <div className="home-artifact-grid">
                {artifacts.map((artifact) => (
                  <article
                    className="home-artifact-card"
                    data-tone={artifact.tone}
                    key={artifact.id}
                  >
                    <span className="home-artifact-symbol">
                      {artifact.symbol}
                    </span>
                    <div>
                      <span>{artifact.type}</span>
                      <h4>{artifact.name}</h4>
                      <p>{artifact.change}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>凡人修仙阁</strong>
          <span>给道友玩的互动仙途长卷</span>
        </div>
        <a href="#hanli-timeline">
          <Clock3 size={15} />
          翻开长卷
        </a>
      </footer>
    </main>
  )
}

function HomeHeroCopy() {
  const countdown = useCountdown(countdownTarget)
  const countdownActive =
    countdown.remainingMs === null || countdown.remainingMs > 0

  return (
    <div className="home-hero-copy">
      <p className="seal-line">凡人修仙阁</p>
      <h1>{countdownActive ? '慕兰之战，归期已定' : '凡人修仙阁'}</h1>
      <p className="home-hero-subtitle">
        {countdownActive
          ? '6 月 13 日 11:00，请道友回阁'
          : '七玄门风起，乱星海潮生，请道友翻开韩立这一卷'}
      </p>

      {countdownActive ? (
        <div className="countdown-altar" aria-label="复播倒计时">
          <CountdownUnit label="天" value={countdown.days} />
          <CountdownUnit label="时" value={countdown.hours} />
          <CountdownUnit label="分" value={countdown.minutes} />
          <CountdownUnit label="秒" value={countdown.seconds} />
        </div>
      ) : null}

      <div className="hero-actions">
        <a className="primary-link" href="#hanli-timeline">
          <Map size={18} />
          入阁翻卷
        </a>
        <a className="ghost-link" href="/run">
          <Footprints size={18} />
          韩跑跑出发
        </a>
      </div>
    </div>
  )
}

function CountdownUnit({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <strong>{value}</strong>
      <em>{label}</em>
    </span>
  )
}

function useCountdown(target: string) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    const targetTime = new Date(target).getTime()
    const tick = () => setRemainingMs(Math.max(targetTime - Date.now(), 0))
    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [target])

  const safeMs = remainingMs ?? 0
  const totalSeconds = Math.floor(safeMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    remainingMs,
    days: remainingMs === null ? '--' : String(days).padStart(2, '0'),
    hours: remainingMs === null ? '--' : String(hours).padStart(2, '0'),
    minutes: remainingMs === null ? '--' : String(minutes).padStart(2, '0'),
    seconds: remainingMs === null ? '--' : String(seconds).padStart(2, '0'),
  }
}
