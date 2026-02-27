'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { scheduleMatchSchema } from '@/domains/sports/schemas/match.schema'
import { scheduleMatchAction } from '@/domains/sports/actions/match.actions'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type FormValues = z.infer<typeof scheduleMatchSchema>

interface Season {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  isExternal: boolean
}

interface ScheduleMatchSheetProps {
  orgSlug: string
  seasons: Season[]
  teams: Team[]
  children: React.ReactNode
}

export function ScheduleMatchSheet({ orgSlug, seasons, teams, children }: ScheduleMatchSheetProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(scheduleMatchSchema),
    defaultValues: {
      orgSlug,
      homeTeamId: '',
      awayTeamId: '',
      matchDate: '',
      competitionName: '',
      isHomeGame: true,
    },
  })

  const { execute, isPending } = useAction(scheduleMatchAction, {
    onSuccess: () => {
      toast.success('Partido programado correctamente.')
      form.reset()
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Error al programar el partido.')
    },
  })

  function onSubmit(values: FormValues) {
    execute(values)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:w-[440px] md:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Programar partido</SheetTitle>
          <SheetDescription>Completa los datos del nuevo partido.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="seasonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporada</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona temporada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seasons.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homeTeamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo local</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo local" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} {t.isExternal ? '(Externo)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awayTeamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo visitante</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo visitante" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} {t.isExternal ? '(Externo)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matchDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y hora</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecciona fecha del partido"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competitionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competición</FormLabel>
                  <FormControl>
                    <Input placeholder="Liga, Copa..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Programar'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
