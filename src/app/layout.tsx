import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { LenisProvider } from '@/components/providers/lenis-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Victoria Highlanders',
  description: 'Plataforma de gestión del club',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950`} suppressHydrationWarning>
        <LenisProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </LenisProvider>
      </body>
    </html>
  )
}
