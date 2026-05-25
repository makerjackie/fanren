import { createFileRoute } from '@tanstack/react-router'
import {
  Compass,
  Copy,
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
  reclaim: string
  next: string
  status: string
  forgotten: number
  route: string
  people: string[]
  artifacts: string[]
  image: string
  flowIndex: number
}

type HistoryStep = {
  title: string
  era: string
  detail: string
}

type CharacterPath = {
  name: string
  image: string
  tag: string
  note: string
  beats: string[]
}

const stages: Stage[] = [
  {
    id: 'qixuan',
    title: '只记得墨大夫那一局',
    short: '七玄门旧梦',
    place: '越国镜州 · 七玄门',
    memory: '韩立还是山村少年，在神手谷练长春功，捡到了改变命运的小瓶。',
    recap:
      '你断在最早的人间烟火里。墨大夫、余子童、金光上人接连登场，韩立第一次知道修仙者也会算计到骨头里。',
    reclaim:
      '先把掌天瓶、长春功、升仙令想起来。这里不是热血开局，而是韩立谨慎性格的源头。',
    next: '往后就是太南小会、黄枫谷和血色禁地，凡人正式推门进修仙界。',
    status: '旧事蒙尘九成',
    forgotten: 91,
    route: '七玄门 -> 金光上人 -> 太南小会 -> 黄枫谷',
    people: ['韩立', '墨大夫', '厉飞雨'],
    artifacts: ['掌天瓶', '升仙令', '长春功'],
    image: '/media/images/characters/mo-daifu.webp',
    flowIndex: 0,
  },
  {
    id: 'bloody-trial',
    title: '记得血色禁地和南宫婉',
    short: '血色禁地',
    place: '越国七派 · 血色禁地',
    memory: '你还记得那场试炼，也记得韩立和南宫婉的命运从这里拧在一起。',
    recap:
      '这是人界篇早期的分水岭。韩立靠准备和耐心活下来，拿到筑基关键资源，南宫婉线也从意外变成长线。',
    reclaim:
      '回看血色禁地、筑基、李化元、青元剑诀。重点不是名词，而是韩立为什么能稳定长起来。',
    next: '正魔大战很快压过来，韩立最有凡人味的选择出现了：不硬撑，先活。',
    status: '旧事蒙尘七成',
    forgotten: 73,
    route: '黄枫谷 -> 血色禁地 -> 筑基 -> 正魔大战',
    people: ['韩立', '南宫婉', '李化元'],
    artifacts: ['筑基丹', '青元剑诀', '符宝'],
    image: '/media/images/characters/nangong-wan.webp',
    flowIndex: 2,
  },
  {
    id: 'run-to-sea',
    title: '记得他跑路去了乱星海',
    short: '韩跑跑远遁',
    place: '天南战乱 · 古传送阵',
    memory: '越国卷入正魔大战，韩立没有站在原地等情怀，而是保存实力远遁海外。',
    recap:
      '你记住了凡人最有辨识度的选择：修仙界不是擂台，活下来才有下一章。乱星海打开新地图，也让韩立从宗门弟子变成真正的独行修士。',
    reclaim:
      '把古传送阵、乱星海、极阴老祖、结丹线串起来。掌天瓶催熟灵药的价值，会在这段全面放大。',
    next: '虚天殿、虚天鼎、乾蓝冰焰会把韩立推到高阶修士的牌桌边缘。',
    status: '旧事蒙尘五成',
    forgotten: 52,
    route: '天南逃亡 -> 乱星海 -> 结丹 -> 虚天殿',
    people: ['韩立', '银月', '极阴老祖'],
    artifacts: ['古传送阵', '噬金虫', '虚天鼎'],
    image: '/media/images/characters/yinyue.webp',
    flowIndex: 4,
  },
  {
    id: 'xutian',
    title: '记得虚天殿抢宝',
    short: '虚天殿夺宝',
    place: '乱星海 · 虚天殿',
    memory: '你应该还记得一群高阶修士互相算计，韩立在夹缝里硬拿机缘。',
    recap:
      '这一段好看在“稳”和“狠”一起出现。韩立不是最强，但他准备最多、撤退最快、底牌最杂。',
    reclaim:
      '顺一遍虚天殿、青竹蜂云剑、噬金虫和银月线。到这里，韩立已经能在高阶局里留下名字。',
    next: '回到天南后，元婴、坠魔谷、昆吾山会连续把世界观拔高。',
    status: '旧事蒙尘三成',
    forgotten: 36,
    route: '虚天殿 -> 结丹稳固 -> 青竹蜂云剑 -> 回天南',
    people: ['韩立', '银月', '蛮胡子'],
    artifacts: ['虚天鼎', '乾蓝冰焰', '青竹蜂云剑'],
    image: '/media/images/characters/xiang-zhili.webp',
    flowIndex: 5,
  },
  {
    id: 'nascent',
    title: '已经看到元婴之后',
    short: '元婴老魔',
    place: '天南 · 落云宗',
    memory: '你记得韩立已经成了元婴修士，手里底牌多到敌人很难算清。',
    recap:
      '这里完成身份转变：他不再只是逃命的小修士，而是天南有分量的大修。飞剑、神雷、傀儡、灵虫开始组成完整战斗系统。',
    reclaim:
      '接回落云宗、慕兰大战、坠魔谷和南宫婉重逢线。看点是韩老魔为什么越来越难杀。',
    next: '后面的爽感在大场面、旧人回归、高阶战局，以及韩立那种老练的分寸感。',
    status: '旧事蒙尘两成',
    forgotten: 24,
    route: '元婴 -> 落云宗 -> 慕兰大战 -> 坠魔谷',
    people: ['韩立', '南宫婉', '紫灵'],
    artifacts: ['辟邪神雷', '青竹蜂云剑', '大衍诀'],
    image: '/media/images/characters/zi-ling.webp',
    flowIndex: 6,
  },
  {
    id: 'kunwu',
    title: '还记得坠魔谷 / 昆吾山',
    short: '人界终局',
    place: '天南 · 大晋 · 昆吾山',
    memory: '你已经记到人界篇后期，化神、魔界裂缝和灵界消息都开始浮出水面。',
    recap:
      '人界后期的重点不只是副本，而是上限被揭开。韩立要面对的是飞升、空间节点和更高世界。',
    reclaim:
      '快速扫过大晋、坠魔谷、昆吾山、空间节点和冰凤线即可。你缺的不是全集，是主线顺序。',
    next: '再往后就是离开人界，真正进入更大的修仙宇宙。',
    status: '旧事蒙尘一成',
    forgotten: 12,
    route: '坠魔谷 -> 昆吾山 -> 化神线索 -> 偷渡灵界',
    people: ['韩立', '银月', '向之礼'],
    artifacts: ['空间节点', '八灵尺', '古魔封印'],
    image: '/media/images/characters/yuanyao.webp',
    flowIndex: 8,
  },
  {
    id: 'only-run',
    title: '只记得韩跑跑很能苟',
    short: '道心未散',
    place: '记忆裂缝 · 不明洞府',
    memory: '你保留了最关键的一条：韩立不是莽，是把活命当成第一功法。',
    recap:
      '这其实够用了。凡人好看的地方，是普通资质的人在极端残酷的系统里，用谨慎、耐心和底牌一点点把命续上。',
    reclaim:
      '从七玄门、血色禁地、乱星海、元婴四段接回即可。先看主线，再看支线。',
    next: '如果复播前只接一条线，就接“韩立从逃亡到元婴”的成长线。',
    status: '旧事蒙尘十成，道心还在',
    forgotten: 96,
    route: '七玄门 -> 血色禁地 -> 乱星海 -> 元婴',
    people: ['韩立', '厉飞雨', '南宫婉'],
    artifacts: ['掌天瓶', '符箓', '跑路路线'],
    image: '/media/images/characters/hanli.webp',
    flowIndex: 1,
  },
]

