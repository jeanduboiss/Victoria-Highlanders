'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateMatchResultSchema } from '@/domains/sports/schemas/match.schema'
import { updateMatchResultAction, updateMatchStatusAction } from '@/domains/sports/actions/match.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
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
import { toast } from 'sonner'
import { Check, Pause, X } from 'lucide-react'

type ResultValues = z.infer<typeof updateMatchResultSchema>

interface UpdateMatchResultFormProps {
    orgSlug: string
    matchId: string
    currentStatus: string
    homeTeamName: string
    awayTeamName: string
}

export function UpdateMatchResultForm({
    orgSlug,
    matchId,
    currentStatus,
    homeTeamName,
    awayTeamName,
}: UpdateMatchResultFormProps) {
    const form = useForm<ResultValues>({
        resolver: zodResolver(updateMatchResultSchema),
        defaultValues: {
            orgSlug,
            matchId,
            homeScore: 0,
            awayScore: 0,
        },
    })

    const { execute: executeResult, isPending: isResultPending } = useAction(updateMatchResultAction, {
        onSuccess: () => toast.success('Resultado actualizado. Estadísticas recalculadas.'),
        onError: ({ error }) => toast.error(error.serverError ?? 'Error al actualizar resultado.'),
    })

    const { execute: executeStatus, isPending: isStatusPending } = useAction(updateMatchStatusAction, {
        onSuccess: () => toast.success('Estado del partido actualizado.'),
        onError: ({ error }) => toast.error(error.serverError ?? 'Error al cambiar estado.'),
    })

    function onSubmitResult(values: ResultValues) {
        executeResult(values)
    }

    function handleStatusChange(status: 'POSTPONED' | 'CANCELLED' | 'ABANDONED') {
        executeStatus({ orgSlug, matchId, status })
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Resultado final</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitResult)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="homeScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground truncate">
                                            {homeTeamName}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                className="text-center text-2xl font-bold h-14"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="awayScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-muted-foreground truncate">
                                            {awayTeamName}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                className="text-center text-2xl font-bold h-14"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isResultPending}>
                            <Check className="mr-2 h-4 w-4" />
                            {isResultPending ? 'Guardando...' : 'Finalizar partido'}
                        </Button>
                    </form>
                </Form>

                <Separator />

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Cambiar estado</p>
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 text-xs" disabled={isStatusPending}>
                                    <Pause className="mr-1.5 h-3 w-3" />
                                    Aplazar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Aplazar este partido?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        El partido se marcará como aplazado. Podrás reprogramarlo más tarde.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('POSTPONED')}>
                                        Confirmar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive" disabled={isStatusPending}>
                                    <X className="mr-1.5 h-3 w-3" />
                                    Cancelar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar este partido?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        El partido se marcará como cancelado permanentemente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Volver</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleStatusChange('CANCELLED')}
                                    >
                                        Confirmar cancelación
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
