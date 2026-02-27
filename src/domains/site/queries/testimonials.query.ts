import { prisma } from '@/lib/prisma/client'

export async function getTestimonialsByOrg(organizationId: string) {
  return prisma.testimonial.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublishedTestimonialsBySlug(orgSlug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) return []

  return prisma.testimonial.findMany({
    where: { organizationId: org.id, isPublished: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  })
}
