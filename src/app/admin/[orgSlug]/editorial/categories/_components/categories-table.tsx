'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { FolderOpen } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    _count: { ArticleCategories: number }
}

interface CategoriesTableProps {
    categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
    const t = useTranslations('admin.pages.editorial.categoriesTable')
    if (categories.length === 0)
        return <p className="text-sm text-muted-foreground py-8 text-center">{t('noCategories')}</p>

    return (
        <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead className="hidden sm:table-cell">{t('slug')}</TableHead>
                            <TableHead className="text-center">{t('articles')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    {category.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">{category.description}</p>
                                    )}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{category.slug}</code>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="text-xs tabular-nums">
                                        {category._count.ArticleCategories}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
