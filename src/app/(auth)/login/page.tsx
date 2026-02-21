import { LoginForm } from './_components/login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-11 shrink-0 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-sm">
            <svg viewBox="0 0 32 32" fill="none" className="size-6" aria-hidden>
              <path d="M16 3L4 8v8c0 6.627 5.12 11.5 12 13 6.88-1.5 12-6.373 12-13V8L16 3Z" fill="#D4AF37" fillOpacity=".15" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M11 16l3.5 3.5L21 13" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-oswald text-[22px] font-bold uppercase tracking-tight text-white leading-none">
              Victoria <span className="text-[#D4AF37]">Highlanders</span>
            </h1>
            <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-white/35 mt-0.5">
              FC — League 1 BC
            </p>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-white/55 text-[13px] leading-relaxed">
            Accede a la plataforma de gestión deportiva del club.
          </p>
        </div>
      </div>

      <LoginForm />
    </div>
  )
}
