/**
 * Minimal endpoint para que el cliente obtenga el organizationId dado un orgSlug.
 * Usado por el UploadAssetSheet para construir el storage path antes de subir.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  await requireSession().catch(() => {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  })

  const orgSlug = request.nextUrl.searchParams.get('orgSlug')
  if (!orgSlug)
    return NextResponse.json({ error: 'orgSlug required' }, { status: 400 })

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })

  if (!org)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ organizationId: org.id })
}
