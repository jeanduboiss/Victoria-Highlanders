'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export function UpdatePasswordForm() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.')
            return
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.')
            return
        }

        setIsLoading(true)

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        setIsLoading(false)

        if (error) {
            console.error('Update password error:', error)
            toast.error('Hubo un error al actualizar tu contraseña. Es posible que el enlace haya expirado.')
            return
        }

        toast.success('Contraseña actualizada correctamente.')
        router.push('/admin')
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Actualizar contraseña'}
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
