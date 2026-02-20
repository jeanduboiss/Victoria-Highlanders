import { redirect } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar/admin-sidebar'
import { AdminTopbar } from '@/components/admin/topbar/admin-topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'

interface OrgLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}

export default async function OrgAdminLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params

  // requireOrgAccess uses unstable_cache — 0 DB calls after first load
  const ctx = await requireOrgAccess(orgSlug).catch(() => redirect('/login'))

  // Read sidebar state from cookie for persistence
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get('sidebar:state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={sidebarOpen ?? true} className="bg-sidebar">
      <AdminSidebar
        orgSlug={orgSlug}
        orgName={ctx.organizationName}
        userEmail={ctx.email}
        userRole={ctx.role}
      />
      <SidebarInset className="bg-transparent border-0">
        <div className="h-svh overflow-hidden lg:p-2 w-full">
          <div className="lg:border lg:border-border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-background h-full w-full">
            <AdminTopbar orgId={ctx.organizationId} />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
