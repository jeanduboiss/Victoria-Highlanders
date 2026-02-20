# Dominios — Responsabilidades y Patrones

## Victoria Highlanders — Sports Management Platform

---

## Patrón General

Todos los dominios siguen el mismo patrón:

```
src/domains/<domain>/
  schemas/      — Zod schemas (validación de inputs)
  actions/      — Server Actions con next-safe-action (escritura)
  queries/      — Funciones Prisma puras (lectura, usadas en RSC)
```

Todas las **Server Actions**:
1. Validan el input con Zod via `actionClient.schema()`
2. Verifican permisos con `requirePermission(orgSlug, module, action)`
3. Ejecutan la operación Prisma
4. Llaman `revalidatePath()` para invalidar el cache
5. Retornan el resultado

---

## Dominio: Sports

### Squad Management (`sports/actions/squad.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `createTeamAction` | Crea equipo en la org | teams.write |
| `updateTeamAction` | Actualiza datos del equipo | teams.write |
| `createPlayerAction` | Registra jugador en el pool | players.write |
| `updatePlayerAction` | Actualiza datos personales | players.write |
| `deactivatePlayerAction` | Soft-delete (isActive=false) | players.write |
| `enrollPlayerAction` | Asigna jugador a equipo en temporada activa | players.write |
| `transferPlayerAction` | Cierra record actual, abre uno nuevo | players.write |
| `createStaffMemberAction` | Registra miembro de staff | staff.write |

**`enrollPlayerAction`** crea en una transacción:
- `PlayerSeasonRecord` con `isCurrent=true`
- `PlayerStatsSeason` vacío vinculado al record

**`transferPlayerAction`** en una transacción:
1. Cierra el record actual: `transferOutDate=today, isCurrent=false`
2. Crea nuevo `PlayerSeasonRecord` con `isCurrent=true`
3. Crea nuevo `PlayerStatsSeason` vacío

### Season Management (`sports/actions/season.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `createSeasonAction` | Crea temporada (inactiva) | seasons.write |
| `activateSeasonAction` | Activa temporada; desactiva la anterior | seasons.write |
| `archiveSeasonAction` | Archiva; bloquea todos los records vía trigger | seasons.write |

### Match & Stats (`sports/actions/match.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `scheduleMatchAction` | Crea partido como SCHEDULED | matches.write |
| `updateMatchResultAction` | Registra resultado + recalcula stats | matches.write |
| `addMatchEventAction` | Agrega gol/tarjeta/sustitución | match_events.write |
| `removeMatchEventAction` | Elimina evento + recalcula stats | match_events.write |
| `updateMatchStatusAction` | Marca como POSTPONED/CANCELLED/ABANDONED | matches.write |

### Lógica de Recalculo de Stats

Ver `src/lib/utils/stats.ts`:

1. `recalculateStatsForMatch(matchId)` — disparo principal
2. Para cada jugador del partido, llama `recalculatePlayerStats(playerId, seasonId)`
3. `recalculatePlayerStats` suma **todos** los MatchEvents de la temporada completa (no solo del partido actual)
4. Actualiza `PlayerStatsSeason` con `upsert`
5. Respeta `isLocked`: si el record está bloqueado, salta silenciosamente

---

## Dominio: Editorial

### Articles (`editorial/actions/article.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `createArticleAction` | Crea DRAFT con slug auto-generado | articles.write |
| `updateArticleAction` | Edita contenido; slug opcional | articles.write |
| `publishArticleAction` | DRAFT/SCHEDULED → PUBLISHED, sets publishedAt | articles.write |
| `scheduleArticleAction` | DRAFT → SCHEDULED, sets scheduledAt | articles.write |
| `archiveArticleAction` | PUBLISHED → ARCHIVED | articles.write |
| `deleteArticleAction` | Elimina; solo CLUB_ADMIN, solo DRAFT | articles.delete |
| `createCategoryAction` | Crea categoría con slug | categories.write |
| `createTagAction` | Crea tag con slug | tags.write |

**Flujo de estados de artículo:**
```
DRAFT → PUBLISHED (publishArticleAction)
DRAFT → SCHEDULED (scheduleArticleAction)
SCHEDULED → PUBLISHED (publishArticleAction o Edge Function automática)
PUBLISHED → ARCHIVED (archiveArticleAction)
DRAFT → eliminado (deleteArticleAction, solo CLUB_ADMIN)
```

