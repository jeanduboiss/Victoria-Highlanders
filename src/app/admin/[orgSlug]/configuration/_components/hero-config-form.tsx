'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { updateSiteConfigAction } from '@/domains/configuration/actions/site-config.actions'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const schema = z.object({
  orgSlug: z.string(),
  siteName: z.string().min(1),
  heroTitle: z.string().max(120).optional(),
  heroSubtitle: z.string().max(400).optional(),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  featuredArticleId: z.string().uuid().optional().or(z.literal('')),
  featuredMatchId: z.string().uuid().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Article { id: string; title: string }
interface MatchOption {
  id: string
  matchDate: Date
  homeTeam: { shortName: string | null; name: string }
  awayTeam: { shortName: string | null; name: string }
}

interface HeroConfigFormProps {
  orgSlug: string
  siteName: string
  config: {
    heroTitle?: string | null
    heroSubtitle?: string | null
    heroImageUrl?: string | null
    featuredArticleId?: string | null
    featuredMatchId?: string | null
  } | null
  articles: Article[]
  matches: MatchOption[]
}

export function HeroConfigForm({ orgSlug, siteName, config, articles, matches }: HeroConfigFormProps) {
  const t = useTranslations('admin.pages.configuration.hero')
  const locale = useLocale()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orgSlug,
      siteName,
      heroTitle: config?.heroTitle ?? 'Unstoppable\nMomentum',
      heroSubtitle: config?.heroSubtitle ?? 'The Highlanders secure another crucial victory at home...',
      heroImageUrl: config?.heroImageUrl ?? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80',
      featuredArticleId: config?.featuredArticleId ?? '__none__',
      featuredMatchId: config?.featuredMatchId ?? '__none__',
    },
  })

  const { execute, isPending } = useAction(updateSiteConfigAction, {
    onSuccess: () => toast.success(t('success')),
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  function onSubmit(values: FormValues) {
    execute({
      ...values,
      featuredArticleId: values.featuredArticleId === '__none__' ? '' : values.featuredArticleId,
      featuredMatchId: values.featuredMatchId === '__none__' ? '' : values.featuredMatchId,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">{t('text')}</h2>
          <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <Input placeholder="Unstoppable Momentum" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heroSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('subtitle')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="The Highlanders secure another crucial victory..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold">{t('background')}</h2>
          <FormField
            control={form.control}
            name="heroImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('imageUrl')}</FormLabel>
                <FormControl>
                  <Input placeholder="https://images.unsplash.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold">{t('featured')}</h2>
          <FormField
            control={form.control}
            name="featuredArticleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('featuredArticle')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('noneArticle')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noneArticle')}</SelectItem>
                    {articles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="featuredMatchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('featuredMatch')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('noneMatch')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">{t('noneMatch')}</SelectItem>
                    {matches.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.homeTeam.shortName ?? m.homeTeam.name} vs {m.awayTeam.shortName ?? m.awayTeam.name} · {new Date(m.matchDate).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? t('saving') : t('saveHero')}
        </Button>
      </form>
    </Form>
  )
}
