'use client'

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="font-oswald text-xl font-bold uppercase text-white">Algo salió mal</p>
      <button
        onClick={reset}
        className="border border-[#D4AF37] px-6 py-2 font-sans text-sm uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
      >
        Reintentar
      </button>
    </div>
  )
}
