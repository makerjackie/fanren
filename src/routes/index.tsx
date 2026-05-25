import { createFileRoute } from '@tanstack/react-router'
import {
  Compass,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  ScrollText,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

export const Route = createFileRoute('/')({ component: Home })

type Stage = {
  id: string
  title: string
  short: string
  place: string
  memory: string
  recap: string
  catchup: string
  next: string
  status: string
  forgotten: number
  route: string
  people: string[]
  artifacts: string[]
  image: string
}

const stages: Stage[] = [
  {
    id: 'qixuan',
    title: '我只记得墨大夫想夺舍',
    short: '七玄门旧梦',
    place: '越国镜州 · 七玄门',
    memory: '韩立还是山村少年，在神手谷练长春功，捡到了改变命运的小瓶。',
    recap:
      '你停在最早的凡人篇。韩立从江湖走进修仙世界，第一次明白“仙人”未必比凡人更干净，墨大夫这局把他的谨慎底色直接打出来了。',
    catchup:
      '从墨大夫、余子童、金光上人补起，重点记住掌天瓶、升仙令和韩立第一次杀修仙者。',
    next: '接下来是黄枫谷、血色禁地和南宫婉，感情线与修仙界规则会同时展开。',
    status: '记忆封印九成',
    forgotten: 91,
    route: '七玄门 -> 金光上人 -> 太南小会 -> 黄枫谷',
    people: ['韩立', '墨大夫', '厉飞雨'],
    artifacts: ['掌天瓶', '升仙令', '长春功'],
    image: '/media/images/characters/mo-daifu.webp',
  },
  {
    id: 'bloody-trial',
    title: '我记得血色禁地和南宫婉',
    short: '血色禁地',
    place: '越国七派 · 血色禁地',
    memory: '你记得那场试炼，也大概记得韩立和南宫婉的命运被强行绑在一起。',
    recap:
      '这是人界篇最重要的早期节点。韩立靠谨慎、符箓、药园机缘活下来，也拿到筑基关键资源。南宫婉线从这里开始变成长期伏笔。',
    catchup:
      '补血色禁地后直接接筑基、李化元、青元剑诀。你需要把“韩立为什么能稳定发育”想起来。',
    next: '接下来正魔大战压过来，韩立最经典的选择不是热血死守，而是先跑。',
    status: '记忆封印七成',
    forgotten: 73,
    route: '黄枫谷 -> 血色禁地 -> 筑基 -> 正魔大战',
    people: ['韩立', '南宫婉', '李化元'],
    artifacts: ['筑基丹', '青元剑诀', '符宝'],
    image: '/media/images/characters/nangong-wan.webp',
  },
  {
    id: 'run-to-sea',
    title: '我记得韩立跑路去乱星海',
    short: '韩跑跑远遁',
    place: '天南战乱 · 古传送阵',
    memory:
      '越国被卷进正魔大战，韩立没有站在原地等热血，而是保存实力远遁海外。',
    recap:
      '你记住了凡人最有味道的选择：修仙界不是少年漫赛场，活下来才有后续。乱星海打开了地图，也让韩立从宗门弟子变成真正的独行修士。',
    catchup:
      '回看古传送阵、乱星海、极阴老祖和结丹线。掌天瓶催熟灵药的价值会在这里全面放大。',
    next: '虚天殿、虚天鼎、乾蓝冰焰会把韩立推到高阶修士牌桌边缘。',
    status: '记忆封印五成',
    forgotten: 52,
    route: '天南逃亡 -> 乱星海 -> 结丹 -> 虚天殿',
    people: ['韩立', '银月', '极阴老祖'],
    artifacts: ['古传送阵', '噬金虫', '虚天鼎'],
    image: '/media/images/characters/yinyue.webp',
  },
  {
    id: 'xutian',
    title: '我记得虚天殿抢宝',
    short: '虚天殿夺宝',
    place: '乱星海 · 虚天殿',
    memory: '你应该还记得高阶修士互相算计，韩立在夹缝里硬拿机缘。',
    recap:
      '这一段是“苟”和“狠”的结合。韩立不是最强，但他准备最多、撤退最快、底牌最杂。虚天鼎与乾蓝冰焰让他的战斗体系开始升维。',
    catchup:
      '补虚天殿、青竹蜂云剑、噬金虫和银月线。这里开始，韩立不是小修士混地图，而是在高阶局里活跃。',
    next: '后面回到天南，元婴、坠魔谷、昆吾山会连续把世界观拔高。',
    status: '记忆封印三成',
    forgotten: 36,
    route: '虚天殿 -> 结丹稳固 -> 青竹蜂云剑 -> 回天南',
    people: ['韩立', '银月', '蛮胡子'],
    artifacts: ['虚天鼎', '乾蓝冰焰', '青竹蜂云剑'],
    image: '/media/images/characters/xiang-zhili.webp',
  },
  {
    id: 'nascent',
    title: '我已经看到元婴大成',
    short: '元婴老魔',
    place: '天南 · 落云宗',
    memory: '你记得韩立已经成了元婴修士，手里底牌多到敌人很难算清。',
    recap:
      '这时韩立完成身份转变：不再只是逃命的低阶修士，而是天南有分量的大修。辟邪神雷、飞剑、傀儡、灵虫开始形成完整战斗系统。',
    catchup:
      '补元婴后的落云宗、坠魔谷、慕兰大战和南宫婉重逢线。重点是“韩老魔为什么越来越难杀”。',
    next: '复播接近的爽点就在这里：大场面、旧人回归、高阶战局和韩立的老练感。',
    status: '记忆封印两成',
    forgotten: 24,
    route: '元婴 -> 落云宗 -> 慕兰大战 -> 坠魔谷',
    people: ['韩立', '南宫婉', '紫灵'],
    artifacts: ['辟邪神雷', '青竹蜂云剑', '大衍诀'],
    image: '/media/images/characters/zi-ling.webp',
  },
  {
    id: 'kunwu',
    title: '我还记得坠魔谷 / 昆吾山',
    short: '人界终局',
    place: '天南 · 大晋 · 昆吾山',
    memory: '你已经记到人界篇后期，化神、魔界裂缝和灵界信息都开始浮出水面。',
    recap:
      '人界篇后期的重点不是单个副本，而是人界上限被揭开。韩立已经不是追求筑基结丹的小修士，他要面对的是飞升、空间节点和更高世界。',
    catchup:
      '快速扫一遍大晋、昆吾山、空间节点和冰凤线即可。你需要的不是补课，是把主线顺序理回来。',
    next: '后面就是离开人界，真正进入更大的修仙宇宙。',
    status: '记忆封印一成',
    forgotten: 12,
    route: '坠魔谷 -> 昆吾山 -> 化神线索 -> 偷渡灵界',
    people: ['韩立', '银月', '向之礼'],
    artifacts: ['空间节点', '八灵尺', '古魔封印'],
    image: '/media/images/characters/yuanyao.webp',
  },
  {
    id: 'only-run',
    title: '我只记得韩跑跑很能苟',
    short: '道友失忆',
    place: '记忆裂缝 · 不明洞府',
    memory: '你保留了最正确的一条核心记忆：韩立不是莽，是把活命当成第一功法。',
    recap:
      '这其实够用了。凡人好看的地方就是普通资质的人，在一个极端残酷的系统里，用谨慎、耐心和底牌一点点把命续上去。',
    catchup:
      '建议直接从“七玄门 10 分钟回顾”开始，再按血色禁地、乱星海、元婴三段补。',
    next: '如果复播前只补一条线，就补“韩立从逃亡到元婴”的成长线。',
    status: '记忆封印十成但道心尚在',
    forgotten: 96,
    route: '七玄门 -> 血色禁地 -> 乱星海 -> 元婴',
    people: ['韩立', '厉飞雨', '南宫婉'],
    artifacts: ['掌天瓶', '符箓', '跑路路线'],
    image: '/media/images/characters/hanli.webp',
  },
]

const characterCards = [
  {
    name: '韩立',
    image: '/media/images/characters/hanli.webp',
    tag: '谨慎流主角',
    note: '凡人开局，靠耐心、底牌和撤退路线活到最后。',
  },
  {
    name: '南宫婉',
    image: '/media/images/characters/nangong-wan.webp',
    tag: '早期宿命线',
    note: '血色禁地之后，感情线开始变成贯穿人界篇的暗线。',
  },
  {
    name: '银月',
    image: '/media/images/characters/yinyue.webp',
    tag: '乱星海之后',
    note: '器灵、妖族身世、灵界伏笔，都是后期世界观入口。',
  },
  {
    name: '向之礼',
    image: '/media/images/characters/xiang-zhili.webp',
    tag: '隐藏大佬',
    note: '看似路人，实际把人界上限和飞升线悄悄端出来。',
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

function Home() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [entered, setEntered] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [selectedId, setSelectedId] = useState(stages[2].id)
  const [copied, setCopied] = useState(false)

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedId) ?? stages[2],
    [selectedId],
  )

  const shareText = `复播前测了一下，我的凡人记忆停在「${selectedStage.short}」。${selectedStage.status}，补课路线：${selectedStage.route}。`

  const enterSite = () => {
    setEntered(true)
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.34
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

  const copyShareText = async () => {
    await navigator.clipboard.writeText(`${shareText} https://fanren.01mvp.com`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className={`site-shell ${entered ? 'is-entered' : ''}`}>
      <audio ref={audioRef} src="/media/audio/bgm.mp3" preload="auto" loop />

      <section className="hero-section" aria-label="凡人回坑入口">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/media/images/bg/hero-poster.jpg"
        >
          <source src="/media/videos/hero.mp4" type="video/mp4" />
        </video>
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
          aria-label={soundOn ? '关闭背景音乐' : '播放背景音乐'}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div className="hero-content">
          <p className="eyebrow">非官方粉丝回坑工具</p>
          <h1>
            凡人修仙传
            <span>人界篇回坑玉简</span>
          </h1>
          <p className="hero-copy">
            复播前，点一下你最后记得的剧情。玉简会告诉你从哪补、该记谁、接下来为什么爽。
          </p>
          <div className="hero-actions">
            <a href="#recall" className="primary-link">
              <ScrollText size={18} />
              开始回忆
            </a>
            <a href="#report" className="ghost-link">
              <Compass size={18} />
              看我的补课路线
            </a>
          </div>
        </div>

        <button
          type="button"
          className="entry-gate"
          onClick={enterSite}
          aria-hidden={entered}
          tabIndex={entered ? -1 : 0}
        >
          <span className="gate-ring" />
          <span className="gate-title">叩开洞府</span>
          <span className="gate-subtitle">点击进入，灵音自启</span>
        </button>
      </section>

      <section id="recall" className="recall-section">
        <div className="section-kicker">你最后记得哪里</div>
        <div className="section-heading">
          <h2>选一个记忆节点</h2>
          <p>不用答题，不用登录。越像你，补课路线越准。</p>
        </div>

        <div className="memory-grid">
          {stages.map((stage, index) => (
            <button
              className={`memory-card ${selectedStage.id === stage.id ? 'active' : ''}`}
              key={stage.id}
              type="button"
              onClick={() => setSelectedId(stage.id)}
            >
              <span className="memory-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="memory-place">{stage.place}</span>
              <strong>{stage.title}</strong>
              <span>{stage.memory}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="report" className="report-section">
        <div className="report-video-frame" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/media/images/bg/timeline-poster.jpg"
          >
            <source src="/media/videos/timeline.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="jade-report">
          <div className="report-topline">
            <span>回坑玉简已生成</span>
            <span>{selectedStage.status}</span>
          </div>
          <div className="report-main">
            <div className="seal-block">
              <img src={selectedStage.image} alt="" />
              <span>人界篇</span>
            </div>
            <div>
              <p className="report-place">{selectedStage.place}</p>
              <h2>{selectedStage.short}</h2>
              <p>{selectedStage.recap}</p>
            </div>
          </div>

          <div className="progress-block">
            <div>
              <span>遗忘程度</span>
              <strong>{selectedStage.forgotten}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${selectedStage.forgotten}%` }} />
            </div>
          </div>

          <div className="report-columns">
            <article>
              <Sparkles size={18} />
              <h3>60 秒补课</h3>
              <p>{selectedStage.catchup}</p>
            </article>
            <article>
              <Swords size={18} />
              <h3>接下来爽点</h3>
              <p>{selectedStage.next}</p>
            </article>
          </div>

          <div className="report-tags">
            <div>
              <span>必记人物</span>
              <p>{selectedStage.people.join(' / ')}</p>
            </div>
            <div>
              <span>必记法宝</span>
              <p>{selectedStage.artifacts.join(' / ')}</p>
            </div>
            <div>
              <span>补课路线</span>
              <p>{selectedStage.route}</p>
            </div>
          </div>

          <div className="share-row">
            <button type="button" onClick={copyShareText}>
              <Copy size={17} />
              {copied ? '已复制' : '复制分享文案'}
            </button>
            <button type="button" onClick={() => setSelectedId(stages[0].id)}>
              <RotateCcw size={17} />
              从头补起
            </button>
          </div>
        </div>
      </section>

      <section className="character-section">
        <div className="section-kicker">复播前必记旧人</div>
        <div className="section-heading">
          <h2>先把这几个人想起来</h2>
          <p>不做百科，先抓主线。看完这些名字，很多剧情会自己接上。</p>
        </div>
        <div className="character-grid">
          {characterCards.map((card) => (
            <article className="character-card" key={card.name}>
              <img src={card.image} alt={card.name} loading="lazy" />
              <div>
                <span>{card.tag}</span>
                <h3>{card.name}</h3>
                <p>{card.note}</p>
              </div>
            </article>
          ))}
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
          <p className="eyebrow">今日天机</p>
          <h2>复播前别硬补全集，先补你断掉的那一段。</h2>
          <p>
            这个小站是用 AI
            辅助开发出来的互动网页。想看从想法、素材、交互到部署的完整拆解，我会整理到
            01MVP。
          </p>
          <a href="https://01mvp.com" target="_blank" rel="noreferrer">
            去 01MVP 看制作过程
            <ExternalLink size={17} />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>凡人修仙传 · 人界篇回坑玉简</strong>
          <span>非官方粉丝项目。剧情信息为个人整理，素材仅作氛围展示。</span>
        </div>
        <a href="#recall">
          <Play size={15} />
          再测一次
        </a>
      </footer>
    </main>
  )
}
