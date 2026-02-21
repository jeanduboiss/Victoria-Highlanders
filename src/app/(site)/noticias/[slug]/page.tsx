import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPublicArticleBySlug, getPublicArticles } from '@/domains/editorial/queries/public-articles.query'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await getPublicArticles({ limit: 100 })
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getPublicArticleBySlug(slug)
  if (!article) notFound()

  const category = article.ArticleCategories?.[0]?.article_categories?.name

  let htmlContent = ''
  try {
    htmlContent = generateHTML(article.content as Parameters<typeof generateHTML>[0], [
      StarterKit,
      TiptapImage,
      TiptapLink,
    ])
  } catch {
    htmlContent = ''
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[860px] px-4 lg:px-8 py-10 lg:py-16">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-1.5 font-sans text-[12px] font-bold uppercase tracking-wider text-white/40 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Noticias
        </Link>

        <article>
          <div className="mb-8">
            {category && (
              <span className="inline-block bg-gold px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-black mb-4">
                {category}
              </span>
            )}
            <h1 className="font-oswald text-[32px] sm:text-[44px] lg:text-[52px] font-bold uppercase leading-[1.05] text-white mb-4">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="font-sans text-[16px] text-gray-400 leading-relaxed mb-4">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-3 text-[12px] text-gray-600">
              {article.publishedAt && (
                <span>
                  {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))}
                </span>
              )}
              {article.author?.email && (
                <>
                  <span>·</span>
                  <span className="capitalize">{article.author.email.split('@')[0]}</span>
                </>
              )}
            </div>
          </div>

          {article.coverImageUrl && (
            <div className="w-full aspect-[21/9] overflow-hidden mb-8">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {htmlContent ? (
            <div
              className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-oswald prose-headings:uppercase prose-a:text-gold prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="font-sans text-[14px] text-gray-500 italic">Contenido no disponible.</p>
          )}
        </article>

        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 font-oswald text-[13px] font-bold uppercase tracking-widest text-white hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver todas las noticias
          </Link>
        </div>
      </div>
    </div>
  )
}
