'use client'

import { useState } from 'react'

const LOCALES = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
] as const

interface Props {
  currentLocale: string
  variant?: 'site' | 'admin'
}

export function LanguageSwitcher({ currentLocale, variant = 'site' }: Props) {
  const [pending, setPending] = useState(false)

  function switchLocale(locale: string) {
    if (locale === currentLocale || pending) return
    setPending(true)
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => switchLocale(value)}
          disabled={pending || currentLocale === value}
          className={`px-2 py-1 font-sans text-[11px] font-bold uppercase tracking-wider rounded transition-all ${variant === 'admin'
            ? currentLocale === value
              ? 'text-foreground bg-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            : currentLocale === value
              ? 'text-white bg-white/10'
              : 'text-white/40 hover:text-white/80'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
