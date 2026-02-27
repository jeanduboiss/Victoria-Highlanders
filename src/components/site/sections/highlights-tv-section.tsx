'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { fadeInUp, scaleIn, staggerContainer, staggerFast, VIEWPORT } from '@/components/site/animations/variants'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PublicMediaTVItem } from '@/domains/media/queries/public-media.query'

const FALLBACK_VIDEOS = [
  { title: 'Highlights: VHFC vs TSS Rovers', duration: '3:42', ago: '2 days ago', featured: true, url: '/tv' },
  { title: 'Post-Match Interview: Head Coach', duration: '5:15', ago: '3 days ago', featured: false, url: '/tv' },
  { title: 'Goal of the Month: June', duration: '1:20', ago: '1 week ago', featured: false, url: '/tv' },
  { title: 'Inside Training: Preparing for Finals', duration: '8:45', ago: '2 weeks ago', featured: false, url: '/tv' },
]

interface HighlightsTvSectionProps {
  videos?: PublicMediaTVItem[]
}

export function HighlightsTvSection({ videos }: HighlightsTvSectionProps) {
  const displayVideos = videos && videos.length > 0
    ? videos.map((v, i) => ({
      title: v.fileName,
      duration: v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)}:${(v.durationSeconds % 60).toString().padStart(2, '0')}` : 'Video',
      ago: formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: es }),
      featured: i === 0, // Featured para el mas reciente
      url: v.publicUrl,
    }))
    : FALLBACK_VIDEOS
  return (
    <section className="bg-[#0a0a0a] py-12 border-t border-white/5 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <motion.div
          className="mb-6 flex items-baseline justify-between"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <h2 className="font-oswald text-[26px] font-bold uppercase text-white sm:text-[28px]">
            Highlanders <span className="text-gold">TV</span>
          </h2>
          <Link href="/tv" className="font-sans text-[12px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">
            View All →
          </Link>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {displayVideos.map((video) => (
            <motion.div key={video.title} variants={scaleIn}>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">
                <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.2 }}
                      className={`flex h-11 w-11 items-center justify-center ${video.featured ? 'bg-gold' : 'bg-white/15 backdrop-blur-sm'}`}
                    >
                      <svg width="10" height="12" viewBox="0 0 10 12" fill={video.featured ? 'black' : 'white'}>
                        <path d="M0 0L10 6L0 12V0Z" />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5">
                    <span className="font-mono text-[10px] text-white">{video.duration}</span>
                  </div>
                  {video.featured && (
                    <div className="absolute left-2 top-2 bg-gold px-2 py-0.5">
                      <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-black">Latest</span>
                    </div>
                  )}
                </div>
                <h4 className="font-sans text-[13px] font-semibold leading-snug text-white group-hover:text-gold transition-colors line-clamp-2">
                  {video.title}
                </h4>
                <span className="font-sans text-[11px] text-gray-600">{video.ago}</span>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
