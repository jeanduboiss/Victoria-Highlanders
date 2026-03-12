'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTagSchema } from '@/domains/editorial/schemas/article.schema'
import { createTagAction } from '@/domains/editorial/actions/article.actions'
import { useTranslations } from 'next-intl'
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
import { toast } from 'sonner'

type FormValues = z.infer<typeof createTagSchema>

interface CreateTagSheetProps {
    orgSlug: string
    children: React.ReactNode
}

export function CreateTagSheet({ orgSlug, children }: CreateTagSheetProps) {
    const t = useTranslations('admin.pages.editorial.newTagSheet')
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(createTagSchema),
        defaultValues: { orgSlug, name: '' },
    })

    const { execute, isPending } = useAction(createTagAction, {
        onSuccess: () => {
            toast.success(t('success'))
            form.reset({ orgSlug, name: '' })
            setOpen(false)
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? t('error'))
        },
    })

    function onSubmit(values: FormValues) {
        execute(values)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:w-[440px] md:w-[540px]">
                <SheetHeader>
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>{t('desc')}</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>{t('name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                {t('cancel')}
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? t('saving') : t('create')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
