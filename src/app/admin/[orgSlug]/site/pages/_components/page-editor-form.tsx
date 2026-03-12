'use client'
import { useTranslations } from 'next-intl'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { TiptapEditor } from '@/components/admin/editor/tiptap-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, Globe, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { createPageAction, updatePageAction, publishPageAction, unpublishPageAction } from '@/domains/site/actions/page.actions'
import type { Page } from '@prisma/client'

interface Props {
  orgSlug: string
  page?: Page | null
}

export function PageEditorForm({ orgSlug, page }: Props) {
  const t = useTranslations('admin.pages.site.newPageEdit')
  const router = useRouter()
  const isEditing = !!page

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = useMemo(() => ({
    DRAFT: { label: t('draft'), color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    PUBLISHED: { label: 'Publicada', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  }), [t])

  const [editorContent, setEditorContent] = useState<string>(
    page?.content ? JSON.stringify(page.content) : ''
  )

  const form = useForm({
    defaultValues: {
      title: page?.title ?? '',
      coverImageUrl: page?.coverImageUrl ?? '',
      metaTitle: page?.metaTitle ?? '',
      metaDescription: page?.metaDescription ?? '',
    },
  })

  const { execute: executeCreate, isPending: isCreating } = useAction(createPageAction, {
    onSuccess: (result) => {
      toast.success('Página creada.')
      router.push(`/admin/${orgSlug}/site/pages/${result.data?.id}`)
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al crear.'),
  })

  const { execute: executeUpdate, isPending: isUpdating } = useAction(updatePageAction, {
    onSuccess: () => toast.success('Cambios guardados.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  const { execute: executePublish, isPending: isPublishing } = useAction(publishPageAction, {
    onSuccess: () => toast.success('Página publicada.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al publicar.'),
  })

  const { execute: executeUnpublish, isPending: isUnpublishing } = useAction(unpublishPageAction, {
    onSuccess: () => toast.success('Página despublicada.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error.'),
  })

  const isPending = isCreating || isUpdating || isPublishing || isUnpublishing

  function handleSave() {
    const values = form.getValues()
    const payload = {
      orgSlug,
      title: values.title,
      content: editorContent ? JSON.parse(editorContent) : undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
    }

    if (isEditing && page) {
      executeUpdate({ ...payload, pageId: page.id })
    } else {
      executeCreate(payload)
    }
  }

  const currentStatus = page?.status ?? 'DRAFT'
  const statusConfig = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.DRAFT
  const draftLabel = t('draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/admin/${orgSlug}/site/pages`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {isEditing ? 'Editar página' : t('title')}
            </h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.color}`}>
              {currentStatus === 'DRAFT' ? draftLabel : 'Publicada'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing && page?.status === 'DRAFT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => executePublish({ orgSlug, pageId: page.id })}
              disabled={isPending}
            >
              <Eye className="mr-2 h-4 w-4" />
              Publicar
            </Button>
          )}
          {isEditing && page?.status === 'PUBLISHED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeUnpublish({ orgSlug, pageId: page.id })}
              disabled={isPending}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Despublicar
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Guardando...' : t('save')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t('pageTitle')}
                        className="text-xl font-bold h-12 border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>

          <Separator />

          <TiptapEditor
            content={page?.content ? JSON.stringify(page.content) : ''}
            onChange={setEditorContent}
          />
        </div>

        <div className="space-y-4">
          {isEditing && page && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  URL pública
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Slug: </span>
                  <code className="text-[10px] bg-muted px-1 py-0.5 rounded">/p/{page.slug}</code>
                </div>
                {page.status === 'PUBLISHED' && (
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver en el sitio →
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">{t('coverImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={t('imgUrl')} className="text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('seoTitle')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('titleSearch')} className="text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('seoDesc')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('descSearch')} className="text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
