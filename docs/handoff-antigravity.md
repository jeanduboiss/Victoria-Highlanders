# Handoff: Victoria Highlanders — Continuación Fase 6

## INSTRUCCIONES CRÍTICAS PARA EL AGENTE

Estás continuando la implementación de una plataforma de gestión deportiva para **Victoria Highlanders FC**. Todo el diseño, arquitectura, decisiones y código base ya fueron definidos y parcialmente implementados. **TU ROL ES CONTINUAR, NO REDISEÑAR.** Sigue los patrones existentes al pie de la letra.

---

## Stack tecnológico (fijo, no cambiar)

- **Framework**: Next.js 15 App Router (TypeScript estricto)
- **Base de datos**: Supabase (PostgreSQL internamente) + Prisma ORM
- **Auth**: Supabase Auth (magic link / OTP — invitation only, sin registro público)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS + Magic UI
- **Server Actions**: `next-safe-action` (`actionClient`)
- **Formularios**: `react-hook-form` + `zodResolver`
- **Notificaciones**: `sonner` (Toaster ya configurado en root layout)
- **Editor de texto**: TipTap (para artículos)
- **Scroll**: Lenis (sitio público)
- **Deployment**: Vercel

---

## Estructura de directorios (ya creada)

```
src/
  app/
    layout.tsx                         ← Root layout (Inter + Toaster)
    (auth)/
      login/
        page.tsx                       ← Magic link login
        _components/login-form.tsx
    (admin)/
      layout.tsx                       ← ThemeProvider wrapper
      [orgSlug]/
        layout.tsx                     ← Sidebar + Topbar (verifica sesión)
        page.tsx                       ← Dashboard home con 4 widgets
        sports/
          matches/
            page.tsx                   ← Listado de partidos
            _components/               ← matches-table, schedule-match-sheet
          players/
            page.tsx                   ← Listado de jugadores
            _components/               ← players-table, create-player-sheet
        editorial/
          articles/
            page.tsx                   ← Listado de artículos
            _components/articles-table.tsx
        media/
          page.tsx                     ← Grid de media
          _components/                 ← media-grid, upload-asset-sheet
        users/
          page.tsx                     ← Tabla de miembros
          _components/                 ← users-table, invite-user-sheet
        configuration/
          page.tsx                     ← Formulario de site config
          _components/site-config-form.tsx
    auth/callback/route.ts             ← Supabase OAuth callback
    api/
      revalidate/route.ts              ← Webhook para Edge Function
      org-id/route.ts                  ← Endpoint para obtener organizationId por slug
  components/
    admin/
      theme/theme-provider.tsx         ← next-themes
      theme/theme-toggle.tsx
      sidebar/admin-sidebar.tsx        ← Sidebar colapsable shadcn/ui
      sidebar/nav-items.ts             ← Grupos de navegación por módulo
      topbar/admin-topbar.tsx
      topbar/breadcrumbs.tsx
      topbar/user-nav.tsx
      dashboard/kpi-card.tsx
      dashboard/next-match-widget.tsx
      dashboard/recent-articles-widget.tsx
      dashboard/activity-feed.tsx
  domains/
    sports/
      schemas/squad.schema.ts
      schemas/season.schema.ts
      schemas/match.schema.ts
      actions/squad.actions.ts
      actions/season.actions.ts
      actions/match.actions.ts
      queries/squad.queries.ts
      queries/match.queries.ts
    editorial/
      schemas/article.schema.ts
      schemas/event.schema.ts
      actions/article.actions.ts
      actions/event.actions.ts
    media/
      actions/media.actions.ts
    configuration/
      actions/site-config.actions.ts
    iam/
      actions/users.actions.ts
  lib/
    auth/
      permissions.ts                   ← Matriz de permisos estática
      session.ts                       ← getSession, requireSession, requireOrgAccess
      guards.ts                        ← requirePermission, ForbiddenError, AuthError
      index.ts                         ← barrel export
    prisma/client.ts                   ← Singleton de Prisma
    safe-action.ts                     ← actionClient con handleServerError
    utils/
      slug.ts                          ← generateUniqueSlug()
      stats.ts                         ← recalculateStatsForMatch()
      storage.ts                       ← generateStoragePath(), buildPublicUrl()
  middleware.ts                        ← Protege /admin/**, redirige a /login
prisma/schema.prisma                   ← Schema completo (23 modelos, 14 enums)
supabase/
  migrations/
    002_rls_policies.sql               ← RLS en 26 tablas
    003_triggers.sql                   ← 6 triggers de integridad
  functions/
    publish-scheduled/index.ts         ← Edge Function pg_cron
docs/
  prd.md                              ← Product Requirements Document
  architecture.md                     ← Arquitectura completa
  database.md                         ← Diseño de base de datos
  rbac.md                             ← Sistema de permisos
  domains.md                          ← Responsabilidades por dominio
```

