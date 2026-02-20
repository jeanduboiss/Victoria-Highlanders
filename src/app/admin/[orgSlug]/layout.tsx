import { redirect } from 'next/navigation'
import { requireOrgAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
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

  // Verify session and org access; redirects to /login if not authenticated
  const ctx = await requireOrgAccess(orgSlug).catch(() => redirect('/login'))

  // Fetch org name for sidebar header
  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    select: { name: true },
  })

  if (!org) redirect('/login')

  // Read sidebar state from cookie for persistence
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get('sidebar:state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={sidebarOpen ?? true} className="bg-zinc-950">
      <AdminSidebar orgSlug={orgSlug} orgName={org.name} />
      <SidebarInset className="bg-transparent border-0">
        <div className="h-svh overflow-hidden lg:p-2 w-full">
          <div className="lg:border lg:border-white/10 lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-zinc-900/50 h-full w-full">
            <AdminTopbar
              userId={ctx.userId}
              userEmail={ctx.email}
              userRole={ctx.role}
            />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
