export const dynamic = 'force-dynamic'

import { HeroSection } from '@/components/site/sections/hero-section'
import { InfoStripSection } from '@/components/site/sections/info-strip-section'
import { LatestNewsSection } from '@/components/site/sections/latest-news-section'
import { SocialSection } from '@/components/site/sections/social-section'
import { HighlightsTvSection } from '@/components/site/sections/highlights-tv-section'
import { ContactSection } from '@/components/site/sections/contact-section'
import { SponsorsSection } from '@/components/site/sections/sponsors-section'
import { getPublicArticles } from '@/domains/editorial/queries/public-articles.query'
import { getPublicMatchBar } from '@/domains/sports/queries/public-matches.query'

export default async function HomePage() {
  const [articles, matchBar] = await Promise.all([
    getPublicArticles({ limit: 3 }),
    getPublicMatchBar(),
  ])

  const latestArticle = articles[0] ?? null

  return (
    <>
      <HeroSection />
      <InfoStripSection
        latestArticle={latestArticle}
        nextMatch={matchBar.nextMatch}
        latestResult={matchBar.latestResult}
      />
      <LatestNewsSection articles={articles} />
      <SocialSection />
      <HighlightsTvSection />
      <ContactSection />
      <SponsorsSection />
    </>
  )
}
