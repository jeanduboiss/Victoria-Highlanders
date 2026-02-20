import { type LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
}

export function KpiCard({ title, value, description, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="bg-muted/50 dark:bg-neutral-800/50 border rounded-lg p-4">
        <span className="text-2xl sm:text-3xl font-medium tracking-tight">{value}</span>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
