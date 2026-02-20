import { z } from 'zod'

export const createArticleSchema = z.object({
  orgSlug: z.string(),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.record(z.unknown()).default({}), // TipTap JSON
  coverImageUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
})

export const updateArticleSchema = createArticleSchema.extend({
  articleId: z.string().uuid(),
  slug: z.string().min(1).max(200).optional(), // Admin can override slug
})

export const scheduleArticleSchema = z.object({
  orgSlug: z.string(),
  articleId: z.string().uuid(),
  scheduledAt: z.string(), // ISO datetime
})

export const createCategorySchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const createTagSchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1).max(50),
})
