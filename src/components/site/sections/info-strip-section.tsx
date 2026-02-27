'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { staggerContainer, fadeInUp, VIEWPORT } from '@/components/site/animations/variants'
import type { PublicArticle } from '@/domains/editorial/queries/public-articles.query'
import type { PublicMatchBar } from '@/domains/sports/queries/public-matches.query'

interface InfoStripSectionProps {
  latestArticle: PublicArticle | null
  nextMatch: PublicMatchBar['nextMatch']
  latestResult: PublicMatchBar['latestResult']
  hideResults?: boolean
}

export function InfoStripSection({ latestArticle, nextMatch, latestResult }: InfoStripSectionProps) {
  const t = useTranslations('infoStrip')

  return (
    <div className="bg-[#111] border-t border-white/5">
      <motion.div
        className={`mx-auto grid max-w-[1280px] grid-cols-1 divide-y divide-white/10 ${hideResults ? 'md:grid-cols-2' : 'md:grid-cols-3'} md:divide-x md:divide-y-0 px-4 lg:px-8`}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <motion.div variants={fadeInUp} className="py-5 md:pr-6">
          <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{t('teamNews')}</p>
          {latestArticle ? (
            <Link href={`/noticias/${latestArticle.slug}`} className="group flex gap-3">
              {latestArticle.coverImageUrl && (
                <div className="h-16 w-24 shrink-0 overflow-hidden bg-white/5">
                  <img src={latestArticle.coverImageUrl} alt={latestArticle.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="flex flex-col justify-center gap-1">
                <h3 className="font-sans text-[13px] font-semibold leading-snug text-white group-hover:text-gold transition-colors line-clamp-2">
                  {latestArticle.title}
                </h3>
                {latestArticle.publishedAt && (
                  <span className="font-sans text-[11px] text-gray-500">
                    {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(latestArticle.publishedAt))}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <p className="font-sans text-[13px] text-gray-500">{t('noNews')}</p>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="py-5 md:px-6">
          <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{t('nextMatch')}</p>
          {nextMatch ? (
            <div className="flex flex-col gap-2">
              <span className="font-oswald text-[15px] font-bold text-white">
                {nextMatch.isHomeGame
                  ? `Victoria Highlanders vs ${nextMatch.awayTeam.shortName ?? nextMatch.awayTeam.name}`
                  : `${nextMatch.homeTeam.shortName ?? nextMatch.homeTeam.name} vs Victoria Highlanders`}
              </span>
              <span className="font-sans text-[12px] text-gray-400">
                {new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(nextMatch.matchDate))}
              </span>
              {nextMatch.venue && (
                <span className="font-sans text-[11px] text-gray-600">{nextMatch.venue.name}</span>
              )}
              <Link href="/partidos" className="mt-1 inline-block border border-gold/60 px-4 py-1.5 font-oswald text-[11px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all w-fit">
                {t('buyTickets')}
              </Link>
            </div>
          ) : (
            <p className="font-sans text-[13px] text-gray-500">{t('noMatches')}</p>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="py-5 md:pl-6">
          <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{t('latestResult')}</p>
          {latestResult ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-oswald text-[14px] font-bold text-white">
                  {latestResult.homeTeam.shortName ?? latestResult.homeTeam.name}
                </span>
                <div className="flex items-center gap-2 bg-[#1f2937] px-3 py-1">
                  <span className="font-oswald text-[20px] font-bold text-white">
                    {latestResult.homeScore} – {latestResult.awayScore}
                  </span>
                </div>
                <Link href="/partidos" className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors">
                  Match Report →
                </Link>
              </div>
              <Link href="/partidos" className="font-sans text-[11px] font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors">
                {t('matchReport')}
              </Link>
            </div>
          ) : (
            <p className="font-sans text-[13px] text-gray-500">{t('noResults')}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
