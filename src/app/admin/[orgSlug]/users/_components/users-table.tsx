'use client'

import { useTranslations, useLocale } from 'next-intl'

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

export function UsersTable({ members, orgSlug, currentUserId }: UsersTableProps) {
  const t = useTranslations('admin.pages.usersTable')
  const locale = useLocale()

  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('VIEWER')

  const roleLabels: Record<string, string> = {
    CLUB_ADMIN: t('roleAdmin'),
    CLUB_MANAGER: t('roleManager'),
    EDITOR: t('roleEditor'),
    VIEWER: t('roleViewer'),
    SUPER_ADMIN: t('roleAdmin'),
    LEAGUE_ADMIN: t('roleAdmin'),
  }

  const approvableRoles = [
    { value: 'CLUB_ADMIN', label: t('roleAdmin') },
    { value: 'CLUB_MANAGER', label: t('roleManager') },
    { value: 'EDITOR', label: t('roleEditor') },
    { value: 'VIEWER', label: t('roleViewer') },
  ] as const

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    ACTIVE: { label: t('statusActive'), variant: 'default' },
    INACTIVE: { label: t('statusInactive'), variant: 'secondary' },
    PENDING: { label: t('statusPending'), variant: 'outline' },
  }

  const { execute: deactivate, isPending: isDeactivating } = useAction(deactivateMemberAction, {
    onSuccess: () => toast.success(t('successDeactivate')),
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const { execute: activate, isPending: isActivating } = useAction(activateMemberAction, {
    onSuccess: () => toast.success(t('successActivate')),
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const { execute: remove, isPending: isRemoving } = useAction(removeMemberAction, {
    onSuccess: () => toast.success(t('successRemove')),
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const { execute: resend, isPending: isResending } = useAction(resendInviteAction, {
    onSuccess: ({ data }) => {
      if (data?.emailSent) {
        toast.success(t('successResend'))
      } else {
        toast.info(t('noEmail', { link: data?.inviteLink ?? '' }))
      }
    },
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const { execute: updateRole } = useAction(updateMemberRoleAction, {
    onSuccess: () => toast.success(t('successUpdateRole')),
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  const { execute: approve, isPending: isApproving } = useAction(approveUserAction, {
    onSuccess: () => {
      toast.success(t('successApprove'))
      setApprovingId(null)
    },
    onError: ({ error }) => toast.error(error.serverError ?? t('error')),
  })

  if (members.length === 0)
    return <p className="text-sm text-muted-foreground py-8 text-center">{t('noMembers')}</p>

  const approvingMember = members.find((m) => m.id === approvingId)

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('status')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('since')}</TableHead>
                <TableHead className="text-right pr-4">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const displayName = member.user.fullName || member.user.email
                const isSelf = member.userId === currentUserId
                const statusInfo = statusConfig[member.status] ?? statusConfig.PENDING

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
                            {approvableRoles.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {roleLabels[member.role] ?? member.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(member.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
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
                            {t('deactivate')}
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
                            {t('activate')}
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
                              {t('approve')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="whitespace-nowrap"
                              disabled={isResending}
                              onClick={() => resend({ orgSlug, memberId: member.id })}
                            >
                              {t('resend')}
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
                                <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('confirmDeleteDesc', { name: displayName })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => remove({ orgSlug, memberId: member.id })}
                                >
                                  {t('delete')}
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
            <DialogTitle>{t('approveTitle')}</DialogTitle>
            <DialogDescription>
              {t('approveDesc', { name: (approvingMember?.user.fullName || approvingMember?.user.email) ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {approvableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingId(null)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={isApproving}
              onClick={() => {
                if (!approvingId) return
                approve({ orgSlug, memberId: approvingId, role: selectedRole as 'CLUB_ADMIN' | 'CLUB_MANAGER' | 'EDITOR' | 'VIEWER' })
              }}
            >
              {isApproving ? t('approving') : t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
