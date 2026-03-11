'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Season, TeamCategory } from '@prisma/client'

interface Props {
  seasons: Season[]
  categories: TeamCategory[]
  competitions: string[]
  currentSeasonId?: string
  currentCategory?: string
  currentCompetition?: string
  orgSlug: string
}

export function StandingsFilters({
  seasons,
  categories,
  competitions,
  currentSeasonId,
  currentCategory,
  currentCompetition,
  orgSlug,
}: Props) {
  const t = useTranslations('admin.pages.sports.standingsFilters')
  const tc = useTranslations('subpages.roster.categories')
  const router = useRouter()
  const hasFilters = !!(currentSeasonId || currentCategory || currentCompetition)

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams()
    if (currentSeasonId && key !== 'seasonId') params.set('seasonId', currentSeasonId)
    if (currentCategory && key !== 'category') params.set('category', currentCategory)
    if (currentCompetition && key !== 'competitionName') params.set('competitionName', currentCompetition)
    if (value) params.set(key, value)
    const query = params.toString()
    router.push(`/admin/${orgSlug}/sports/standings${query ? `?${query}` : ''}`)
  }

  function clearFilters() {
    router.push(`/admin/${orgSlug}/sports/standings`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={currentSeasonId ?? 'all'}
        onValueChange={(v) => updateFilter('seasonId', v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm">
          <SelectValue placeholder={t('season')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allSeasons')}</SelectItem>
          {seasons.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentCategory ?? 'all'}
        onValueChange={(v) => updateFilter('category', v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm">
          <SelectValue placeholder={t('category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>{tc(c)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {competitions.length > 0 && (
        <Select
          value={currentCompetition ?? 'all'}
          onValueChange={(v) => updateFilter('competitionName', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-48 h-8 text-sm">
            <SelectValue placeholder={t('competition')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCompetitions')}</SelectItem>
            {competitions.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {t('clear')}
        </Button>
      )}
    </div>
  )
}
