import { redirect } from 'next/navigation'
import { requireSession, getUserPrimaryOrg } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'

export default async function AdminIndexPage() {
    const session = await requireSession()
    const org = await getUserPrimaryOrg(session.userId)

    if (!org) {
        const pending = await prisma.organizationMember.findFirst({
            where: { userId: session.userId, status: 'PENDING' },
            select: { id: true },
        })
        redirect(pending ? '/pending' : '/login?error=no_organization')
    }

    redirect(`/admin/${org.slug}`)
}
