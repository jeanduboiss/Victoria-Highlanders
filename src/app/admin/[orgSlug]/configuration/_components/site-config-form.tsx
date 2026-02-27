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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const schema = z.object({
  orgSlug: z.string(),
  siteName: z.string().min(1).max(100),
  tagline: z.string().max(200).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  seoDefaultTitle: z.string().max(60).optional(),
  seoDefaultDescription: z.string().max(160).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialYoutube: z.string().url().optional().or(z.literal('')),
  socialTiktok: z.string().url().optional().or(z.literal('')),
  socialLinkedin: z.string().url().optional().or(z.literal('')),
  hideResults: z.boolean().optional(),
  hideStandings: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface SiteConfig {
  siteName: string
  tagline: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  seoDefaultTitle: string | null
  seoDefaultDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  socialTwitter: string | null
  socialInstagram: string | null
  socialFacebook: string | null
  socialYoutube: string | null
  socialTiktok: string | null
  socialLinkedin: string | null
  hideResults: boolean
  hideStandings: boolean
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
      siteName: config?.siteName ?? '',
      tagline: config?.tagline ?? '',
      primaryColor: config?.primaryColor ?? '#000000',
      secondaryColor: config?.secondaryColor ?? '#ffffff',
      accentColor: config?.accentColor ?? '#3b82f6',
      seoDefaultTitle: config?.seoDefaultTitle ?? '',
      seoDefaultDescription: config?.seoDefaultDescription ?? '',
      contactEmail: config?.contactEmail ?? '',
      contactPhone: config?.contactPhone ?? '',
      address: config?.address ?? '',
      socialTwitter: config?.socialTwitter ?? '',
      socialInstagram: config?.socialInstagram ?? '',
      socialFacebook: config?.socialFacebook ?? '',
      socialYoutube: config?.socialYoutube ?? '',
      socialTiktok: config?.socialTiktok ?? '',
      socialLinkedin: config?.socialLinkedin ?? '',
      hideResults: config?.hideResults ?? false,
      hideStandings: config?.hideStandings ?? false,
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
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del sitio</FormLabel>
                  <FormControl>
                    <Input placeholder="Victoria Highlanders FC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan / Tagline</FormLabel>
                  <FormControl>
                    <Input placeholder="Official Sports Management Platform" {...field} />
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
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (250) 000-0000" {...field} />
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
          <h2 className="text-base font-semibold">Ajustes de visibilidad</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hideResults"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Ocultar Resultados
                    </FormLabel>
                    <FormDescription>
                      Ocultará la visualización de resultados deportivos en el sitio público.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideStandings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Ocultar Tabla de Posiciones
                    </FormLabel>
                    <FormDescription>
                      Ocultará cualquier sección referida a la tabla de la liga en el sitio.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
            name="seoDefaultTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta título (SEO)</FormLabel>
                <FormControl>
                  <Input placeholder="Victoria Highlanders FC — Sitio oficial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seoDefaultDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta descripción (SEO)</FormLabel>
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
