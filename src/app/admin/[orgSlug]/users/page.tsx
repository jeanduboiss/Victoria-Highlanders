import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { UsersTable } from './_components/users-table'
import { InviteUserSheet } from './_components/invite-user-sheet'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function UsersPage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'users', 'read').catch(() => redirect('/login'))

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: ctx.organizationId },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title="Usuarios"
        description={`${members.length} miembro${members.length !== 1 ? 's' : ''} en la organización`}
        action={
          <InviteUserSheet orgSlug={orgSlug}>
            <Button size="sm" className="cursor-pointer">
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar usuario
            </Button>
          </InviteUserSheet>
        }
      />
      <UsersTable members={members} orgSlug={orgSlug} currentUserId={ctx.userId} />
    </div>
  )
}
