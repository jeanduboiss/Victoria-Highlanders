'use client'

import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Star, Quote } from 'lucide-react'
import { fadeInUp, staggerFast, VIEWPORT } from '@/components/site/animations/variants'

type Testimonial = {
  id: string
  authorName: string
  authorRole: string | null
  authorAvatarUrl: string | null
  content: string
  rating: number
  isFeatured: boolean
}

interface Props {
  testimonials: Testimonial[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
      ))}
    </div>
  )
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`flex flex-col gap-4 rounded-sm border bg-[#111] p-6 ${t.isFeatured ? 'border-gold/30' : 'border-white/[0.06]'}`}
    >
      <Quote className="w-6 h-6 text-gold/40" />
      <StarRating rating={t.rating} />
      <p className="font-sans text-[14px] leading-relaxed text-gray-300 flex-1">"{t.content}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
        {t.authorAvatarUrl ? (
          <img src={t.authorAvatarUrl} alt={t.authorName} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm shrink-0">
            {t.authorName[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-sans text-[13px] font-semibold text-white">{t.authorName}</p>
          {t.authorRole && <p className="font-sans text-[11px] text-gray-500">{t.authorRole}</p>}
        </div>
        {t.isFeatured && (
          <Star className="w-4 h-4 fill-gold text-gold ml-auto shrink-0" />
        )}
      </div>
    </motion.div>
  )
}

export function TestimonialsSection({ testimonials }: Props) {
  const t = useTranslations('testimonials')

  if (testimonials.length === 0) return null

  return (
    <section className="bg-[#0a0a0a] py-20">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <motion.div
          className="mb-10"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">
            {t('label')}
          </p>
          <h2 className="font-oswald text-[32px] font-bold uppercase text-white sm:text-[40px]">
            {t('title')}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} t={testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
