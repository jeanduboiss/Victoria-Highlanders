import { RegisterForm } from './_components/register-form'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function RegisterPage() {
    const t = await getTranslations('auth.register')

    return (
        <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 font-sans text-[12px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t('backToHome')}
                </Link>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center size-12 bg-white/5 border border-white/10 rounded-full">
                        <UserPlus className="size-5 text-white/80" />
                    </div>
                    <div>
                        <h1 className="font-oswald text-[26px] font-bold uppercase tracking-tight text-white leading-none">
                            {t('title')}
                        </h1>
                    </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4">
                    <p className="text-white/55 text-[13px] leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <RegisterForm />
        </div>
    )
}
