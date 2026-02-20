import { LoginForm } from './_components/login-form'
import { ShieldHalf } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Logo + Branding */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#22c55e]/15">
            <ShieldHalf className="size-5 text-[#22c55e]" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">
            Victoria Highlanders
          </span>
        </div>
        <p className="text-white/50 text-sm">
          Plataforma de gestión deportiva del club
        </p>
      </div>

      {/* Form */}
      <LoginForm />
    </div>
  )
}
