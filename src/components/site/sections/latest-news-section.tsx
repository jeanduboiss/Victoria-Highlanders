'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerFast, scaleIn, VIEWPORT } from '@/components/site/animations/variants'
import type { PublicArticle } from '@/domains/editorial/queries/public-articles.query'

const STANDINGS = [
  { pos: 1, name: 'Surrey FC',            played: 18, won: 13, drawn: 3, lost: 2, gd: +28, pts: 42 },
  { pos: 2, name: 'Victoria Highlanders', played: 18, won: 12, drawn: 3, lost: 3, gd: +21, pts: 39, isUs: true },
  { pos: 3, name: 'Langley United',       played: 18, won: 10, drawn: 4, lost: 4, gd: +14, pts: 34 },
  { pos: 4, name: 'Burnaby FC',           played: 18, won: 9,  drawn: 3, lost: 6, gd: +8,  pts: 30 },
  { pos: 5, name: 'Richmond Athletic',    played: 18, won: 8,  drawn: 3, lost: 7, gd: +2,  pts: 27 },
  { pos: 6, name: 'Nanaimo United',       played: 18, won: 6,  drawn: 5, lost: 7, gd: -4,  pts: 23 },
  { pos: 7, name: 'Kelowna FC',           played: 18, won: 4,  drawn: 4, lost: 10, gd: -15, pts: 16 },
  { pos: 8, name: 'Prince George SC',     played: 18, won: 2,  drawn: 1, lost: 15, gd: -34, pts: 7  },
]

interface LatestNewsSectionProps {
  articles: PublicArticle[]
}

function ArticleCard({ article }: { article: PublicArticle }) {
  const category = article.ArticleCategories?.[0]?.article_categories?.name

  return (
    <motion.div variants={scaleIn}>
      <Link href={`/noticias/${article.slug}`} className="group flex flex-col">
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#1a1a1a]">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1f2937]">
              <span className="font-oswald text-[11px] uppercase tracking-widest text-gray-600">VHFC</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 pt-3">
          {category && (
            <span className="inline-block w-fit bg-gold px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-black">
              {category}
            </span>
          )}
          <h3 className="font-oswald text-[18px] font-bold uppercase leading-tight text-white group-hover:text-gold transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.publishedAt && (
            <p className="font-sans text-[11px] text-gray-500">
              {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  const t = useTranslations('latestNews')

  return (
    <section className="bg-[#0f0f0f] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-10">

          <motion.div
            className="flex-1 min-w-0"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-oswald text-[28px] font-bold uppercase text-white sm:text-[32px]">{t('title')}</h2>
              <Link href="/noticias" className="font-sans text-[12px] font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors">
                {t('allNews')}
              </Link>
            </div>

            {articles.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={staggerFast}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
              >
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </motion.div>
            ) : (
              <div className="flex h-40 items-center justify-center border border-white/5">
                <p className="font-sans text-[13px] text-gray-600">{t('noArticles')}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="w-full lg:w-[300px] shrink-0"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <div className="bg-[#111] border border-white/5">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#161616] px-4 py-3">
                <h3 className="font-oswald text-[14px] font-bold uppercase tracking-wider text-white">League 1 BC</h3>
                <Link href="/tabla" className="font-sans text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors">
                  {t('full')}
                </Link>
              </div>

              <div className="px-0">
                <div className="grid grid-cols-[20px_1fr_24px_24px_24px_28px] gap-x-2 border-b border-white/5 px-3 py-2">
                  <span className="font-sans text-[10px] font-bold uppercase text-gray-600">#</span>
                  <span className="font-sans text-[10px] font-bold uppercase text-gray-600">Club</span>
                  <span className="font-sans text-[10px] font-bold uppercase text-gray-600 text-right">P</span>
                  <span className="font-sans text-[10px] font-bold uppercase text-gray-600 text-right">GD</span>
                  <span className="font-sans text-[10px] font-bold uppercase text-gray-600 text-right">Pts</span>
                  <span></span>
                </div>

                <motion.div variants={staggerFast} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
                  {STANDINGS.map((team) => (
                    <motion.div
                      key={team.pos}
                      variants={fadeInUp}
                      className={`grid grid-cols-[20px_1fr_24px_24px_24px_28px] gap-x-2 items-center border-b border-white/5 px-3 py-2.5 last:border-0 ${team.isUs ? 'bg-gold/10' : 'hover:bg-white/[0.03] transition-colors'}`}
                    >
                      <span className={`font-oswald text-[12px] font-bold ${team.isUs ? 'text-gold' : 'text-gray-500'}`}>{team.pos}</span>
                      <span className={`font-sans text-[12px] font-semibold truncate ${team.isUs ? 'text-gold' : 'text-white'}`}>{team.name}</span>
                      <span className={`font-sans text-[12px] text-right ${team.isUs ? 'text-gold/80' : 'text-gray-400'}`}>{team.played}</span>
                      <span className={`font-sans text-[12px] text-right ${team.isUs ? 'text-gold/80' : 'text-gray-400'}`}>{team.gd > 0 ? `+${team.gd}` : team.gd}</span>
                      <span className={`font-oswald text-[13px] font-bold text-right ${team.isUs ? 'text-gold' : 'text-white'}`}>{team.pts}</span>
                      <span></span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="border-t border-white/5 px-3 py-2">
                <p className="font-sans text-[10px] text-gray-600">{t('provisional')}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
