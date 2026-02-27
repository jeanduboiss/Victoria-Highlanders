'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import Image from 'next/image'
import { fadeInUp, staggerContainer } from '@/components/site/animations/variants'

interface Team {
  name: string
  logoUrl?: string | null
}

export interface NextMatchCountdownProps {
  targetDate: Date | string
  homeTeam: Team
  awayTeam: Team
  competitionName?: string | null
  venueName?: string | null
  isHomeGame?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date): TimeLeft {
  const difference = target.getTime() - new Date().getTime()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}

export function NextMatchCountdown({ 
  targetDate, 
  homeTeam, 
  awayTeam, 
  competitionName = 'League 1 BC', 
  venueName,
  isHomeGame = true
}: NextMatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const target = new Date(targetDate)
    
    setTimeLeft(calculateTimeLeft(target))

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!isMounted) {
    return null 
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-16 md:py-24">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.03)_0%,transparent_70%)]" />
      <div className="absolute top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto w-full max-w-[1280px] px-4 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-10 text-center">
            {competitionName ? (
              <span className="mb-4 inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                <Trophy className="h-4 w-4 text-gold" />
                {competitionName}
              </span>
            ) : null}
            <h2 className="font-oswald text-[32px] font-bold uppercase leading-tight tracking-tight text-white md:text-[48px]">
              Next <span className="text-gold">Match</span>
            </h2>
          </motion.div>

          {/* Teams Layout */}
          <motion.div variants={fadeInUp} className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-between gap-12 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:flex-row md:p-12">
            
            {/* Home Team */}
            <TeamDisplay team={homeTeam} isHome={true} />

            {/* VS Badge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-oswald text-xl font-bold uppercase text-black shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                VS
              </span>
            </div>

            {/* Away Team */}
            <TeamDisplay team={awayTeam} isHome={false} />

          </motion.div>

          {/* Info Details */}
          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-6 font-sans text-sm font-light text-gray-400">
            {venueName ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>{venueName} {isHomeGame ? "(Home)" : "(Away)"}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              <span>
                {new Date(targetDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center gap-4 md:gap-8">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeSeparator />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeSeparator />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeSeparator />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

function TeamDisplay({ team, isHome }: { team: Team, isHome: boolean }) {
  // Use generic avatars when logos are missing
  const defaultLogo = isHome ? '/images/placeholder-logo-1.png' : '/images/placeholder-logo-2.png'

  return (
    <div className={`flex flex-col items-center gap-4 ${isHome ? 'md:items-end' : 'md:items-start'} flex-1 w-full`}>
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-black/50 p-4 md:h-32 md:w-32">
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-white/5 flex items-center justify-center">
            <span className="font-oswald font-bold text-white/40 text-2xl">{team.name.substring(0, 3)}</span>
          </div>
        )}
      </div>
      <h3 className={`font-oswald text-2xl font-bold uppercase tracking-wide text-white ${isHome ? 'md:text-right' : 'md:text-left'} text-center md:text-3xl`}>
        {team.name}
      </h3>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex min-w-[70px] flex-col items-center justify-center md:min-w-[100px]">
      <span className="font-oswald text-[40px] font-bold leading-none tracking-tight text-white md:text-[64px]">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold md:text-[12px]">
        {label}
      </span>
    </div>
  )
}

function TimeSeparator() {
  return (
    <div className="flex h-full flex-col items-center justify-start pt-2 md:pt-4">
      <span className="font-oswald text-2xl font-bold text-white/20 md:text-4xl">:</span>
    </div>
  )
}
