/**
 * Next.js Middleware — Route Protection
 * Victoria Highlanders Sports Management Platform
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return response
  }

  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Authorization is deferred to layout.tsx and page.tsx via requireOrgAccess
    // This dramatically speeds up navigation because middleware doesn't hit the DB.
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
  ],
}
