'use client'

import { motion } from 'motion/react'
import { fadeInUp, VIEWPORT } from '@/components/site/animations/variants'

const FALLBACK_SPONSORS = [
  { name: 'Nike', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png' },
  { name: 'Telus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Telus_2023.svg/200px-Telus_2023.svg.png' },
  { name: 'BMO', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/BMO_Logo.svg/200px-BMO_Logo.svg.png' },
  { name: 'BC Ferries', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/20/BC_Ferries_logo.svg/200px-BC_Ferries_logo.svg.png' },
  { name: 'Save-On-Foods', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Save-On-Foods_Logo.svg/200px-Save-On-Foods_Logo.svg.png' },
  { name: 'Canadian Tire', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canadian_Tire_Corporation_Logo.svg/200px-Canadian_Tire_Corporation_Logo.svg.png' },
  { name: 'Rogers', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rogers_logo.svg/200px-Rogers_logo.svg.png' },
  { name: 'Tim Hortons', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Tim_Hortons_logo.svg/200px-Tim_Hortons_logo.svg.png' },
]

interface Sponsor { name: string; logoUrl: string; websiteUrl?: string }
interface SponsorsSectionProps { sponsors?: Sponsor[] }

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const list = sponsors && sponsors.length > 0 ? sponsors : FALLBACK_SPONSORS
  return (
    <section className="bg-white py-10 overflow-hidden">
      <motion.div
        className="mx-auto max-w-[1280px] px-4 mb-5 lg:px-8"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        <p className="text-center font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
          Official Partners
        </p>
      </motion.div>

      <div className="relative flex overflow-hidden">
        <div
          className="flex shrink-0 items-center gap-12 animate-marquee"
          style={{ animationDuration: '28s' }}
        >
          {[...list, ...list].map((s, i) => (
            <div key={i} className="flex h-10 w-32 shrink-0 items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <img
                src={s.logoUrl}
                alt={s.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) parent.innerHTML = `<span style="font-family:var(--font-oswald);font-size:16px;font-weight:900;color:#374151;letter-spacing:0.05em">${s.name.toUpperCase()}</span>`
                }}
              />
            </div>
          ))}
        </div>

        <div
          className="flex shrink-0 items-center gap-12 animate-marquee"
          aria-hidden="true"
          style={{ animationDuration: '28s' }}
        >
          {[...list, ...list].map((s, i) => (
            <div key={i} className="flex h-10 w-32 shrink-0 items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <img
                src={s.logoUrl}
                alt={s.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) parent.innerHTML = `<span style="font-family:var(--font-oswald);font-size:16px;font-weight:900;color:#374151;letter-spacing:0.05em">${s.name.toUpperCase()}</span>`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
