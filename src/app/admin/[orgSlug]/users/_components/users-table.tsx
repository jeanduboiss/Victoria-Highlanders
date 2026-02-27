'use client'

import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deactivateMemberAction,
  approveUserAction,
  activateMemberAction,
  removeMemberAction,
  resendInviteAction,
  updateMemberRoleAction,
} from '@/domains/iam/actions/users.actions'
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

const APPROVABLE_ROLES = [
  { value: 'CLUB_ADMIN', label: 'Club Admin' },
  { value: 'CLUB_MANAGER', label: 'Manager' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
] as const

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  ACTIVE: { label: 'Activo', variant: 'default' },
  INACTIVE: { label: 'Inactivo', variant: 'secondary' },
  PENDING: { label: 'Pendiente', variant: 'outline' },
}

export function UsersTable({ members, orgSlug, currentUserId }: UsersTableProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('VIEWER')

  const { execute: deactivate, isPending: isDeactivating } = useAction(deactivateMemberAction, {
    onSuccess: () => toast.success('Miembro desactivado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al desactivar.'),
  })

  const { execute: activate, isPending: isActivating } = useAction(activateMemberAction, {
    onSuccess: () => toast.success('Miembro reactivado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al activar.'),
  })

  const { execute: remove, isPending: isRemoving } = useAction(removeMemberAction, {
    onSuccess: () => toast.success('Miembro eliminado de la organización.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar.'),
  })

  const { execute: resend, isPending: isResending } = useAction(resendInviteAction, {
    onSuccess: ({ data }) => {
      if (data?.emailSent) {
        toast.success('Invitación reenviada.')
      } else {
        toast.info(`Email no disponible. Link: ${data?.inviteLink}`)
      }
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al reenviar.'),
  })

  const { execute: updateRole } = useAction(updateMemberRoleAction, {
    onSuccess: () => toast.success('Rol actualizado.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al cambiar rol.'),
  })

  const { execute: approve, isPending: isApproving } = useAction(approveUserAction, {
    onSuccess: () => {
      toast.success('Usuario aprobado correctamente.')
      setApprovingId(null)
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al aprobar.'),
  })

  if (members.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">No hay miembros aún.</p>

  const approvingMember = members.find((m) => m.id === approvingId)

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Desde</TableHead>
                <TableHead className="text-right pr-4">Acciones</TableHead>
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
                      {!isSelf && member.status === 'ACTIVE' ? (
                        <Select
                          defaultValue={member.role}
                          onValueChange={(role) =>
                            updateRole({ orgSlug, memberId: member.id, role: role as 'CLUB_ADMIN' | 'CLUB_MANAGER' | 'EDITOR' | 'VIEWER' })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPROVABLE_ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </Badge>
                      )}
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isSelf && member.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive whitespace-nowrap"
                            disabled={isDeactivating}
                            onClick={() => deactivate({ orgSlug, memberId: member.id })}
                          >
                            Desactivar
                          </Button>
                        )}

                        {member.status === 'INACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-500 whitespace-nowrap"
                            disabled={isActivating}
                            onClick={() => activate({ orgSlug, memberId: member.id })}
                          >
                            Activar
                          </Button>
                        )}

                        {member.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-500 hover:text-amber-400 whitespace-nowrap"
                              onClick={() => {
                                setSelectedRole('VIEWER')
                                setApprovingId(member.id)
                              }}
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="whitespace-nowrap"
                              disabled={isResending}
                              onClick={() => resend({ orgSlug, memberId: member.id })}
                            >
                              Reenviar
                            </Button>
                          </>
                        )}

                        {!isSelf && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive px-2"
                                disabled={isRemoving}
                              >
                                ✕
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {displayName} será removido de la organización. Esta acción no puede deshacerse.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => remove({ orgSlug, memberId: member.id })}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!approvingId} onOpenChange={(v: boolean) => { if (!v) setApprovingId(null) }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Aprobar usuario</DialogTitle>
            <DialogDescription>
              {approvingMember?.user.fullName || approvingMember?.user.email} tendrá acceso al dashboard con el rol que elijas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPROVABLE_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingId(null)}>
              Cancelar
            </Button>
            <Button
              disabled={isApproving}
              onClick={() => {
                if (!approvingId) return
                approve({ orgSlug, memberId: approvingId, role: selectedRole as 'CLUB_ADMIN' | 'CLUB_MANAGER' | 'EDITOR' | 'VIEWER' })
              }}
            >
              {isApproving ? 'Aprobando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