---

## Patrones obligatorios

### 1. Server Action (siempre con next-safe-action)

```typescript
'use server'
import { actionClient } from '@/lib/safe-action'
import { requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  orgSlug: z.string(),
  // ... campos
})

export const myAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const ctx = await requirePermission(parsedInput.orgSlug, 'module', 'write')
    // ctx.organizationId, ctx.userId, ctx.role disponibles
    const result = await prisma.model.create({ data: { organizationId: ctx.organizationId, ... } })
    revalidatePath(`/admin/${parsedInput.orgSlug}/...`)
    return result
  })
```

### 2. Query para React Server Component

```typescript
// src/domains/[domain]/queries/[name].queries.ts
import { prisma } from '@/lib/prisma/client'
export async function getXByOrg(organizationId: string) {
  return prisma.x.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } })
}
```

### 3. Página de listado (RSC)

```typescript
// src/app/(admin)/[orgSlug]/module/page.tsx
import { requirePermission } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface Props { params: Promise<{ orgSlug: string }> }

export default async function ModulePage({ params }: Props) {
  const { orgSlug } = await params
  const ctx = await requirePermission(orgSlug, 'module', 'read').catch(() => redirect('/login'))
  const data = await getDataByOrg(ctx.organizationId)
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Título</h1>
        <CreateSheet orgSlug={orgSlug}><Button size="sm">+ Nuevo</Button></CreateSheet>
      </div>
      <DataTable data={data} orgSlug={orgSlug} />
    </div>
  )
}
```

### 4. Sheet de creación/edición (Client Component)

```typescript
'use client'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

export function CreateXSheet({ orgSlug, children }) {
  const [open, setOpen] = useState(false)
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { orgSlug } })
  const { execute, isPending } = useAction(createXAction, {
    onSuccess: () => { toast.success('Creado.'); form.reset({ orgSlug }); setOpen(false) },
    onError: ({ error }) => toast.error(error.serverError ?? 'Error.'),
  })
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader><SheetTitle>Nuevo X</SheetTitle></SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(execute)} className="space-y-4 mt-6">
            {/* campos */}
            <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Crear'}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

### 5. Módulos y permisos disponibles

```typescript
// Módulos válidos para requirePermission():
type Module = 'dashboard' | 'teams' | 'players' | 'seasons' | 'matches' | 'match_events' |
  'player_stats' | 'staff' | 'articles' | 'categories' | 'events' | 'tags' |
  'media' | 'site_config' | 'users' | 'leagues' | 'competitions'

// Roles: SUPER_ADMIN > LEAGUE_ADMIN > CLUB_ADMIN > CLUB_MANAGER > EDITOR > VIEWER
// EDITOR: solo editorial + media
// CLUB_MANAGER: todo excepto users y site_config
// CLUB_ADMIN: todo
```

---

## Convenciones de código (obligatorias)

- **Sin puntos y coma** en TypeScript
- **function** (no const) para componentes React
- **Interfaces** sobre tipos
- `use client` solo cuando es necesario (evento handlers, hooks, useAction)
- **Páginas de listado** = RSC; **formularios** = 'use client'
- Nombres de archivos en **kebab-case**
- Imports de `@/` (path alias)
- Clases Tailwind con enfoque **utility-first**
- Manejo de errores con **retornos tempranos** y `redirect('/login')` en catch
- **Toasts** via `sonner`: `toast.success()`, `toast.error()`

---

## Schema de Prisma — Modelos clave

```prisma
// Los 23 modelos disponibles (todos tienen organizationId excepto User):
User, OrganizationMember, Organization, League, Venue
Team, Season, Player, PlayerNationality, PlayerSeasonRecord, PlayerStatsSeason
StaffMember, Match, MatchEvent, Competition, CompetitionParticipant
Tag, Article, ArticleCategory, MediaAsset, MediaFolder, MediaFolderAsset
Event, SiteConfiguration

