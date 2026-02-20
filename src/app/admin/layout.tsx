import { ThemeProvider } from '@/components/admin/theme/theme-provider'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