const historyFlow: HistoryStep[] = [
  {
    title: '七玄门',
    era: '凡人入局',
    detail: '墨大夫设局，掌天瓶现身，韩立第一次从江湖摸到修仙界门槛。',
  },
  {
    title: '太南小会',
    era: '散修初见',
    detail: '升仙令、修仙集市和底层散修规则，把“仙路很贵”讲清楚了。',
  },
  {
    title: '黄枫谷',
    era: '宗门发育',
    detail: '入门、筑基、拜师、练剑，韩立开始把谨慎变成稳定收益。',
  },
  {
    title: '血色禁地',
    era: '早期名场面',
    detail: '试炼夺药，南宫婉线埋下，韩立真正开始靠底牌活过大局。',
  },
  {
    title: '乱星海',
    era: '地图展开',
    detail: '古传送阵远遁海外，结丹、灵虫、虚天殿接连把牌面拉高。',
  },
  {
    title: '虚天殿',
    era: '高阶牌桌',
    detail: '虚天鼎、乾蓝冰焰、银月线开启，韩立在夹缝里拿到关键机缘。',
  },
  {
    title: '元婴之后',
    era: '韩老魔成型',
    detail: '回天南、落云宗、慕兰战局，飞剑神雷与灵虫形成战斗体系。',
  },
  {
    title: '坠魔谷',
    era: '世界观上抬',
    detail: '古魔、裂缝、旧人重逢交织，人界不再只是门派与资源之争。',
  },
  {
    title: '昆吾山',
    era: '人界终局',
    detail: '化神和空间节点浮出水面，飞升不再是传说，而是下一扇门。',
  },
]

