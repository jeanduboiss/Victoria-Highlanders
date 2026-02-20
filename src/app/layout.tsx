import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { LenisProvider } from '@/components/providers/lenis-provider'
import { ThemeProvider } from '@/components/admin/theme/theme-provider'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Victoria Highlanders',
  description: 'Plataforma de gestión del club',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <LenisProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
