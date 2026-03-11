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
import { useTranslations } from 'next-intl'

export function RegisterForm() {
    const t = useTranslations('auth.register')
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            toast.error(error.message || t('errorRegister'))
        } else {
            await createPendingMemberAction({})
            router.push('/pending')
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2.5">
                <label htmlFor="email" className="block text-white/70 text-[13px] uppercase tracking-wider font-semibold">
                    {t('emailLabel')}
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-12 rounded-none border-b focus-visible:ring-0 focus-visible:border-white transition-colors"
                />
            </div>

            {/* Password */}
            <div className="space-y-2.5">
                <label htmlFor="password" className="block text-white/70 text-[13px] uppercase tracking-wider font-semibold">
                    {t('passwordLabel')}
                </label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-12 pr-10 rounded-none border-b focus-visible:ring-0 focus-visible:border-white transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors cursor-pointer"
                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                className="w-full h-14 font-oswald tracking-widest uppercase text-xs cursor-pointer rounded-none bg-white hover:bg-white/90 text-black transition-colors"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {t('creating')}
                    </>
                ) : (
                    t('createAccountBtn')
                )}
            </Button>

            {/* Toggle login */}
            <p className="text-center text-[13px] text-white/40 pt-2">
                {t('haveAccount')}{' '}
                <Link
                    href="/login"
                    className="text-white hover:text-white/80 font-bold uppercase tracking-wider transition-colors cursor-pointer border-b border-white/30 hover:border-white"
                >
                    {t('loginLink')}
                </Link>
            </p>
        </form>
    )
}
