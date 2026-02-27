'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function AuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    })

    supabase.auth.getSession().then(({ error }) => {
      if (error) {
        supabase.auth.signOut().finally(() => router.push('/login'))
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
