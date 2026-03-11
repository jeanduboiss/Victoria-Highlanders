'use client'

import { useTranslations, useLocale } from 'next-intl'

import { useAction } from 'next-safe-action/hooks'
import { publishEventAction, cancelEventAction, finishEventAction } from '@/domains/editorial/actions/event.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Send, XCircle, CheckCircle2, MapPin, Calendar, Clock } from 'lucide-react'

interface EventItem {
    id: string
    title: string
    slug: string
    eventType: string
    status: string
    startDatetime: Date
    endDatetime: Date | null
    locationText: string | null
    tags?: { id: string; name: string }[]
}

interface EventsTableProps {
    events: EventItem[]
    orgSlug: string
}

export function EventsTable({ events, orgSlug }: EventsTableProps) {
    const t = useTranslations('admin.pages.editorial.eventsTable')
    const locale = useLocale()

    const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
        DRAFT: { label: t('statusDraft'), variant: 'secondary' },
        PUBLISHED: { label: t('statusPublished'), variant: 'default' },
        CANCELLED: { label: t('statusCancelled'), variant: 'destructive' },
        FINISHED: { label: t('statusFinished'), variant: 'outline' },
    }

    const TYPE_LABELS: Record<string, string> = {
        MATCH: t('typeMatch'),
        TRAINING: t('typeTraining'),
        SOCIAL: t('typeSocial'),
        MEMBERSHIP: t('typeMembership'),
        PRESS: t('typePress'),
        CHARITY: t('typeCharity'),
        OTHER: t('typeOther'),
    }

    const { execute: executePublish, isPending: isPub } = useAction(publishEventAction, {
        onSuccess: () => toast.success(t('successPublish')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })
    const { execute: executeCancel, isPending: isCan } = useAction(cancelEventAction, {
        onSuccess: () => toast.success(t('successCancel')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })
    const { execute: executeFinish, isPending: isFin } = useAction(finishEventAction, {
        onSuccess: () => toast.success(t('successFinish')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })

    if (events.length === 0)
        return <p className="text-sm text-muted-foreground py-8 text-center">{t('noEvents')}</p>

    const isPending = isPub || isCan || isFin

    return (
        <TooltipProvider>
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('event')}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t('type')}</TableHead>
                                <TableHead>{t('date')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('place')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead className="text-right">{t('actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => {
                                const start = new Date(event.startDatetime)
                                const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT
                                return (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium line-clamp-1">{event.title}</p>
                                                {event.tags && event.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {event.tags.slice(0, 3).map((t) => (
                                                            <Badge key={t.id} variant="outline" className="text-[10px] px-1">{t.name}</Badge>
                                                        ))}
                                                        {event.tags.length > 3 && (
                                                            <span className="text-[10px] text-muted-foreground">+{event.tags.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                                            {TYPE_LABELS[event.eventType] ?? event.eventType}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {start.toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short' })}
                                                <Clock className="h-3 w-3 ml-1" />
                                                {start.toLocaleTimeString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {event.locationText ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.locationText}
                                                </span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {event.status === 'DRAFT' && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-emerald-500"
                                                                onClick={() => executePublish({ orgSlug, eventId: event.id })}
                                                                disabled={isPending}
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('publish')}</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {event.status === 'PUBLISHED' && (
                                                    <>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-500"
                                                                    onClick={() => executeFinish({ orgSlug, eventId: event.id })}
                                                                    disabled={isPending}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('finish')}</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive"
                                                                    onClick={() => executeCancel({ orgSlug, eventId: event.id })}
                                                                    disabled={isPending}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('cancel')}</TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </TooltipProvider>
    )
}
