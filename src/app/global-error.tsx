'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <button onClick={reset} className="mt-4 border border-white/20 px-6 py-2 text-sm hover:bg-white/10">
          Try again
        </button>
      </body>
    </html>
  )
}
