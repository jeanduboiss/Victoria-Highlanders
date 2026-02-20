'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Signup error:', error)
        toast.error(error.message || 'Error al registrarse. Inténtalo de nuevo.')
      } else {
        toast.success('Registro exitoso. Revisa tu correo o entra si no hay validación requerida.')
        if (process.env.NODE_ENV === 'development') {
          // auto-redirect in dev if emails are turned off
          router.push('/admin')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('Login error:', error)
        toast.error('Correo o contraseña incorrectos.')
      } else {
        toast.success('Inicio de sesión exitoso.')
        router.push('/admin')
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80 font-normal">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="johndoe@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="rounded-full bg-[#111111] border-none text-white h-12 px-6 focus-visible:ring-orange-500/50 placeholder:text-white/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80 font-normal">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegistering ? "new-password" : "current-password"}
            className="rounded-full bg-[#111111] border-none text-white h-12 px-6 focus-visible:ring-orange-500/50 placeholder:text-white/20"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer hover:text-white transition-colors">
            <input type="checkbox" className="rounded border-white/10 bg-black/50 w-4 h-4 accent-orange-400" />
            Keep me logged in
          </label>

          {!isRegistering && (
            <Link
              href="/login/forgot-password"
              className="text-sm text-white/60 hover:text-white hover:underline transition-colors"
              tabIndex={-1}
            >
              Forgot Password
            </Link>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded-full h-12 bg-gradient-to-r from-[#FF7A59] to-[#FF5E5E] hover:opacity-90 text-white font-medium text-base shadow-[0_0_20px_rgba(255,122,89,0.3)] transition-all border-none"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (isRegistering ? 'Sign up' : 'Sign in')}
        </Button>
      </form>

      <div className="pt-4 flex flex-col items-center gap-6">
        <div className="flex gap-4">
          <button type="button" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </button>
          <button type="button" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform text-black">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.699-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
          <button type="button" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073C24 5.452 18.627 0 12 0 5.373 0 0 5.452 0 12.073c0 5.922 4.316 10.832 9.943 11.916V15.56H6.947v-3.487h2.996v-2.66c0-2.95 1.758-4.576 4.444-4.576 1.286 0 2.634.228 2.634.228v2.895h-1.485c-1.463 0-1.92.906-1.92 1.838v2.275h3.255l-.52 3.487h-2.735v8.429C19.684 22.905 24 17.995 24 12.073z" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-white/60 hover:text-white hover:underline text-sm transition-colors"
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
