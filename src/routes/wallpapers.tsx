import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Film, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { SiteNav } from '../components/SiteNav'
import { wallpaperSources } from '../data/fanrenWorld'

export const Route = createFileRoute('/wallpapers')({
  component: WallpapersPage,
})

const sourceKinds = [
  '番剧入口',
  '官方壁纸',
  '场景设定',
  '制作方 PV',
  '动态壁纸',
] as const

type Img = { name: string; src: string }

const BASE = '/media/images/bg-image'

const qfn = (file: string) => `${BASE}/collect/群芳绘卷/${file}.webp`
const bfn = (file: string) => `${BASE}/collect/缤纷夏日/${file}.webp`
const qban = (file: string) => `${BASE}/collect/Q版/${file}.webp`

const imageCollections: { name: string; images: Img[] }[] = [
  {
    name: '独立壁纸',
    images: [
      { name: '4K 原图', src: `${BASE}/4K 原图.webp` },
      { name: '青竹小轩', src: `${BASE}/青竹小轩 4K.webp` },
      { name: '温天仁', src: `${BASE}/温天仁2.webp` },
      { name: '玄骨', src: `${BASE}/玄骨2.webp` },
    ],
  },
  {
    name: '群芳绘卷',
    images: [
      { name: '梅凝', src: qfn('1.梅凝 4K') },
      { name: '慕沛灵', src: qfn('2.慕沛灵 4K') },
      { name: '元瑶', src: qfn('3.元瑶 4K') },
      { name: '南宫婉', src: qfn('4.南宫婉 4K') },
      { name: '南黎岛交换会女修', src: qfn('5.南黎岛交换会女修 4K') },
      { name: '银月', src: qfn('6.银月 4K') },
      { name: '宋玉', src: qfn('7.宋玉 4K') },
      { name: '范静梅', src: qfn('8.范静梅 4K') },
      { name: '紫灵', src: qfn('9.紫灵 4K') },
      { name: '卓如婷', src: qfn('10.卓如婷 4K') },
      { name: '文思月', src: qfn('11.文思月 4K') },
      { name: '菡云芝', src: qfn('12.菡云芝 4K') },
      { name: '柳玉', src: qfn('13.柳玉 4K') },
      { name: '辛如音', src: qfn('14.辛如音 4K') },
      { name: '尸魈', src: qfn('15.尸魈 4K') },
      { name: '石蝶', src: qfn('16.石蝶 4K') },
      { name: '妍丽', src: qfn('17.妍丽 4K') },
      { name: '双剑侍女', src: qfn('18.双剑侍女 4K') },
      { name: '陈巧倩', src: qfn('19.陈巧倩 4K') },
      { name: '南陇侯双侍妾', src: qfn('20.南陇侯双侍妾 4K') },
      { name: '墨彩环', src: qfn('21.墨彩环 4K') },
      { name: '凌玉灵', src: qfn('22.凌玉灵 4K') },
      { name: '温夫人', src: qfn('23.温夫人 4K') },
      { name: '燕如嫣', src: qfn('24.燕如嫣 4K') },
      { name: '周媛', src: qfn('25.周媛 4K') },
      { name: '极妙飞仙', src: qfn('26.极妙飞仙 4K') },
      { name: '钟卫娘', src: qfn('27.钟卫娘 4K') },
      { name: '多宝女', src: qfn('28.多宝女 4K') },
      { name: '萧翠儿', src: qfn('29.萧翠儿 4K') },
      { name: '墨夫人', src: qfn('30.墨夫人 4K') },
      { name: '红粉', src: qfn('31.红粉 4K') },
      { name: '冯珏', src: qfn('32.冯珏 4K') },
      { name: '霓裳', src: qfn('33.霓裳 4K') },
      { name: '南宫屏', src: qfn('34.“南宫屏” 4K') },
      { name: '红拂', src: qfn('35.红拂 4K') },
      { name: '董萱儿', src: qfn('36.董萱儿 4K') },
      { name: '公孙杏', src: qfn('37.公孙杏 4K') },
      { name: '小昙', src: qfn('38.小昙 4K') },
      { name: '韩小妹', src: qfn('39.韩小妹 4K') },
      { name: '李缨宁', src: qfn('40.李缨宁 4') },
      { name: '送丹侍女', src: qfn('41.送丹侍女 4K') },
      { name: '玉儿', src: qfn('42.玉儿 4K') },
      { name: '伏元朗', src: qfn('43.伏元朗 4K') },
      { name: '白凤峰女修', src: qfn('44.白凤峰女修 4K') },
      { name: '金荣', src: qfn('45.金荣 4K') },
      { name: '小汪凝', src: qfn('46.小汪凝 4K') },
      { name: '乐上师', src: qfn('47.乐上师 4K') },
      { name: '曲魂之妻', src: qfn('48.曲魂之妻 4K') },
      { name: '韵琴', src: qfn('49.韵琴 4K') },
      { name: '从白曼', src: qfn('50.从白曼 4K') },
      { name: '邰夫人', src: qfn('51.邰夫人 4K') },
    ],
  },
  {
    name: '缤纷夏日',
    images: [
      { name: '南宫婉', src: bfn('南宫婉') },
      { name: '元瑶', src: bfn('元瑶') },
      { name: '梅凝', src: bfn('梅凝') },
      { name: '梅凝 4K', src: bfn('梅凝 4k') },
      { name: '银月', src: bfn('银月') },
      { name: '紫灵', src: bfn('紫灵') },
      { name: '慕沛灵', src: bfn('慕沛灵') },
      { name: '范静梅', src: bfn('范静梅') },
      { name: '卓如婷', src: bfn('卓如婷') },
      { name: '文思月', src: bfn('文思月') },
      { name: '菡云芝', src: bfn('菡云芝') },
      { name: '辛如音', src: bfn('辛如音') },
      { name: '宋玉', src: bfn('宋玉') },
      { name: '宋玉 2', src: bfn('宋玉2') },
      { name: '凌玉灵', src: bfn('凌玉灵') },
      { name: '温夫人', src: bfn('温夫人') },
      { name: '公孙杏', src: bfn('公孙杏') },
      { name: '尸魈', src: bfn('尸魈') },
      { name: '南陇侯双侍妾', src: bfn('南陇侯双侍妾') },
      { name: '合照 1', src: bfn('合照1') },
      { name: '合照 2', src: bfn('合照2') },
    ],
  },
  {
    name: 'Q版',
    images: [
      { name: '梅凝', src: qban('梅凝') },
      { name: '元瑶', src: qban('元瑶') },
      { name: '银月', src: qban('银月') },
      { name: '紫灵', src: qban('紫灵') },
      { name: '慕沛灵', src: qban('慕沛灵') },
      { name: '宋玉', src: qban('宋玉') },
      { name: '凌玉灵', src: qban('凌玉灵') },
      { name: '文思月', src: qban('文思月') },
      { name: '菡云芝', src: qban('菡云芝') },
      { name: '辛如音', src: qban('辛如音') },
      { name: '柳玉', src: qban('柳玉') },
      { name: '公孙杏', src: qban('公孙杏') },
      { name: '燕如嫣', src: qban('燕如嫣') },
      { name: '邰夫人', src: qban('邰夫人') },
      { name: '乐上师', src: qban('乐上师') },
      { name: '双剑侍女', src: qban('双剑侍女') },
      { name: '合照 1', src: qban('合照1') },
      { name: '合照 2', src: qban('合照2') },
      { name: '合照 3', src: qban('合照3') },
      { name: '合照 4', src: qban('合照4') },
    ],
  },
  {
    name: '自拍',
    images: Array.from({ length: 16 }, (_, i) => ({
      name: `自拍 ${i + 1}`,
      src: `${BASE}/collect/自拍/${i + 1}.webp`,
    })),
  },
]

