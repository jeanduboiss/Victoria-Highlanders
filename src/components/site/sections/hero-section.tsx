'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { fadeInUp, fadeIn, staggerContainer, EASE_OUT_EXPO } from '@/components/site/animations/variants'

export function HeroSection() {
  return (
    <section className="relative flex items-end overflow-hidden bg-[#0a0a0a]" style={{ minHeight: 'calc(100vh - 94px)' }}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
      >
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt="Victoria Highlanders"
          fill
          priority
          className="object-cover object-center opacity-50"
        />
      </motion.div>

      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.75) 55%,rgba(0,0,0,0.15) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 55%)' }} />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-12 pt-20 lg:px-8 lg:pb-20">
        <motion.div
          className="max-w-[600px]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeIn} className="mb-4">
            <span className="inline-block bg-gold px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-black">
              League 1 BC
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mb-4 font-oswald text-[44px] font-bold uppercase leading-[1] tracking-tight text-white sm:text-[56px] md:text-[72px]"
          >
            Unstoppable<br />Momentum
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-8 max-w-[460px] font-sans text-[14px] font-light leading-relaxed text-gray-400 sm:text-[15px]"
          >
            The Highlanders secure another crucial victory at home, climbing the League 1 BC standings with a dominant performance.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
            <Link
              href="/noticias"
              className="flex h-[46px] items-center justify-center bg-gold px-6 font-oswald text-[13px] font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90 sm:px-8"
            >
              Read Report
            </Link>
            <Link
              href="/tv"
              className="flex h-[46px] items-center justify-center border border-white/30 px-6 font-oswald text-[13px] font-bold uppercase tracking-widest text-white transition-all hover:border-gold hover:text-gold sm:px-8"
            >
              Watch Highlights
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
