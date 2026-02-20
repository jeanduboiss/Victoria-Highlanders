import { redirect } from 'next/navigation'
import { requireSession, getUserPrimaryOrg } from '@/lib/auth/session'

export default async function AdminIndexPage() {
    // Verificamos que el usuario esté autenticado
    const session = await requireSession()

    // Obtenemos su organización principal
    const org = await getUserPrimaryOrg(session.userId)

    if (!org) {
        // Si no tiene organización, lo enviamos de vuelta con un error
        redirect('/login?error=no_organization')
    }

    // Redirigimos al dashboard de su organización
    redirect(`/admin/${org.slug}`)
}
