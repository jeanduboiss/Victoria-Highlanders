'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/login/update-password`,
        })

        setIsLoading(false)

        if (error) {
            console.error('Reset password error:', error)
            toast.error('Error al enviar el correo. Verifica tu dirección e inténtalo de nuevo.')
            return
        }

        setIsSent(true)
    }

    if (isSent) {
        return (
            <div className="text-center space-y-4 rounded-lg border p-6">
                <p className="text-sm font-medium">Revisa tu correo</p>
                <p className="text-sm text-muted-foreground">
                    Hemos enviado instrucciones a <strong>{email}</strong> para que restablezcas tu contraseña.
                </p>
                <div className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Volver al inicio de sesión</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>
            </form>
            <div className="text-center text-sm">
                <Link href="/login" className="text-muted-foreground hover:text-primary hover:underline">
                    Volver al inicio de sesión
                </Link>
            </div>
        </div>
    )
}
