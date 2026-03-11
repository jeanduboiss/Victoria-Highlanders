import { requirePermission } from '@/lib/auth'
import { getEventsByOrg, getTagsByOrg } from '@/domains/editorial/queries/editorial.queries'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EventsTable } from './_components/events-table'
import { CreateEventSheet } from './_components/create-event-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
    params: Promise<{ orgSlug: string }>
}

export default async function EventsPage({ params }: Props) {
    const t = await getTranslations('admin.pages')
    const { orgSlug } = await params
    const ctx = await requirePermission(orgSlug, 'events', 'read').catch(() => redirect('/login'))

    const [events, tags] = await Promise.all([
        getEventsByOrg(ctx.organizationId),
        getTagsByOrg(ctx.organizationId),
    ])

    type EventRow = Awaited<ReturnType<typeof getEventsByOrg>>[number]
    const eventsFlat = events.map((e: EventRow) => ({
        ...e,
        tags: e.tags.map((et: EventRow['tags'][number]) => et.tag),
    }))

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('editorial.eventsTitle')}</h1>
                    <p className="text-muted-foreground">{events.length} {t('editorial.eventsRegistered')}</p>
                </div>
                <CreateEventSheet orgSlug={orgSlug} tags={tags}>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('editorial.newEvent')}
                    </Button>
                </CreateEventSheet>
            </div>
            <EventsTable events={eventsFlat as any} orgSlug={orgSlug} />
        </div>
    )
}
