'use client'

import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

interface TagItem {
    id: string
    name: string
    slug: string
    _count: { articles: number; events: number }
}

interface TagsTableProps {
    tags: TagItem[]
}

export function TagsTable({ tags }: TagsTableProps) {
    if (tags.length === 0)
        return <p className="text-sm text-muted-foreground py-8 text-center">No hay tags creados.</p>

    return (
        <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
                <div
                    key={tag.id}
                    className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:shadow-sm hover:border-primary/20"
                >
                    <Tag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                        <p className="font-medium text-sm">{tag.name}</p>
                        <code className="text-[10px] text-muted-foreground">{tag.slug}</code>
                    </div>
                    <div className="flex gap-1.5 ml-2">
                        <Badge variant="secondary" className="text-[10px] tabular-nums">
                            {tag._count.articles} art.
                        </Badge>
                        <Badge variant="outline" className="text-[10px] tabular-nums">
                            {tag._count.events} ev.
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    )
}
