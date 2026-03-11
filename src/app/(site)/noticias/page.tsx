export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getPublicArticles } from '@/domains/editorial/queries/public-articles.query'
import type { PublicArticle } from '@/domains/editorial/queries/public-articles.query'

import { getTranslations, getLocale } from 'next-intl/server'

function ArticleCard({ article, featured = false, locale, t }: { article: PublicArticle; featured?: boolean, locale: string, t: any }) {
  const category = article.ArticleCategories?.[0]?.article_categories?.name

  if (featured) {
    return (
      <Link href={`/noticias/${article.slug}`} className="group col-span-full lg:col-span-2 flex flex-col sm:flex-row gap-0 overflow-hidden bg-[#111] border border-white/[0.06] hover:border-gold/30 transition-colors">
        <div className="sm:w-[55%] aspect-[16/10] sm:aspect-auto overflow-hidden bg-[#1a1a1a] shrink-0">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-[#1a1a1a]">
              <span className="font-oswald text-[11px] uppercase tracking-widest text-gray-700">VHFC</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          {category && (
            <span className="inline-block w-fit bg-gold px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-black">
              {t.has(`categories.${category}`) ? t(`categories.${category}`) : category}
            </span>
          )}
          <h2 className="font-oswald text-[24px] sm:text-[28px] font-bold uppercase leading-tight text-white group-hover:text-gold transition-colors line-clamp-3">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="font-sans text-[13px] text-gray-400 leading-relaxed line-clamp-3">{article.excerpt}</p>
          )}
          {article.publishedAt && (
            <p className="font-sans text-[11px] text-gray-600 mt-1">
              {new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))}
            </p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/noticias/${article.slug}`} className="group flex flex-col overflow-hidden bg-[#111] border border-white/[0.06] hover:border-gold/30 transition-colors">
      <div className="aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
            <span className="font-oswald text-[11px] uppercase tracking-widest text-gray-700">VHFC</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        {category && (
          <span className="inline-block w-fit bg-gold px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-black">
            {t.has(`categories.${category}`) ? t(`categories.${category}`) : category}
          </span>
        )}
        <h3 className="font-oswald text-[18px] font-bold uppercase leading-tight text-white group-hover:text-gold transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.publishedAt && (
          <p className="font-sans text-[11px] text-gray-600">
            {new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))}
          </p>
        )}
      </div>
    </Link>
  )
}

export default async function NoticiasPage() {
  const articles = await getPublicArticles({ limit: 30 })
  const t = await getTranslations('subpages.news')
  const locale = await getLocale()
  const [featured, ...rest] = articles

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-10">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">{t('press')}</p>
          <h1 className="font-oswald text-[36px] sm:text-[48px] font-bold uppercase text-white">{t('title')}</h1>
        </div>

        {articles.length === 0 ? (
          <div className="flex h-60 items-center justify-center border border-white/5 bg-white/[0.02] rounded">
            <p className="font-sans text-[13px] text-gray-600 font-bold tracking-widest uppercase">{t('noArticles')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured && <ArticleCard article={featured} featured locale={locale} t={t} />}
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
