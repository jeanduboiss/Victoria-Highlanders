import type { Metadata } from 'next'
import { Montserrat, Oswald, Roboto } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { LenisProvider } from '@/components/providers/lenis-provider'
import { ThemeProvider } from '@/components/admin/theme/theme-provider'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['300', '400', '500', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Victoria Highlanders',
  description: 'Plataforma de gestión del club',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${oswald.variable} ${roboto.variable} font-sans`} suppressHydrationWarning>
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
