import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { UsersTable } from './_components/users-table'
import { InviteUserSheet } from './_components/invite-user-sheet'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">{members.length} miembro(s) en la organización.</p>
        </div>
        <InviteUserSheet orgSlug={orgSlug}>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar usuario
          </Button>
        </InviteUserSheet>
      </div>
      <UsersTable members={members} orgSlug={orgSlug} currentUserId={ctx.userId} />
    </div>
  )
}