const characterPaths: CharacterPath[] = [
  {
    name: '韩立',
    image: '/media/images/characters/hanli.webp',
    tag: '主线',
    note: '凡人开局，靠耐心、底牌和撤退路线，把每一次小胜变成下一次活路。',
    beats: [
      '七玄门入局',
      '黄枫谷筑基',
      '乱星海结丹',
      '回天南元婴',
      '寻找飞升路',
    ],
  },
  {
    name: '南宫婉',
    image: '/media/images/characters/nangong-wan.webp',
    tag: '情线',
    note: '血色禁地之后，她不常在场，却一直是韩立人界篇最重要的牵挂。',
    beats: ['掩月宗', '血色禁地', '长期分离', '再遇与重逢', '道侣线回收'],
  },
  {
    name: '银月',
    image: '/media/images/characters/yinyue.webp',
    tag: '伏笔',
    note: '从器灵到身世线，她让乱星海之后的故事自然接向灵界。',
    beats: ['器灵现身', '虚天殿后同行', '妖族身世', '昆吾山牵连', '灵界伏笔'],
  },
  {
    name: '厉飞雨',
    image: '/media/images/characters/li-feyu.webp',
    tag: '凡尘',
    note: '他提醒观众：韩立走得再远，最早那段江湖和凡人烟火并没有消失。',
    beats: ['七玄门旧友', '凡人少年意气', '化名余响', '旧日对照', '人间牵挂'],
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
  const [selectedCharacterName, setSelectedCharacterName] = useState(
    characterPaths[0].name,
  )
  const [copied, setCopied] = useState(false)

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedId) ?? stages[2],
    [selectedId],
  )

  const selectedCharacter = useMemo(
    () =>
      characterPaths.find(
        (character) => character.name === selectedCharacterName,
      ) ?? characterPaths[0],
    [selectedCharacterName],
  )

  const shareText = `我在「${selectedStage.short}」附近断过片，旧事还剩 ${selectedStage.forgotten}% 没接回。下一段从「${selectedStage.route}」继续看。`

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

  const copyShareText = async () => {
    await navigator.clipboard.writeText(`${shareText} https://fanren.01mvp.com`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className={`site-shell ${entered ? 'is-entered' : ''}`}>
      <audio ref={audioRef} src="/media/audio/bufan.mp3" preload="auto" loop />

      <section className="hero-section" aria-label="凡人断章寻踪入口">
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
          aria-label={soundOn ? '关闭背景声' : '播放背景声'}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div className="hero-content">
          <p className="eyebrow">非官方粉丝互动页</p>
          <h1>
            凡人修仙传
            <span>人界篇断章寻踪</span>
          </h1>
          <p className="hero-copy">
            想不起自己断在哪一段？点一个旧印，把七玄门、血色禁地、乱星海和元婴后的线索接回来。
          </p>
          <div className="hero-actions">
            <a href="#recall" className="primary-link">
              <ScrollText size={18} />
              寻回断点
            </a>
            <a href="#history" className="ghost-link">
              <Compass size={18} />
              看人界路书
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
          <span className="gate-door gate-door-left" aria-hidden="true" />
          <span className="gate-door gate-door-right" aria-hidden="true" />
          <span className="gate-light" aria-hidden="true" />
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
          <span className="gate-subtitle">门开处，旧章自来</span>
        </button>
      </section>

      <section id="recall" className="recall-section">
        <div className="section-kicker">你最后记得哪里</div>
        <div className="section-heading">
          <h2>选一个记忆断点</h2>
          <p>
            不用答题，不用登录。像就点它，页面会把下一段主线、人物和法宝一起亮出来。
          </p>
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
            <span>断点已锁定</span>
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
              <span>旧事未接回</span>
              <strong>{selectedStage.forgotten}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${selectedStage.forgotten}%` }} />
            </div>
          </div>

          <div className="report-columns">
            <article>
              <Sparkles size={18} />
              <h3>前情压缩</h3>
              <p>{selectedStage.reclaim}</p>
            </article>
            <article>
              <Swords size={18} />
              <h3>下一段看点</h3>
              <p>{selectedStage.next}</p>
            </article>
          </div>

          <div className="report-tags">
            <div>
              <span>旧人</span>
              <p>{selectedStage.people.join(' / ')}</p>
            </div>
            <div>
              <span>法宝</span>
              <p>{selectedStage.artifacts.join(' / ')}</p>
            </div>
            <div>
              <span>接回路线</span>
              <p>{selectedStage.route}</p>
            </div>
          </div>

          <div className="share-row">
            <button type="button" onClick={copyShareText}>
              <Copy size={17} />
              {copied ? '已复制' : '复制断点'}
            </button>
            <button type="button" onClick={() => setSelectedId(stages[0].id)}>
              <RotateCcw size={17} />
              从七玄门接起
            </button>
          </div>
        </div>
      </section>

      <section id="history" className="history-section">
        <div className="section-kicker">人界篇进度</div>
        <div className="section-heading">
          <h2>韩立这一路到底走到哪了</h2>
          <p>
            把大段剧情压成一张路书。你选的断点会在这里点亮，往后看就是下一段旧事。
          </p>
        </div>
        <div className="history-track">
          {historyFlow.map((step, index) => {
            const state =
              index < selectedStage.flowIndex
                ? 'past'
                : index === selectedStage.flowIndex
                  ? 'current'
                  : ''

            return (
              <article className={`history-step ${state}`} key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <em>{step.era}</em>
                <p>{step.detail}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="character-section">
        <div className="section-kicker">人物命线</div>
        <div className="section-heading">
          <h2>旧人不是百科，是记忆钩子</h2>
          <p>点一个人，看他在人界篇的几次抬头。先抓住线，再回去看细节。</p>
        </div>
        <div className="character-layout">
          <div className="character-grid">
            {characterPaths.map((card) => (
              <button
                className={`character-card ${
                  selectedCharacter.name === card.name ? 'active' : ''
                }`}
                key={card.name}
                type="button"
                onClick={() => setSelectedCharacterName(card.name)}
              >
                <img src={card.image} alt={card.name} loading="lazy" />
                <div>
                  <span>{card.tag}</span>
                  <h3>{card.name}</h3>
                  <p>{card.note}</p>
                </div>
              </button>
            ))}
          </div>
          <aside className="path-panel">
            <span>当前命线</span>
            <h3>{selectedCharacter.name}</h3>
            <ol>
              {selectedCharacter.beats.map((beat) => (
                <li key={beat}>{beat}</li>
              ))}
            </ol>
          </aside>
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
          <h2>旧卷翻到这里，风声从七玄门吹到乱星海。</h2>
          <p>
            山门旧影、禁地花雨、星海长夜，想起哪一幕，就从哪一幕继续往前走。
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>凡人修仙传 · 人界篇断章寻踪</strong>
          <span>
            旧事重温页 · 由{' '}
            <a href="https://01mvp.com" target="_blank" rel="noreferrer">
              01MVP
            </a>{' '}
            整理
          </span>
        </div>
        <a href="#recall">
          <Play size={15} />
          再测一次
        </a>
      </footer>
    </main>
  )
}
