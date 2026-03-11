'use client'

import { motion } from 'motion/react'
import { useTranslations, useLocale } from 'next-intl'
import { fadeInUp, VIEWPORT } from '@/components/site/animations/variants'
import { Calendar, MapPin } from 'lucide-react'
import type { PublicMatch, PublicMatchBar } from '@/domains/sports/queries/public-matches.query'

interface MatchesSectionProps {
  matches: PublicMatch[]
  nextMatch: PublicMatchBar['nextMatch']
  latestResult: PublicMatchBar['latestResult']
  hideResults?: boolean
}

function MatchCard({ match }: { match: PublicMatch }) {
  const t = useTranslations('matches')
  const locale = useLocale()
  const isFinished = match.status === 'FINISHED'
  const date = new Date(match.matchDate)

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.06] last:border-0">
      <div className="w-12 text-center shrink-0">
        <p className="font-oswald text-[11px] font-bold uppercase text-white/40">
          {date.toLocaleDateString(locale, { month: 'short' }).toUpperCase()}
        </p>
        <p className="font-oswald text-[22px] font-bold text-white leading-none">
          {date.getDate()}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-sans text-sm font-medium text-white truncate">
            {match.homeTeam.name}
          </p>
          {isFinished ? (
            <span className="font-oswald text-base font-bold text-gold shrink-0">
              {match.homeScore} — {match.awayScore}
            </span>
          ) : (
            <span className="font-sans text-[11px] font-bold uppercase text-white/30 shrink-0 bg-white/[0.05] px-2 py-0.5 rounded">
              vs
            </span>
          )}
          <p className="font-sans text-sm font-medium text-white truncate text-right">
            {match.awayTeam.name}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {match.venue && (
            <span className="text-[11px] text-white/30 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {match.venue.name}
            </span>
          )}
          {match.competitionName && (
            <span className="text-[11px] text-white/25 ml-2">{match.competitionName}</span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isFinished ? 'bg-gold/10 text-gold' : 'bg-white/[0.05] text-white/40'}`}>
          {isFinished ? t('final') : date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export function MatchesSection({ matches, nextMatch, latestResult, hideResults }: MatchesSectionProps) {
  const t = useTranslations('matches')

  if (matches.length === 0 && !nextMatch && !latestResult) return null

  const upcoming = matches.filter((m) => m.status === 'SCHEDULED')
  const finished = hideResults ? [] : matches.filter((m) => m.status === 'FINISHED')

  return (
    <section className="bg-[#0d0d0d] py-20">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <motion.div
          className="mb-10"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">{t('seasonLabel')}</p>
          <h2 className="font-oswald text-[32px] font-bold uppercase text-white sm:text-[40px]">{t('title')}</h2>
        </motion.div>

        <div className={`grid grid-cols-1 ${hideResults && upcoming.length > 0 ? 'max-w-3xl mx-auto' : 'lg:grid-cols-2'} gap-8`}>
          {upcoming.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-gold" />
                <p className="font-oswald text-[13px] font-bold uppercase tracking-widest text-gold">{t('upcoming')}</p>
              </div>
              <div className="bg-[#111] border border-white/[0.06] rounded-sm px-4">
                {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </motion.div>
          )}

          {finished.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                </span>
                <p className="font-oswald text-[13px] font-bold uppercase tracking-widest text-white/60">{t('results')}</p>
              </div>
              <div className="bg-[#111] border border-white/[0.06] rounded-sm px-4">
                {finished.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
