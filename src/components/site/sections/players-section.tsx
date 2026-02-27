'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { fadeInUp, VIEWPORT } from '@/components/site/animations/variants'
import { User } from 'lucide-react'
import type { PublicPlayer } from '@/domains/sports/queries/public-players.query'

interface PlayersSectionProps {
  players: PublicPlayer[]
}

export function PlayersSection({ players }: PlayersSectionProps) {
  const t = useTranslations('players')

  if (players.length === 0) return null

  return (
    <section className="bg-[#0a0a0a] py-20 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <motion.div
          className="mb-10"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">{t('teamLabel')}</p>
          <h2 className="font-oswald text-[32px] font-bold uppercase text-white sm:text-[40px]">{t('title')}</h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {players.map((player, i) => (
            <motion.div
              key={player.id}
              className="shrink-0 w-[180px] sm:w-[200px] snap-start group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-sm bg-[#111] border border-white/[0.06] aspect-[3/4] mb-3 group-hover:border-gold/30 transition-colors duration-300">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-end justify-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
                    <User className="w-20 h-20 text-white/10 mb-6" />
                  </div>
                )}
                {player.jerseyNumberDefault && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                    <span className="font-oswald text-[13px] font-bold text-black leading-none">
                      {player.jerseyNumberDefault}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-oswald text-[15px] font-bold uppercase text-white leading-tight">
                {player.firstName} {player.lastName}
              </p>
              {player.position && (
                <p className="font-sans text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">
                  {t(`positions.${player.position}` as any) ?? player.position}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
