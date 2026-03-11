import { type LucideIcon } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number
  description?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  badgeText?: string
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  badgeText,
}: KpiCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={cn('flex items-center justify-center rounded-lg size-9 shrink-0', iconBg)}>
          <Icon className={cn('size-4', iconColor)} />
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {badgeText || 'Total'}
        </span>
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          <NumberTicker value={value} />
        </div>
        <p className="text-sm font-medium text-foreground mt-0.5">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
