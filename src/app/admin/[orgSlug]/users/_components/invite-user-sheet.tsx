'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { inviteUserAction } from '@/domains/iam/actions/users.actions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({
  orgSlug: z.string(),
  email: z.string().email(),
  role: z.enum(['CLUB_ADMIN', 'CLUB_MANAGER', 'EDITOR', 'VIEWER']),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
})

type FormValues = z.infer<typeof schema>

interface InviteUserSheetProps {
  orgSlug: string
  children: React.ReactNode
}

const ROLES = [
  { value: 'CLUB_ADMIN', label: 'Club Admin' },
  { value: 'CLUB_MANAGER', label: 'Manager' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
] as const

export function InviteUserSheet({ orgSlug, children }: InviteUserSheetProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { orgSlug, email: '', firstName: '', lastName: '', role: 'EDITOR' as const },
  })

  const { execute, isPending } = useAction(inviteUserAction, {
    onSuccess: ({ data }) => {
      toast.success(`Invitación enviada a ${data?.email}.`)
      form.reset({ orgSlug, email: '', firstName: '', lastName: '', role: 'EDITOR' })
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Error al enviar la invitación.')
    },
  })

  function onSubmit(values: FormValues) {
    execute(values)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>Invitar usuario</SheetTitle>
          <SheetDescription>
            Se enviará un magic link al correo ingresado.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Enviando...' : 'Invitar'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
