import { SiteTopbar } from '@/components/site/navbar/site-topbar'
import { SiteNavbar } from '@/components/site/navbar/site-navbar'
import { SiteFooter } from '@/components/site/footer/site-footer'
import { getPublicNavItems } from '@/domains/site/queries/public-pages.query'
import { getLocale } from 'next-intl/server'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'
  const [navItems, locale] = await Promise.all([
    getPublicNavItems(slug),
    getLocale(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <SiteTopbar />
      <SiteNavbar navItems={navItems} locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
