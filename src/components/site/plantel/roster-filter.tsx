'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import type { TeamCategory } from '@prisma/client'
import { useTranslations } from 'next-intl'

interface Season {
    id: string
    name: string
    isCurrent: boolean
}

interface Team {
    id: string
    name: string
    category: TeamCategory
}

interface RosterFilterProps {
    seasons: Season[]
    teams: Team[]
    currentSeasonId?: string
    currentCategory: string
}

const CATEGORY_LABELS: Record<string, string> = {
    FIRST_TEAM: 'Primer Equipo',
    RESERVE: 'Reserva',
    U23: 'Sub-23',
    U20: 'Sub-20',
    U18: 'Sub-18',
    U16: 'Sub-16',
    U14: 'Sub-14',
    U12: 'Sub-12',
    WOMEN: 'Femenino',
    FUTSAL: 'Futsal',
}

export function RosterFilter({ seasons, teams, currentSeasonId, currentCategory }: RosterFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations('subpages.roster')

    const categories = Array.from(new Set(teams.map(t => t.category)))

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) {
            params.set('season', e.target.value)
        } else {
            params.delete('season')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleCategoryChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('category', val)
        } else {
            params.delete('category')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end border-b border-white/[0.06] pb-6"
        >
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 font-oswald text-[13px] font-bold uppercase tracking-widest transition-all ${currentCategory === cat
                            ? 'bg-gold text-black'
                            : 'bg-[#1a1a1a] text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {t.has(`categories.${cat}`) ? t(`categories.${cat}`) : (CATEGORY_LABELS[cat] ?? cat)}
                    </button>
                ))}
            </div>

            <div className="w-full md:w-auto min-w-[200px]">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                    {t('seasonTitle')}
                </label>
                <select
                    value={currentSeasonId ?? ''}
                    onChange={handleSeasonChange}
                    className="w-full bg-[#1a1a1a] border border-white/10 px-4 py-2.5 font-oswald text-[14px] text-white outline-none focus:border-gold/50 transition-colors"
                >
                    {seasons.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name} {s.isCurrent && t('current')}
                        </option>
                    ))}
                </select>
            </div>
        </motion.div>
    )
}
