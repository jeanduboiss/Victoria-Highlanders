/**
 * Slug generation utilities.
 * Generates URL-friendly slugs with automatic numeric suffix for duplicates.
 *
 * Examples:
 *   "Victoria gana 3-0" → "victoria-gana-3-0"
 *   If duplicate → "victoria-gana-3-0-2", "-3", etc.
 */

import { prisma } from '@/lib/prisma/client'

type SlugTable = 'articles' | 'events' | 'article_categories' | 'tags' | 'media_folders'

/**
 * Converts a string to a URL-safe slug.
 * Handles special characters, accents, and spaces.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accent diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // Remove non-alphanumeric (keep hyphens)
    .trim()
    .replace(/\s+/g, '-')           // Spaces → hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')        // Strip leading/trailing hyphens
    .slice(0, 200)                  // Max 200 chars
}

/**
 * Generates a unique slug for a given organization.
 * Appends numeric suffix (-2, -3…) if the base slug already exists.
 *
 * @param title - The source text to slugify
 * @param organizationId - Tenant scope for uniqueness check
 * @param table - Which table to check for uniqueness
 * @param excludeId - Skip this ID when checking (for updates)
 */
export async function generateUniqueSlug(
  title: string,
  organizationId: string,
  table: SlugTable,
  excludeId?: string,
): Promise<string> {
  const base = toSlug(title)
  let candidate = base
  let suffix = 2

  while (true) {
    const exists = await checkSlugExists(candidate, organizationId, table, excludeId)
    if (!exists) return candidate
    candidate = `${base}-${suffix}`
    suffix++
  }
}

async function checkSlugExists(
  slug: string,
  organizationId: string,
  table: SlugTable,
  excludeId?: string,
): Promise<boolean> {
  const where = { organizationId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) }

  switch (table) {
    case 'articles':
      return !!(await prisma.article.findFirst({ where, select: { id: true } }))
    case 'events':
      return !!(await prisma.event.findFirst({ where, select: { id: true } }))
    case 'article_categories':
      return !!(await prisma.articleCategory.findFirst({ where, select: { id: true } }))
    case 'tags':
      return !!(await prisma.tag.findFirst({ where, select: { id: true } }))
    case 'media_folders':
      return !!(await prisma.mediaFolder.findFirst({ where, select: { id: true } }))
    default:
      return false
  }
}
