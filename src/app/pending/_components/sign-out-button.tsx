'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-white/30 hover:text-white/55 transition-colors duration-200"
    >
      Cerrar sesión
    </button>
  )
}
