'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { transferPlayerSchema } from '@/domains/sports/schemas/squad.schema'
import { transferPlayerAction } from '@/domains/sports/actions/squad.actions'
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
import { toast } from 'sonner'
import { ArrowRightLeft } from 'lucide-react'

type FormValues = z.infer<typeof transferPlayerSchema>

interface Team {
    id: string
    name: string
    category: string
}

interface TransferPlayerSheetProps {
    orgSlug: string
    currentRecordId: string
    currentTeamName: string
    teams: Team[]
    children: React.ReactNode
}

export function TransferPlayerSheet({
    orgSlug,
    currentRecordId,
    currentTeamName,
    teams,
    children,
}: TransferPlayerSheetProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(transferPlayerSchema),
        defaultValues: {
            orgSlug,
            currentRecordId,
            newTeamId: '',
            transferDate: new Date().toISOString().split('T')[0],
        },
    })

    const { execute, isPending } = useAction(transferPlayerAction, {
        onSuccess: () => {
            toast.success('Transferencia realizada correctamente.')
            form.reset({ orgSlug, currentRecordId, transferDate: new Date().toISOString().split('T')[0] })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? 'Error al transferir jugador.')
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
                    <SheetTitle>Transferir jugador</SheetTitle>
                    <SheetDescription>
                        Mover de <span className="font-medium">{currentTeamName}</span> a otro equipo.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        {/* Info actual */}
                        <div className="rounded-lg border border-dashed p-3 space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Equipo actual</p>
                            <p className="text-sm font-medium">{currentTeamName}</p>
                        </div>

                        <div className="flex items-center justify-center">
                            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <FormField
                            control={form.control}
                            name="newTeamId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipo destino</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona equipo destino" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teams.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    {t.name}
                                                    <span className="text-muted-foreground ml-2 text-xs">({t.category})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="jerseyNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nuevo dorsal</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={99}
                                                placeholder="Nro"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="transferDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de transferencia</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Fecha de transferencia"
                                                fromYear={2000}
                                                toYear={2050}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? 'Procesando...' : 'Confirmar transferencia'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
