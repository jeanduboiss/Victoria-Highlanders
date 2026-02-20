import { z } from 'zod'

export const createSeasonSchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1).max(50), // e.g., "2025-2026"
  shortName: z.string().max(10).optional(), // e.g., "25/26"
  startDate: z.string(), // ISO date
  endDate: z.string(),   // ISO date
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'Start date must be before end date', path: ['endDate'] }
)

export const activateSeasonSchema = z.object({
  orgSlug: z.string(),
  seasonId: z.string().uuid(),
})

export const archiveSeasonSchema = z.object({
  orgSlug: z.string(),
  seasonId: z.string().uuid(),
})
