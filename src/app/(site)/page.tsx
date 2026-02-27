export const dynamic = 'force-dynamic'

import { HeroSection } from '@/components/site/sections/hero-section'
import { InfoStripSection } from '@/components/site/sections/info-strip-section'
import { LatestNewsSection } from '@/components/site/sections/latest-news-section'
import { PlayersSection } from '@/components/site/sections/players-section'
import { MatchesSection } from '@/components/site/sections/matches-section'
import { SocialSection } from '@/components/site/sections/social-section'
import { HighlightsTvSection } from '@/components/site/sections/highlights-tv-section'
import { ContactSection } from '@/components/site/sections/contact-section'
import { SponsorsSection } from '@/components/site/sections/sponsors-section'
import { TestimonialsSection } from '@/components/site/sections/testimonials-section'
import { getPublicArticles } from '@/domains/editorial/queries/public-articles.query'
import { getPublicMatches, getPublicMatchBar } from '@/domains/sports/queries/public-matches.query'
import { getPublicPlayers } from '@/domains/sports/queries/public-players.query'
import { getPublicMediaTV } from '@/domains/media/queries/public-media.query'
import { getSiteConfigBySlug } from '@/domains/configuration/actions/site-config.actions'
import { getPublishedTestimonialsBySlug } from '@/domains/site/queries/testimonials.query'
import { NextMatchCountdown } from '@/components/site/matches/next-match-countdown'

export default async function HomePage() {
  const slug = process.env.DEFAULT_ORG_SLUG ?? 'victoria-highlanders'

  // Fetch data in parallel with explicit awaits to preserve correct TypeScript types
  const articlesPromise = getPublicArticles({ limit: 3 })
  const matchBarPromise = getPublicMatchBar()
  const matchesPromise = getPublicMatches({ limit: 6 })
  const playersPromise = getPublicPlayers({ limit: 16 })
  const tvVideosPromise = getPublicMediaTV({ limit: 4 })
  const configPromise = getSiteConfigBySlug(slug)
  const testimonialsPromise = getPublishedTestimonialsBySlug(slug).catch(() => [])

  const articles = await articlesPromise
  const matchBar = await matchBarPromise
  const matches = await matchesPromise
  const players = await playersPromise
  const tvVideos = await tvVideosPromise
  const orgConfig = await configPromise
  const testimonials = await testimonialsPromise

  const latestArticle = articles[0] ?? null
  const rawSponsors = orgConfig?.sponsorsJson
  const sponsors = Array.isArray(rawSponsors) ? rawSponsors as { name: string; logoUrl: string; websiteUrl?: string }[] : undefined

  return (
    <>
      <HeroSection
        heroTitle={orgConfig?.heroTitle}
        heroSubtitle={orgConfig?.heroSubtitle}
        heroImageUrl={orgConfig?.heroImageUrl}
        featuredArticle={orgConfig?.featuredArticle}
      />
      {matchBar.nextMatch ? (
        <NextMatchCountdown
          targetDate={matchBar.nextMatch.matchDate}
          homeTeam={{
            name: matchBar.nextMatch.homeTeam.name,
            logoUrl: matchBar.nextMatch.homeTeam.badgeUrl
          }}
          awayTeam={{
            name: matchBar.nextMatch.awayTeam.name,
            logoUrl: matchBar.nextMatch.awayTeam.badgeUrl
          }}
          venueName={matchBar.nextMatch.venue?.name}
          isHomeGame={matchBar.nextMatch.isHomeGame}
        />
      ) : null}
      <InfoStripSection
        latestArticle={latestArticle}
        nextMatch={matchBar.nextMatch}
        latestResult={matchBar.latestResult}
        hideResults={orgConfig?.hideResults ?? false}
      />
      <LatestNewsSection articles={articles} />
      <PlayersSection players={players} />
      <MatchesSection
        matches={matches}
        nextMatch={matchBar.nextMatch}
        latestResult={matchBar.latestResult}
        hideResults={orgConfig?.hideResults ?? false}
      />
      <SocialSection />
      <HighlightsTvSection videos={tvVideos} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection />
      <SponsorsSection sponsors={sponsors} />
    </>
  )
}
