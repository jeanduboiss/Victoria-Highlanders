'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAction } from 'next-safe-action/hooks'
import { updateSiteConfigAction } from '@/domains/configuration/actions/site-config.actions'
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
import { toast } from 'sonner'

const schema = z.object({
  orgSlug: z.string(),
  clubName: z.string().min(1).max(100).optional(),
  clubShortName: z.string().max(10).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
})

type FormValues = z.infer<typeof schema>

interface SiteConfig {
  clubName: string | null
  clubShortName: string | null
  primaryColor: string | null
  secondaryColor: string | null
  metaTitle: string | null
  metaDescription: string | null
  contactEmail: string | null
  foundedYear: number | null
}

interface SiteConfigFormProps {
  orgSlug: string
  config: SiteConfig | null
}

export function SiteConfigForm({ orgSlug, config }: SiteConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orgSlug,
      clubName: config?.clubName ?? '',
      clubShortName: config?.clubShortName ?? '',
      primaryColor: config?.primaryColor ?? '#000000',
      secondaryColor: config?.secondaryColor ?? '#ffffff',
      metaTitle: config?.metaTitle ?? '',
      metaDescription: config?.metaDescription ?? '',
      contactEmail: config?.contactEmail ?? '',
      foundedYear: config?.foundedYear ?? undefined,
    },
  })

  const { execute, isPending } = useAction(updateSiteConfigAction, {
    onSuccess: () => toast.success('Configuración guardada.'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar.'),
  })

  function onSubmit(values: FormValues) {
    execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Información del club</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clubName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del club</FormLabel>
                  <FormControl>
                    <Input placeholder="Victoria Highlanders" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clubShortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre corto</FormLabel>
                  <FormControl>
                    <Input placeholder="VH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contacto</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="info@club.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foundedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año de fundación</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1990"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold">Colores</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color primario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <input type="color" {...field} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input {...field} placeholder="#000000" className="font-mono" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color secundario</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <input type="color" {...field} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input {...field} placeholder="#ffffff" className="font-mono" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold">SEO</h2>
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta título</FormLabel>
                <FormControl>
                  <Input placeholder="Victoria Highlanders FC — Sitio oficial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Sitio oficial del Victoria Highlanders FC..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Form>
  )
}
