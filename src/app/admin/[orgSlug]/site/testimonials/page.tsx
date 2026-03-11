import { requirePermission } from '@/lib/auth'
import {  redirect  } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getTestimonialsByOrg } from '@/domains/site/queries/testimonials.query'
import { TestimonialsTable } from './_components/testimonials-table'
import { TestimonialSheet } from './_components/testimonial-sheet'
import { GoogleReviewsPlaceholder } from './_components/google-reviews-placeholder'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  params: Promise<{ orgSlug: string }>
}

export default async function TestimonialsPage({ params }: Props) {
  const t = await getTranslations('admin.pages')
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'testimonials', 'read').catch(() => redirect('/login'))

  const testimonials = await getTestimonialsByOrg(ctx.organizationId)
  const published = testimonials.filter((t) => t.isPublished).length

  return (
    <div className="space-y-6 py-4">
      <PageHeader
        title={t('site.testimonials')}
        description={t('site.testimonialsCount', { count: testimonials.length })}
        action={
          <TestimonialSheet orgSlug={orgSlug}>
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {t('site.newTestimonial')}
            </Button>
          </TestimonialSheet>
        }
      />

      <TestimonialsTable testimonials={testimonials} orgSlug={orgSlug} />

      <GoogleReviewsPlaceholder />
    </div>
  )
}
