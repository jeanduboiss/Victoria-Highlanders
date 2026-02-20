import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Victoria Highlanders | Acceso',
  description: 'Inicia sesión en la plataforma de gestión del club',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#0a0a0a] relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.07),transparent_60%)]" />
      </div>

      <div className="w-full max-w-[950px] relative z-10 flex flex-col lg:flex-row min-h-[580px] rounded-2xl overflow-hidden shadow-2xl border border-white/5">

        <div className="hidden lg:block w-[48%] relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=85"
            alt="Victoria Highlanders"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mb-2 inline-block bg-gold px-2 py-0.5">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-black">League 1 BC</span>
            </div>
            <p className="font-oswald text-[28px] font-bold uppercase leading-tight text-white">
              Victoria<br />Highlanders FC
            </p>
            <p className="mt-1 font-sans text-[12px] text-white/50">
              Plataforma de gestión deportiva
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[52%] bg-[#0e0e0e] p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
          {children}
        </div>

      </div>
    </div>
  )
}
