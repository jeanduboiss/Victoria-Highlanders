'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deactivateMemberAction } from '@/domains/iam/actions/users.actions'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

type Member = {
  id: string
  role: string
  isActive: boolean
  createdAt: Date
  userId: string
  user: {
    email: string
    firstName: string | null
    lastName: string | null
  }
}

interface UsersTableProps {
  members: Member[]
  orgSlug: string
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = {
  CLUB_ADMIN: 'Club Admin',
  CLUB_MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
  SUPER_ADMIN: 'Super Admin',
  LEAGUE_ADMIN: 'Liga Admin',
}

export function UsersTable({ members, orgSlug, currentUserId }: UsersTableProps) {
  const { execute: deactivate, isPending } = useAction(deactivateMemberAction, {
    onSuccess: () => toast.success('Miembro desactivado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al desactivar.'),
  })

  if (members.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">No hay miembros aún.</p>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const displayName =
              member.user.firstName || member.user.lastName
                ? `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim()
                : member.user.email
            const isSelf = member.userId === currentUserId

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {member.isActive ? 'Activo' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  {!isSelf && member.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => deactivate({ orgSlug, memberId: member.id })}
                    >
                      Desactivar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
