import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="font-oswald text-[80px] font-bold leading-none text-white/10">404</p>
      <p className="font-oswald text-2xl font-bold uppercase text-white">Página no encontrada</p>
      <Link
        href="/"
        className="mt-2 border border-[#D4AF37] px-6 py-2 text-sm uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
