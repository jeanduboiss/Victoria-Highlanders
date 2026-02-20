'use client'

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
    _count: { articles: number }
}

interface CategoriesTableProps {
    categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
    if (categories.length === 0)
        return <p className="text-sm text-muted-foreground py-8 text-center">No hay categorías creadas.</p>

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="text-center">Artículos</TableHead>
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
                            <TableCell>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{category.slug}</code>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="text-xs tabular-nums">
                                    {category._count.articles}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
