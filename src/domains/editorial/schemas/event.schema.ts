import { z } from 'zod'

export const createEventSchema = z.object({
  orgSlug: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).optional(),
  eventType: z.enum(['MATCH','TRAINING','SOCIAL','MEMBERSHIP','PRESS','CHARITY','OTHER']).default('OTHER'),
  coverImageUrl: z.string().url().optional(),
  startDatetime: z.string(), // ISO datetime
  endDatetime: z.string().optional(),
  venueId: z.string().uuid().optional(),
  locationText: z.string().max(200).optional(),
  isFeatured: z.boolean().default(false),
  registrationUrl: z.string().url().optional(),
  tagIds: z.array(z.string().uuid()).default([]),
})

export const updateEventSchema = createEventSchema.extend({
  eventId: z.string().uuid(),
})
