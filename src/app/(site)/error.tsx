'use client'

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="font-oswald text-2xl font-bold uppercase text-white">Algo salió mal</p>
      <button
        onClick={reset}
        className="border border-gold px-6 py-2 font-sans text-sm uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all"
      >
        Reintentar
      </button>
    </div>
  )
}
