import { z } from 'zod'

export const createPageSchema = z.object({
  orgSlug: z.string(),
  title: z.string().min(1).max(200),
  content: z.any().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export const updatePageSchema = z.object({
  orgSlug: z.string(),
  pageId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export const publishPageSchema = z.object({
  orgSlug: z.string(),
  pageId: z.string().uuid(),
})

export const deletePageSchema = z.object({
  orgSlug: z.string(),
  pageId: z.string().uuid(),
})
