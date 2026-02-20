import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
    return (
        <div className="w-full h-full space-y-4 py-4 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px] bg-white/10" />
                    <Skeleton className="h-4 w-[150px] bg-white/5" />
                </div>
                <Skeleton className="h-9 w-[120px] bg-white/10" />
            </div>

            {/* Content skeleton blocks (cards or table) */}
            <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] w-full rounded-xl bg-white/5" />
                ))}
            </div>

            {/* Main table area skeleton */}
            <div className="mt-8 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-full rouned-md bg-white/5" />
                    </div>
                ))}
            </div>
        </div>
    )
}
