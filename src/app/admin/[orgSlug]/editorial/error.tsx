'use client'

export default function SectionError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-lg font-semibold">Algo salió mal</p>
      <button onClick={reset} className="rounded border px-4 py-2 text-sm hover:bg-muted transition-colors">
        Reintentar
      </button>
    </div>
  )
}
