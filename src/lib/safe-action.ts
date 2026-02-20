/**
 * next-safe-action client configuration.
 * Provides a typed action client with consistent error handling.
 *
 * Usage:
 *   export const myAction = actionClient
 *     .schema(mySchema)
 *     .action(async ({ parsedInput }) => { ... })
 */

import { createSafeActionClient } from 'next-safe-action'
import { ForbiddenError, AuthError } from '@/lib/auth/guards'

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    // User-facing errors — pass message through
    if (error instanceof ForbiddenError) {
      return error.message
    }
    if (error instanceof AuthError) {
      return error.message
    }
    // Prisma constraint errors — friendly messages
    if (error.message.includes('Unique constraint')) {
      return 'A record with these details already exists.'
    }
    if (error.message.includes('Cannot modify a locked record')) {
      return 'This season has been archived. Its records cannot be modified.'
    }
    if (error.message.includes('Cannot delete player')) {
      return 'This player has historical records and cannot be deleted. You can deactivate them instead.'
    }
    if (error.message.includes('Cannot delete media asset')) {
      return 'This file is in use and cannot be deleted. Remove all references to it first.'
    }
    // Generic fallback — never expose internal details
    console.error('[Server Action Error]', error)
    return 'An unexpected error occurred. Please try again.'
  },
})
