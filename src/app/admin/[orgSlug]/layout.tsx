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
    <SidebarProvider defaultOpen={sidebarOpen ?? true} className="bg-muted/40 dark:bg-zinc-950">
      <AdminSidebar orgSlug={orgSlug} orgName={org.name} />
      <SidebarInset>
        <AdminTopbar
          userId={ctx.userId}
          userEmail={ctx.email}
          userRole={ctx.role}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
