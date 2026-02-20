import { SiteTopbar } from '@/components/site/navbar/site-topbar'
import { SiteNavbar } from '@/components/site/navbar/site-navbar'
import { SiteFooter } from '@/components/site/footer/site-footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <SiteTopbar />
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
