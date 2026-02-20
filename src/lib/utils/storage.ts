/**
 * Supabase Storage path utilities.
 * Generates canonical storage paths for media uploads.
 *
 * Path format: {orgId}/{year}/{month}/{uuid}-{sanitizedFilename}
 * Example: "abc-123/2026/02/f47ac10b-photo-match.jpg"
 */

import { randomUUID } from 'crypto'

/**
 * Generates a canonical storage path for a media asset.
 * Includes organization isolation, date-based organization, and UUID to prevent collisions.
 */
export function generateStoragePath(organizationId: string, fileName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uuid = randomUUID()
  const sanitized = sanitizeFileName(fileName)

  return `${organizationId}/${year}/${month}/${uuid}-${sanitized}`
}

/**
 * Returns the Supabase Storage bucket name for a given MIME type.
 */
export function getBucket(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'media'
  if (mimeType.startsWith('video/')) return 'media'
  return 'media'
}

/**
 * Sanitizes a file name for safe storage.
 * Removes special characters and normalizes to lowercase.
 */
function sanitizeFileName(fileName: string): string {
  const ext = fileName.split('.').pop() ?? ''
  const base = fileName
    .replace(/\.[^/.]+$/, '')      // Remove extension
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  return ext ? `${base}.${ext.toLowerCase()}` : base
}

/**
 * Builds the full public URL for a Supabase Storage asset.
 */
export function buildPublicUrl(storagePath: string, bucket = 'media'): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`
}
