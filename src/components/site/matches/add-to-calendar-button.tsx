'use client'

import { useTranslations } from 'next-intl'

export interface CalendarMatchData {
  matchDate: Date | string
  homeTeam: { name: string }
  awayTeam: { name: string }
  venue?: { name: string } | null
  competitionName?: string | null
  matchId?: string
}

interface AddToCalendarButtonProps {
  match: CalendarMatchData
}

function formatIsoCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildGoogleCalendarUrl(match: CalendarMatchData): string {
  const start = new Date(match.matchDate)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`
  const details = match.competitionName ?? 'Victoria Highlanders'
  const location = match.venue?.name ?? ''

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatIsoCompact(start)}/${formatIsoCompact(end)}`,
    details,
    location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function downloadIcsFile(match: CalendarMatchData) {
  const start = new Date(match.matchDate)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const now = new Date()
  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}`
  const description = match.competitionName ?? 'Victoria Highlanders'
  const location = match.venue?.name ?? ''
  const uid = match.matchId ?? `${formatIsoCompact(start)}-${match.homeTeam.name}-${match.awayTeam.name}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Victoria Highlanders//Match//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@victoriahighlanders.ca`,
    `DTSTAMP:${formatIsoCompact(now)}`,
    `DTSTART:${formatIsoCompact(start)}`,
    `DTEND:${formatIsoCompact(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `partido-${uid}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function AddToCalendarButton({ match }: AddToCalendarButtonProps) {
  const t = useTranslations('matches')

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
        {t('addToCalendar')}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={buildGoogleCalendarUrl(match)}
          target="_blank"
          rel="noopener noreferrer"
          title={t('googleCalendar')}
          className="shrink-0 flex items-center gap-2.5 bg-white/[0.07] hover:bg-white/[0.13] border border-white/20 hover:border-white/40 rounded-lg px-5 py-2.5 transition-all group"
        >
          <GoogleIcon />
          <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
            Google Calendar
          </span>
        </a>
        <button
          type="button"
          onClick={() => downloadIcsFile(match)}
          title={t('appleCalendar')}
          className="shrink-0 flex items-center gap-2.5 bg-white/[0.07] hover:bg-white/[0.13] border border-white/20 hover:border-white/40 rounded-lg px-5 py-2.5 transition-all group"
        >
          <AppleIcon />
          <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
            Apple iCalendar
          </span>
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="text-white/60" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}
