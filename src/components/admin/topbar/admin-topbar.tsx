import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminBreadcrumbs } from './breadcrumbs'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { NotificationsPopover } from './notifications-popover'
import { LanguageSwitcher } from '@/components/site/language-switcher'
import { getLocale } from 'next-intl/server'

interface AdminTopbarProps {
  orgId: string
}

export async function AdminTopbar({ orgId }: AdminTopbarProps) {
  const locale = await getLocale()

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-transparent px-4 w-full min-w-0">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <AdminBreadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <NotificationsPopover orgId={orgId} />
        <LanguageSwitcher currentLocale={locale} variant="admin" />
        <Separator orientation="vertical" className="h-4" />
        <AnimatedThemeToggler className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" />
      </div>
    </header>
  )
}
