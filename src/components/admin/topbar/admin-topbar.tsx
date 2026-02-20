import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminBreadcrumbs } from './breadcrumbs'
import { ThemeToggle } from '../theme/theme-toggle'
import { UserNav } from './user-nav'

interface AdminTopbarProps {
  userId: string
  userEmail: string
  userRole: string
}

export function AdminTopbar({ userId, userEmail, userRole }: AdminTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 bg-transparent px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <AdminBreadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserNav userEmail={userEmail} userRole={userRole} />
      </div>
    </header>
  )
}
