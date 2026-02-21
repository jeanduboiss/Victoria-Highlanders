'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const NAV_LINKS = [
  { label: 'Noticias', href: '/noticias' },
  { label: 'Plantel', href: '/plantel' },
  { label: 'Partidos', href: '/partidos' },
  { label: 'Galería', href: '/galeria' },
]

export function SiteNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#161616] border-b border-white/10 shadow-lg">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between px-4 lg:px-8">

        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/images/logo-victoria-sm.png" alt="VHFC" width={36} height={40} className="object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-oswald text-[13px] font-bold uppercase tracking-[0.15em] text-white">Victoria</span>
            <span className="font-oswald text-[13px] font-bold uppercase tracking-[0.15em] text-gold">Highlanders</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden border border-gold bg-gold px-5 py-2 font-oswald text-[12px] font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90 lg:block"
          >
            Buy Tickets
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/login"
              className="px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-white/50 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="border border-white/20 px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-white/70 transition-all hover:border-white/50 hover:text-white"
            >
              Register
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col justify-center gap-[5px] p-1 lg:hidden"
            aria-label="Menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block h-[2px] w-6 bg-white origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-[2px] w-6 bg-white"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block h-[2px] w-5 bg-white origin-center"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-[#111] lg:hidden"
          >
            <div className="py-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-6 py-3 font-sans text-[13px] font-semibold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 border-b border-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2 px-6 py-4"
              >
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 text-center font-sans text-[11px] font-semibold uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 text-center font-sans text-[11px] font-semibold uppercase tracking-widest text-white bg-gold/10 border border-gold/40 hover:bg-gold hover:text-black transition-all"
                >
                  Register
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
