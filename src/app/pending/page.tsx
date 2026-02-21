import { requireSession } from '@/lib/auth/session'
import { SignOutButton } from './_components/sign-out-button'
import { Check, Lock } from 'lucide-react'

export default async function PendingPage() {
  await requireSession()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.09),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_110%,rgba(212,175,55,0.04),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        <div className="mb-10 text-center">
          <span className="text-lg font-bold tracking-tight text-white">
            Victoria <span className="text-[#D4AF37]">Highlanders</span>
          </span>
        </div>

        <div className="w-full bg-[#111111] border border-white/[0.06] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

          <div className="flex justify-center mb-7">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full bg-[#D4AF37]/5 animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="absolute w-14 h-14 rounded-full bg-[#D4AF37]/8 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-[18px] font-bold text-white mb-2 tracking-tight">
              Solicitud enviada
            </h1>
            <p className="text-sm text-white/40 leading-relaxed">
              Tu cuenta fue creada exitosamente. El administrador del club revisará tu solicitud y te habilitará el acceso.
            </p>
          </div>

          <div className="space-y-0">

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                </div>
                <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-white/5 my-1.5" />
              </div>
              <div className="pt-1 pb-7">
                <p className="text-sm font-medium text-white">Cuenta creada</p>
                <p className="text-xs text-white/35 mt-0.5">Tu usuario fue registrado exitosamente</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center shrink-0 animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                </div>
                <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-white/[0.03] my-1.5" />
              </div>
              <div className="pt-1 pb-7">
                <p className="text-sm font-semibold text-[#D4AF37]">Esperando aprobación</p>
                <p className="text-xs text-white/35 mt-0.5">El administrador está revisando tu solicitud</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/8 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-white/20" strokeWidth={2} />
                </div>
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium text-white/25">Acceso al dashboard</p>
                <p className="text-xs text-white/18 mt-0.5">Disponible una vez aprobado</p>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-7">
          <SignOutButton />
        </div>

      </div>
    </div>
  )
}
