import { z } from 'zod'

export const createPlayerSchema = z.object({
  orgSlug: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().optional(), // ISO date string
  position: z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']).optional(),
  preferredFoot: z.enum(['LEFT', 'RIGHT', 'BOTH']).optional(),
  heightCm: z.number().int().min(100).max(250).optional(),
  weightKg: z.number().int().min(30).max(150).optional(),
  biography: z.string().max(2000).optional(),
  jerseyNumberDefault: z.number().int().min(1).max(99).optional(),
  nationalities: z.array(z.object({
    country: z.string().length(2), // ISO 3166-1 alpha-2
    isPrimary: z.boolean().default(false),
  })).min(1, 'At least one nationality is required'),
  // Optional: auto-enroll in team on creation
  teamId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
})

export const updatePlayerSchema = createPlayerSchema.extend({
  playerId: z.string().uuid(),
}).omit({ orgSlug: true })

export const enrollPlayerSchema = z.object({
  orgSlug: z.string(),
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  seasonId: z.string().uuid(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  contractType: z.enum(['PROFESSIONAL', 'AMATEUR', 'YOUTH']).default('AMATEUR'),
  transferInDate: z.string(), // ISO date string
})

export const transferPlayerSchema = z.object({
  orgSlug: z.string(),
  currentRecordId: z.string().uuid(),
  newTeamId: z.string().uuid(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  transferDate: z.string(), // ISO date string
})

export const createTeamSchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1).max(100),
  shortName: z.string().max(20).optional(),
  category: z.enum(['FIRST_TEAM', 'RESERVE', 'U23', 'U20', 'U18', 'U16', 'U14', 'U12', 'WOMEN', 'FUTSAL']),
  gender: z.enum(['MALE', 'FEMALE', 'MIXED']).default('MALE'),
  description: z.string().max(1000).optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
})

export const createStaffMemberSchema = z.object({
  orgSlug: z.string(),
  teamId: z.string().uuid().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['HEAD_COACH', 'ASSISTANT_COACH', 'GOALKEEPER_COACH', 'FITNESS_COACH', 'DOCTOR', 'ANALYST', 'TEAM_MANAGER']),
  nationality: z.string().length(2).optional(),
  dateOfBirth: z.string().optional(),
  biography: z.string().max(2000).optional(),
  startDate: z.string().optional(),
})

export const updatePlayerStatsSchema = z.object({
  orgSlug: z.string(),
  statsId: z.string().uuid(),
  matchesPlayed: z.number().int().min(0).default(0),
  matchesStarted: z.number().int().min(0).default(0),
  minutesPlayed: z.number().int().min(0).default(0),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  yellowCards: z.number().int().min(0).default(0),
  redCards: z.number().int().min(0).default(0),
  cleanSheets: z.number().int().min(0).default(0),
  goalsConceded: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
})