function Lightbox({ img, onClose }: { img: Img; onClose: () => void }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={img.src} alt={img.name} className="lightbox-img" />
      <span className="lightbox-name">{img.name}</span>
    </div>
  )
}

function WallpapersPage() {
  const [lightboxImg, setLightboxImg] = useState<Img | null>(null)

  return (
    <main className="fan-page wallpapers-page">
      <SiteNav />
      <section className="page-hero compact-hero wallpaper-hero">
        <div>
          <p className="seal-line">壁纸洞府</p>
          <h1>收录官方壁纸与同人绘卷。</h1>
          <p>群芳绘卷、缤纷夏日、Q 版等系列壁纸，点击可查看大图。</p>
        </div>
      </section>

      <section className="image-collections">
        {imageCollections.map((col) => (
          <div className="image-collection" key={col.name}>
            <h2>
              <ImageIcon size={18} />
              {col.name}
              <span className="image-count">{col.images.length} 张</span>
            </h2>
            <div className="image-grid">
              {col.images.map((img) => (
                <button
                  className="image-thumb"
                  key={img.src}
                  onClick={() => setLightboxImg(img)}
                  type="button"
                >
                  <img src={img.src} alt={img.name} loading="lazy" />
                  <span className="image-thumb-label">{img.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="source-links-section">
        {sourceKinds.map((kind) => {
          const sources = wallpaperSources.filter(
            (source) => source.kind === kind,
          )
          return (
            <div className="source-links-group" key={kind}>
              <h2>
                {kind === '制作方 PV' || kind === '动态壁纸' ? (
                  <Film size={15} />
                ) : (
                  <ImageIcon size={15} />
                )}
                {kind}
              </h2>
              <ul>
                {sources.map((source) => (
                  <li key={source.id}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                      <span className="source-link-from">{source.source}</span>
                      <ExternalLink size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>

      <footer className="wallpaper-footer">
        <p className="wallpaper-credit">壁纸来源：UP主 - 天南第一深情</p>
        <p className="wallpaper-disclaimer">
          本站内容仅供学习交流，版权归原作者及官方所有。如有任何侵权问题，请联系
          <a href="mailto:makerjackie@qq.com"> makerjackie@qq.com</a>
          ，我们会第一时间处理。
        </p>
      </footer>

      {lightboxImg && (
        <Lightbox img={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </main>
  )
}
