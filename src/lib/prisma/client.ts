/**
 * Prisma Client singleton.
 * Prevents multiple instances in development (Next.js hot reload).
 * Import as: import { prisma } from '@/lib/prisma/client'
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection limit and timeout are handled in the DATABASE_URL in .env
// Standard for Prisma 5/6: override via datasourceUrl
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
