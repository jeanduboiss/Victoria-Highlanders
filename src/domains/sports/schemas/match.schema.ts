import { z } from 'zod'

export const scheduleMatchSchema = z.object({
  orgSlug: z.string(),
  seasonId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  competitionName: z.string().max(100).optional(),
  matchDate: z.string(), // ISO datetime
  venueId: z.string().uuid().optional(),
  matchDay: z.number().int().min(1).optional(),
  round: z.string().max(50).optional(),
  isHomeGame: z.boolean().default(true),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.homeTeamId !== data.awayTeamId,
  { message: 'Home and away teams must be different', path: ['awayTeamId'] }
)

export const updateMatchResultSchema = z.object({
  orgSlug: z.string(),
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export const addMatchEventSchema = z.object({
  orgSlug: z.string(),
  matchId: z.string().uuid(),
  playerId: z.string().uuid(),
  assistPlayerId: z.string().uuid().optional(),
  eventType: z.enum([
    'GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'YELLOW_RED_CARD',
    'SUBSTITUTION_IN', 'SUBSTITUTION_OUT', 'PENALTY_SCORED', 'PENALTY_MISSED',
  ]),
  minute: z.number().int().min(1).max(120),
  extraTimeMinute: z.number().int().min(1).max(30).optional(),
  description: z.string().max(200).optional(),
})

export const removeMatchEventSchema = z.object({
  orgSlug: z.string(),
  eventId: z.string().uuid(),
})

export const startMatchLiveSchema = z.object({
  orgSlug: z.string(),
  matchId: z.string().uuid(),
})

export const updateLiveScoreSchema = z.object({
  orgSlug: z.string(),
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

const singleEventSchema = z.object({
  playerId: z.string().uuid(),
  assistPlayerId: z.string().uuid().optional(),
  eventType: z.enum([
    'GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'YELLOW_RED_CARD',
    'SUBSTITUTION_IN', 'SUBSTITUTION_OUT', 'PENALTY_SCORED', 'PENALTY_MISSED',
  ]),
  minute: z.number().int().min(1).max(120),
  extraTimeMinute: z.number().int().min(1).max(30).optional(),
  description: z.string().max(200).optional(),
})

export const bulkAddMatchEventsSchema = z.object({
  orgSlug: z.string(),
  matchId: z.string().uuid(),
  events: z.array(singleEventSchema).min(1).max(50),
})
