'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPlayerSchema } from '@/domains/sports/schemas/squad.schema'
import { createPlayerAction } from '@/domains/sports/actions/squad.actions'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type FormValues = z.infer<typeof createPlayerSchema>

interface Team {
  id: string
  name: string
  category: string
}

interface Season {
  id: string
  name: string
  isCurrent: boolean
  isArchived: boolean
}

interface CreatePlayerSheetProps {
  orgSlug: string
  teams?: Team[]
  seasons?: Season[]
  children: React.ReactNode
}

const POSITIONS = [
  { value: 'GOALKEEPER', label: 'Portero' },
  { value: 'DEFENDER', label: 'Defensa' },
  { value: 'MIDFIELDER', label: 'Centrocampista' },
  { value: 'FORWARD', label: 'Delantero' },
] as const

const CATEGORY_LABELS: Record<string, string> = {
  FIRST_TEAM: 'Primer equipo',
  RESERVE: 'Reserva',
  U23: 'Sub-23',
  U20: 'Sub-20',
  U18: 'Sub-18',
  U16: 'Sub-16',
  U14: 'Sub-14',
  U12: 'Sub-12',
  WOMEN: 'Femenino',
  FUTSAL: 'Futsal',
}

export function CreatePlayerSheet({ orgSlug, teams = [], seasons = [], children }: CreatePlayerSheetProps) {
  const [open, setOpen] = useState(false)

  const activeSeasons = seasons.filter((s) => !s.isArchived)
  const defaultSeason = activeSeasons.find((s) => s.isCurrent)

  const form = useForm<FormValues>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      orgSlug,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationalities: [{ country: '', isPrimary: true }],
      teamId: undefined,
      seasonId: defaultSeason?.id ?? undefined,
    },
  })

  const { execute, isPending } = useAction(createPlayerAction, {
    onSuccess: () => {
      toast.success('Jugador registrado correctamente.')
      form.reset({
        orgSlug,
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationalities: [{ country: '', isPrimary: true }],
        teamId: undefined,
        seasonId: defaultSeason?.id ?? undefined,
      })
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Error al crear el jugador.')
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
          <SheetTitle>Nuevo jugador</SheetTitle>
          <SheetDescription>Registra un jugador en el pool de la organización.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
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
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posición</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona posición" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POSITIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecciona fecha de nacimiento"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationalities.0.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nacionalidad principal (código ISO, ej: GB)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: GB, CL, AR" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team assignment section */}
            {teams.length > 0 && (
              <>
                <Separator className="my-2" />
                <p className="text-sm font-medium text-muted-foreground">Asignar a equipo (opcional)</p>
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin equipo asignado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                ({CATEGORY_LABELS[team.category] ?? team.category})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch('teamId') && activeSeasons.length > 1 && (
                  <FormField
                    control={form.control}
                    name="seasonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporada</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona temporada" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activeSeasons.map((season) => (
                              <SelectItem key={season.id} value={season.id}>
                                {season.name}
                                {season.isCurrent && (
                                  <span className="ml-1.5 text-xs text-emerald-500">(actual)</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Crear jugador'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