### Events (`editorial/actions/event.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `createEventAction` | Crea evento DRAFT con slug | events.write |
| `updateEventAction` | Actualiza datos del evento | events.write |
| `publishEventAction` | DRAFT → PUBLISHED | events.write |
| `cancelEventAction` | DRAFT/PUBLISHED → CANCELLED | events.write |
| `finishEventAction` | PUBLISHED → FINISHED | events.write |

---

## Dominio: Media

### Media Manager (`media/actions/media.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `uploadAssetAction` | Registra asset en DB tras subida a Supabase Storage | media.write |
| `updateAssetMetaAction` | Edita altText y caption | media.write |
| `archiveAssetAction` | Soft-delete; verifica referencias antes | media.write |
| `deleteAssetAction` | Hard-delete; solo si isArchived=true | media.delete |
| `createFolderAction` | Crea carpeta de medios | media.write |
| `deleteFolderAction` | Elimina carpeta vacía | media.delete |
| `moveAssetToFolderAction` | Mueve asset a carpeta (null = raíz) | media.write |

**Flujo de subida:**
1. El cliente sube el archivo directamente a Supabase Storage (presigned URL)
2. El cliente llama `uploadAssetAction` con la `storagePath` y `publicUrl` devueltas por Supabase
3. `uploadAssetAction` registra los metadatos en `MediaAsset`

**Path de storage:** `/{orgId}/{year}/{month}/{uuid}-{sanitizedFilename}`
Ver `src/lib/utils/storage.ts`

---

## Dominio: Configuration

### Site Config (`configuration/actions/site-config.actions.ts`)

| Acción/Query | Descripción | Permiso |
|---|---|---|
| `updateSiteConfigAction` | Actualiza config + revalida sitio público | site_config.write |
| `getSiteConfig(organizationId)` | Query cacheada para RSC | — |
| `getSiteConfigBySlug(orgSlug)` | Resuelve slug → org → config | — |

`updateSiteConfigAction` usa `upsert` para crear la config si no existe.
Tras actualizar, revalida `/` y `/{orgSlug}` para que los cambios sean inmediatos.

---

## Dominio: IAM

### Users (`iam/actions/users.actions.ts`)

| Acción | Descripción | Permiso |
|---|---|---|
| `inviteUserAction` | Envía magic link + crea OrganizationMember pendiente | users.write |
| `updateMemberRoleAction` | Cambia rol (no auto-democión) | users.write |
| `deactivateMemberAction` | Desactiva membresía (no auto-desactivación) | users.write |

**Flujo de invitación:**
1. Admin llama `inviteUserAction` con email y rol
2. `supabase.auth.admin.inviteUserByEmail()` envía magic link
3. Se crea `OrganizationMember` con `isActive=false`
4. Al aceptar la invitación, `isActive` se pone a `true` (via trigger o callback de auth)

---

## Automatización: Publicación Programada

### Edge Function (`supabase/functions/publish-scheduled/index.ts`)

- **Trigger:** `pg_cron` cada minuto
- **Lógica:** `UPDATE articles SET status='PUBLISHED', published_at=now() WHERE status='SCHEDULED' AND scheduled_at <= now()`
- **Post-acción:** Llama webhook `POST /api/revalidate` con las rutas afectadas
- **Webhook:** `src/app/api/revalidate/route.ts` — verifica `NEXT_REVALIDATE_SECRET` y llama `revalidatePath()`

---

## Utilidades Compartidas

| Archivo | Función |
|---|---|
| `src/lib/utils/slug.ts` | `generateUniqueSlug(title, orgId, table, excludeId?)` |
| `src/lib/utils/stats.ts` | `recalculateStatsForMatch(matchId)`, `recalculatePlayerStats(playerId, seasonId)` |
| `src/lib/utils/storage.ts` | `generateStoragePath(orgId, fileName)`, `buildPublicUrl(path)`, `getBucket()` |
| `src/lib/prisma/client.ts` | Singleton de Prisma con `globalThis` para hot-reload en dev |
| `src/lib/safe-action.ts` | `actionClient` con `handleServerError` mapeando errores a mensajes amigables |

---

## Variables de Entorno Requeridas (Fase 4)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma + Supabase
DATABASE_URL=           # postgresql://...@...supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=             # postgresql://...@...supabase.co:5432/postgres

# Revalidación automática
NEXT_REVALIDATE_URL=    # https://yourdomain.com/api/revalidate
NEXT_REVALIDATE_SECRET= # secret aleatorio para proteger el endpoint
```
