'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Mail, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { fadeInLeft, fadeInRight, fadeInUp, staggerContainer, VIEWPORT } from '@/components/site/animations/variants'

export function ContactSection() {
  const t = useTranslations('contact')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const TOPIC_KEYS = ['memberships', 'sponsorships', 'press', 'academy', 'tickets', 'other'] as const

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setSent(true)
  }

  return (
    <section className="bg-[#0a0a0a] py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-16 lg:items-start">

          {/* ── IZQUIERDA ── */}
          <motion.div
            className="lg:w-[400px] shrink-0 flex flex-col gap-8"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <Image
              src="/images/logo-victoria.png"
              alt="Victoria Highlanders FC"
              width={80}
              height={88}
              className="object-contain"
            />

            <div>
              <span className="inline-block bg-gold px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-4">
                {t('badge')}
              </span>
              <h2 className="font-oswald text-[52px] font-bold uppercase leading-[1.05] text-white lg:text-[60px]">
                {t('title').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h2>
            </div>

            <p className="font-sans text-[15px] leading-relaxed text-gray-400 max-w-[340px]">
              {t('description')}
            </p>

            <motion.div
              className="flex flex-col gap-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <motion.a variants={fadeInUp} href="mailto:info@victoriahighlanders.ca" className="group flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
                  <Mail className="size-4 text-gray-400 group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-gray-600">{t('emailLabel')}</p>
                  <p className="font-sans text-[13px] text-white group-hover:text-gold transition-colors">info@victoriahighlanders.ca</p>
                </div>
              </motion.a>

              <motion.a variants={fadeInUp} href="tel:+12505551234" className="group flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
                  <Phone className="size-4 text-gray-400 group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-gray-600">{t('phoneLabel')}</p>
                  <p className="font-sans text-[13px] text-white group-hover:text-gold transition-colors">+1 (250) 555-1234</p>
                </div>
              </motion.a>

              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center border border-white/10 bg-white/5">
                  <MapPin className="size-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-gray-600">{t('venueLabel')}</p>
                  <p className="font-sans text-[13px] text-white">Royal Athletic Park, Victoria BC</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── DERECHA — Formulario ── */}
          <motion.div
            className="flex-1"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <div className="border border-white/5 bg-[#111] p-6 sm:p-8 lg:p-10">

              {sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="flex size-16 items-center justify-center border-2 border-gold">
                    <svg viewBox="0 0 24 24" className="size-7 text-gold" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-oswald text-[28px] font-bold uppercase text-white">{t('sentTitle')}</h3>
                  <p className="font-sans text-[14px] text-gray-400">{t('sentDescription')}</p>
                  <button
                    onClick={() => { setSent(false); setName(''); setEmail(''); setPhone(''); setTopic(''); setMessage('') }}
                    className="mt-2 font-sans text-[12px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
                  >
                    {t('sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                  {/* Row 1 */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('fullNamePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-[#1a1a1a] border border-white/10 px-4 font-sans text-[14px] text-white placeholder:text-gray-600 outline-none transition-colors focus:border-gold/60 focus:bg-[#1f1f1f]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-[#1a1a1a] border border-white/10 px-4 font-sans text-[14px] text-white placeholder:text-gray-600 outline-none transition-colors focus:border-gold/60 focus:bg-[#1f1f1f]"
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 bg-[#1a1a1a] border border-white/10 px-4 font-sans text-[14px] text-white placeholder:text-gray-600 outline-none transition-colors focus:border-gold/60 focus:bg-[#1f1f1f]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        {t('topicLabel')}
                      </label>
                      <div className="relative">
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="h-12 w-full appearance-none bg-[#1a1a1a] border border-white/10 px-4 pr-10 font-sans text-[14px] text-white outline-none transition-colors focus:border-gold/60 focus:bg-[#1f1f1f] [&>option]:bg-[#1a1a1a]"
                        >
                          <option value="" disabled>{t('topicPlaceholder')}</option>
                          {TOPIC_KEYS.map((key) => (
                            <option key={key} value={key}>{t(`topics.${key}`)}</option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-col gap-3">
                    <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      {t('interestArea')}
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {TOPIC_KEYS.map((key) => {
                        const label = t(`topics.${key}`)
                        return (
                          <label
                            key={key}
                            className={`group flex cursor-pointer items-center gap-2.5 border px-3 py-2.5 transition-colors ${topic === key
                                ? 'border-gold/60 bg-gold/10'
                                : 'border-white/8 bg-white/3 hover:border-white/20'
                              }`}
                            onClick={() => setTopic(key)}
                          >
                            <div className={`flex size-4 shrink-0 items-center justify-center border transition-colors ${topic === key ? 'border-gold bg-gold' : 'border-white/20'
                              }`}>
                              {topic === key && (
                                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="black" strokeWidth="2.5">
                                  <polyline points="1.5 6 4.5 9 10.5 3" />
                                </svg>
                              )}
                            </div>
                            <span className={`font-sans text-[11px] leading-tight transition-colors ${topic === key ? 'text-gold' : 'text-gray-400 group-hover:text-gray-200'
                              }`}>
                              {label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      {t('messageLabel')}
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={5}
                        placeholder={t('messagePlaceholder')}
                        value={message}
                        maxLength={500}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none bg-[#1a1a1a] border border-white/10 p-4 pb-8 font-sans text-[14px] text-white placeholder:text-gray-600 outline-none transition-colors focus:border-gold/60 focus:bg-[#1f1f1f]"
                      />
                      <span className="absolute bottom-3 right-4 font-sans text-[11px] text-gray-600">
                        {message.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex h-14 w-full items-center justify-center gap-3 bg-gold font-oswald text-[15px] font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                  >

                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        {t('submitButton')}
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </motion.button>

                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
