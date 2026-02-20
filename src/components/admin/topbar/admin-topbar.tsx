import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminBreadcrumbs } from './breadcrumbs'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { NotificationsPopover } from './notifications-popover'

interface AdminTopbarProps {
  orgId: string
}

export async function AdminTopbar({ orgId }: AdminTopbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-transparent px-4 w-full">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <AdminBreadcrumbs />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsPopover orgId={orgId} />
        <AnimatedThemeToggler className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
      </div>
    </header>
  )
}
