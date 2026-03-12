import { ImageIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function GaleriaPage() {
  const t = await getTranslations('subpages.gallery')
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-10">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-2">{t('media')}</p>
          <h1 className="font-oswald text-[36px] sm:text-[48px] font-bold uppercase text-white">{t('title')}</h1>
        </div>

        <div className="flex flex-col items-center justify-center h-80 border border-white/[0.06] bg-[#111] gap-4 mt-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/20">
            <ImageIcon className="w-6 h-6 text-gold" />
          </div>
          <div className="text-center mt-2">
            <p className="font-oswald text-[18px] font-bold uppercase text-white mb-1">{t('underConstruction')}</p>
            <p className="font-sans text-[13px] text-white/40">{t('soon')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
