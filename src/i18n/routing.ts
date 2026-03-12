import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['es', 'en', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The cookie name used to store the locale
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 31536000,
    path: '/',
    sameSite: 'lax',
  },

  // Don't use a prefix for the default locale, 
  // and in this case, we use 'never' to keep URLs clean
  localePrefix: 'never'
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