// Enums disponibles:
Role, TeamCategory, Position, MatchStatus, MatchEventType
ArticleStatus, EventStatus, EventType, StaffRole, MediaAssetType
TransferType, CompetitionFormat, CompetitionStage, SeasonType
```

---

## RBAC — Contexto devuelto por requirePermission

```typescript
interface OrgContext {
  userId: string
  userEmail: string
  organizationId: string
  role: Role
}
```

---

## Lo que FALTA implementar (Fase 6)

### A. Páginas de detalle (sports)

#### `/admin/[orgSlug]/sports/matches/[matchId]/page.tsx`
- Muestra datos del partido: equipos, resultado, estado, fecha
- Componente `UpdateMatchResultForm` — cambia score + status a FINISHED
- Componente `MatchEventsTimeline` — lista eventos del partido con minuto/tipo
- Componente `AddMatchEventSheet` — Sheet para agregar gol/tarjeta/sustitución
- Botón eliminar evento (llama `removeMatchEventAction`)
- Botón "Marcar como aplazado/cancelado" (llama `updateMatchStatusAction`)

Queries necesarias: `getMatchWithEvents(matchId, organizationId)` — ya existe en `match.queries.ts`

#### `/admin/[orgSlug]/sports/players/[playerId]/page.tsx`
- Datos personales del jugador
- Historial de temporadas (`PlayerSeasonRecord` con equipo, temporada, stats)
- Botón `enrollPlayerAction` — Sheet para asignar a equipo + temporada activa
- Botón `transferPlayerAction` — Sheet para transferir a otro equipo
- Botón `deactivatePlayerAction`

Query: `getPlayerWithHistory(playerId, organizationId)` — ya existe en `squad.queries.ts`

#### `/admin/[orgSlug]/sports/seasons/page.tsx`
- Lista temporadas de la org
- Sheet para `createSeasonAction`
- Botón `activateSeasonAction` (marca como activa)
- Botón `archiveSeasonAction` (con confirmación de peligro)

Query: `getSeasonsByOrg(organizationId)` — ya existe

#### `/admin/[orgSlug]/sports/teams/page.tsx`
- Lista equipos activos
- Sheet para `createTeamAction` (nombre, categoría: FIRST_TEAM/RESERVE/YOUTH/WOMEN)

Query: `getTeamsByOrg(organizationId)` — ya existe

### B. Páginas de detalle (editorial)

#### `/admin/[orgSlug]/editorial/articles/new/page.tsx`
Y `/admin/[orgSlug]/editorial/articles/[articleId]/page.tsx`

Editor de artículo completo:
- Input de título
- **TipTap** como editor de contenido rico (instalar `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`)
- Sidebar derecha con: estado, categorías (multi-select), tags (multi-select), imagen de portada, isFeatured toggle
- Botones: "Guardar borrador" (`updateArticleAction`), "Publicar" (`publishArticleAction`), "Programar" (modal con datetime + `scheduleArticleAction`)
- TipTap guarda como JSON en el campo `content` (tipo `z.record(z.unknown())` en el schema)

#### `/admin/[orgSlug]/editorial/events/page.tsx`
- Lista eventos con estado (DRAFT/PUBLISHED/CANCELLED/FINISHED)
- Sheet `CreateEventSheet` con `createEventAction`

#### `/admin/[orgSlug]/editorial/categories/page.tsx`
- Lista categorías con color swatch
- Sheet `CreateCategorySheet` con `createCategoryAction`

#### `/admin/[orgSlug]/editorial/tags/page.tsx`
- Lista tags simple
- Sheet `CreateTagSheet` con `createTagAction`

### C. Enrolar jugador — Lógica especial

`enrollPlayerAction` requiere:
- `playerId`, `teamId`, `seasonId`, `jerseyNumber`
- Verifica que la temporada no esté archivada
- Crea en transacción: `PlayerSeasonRecord` (isCurrent=true) + `PlayerStatsSeason` vacío

`transferPlayerAction` requiere:
- `currentRecordId`, `newTeamId`, `jerseyNumber`
- En transacción: cierra record actual (isCurrent=false, transferOutDate=today), crea nuevo record + stats vacío

Ambas acciones ya están implementadas en `squad.actions.ts`.

### D. Staff

#### `/admin/[orgSlug]/sports/staff/page.tsx` (opcional)
- Lista staff con rol (HEAD_COACH, ASSISTANT_COACH, etc.)
- Sheet `CreateStaffMemberSheet` con `createStaffMemberAction`

### E. Sitio público (route group `(public)`)

URL base: `/{orgSlug}/` o directamente `/` si hay una sola org.

Páginas públicas (usando RSC + Lenis Scroll):
- `/` — Home del club (hero, próximo partido, últimas noticias, próximos eventos)
- `/squad` — Plantilla actual (getCurrentSquad + getActiveSeasonByOrg)
- `/matches` — Calendario y resultados (getMatchesByOrg)
- `/news` — Lista de artículos publicados
- `/news/[slug]` — Artículo individual
- `/events` — Próximos eventos
- `/events/[slug]` — Evento individual

Datos: queries directas a Prisma (RSC), filtrar siempre por `status: 'PUBLISHED'` en editorial.

---

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=          # con ?pgbouncer=true para Prisma + Supabase
DIRECT_URL=            # sin pgbouncer
NEXT_REVALIDATE_URL=   # https://tudominio.com/api/revalidate
NEXT_REVALIDATE_SECRET= # string secreto aleatorio
```

