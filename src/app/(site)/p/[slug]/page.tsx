import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPublicPageBySlug } from '@/domains/site/queries/public-pages.query'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicPagePage({ params }: Props) {
  const { slug } = await params
  const page = await getPublicPageBySlug(slug)
  if (!page) notFound()

  let htmlContent = ''
  try {
    htmlContent = generateHTML(page.content as Parameters<typeof generateHTML>[0], [
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
          href="/"
          className="inline-flex items-center gap-1.5 font-sans text-[12px] font-bold uppercase tracking-wider text-white/40 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>

        <article>
          {page.coverImageUrl && (
            <div className="w-full aspect-[21/9] overflow-hidden mb-8">
              <img
                src={page.coverImageUrl}
                alt={page.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="font-oswald text-[32px] sm:text-[44px] lg:text-[52px] font-bold uppercase leading-[1.05] text-white mb-8">
            {page.title}
          </h1>

          {htmlContent ? (
            <div
              className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-oswald prose-headings:uppercase prose-a:text-gold prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="font-sans text-[14px] text-gray-500 italic">Contenido no disponible.</p>
          )}
        </article>
      </div>
    </div>
  )
}
