'use server'

import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const uploadAssetSchema = z.object({
  orgSlug: z.string(),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  storagePath: z.string(), // Already uploaded to Supabase Storage; we only register in DB
  publicUrl: z.string().url(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  folderId: z.string().uuid().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
})

const updateAssetMetaSchema = z.object({
  orgSlug: z.string(),
  assetId: z.string().uuid(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
})

const archiveAssetSchema = z.object({
  orgSlug: z.string(),
  assetId: z.string().uuid(),
})

const deleteAssetSchema = z.object({
  orgSlug: z.string(),
  assetId: z.string().uuid(),
})

const createFolderSchema = z.object({
  orgSlug: z.string(),
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
})

const deleteFolderSchema = z.object({
  orgSlug: z.string(),
  folderId: z.string().uuid(),
})

const moveAssetSchema = z.object({
  orgSlug: z.string(),
  assetId: z.string().uuid(),
  folderId: z.string().uuid().nullable(),
})

// Register an asset after it has been uploaded directly to Supabase Storage
export const uploadAssetAction = actionClient
  .schema(uploadAssetSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'write')

    const asset = await prisma.mediaAsset.create({
      data: {
        organizationId: ctx.organizationId,
        fileName: parsedInput.fileName,
        fileSize: parsedInput.fileSize,
        mimeType: parsedInput.mimeType,
        storagePath: parsedInput.storagePath,
        publicUrl: parsedInput.publicUrl,
        altText: parsedInput.altText,
        caption: parsedInput.caption,
        width: parsedInput.width,
        height: parsedInput.height,
        uploadedBy: ctx.userId,
        ...(parsedInput.folderId
          ? { folders: { connect: { id: parsedInput.folderId } } }
          : {}),
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return asset
  })

export const updateAssetMetaAction = actionClient
  .schema(updateAssetMetaSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'write')

    const asset = await prisma.mediaAsset.update({
      where: { id: parsedInput.assetId, organizationId: ctx.organizationId },
      data: {
        altText: parsedInput.altText,
        caption: parsedInput.caption,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return asset
  })

// Soft-delete; blocks if asset is still referenced by articles/events
export const archiveAssetAction = actionClient
  .schema(archiveAssetSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'write')

    // Check references before archiving
    const asset = await prisma.mediaAsset.findFirstOrThrow({
      where: { id: parsedInput.assetId, organizationId: ctx.organizationId },
      select: { publicUrl: true },
    })

    const articleRef = await prisma.article.count({
      where: { organizationId: ctx.organizationId, coverImageUrl: asset.publicUrl },
    })
    const eventRef = await prisma.event.count({
      where: { organizationId: ctx.organizationId, coverImageUrl: asset.publicUrl },
    })

    if (articleRef + eventRef > 0)
      throw new Error('Este asset está referenciado por artículos o eventos. Elimina las referencias primero.')

    const updated = await prisma.mediaAsset.update({
      where: { id: parsedInput.assetId, organizationId: ctx.organizationId },
      data: { isArchived: true },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return updated
  })

// Hard-delete; only allowed if already archived
export const deleteAssetAction = actionClient
  .schema(deleteAssetSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'delete')

    await prisma.mediaAsset.delete({
      where: {
        id: parsedInput.assetId,
        organizationId: ctx.organizationId,
        isArchived: true,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return { success: true }
  })

export const createFolderAction = actionClient
  .schema(createFolderSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'write')

    const folder = await prisma.mediaFolder.create({
      data: {
        organizationId: ctx.organizationId,
        name: parsedInput.name,
        parentId: parsedInput.parentId,
      },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return folder
  })

export const deleteFolderAction = actionClient
  .schema(deleteFolderSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'delete')

    // Check that folder is empty before deleting
    const assetCount = await prisma.mediaFolderAsset.count({
      where: { folderId: parsedInput.folderId },
    })

    if (assetCount > 0)
      throw new Error('La carpeta tiene assets. Muévelos o elimínalos primero.')

    await prisma.mediaFolder.delete({
      where: { id: parsedInput.folderId, organizationId: ctx.organizationId },
    })

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return { success: true }
  })

export const moveAssetToFolderAction = actionClient
  .schema(moveAssetSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'media', 'write')

    if (parsedInput.folderId) {
      // Remove from all folders, then add to target
      await prisma.mediaFolderAsset.deleteMany({
        where: { assetId: parsedInput.assetId },
      })
      await prisma.mediaFolderAsset.create({
        data: { assetId: parsedInput.assetId, folderId: parsedInput.folderId },
      })
    } else {
      // Move to root (no folder)
      await prisma.mediaFolderAsset.deleteMany({
        where: { assetId: parsedInput.assetId },
      })
    }

    revalidatePath(`/admin/${parsedInput.orgSlug}/media`)
    return { success: true }
  })