---

## Dependencias npm ya asumidas (instalar si no están)

```json
{
  "dependencies": {
    "next": "15.x",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "@prisma/client": "latest",
    "next-safe-action": "latest",
    "next-themes": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",
    "sonner": "latest",
    "date-fns": "latest",
    "lucide-react": "latest",
    "@tiptap/react": "latest",
    "@tiptap/starter-kit": "latest",
    "@tiptap/extension-placeholder": "latest",
    "@tiptap/extension-link": "latest",
    "@tiptap/extension-image": "latest",
    "lenis": "latest"
  }
}
```

---

## Checklist de lo que ya existe (NO reimplementar)

- [x] Schema Prisma completo (23 modelos)
- [x] RLS policies SQL
- [x] Triggers SQL (integridad histórica)
- [x] Middleware de protección de rutas
- [x] Sistema RBAC completo (permissions.ts, session.ts, guards.ts)
- [x] Prisma singleton
- [x] actionClient (next-safe-action)
- [x] Utilidades: slug, stats, storage
- [x] Todos los schemas Zod (sports + editorial)
- [x] Todas las Server Actions (sports + editorial + media + config + iam)
- [x] Queries de Prisma (squad + match)
- [x] Layout del dashboard (sidebar colapsable + topbar + theme toggle)
- [x] Dashboard home (4 KPI cards + 3 widgets)
- [x] Página de partidos (listado + sheet de creación)
- [x] Página de jugadores (listado + sheet de creación)
- [x] Página de artículos (listado)
- [x] Página de media (grid + sheet de subida)
- [x] Página de usuarios (tabla + sheet de invitación)
- [x] Página de configuración (formulario)
- [x] Login page (magic link OTP)
- [x] Auth callback route (activa member en primer login)
- [x] Edge Function publish-scheduled
- [x] API route revalidate
- [x] docs/domains.md

---

## Guía de implementación para el editor TipTap

```typescript
// src/components/admin/editor/tiptap-editor.tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface TipTapEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>)
    },
  })

  return <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
}
```

El contenido se guarda como JSON (`editor.getJSON()`) en el campo `content` del artículo.
Para renderizar en el sitio público, usar `generateHTML(content, [StarterKit])` de TipTap.

---

## Notas importantes

1. **Multi-tenancy**: Siempre filtrar por `organizationId`. NUNCA hacer queries sin ese filtro.
2. **Histórico bloqueado**: `PlayerSeasonRecord.isLocked = true` cuando la temporada está archivada. Las acciones ya lo verifican.
3. **Stats**: Siempre usar `recalculateStatsForMatch()` después de agregar/eliminar eventos. Ya implementado.
4. **Slugs**: Siempre usar `generateUniqueSlug()` al crear artículos, eventos, categorías y tags. Ya implementado.
5. **Formularios de artículo**: Son páginas completas (no Sheet) porque TipTap necesita espacio. El listado usa `Link` a `/articles/new`.
6. **Idioma del código**: English (variables, funciones, tipos). Español en UI (labels, mensajes).
7. **Sin puntos y coma** en todo el código TypeScript.
