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
  status: string
  userId: string
  createdAt: Date
  user: {
    email: string
    fullName: string
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

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  ACTIVE: { label: 'Activo', variant: 'default' },
  INACTIVE: { label: 'Inactivo', variant: 'secondary' },
  PENDING: { label: 'Pendiente', variant: 'outline' },
}

export function UsersTable({ members, orgSlug, currentUserId }: UsersTableProps) {
  const { execute: deactivate, isPending } = useAction(deactivateMemberAction, {
    onSuccess: () => toast.success('Miembro desactivado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al desactivar.'),
  })

  if (members.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">No hay miembros aún.</p>

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="hidden md:table-cell">Desde</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const displayName = member.user.fullName || member.user.email
              const isSelf = member.userId === currentUserId
              const statusInfo = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.PENDING

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(member.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {!isSelf && member.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive whitespace-nowrap"
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
    </div>
  )
}
