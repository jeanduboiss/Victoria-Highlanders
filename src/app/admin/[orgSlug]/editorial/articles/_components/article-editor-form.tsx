'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createArticleSchema, updateArticleSchema } from '@/domains/editorial/schemas/article.schema'
import { createArticleAction, updateArticleAction, publishArticleAction, archiveArticleAction } from '@/domains/editorial/actions/article.actions'
import { TiptapEditor } from '@/components/admin/editor/tiptap-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
    ArrowLeft,
    Send,
    Save,
    Archive,
    Globe,
    Tag,
    FolderOpen,
    Star,
} from 'lucide-react'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    slug: string
    _count?: { articles: number }
}

interface TagItem {
    id: string
    name: string
    slug: string
    _count?: { articles: number; events: number }
}

interface Article {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: unknown
    coverImageUrl: string | null
    status: string
    isFeatured: boolean
    publishedAt: Date | null
    categories: Category[]
    tags: TagItem[]
}

interface ArticleEditorFormProps {
    orgSlug: string
    article?: Article | null
    categories: Category[]
    tags: TagItem[]
}

export function ArticleEditorForm({ orgSlug, article, categories, tags }: ArticleEditorFormProps) {
    const t = useTranslations('admin.pages.editorial.articleEditor')
    const tUi = useTranslations('admin.common.status') // Assuming status labels might be in common or just define them locally

    const router = useRouter()
    const isEditing = !!article

    const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
        DRAFT: { label: tUi('draft'), color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
        PUBLISHED: { label: tUi('published'), color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        SCHEDULED: { label: tUi('scheduled'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        ARCHIVED: { label: tUi('archived'), color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    }

    const [editorContent, setEditorContent] = useState<string>(
        article?.content ? JSON.stringify(article.content) : ''
    )
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        article?.categories.map((c) => c.id) ?? []
    )
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
        article?.tags.map((t) => t.id) ?? []
    )

    const form = useForm({
        defaultValues: {
            orgSlug,
            title: article?.title ?? '',
            excerpt: article?.excerpt ?? '',
            coverImageUrl: article?.coverImageUrl ?? '',
            isFeatured: article?.isFeatured ?? false,
        },
    })

    const { execute: executeCreate, isPending: isCreating } = useAction(createArticleAction, {
        onSuccess: (result) => {
            toast.success(t('successCreate'))
            router.push(`/admin/${orgSlug}/editorial/articles/${result.data?.id}`)
        },
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })

    const { execute: executeUpdate, isPending: isUpdating } = useAction(updateArticleAction, {
        onSuccess: () => toast.success(t('successUpdate')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })

    const { execute: executePublish, isPending: isPublishing } = useAction(publishArticleAction, {
        onSuccess: () => toast.success(t('successPublish')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })

    const { execute: executeArchive, isPending: isArchiving } = useAction(archiveArticleAction, {
        onSuccess: () => toast.success(t('successArchive')),
        onError: ({ error }) => toast.error(error.serverError ?? t('error')),
    })

    const isPending = isCreating || isUpdating || isPublishing || isArchiving

    function handleSave() {
        const values = form.getValues()
        const payload = {
            orgSlug,
            title: values.title,
            excerpt: values.excerpt || undefined,
            content: editorContent ? JSON.parse(editorContent) : undefined,
            coverImageUrl: values.coverImageUrl || undefined,
            isFeatured: values.isFeatured,
            categoryIds: selectedCategoryIds,
            tagIds: selectedTagIds,
        }

        if (isEditing && article) {
            executeUpdate({ ...payload, articleId: article.id })
        } else {
            executeCreate(payload)
        }
    }

    function toggleCategory(id: string) {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        )
    }

    function toggleTag(id: string) {
        setSelectedTagIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        )
    }

    const currentStatus = article?.status ?? 'DRAFT'
    const statusConfig = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.DRAFT

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <Link href={`/admin/${orgSlug}/editorial/articles`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight truncate">
                            {isEditing ? t('edit') : t('new')}
                        </h1>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isEditing && article?.status !== 'PUBLISHED' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executePublish({ orgSlug, articleId: article.id })}
                            disabled={isPending}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {t('publish')}
                        </Button>
                    )}
                    {isEditing && article?.status === 'PUBLISHED' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => executeArchive({ orgSlug, articleId: article.id })}
                            disabled={isPending}
                            className="text-destructive"
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            {t('archive')}
                        </Button>
                    )}
                    <Button size="sm" onClick={handleSave} disabled={isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? t('saving') : t('save')}
                    </Button>
                </div>
            </div>

            {/* Editor layout — 3+1 grid */}
            <div className="grid gap-6 lg:grid-cols-4">
                {/* Columna principal — Editor */}
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
                                                placeholder={t('titlePlaceholder')}
                                                className="text-xl font-bold h-12 border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('excerptPlaceholder')}
                                                className="resize-none border-0 bg-transparent px-0 focus-visible:ring-0 text-sm text-muted-foreground placeholder:text-muted-foreground/40"
                                                rows={2}
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

                    {/* TipTap Editor */}
                    <TiptapEditor
                        content={article?.content ? JSON.stringify(article.content) : ''}
                        onChange={setEditorContent}
                    />
                </div>

                {/* Sidebar derecha — Opciones */}
                <div className="space-y-4">
                    {/* URL y SEO */}
                    {isEditing && article && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5" />
                                    SEO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-xs">
                                    <span className="text-muted-foreground">Slug: </span>
                                    <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{article.slug}</code>
                                </div>
                                {article.publishedAt && (
                                    <div className="text-xs">
                                        <span className="text-muted-foreground">Publicado: </span>
                                        {new Date(article.publishedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Cover image */}
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
                                                <Input placeholder={t('imageUrlPlaceholder')} className="text-xs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Destacado */}
                    <Card>
                        <CardContent className="pt-4">
                            <Form {...form}>
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                                {t('isFeatured')}
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Categorías */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                                <FolderOpen className="h-3.5 w-3.5" />
                                {t('categories')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {categories.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t('noCategories')}</p>
                            ) : (
                                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className="flex items-center gap-2 text-xs cursor-pointer group"
                                        >
                                            <Checkbox
                                                checked={selectedCategoryIds.includes(cat.id)}
                                                onCheckedChange={() => toggleCategory(cat.id)}
                                            />
                                            <span className="group-hover:text-foreground text-muted-foreground transition-colors">
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" />
                                {t('tags')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tags.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t('noTags')}</p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                                            className="cursor-pointer text-[10px] transition-colors"
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
