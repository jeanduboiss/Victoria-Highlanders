'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createPendingMemberAction } from '@/domains/iam/actions/users.actions'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message || 'Error al registrarse. Inténtalo de nuevo.')
      } else {
        await createPendingMemberAction({})
        router.push('/pending')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Correo o contraseña incorrectos.')
      } else {
        toast.success('Sesión iniciada correctamente.')
        router.push('/admin')
      }
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-white/80 text-sm font-medium">
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@victoriafc.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="bg-white/[0.07] border-white/15 text-white placeholder:text-white/25 h-12 rounded-lg focus-visible:ring-[#D4AF37]/40 focus-visible:border-[#D4AF37]/50 transition-colors"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-white/80 text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            className="bg-white/[0.07] border-white/15 text-white placeholder:text-white/25 h-12 pr-10 rounded-lg focus-visible:ring-[#D4AF37]/40 focus-visible:border-[#D4AF37]/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-12 font-semibold text-sm cursor-pointer rounded-lg bg-[#D4AF37] hover:bg-[#C4A052] text-black transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
          </>
        ) : (
          isRegistering ? 'Crear cuenta' : 'Iniciar sesión'
        )}
      </Button>

      {/* Toggle login / register */}
      <p className="text-center text-sm text-white/40">
        {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-[#D4AF37] hover:text-[#E8D07A] font-semibold transition-colors cursor-pointer"
        >
          {isRegistering ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </p>

      {/* Forgot password */}
      {!isRegistering && (
        <p className="text-center">
          <Link
            href="/login/forgot-password"
            className="text-xs text-white/35 hover:text-white/60 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      )}
    </form>
  )
}
