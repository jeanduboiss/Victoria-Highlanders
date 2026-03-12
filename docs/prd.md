# Product Requirements Document (PRD)
## Victoria Highlanders — Sports Management Platform

**Version:** 1.0.1
**Date:** 2026-03-11
**Status:** Approved — Fase 1

---

## 1. Vision

Build a digital sports management platform for Victoria Highlanders, a semi-professional football club. The platform combines a public-facing website with a full administrative dashboard, eliminating the need to touch code for day-to-day operations.

The system is designed from day one with a multi-tenant architecture that scales to support full leagues, multiple clubs, and centralized league administration — without schema changes.

---

## 2. Problem Statement

The club currently lacks a unified digital system to manage:
- Player roster with historical season records
- Match scheduling and results
- News and editorial content
- Club events
- Digital media assets
- Site identity and branding

Operations are fragmented across spreadsheets, social media, and manual updates. Administrators need full control without developer intervention.

---

## 3. Target Users

| Role | Description | Access Level |
|---|---|---|
| Super Admin | Platform owner, Velion team | Full platform access |
| Club Admin | Club director / general manager | Full club access |
| Club Manager | Team manager / technical staff lead | Sports module, read config |
| Editor | Communications / press officer | Editorial + Media |
| Viewer | Read-only staff member | Read-only within club |

**Authentication:** Invitation-only via Supabase Auth (email invite / magic link). No public registration.

---

## 4. Functional Modules

### 4.1 News (Editorial CMS)
- Create, edit, delete articles
- Auto-generated slug from title
- Status workflow: DRAFT → SCHEDULED → PUBLISHED → ARCHIVED
- Scheduled publishing (publish at a future date/time)
- Article categories (N:M relationship)
- Featured flag
- Cover image via Media Manager
- Basic SEO fields (meta title, meta description)

### 4.2 Events
- Create, edit, delete events
- Event types: MATCH, TRAINING, SOCIAL, MEMBERSHIP, PRESS, CHARITY, OTHER
- Start/end datetime
- Venue (linked to Venue entity or free-text location)
- Status: DRAFT, PUBLISHED, CANCELLED, FINISHED
- Featured flag
- Cover image via Media Manager

### 4.3 Team Management
- Multiple team categories per organization:
  FIRST_TEAM, RESERVE, U23, U20, U18, U16, U14, U12, WOMEN, FUTSAL
- Each team has name, badge, category, gender, description
- Technical staff (StaffMember) linked per team

### 4.4 Player Management
- Player pool belongs to the organization (not to a specific team)
- Personal data: name, date of birth, nationality, photo, position, height, weight, biography
- Season enrollment: assign player to a team for a season (jersey number, contract type)
- In-season transfers: move player between teams within the same season
- Historical records: all past season assignments are immutable and preserved
- Soft-delete: players with historical records cannot be permanently deleted

### 4.5 Season Management
- Create seasons with name and date range
- Activate a season (only one `is_current = true` per organization at a time)
- Archive a season: seals all player records and stats as immutable
- Archived season data is read-only at all layers (DB trigger + Prisma middleware + service layer)

### 4.6 Match Management
- Schedule matches: home/away teams, date, venue, competition name, match day
- Match statuses: SCHEDULED, FINISHED, POSTPONED, CANCELLED, ABANDONED
- Record result (home score / away score) after the match ends
- Log match events manually post-match: goals, own goals, yellow/red cards, substitutions
- MatchEvents automatically update PlayerStatsSeason

### 4.7 Player Statistics
- Accumulated per player per team per season (PlayerStatsSeason)
- Fields: matches played, matches started, minutes played, goals, assists, yellow cards, red cards
- Goalkeeper-specific: clean sheets, goals conceded, saves
- Linked to PlayerSeasonRecord for historical integrity
- Manual entry post-match (no live scoring)

### 4.8 Media Manager
- Upload files to Supabase Storage
- Supported types: images (JPG, PNG, WebP, GIF, SVG), videos, documents
- Virtual folder structure with nested subfolders
- Asset tagging with alt text and caption
- Safe deletion: assets referenced in articles, events, or site config cannot be hard-deleted (soft archive)
- Centralized media library accessible from any content form

### 4.9 Site Configuration
- Site name, tagline
- Logo, favicon, hero image (from Media Manager)
- Primary, secondary, accent colors (Tailwind-compatible hex values)
- Font preferences (heading / body)
- Social links: Twitter/X, Instagram, Facebook, YouTube, TikTok, LinkedIn
- Contact info: email, phone, address
- Google Analytics ID
- Default SEO title and description
- Changes take effect immediately on the public site (on-demand revalidation)

### 4.10 Residency Program Page
- Static/configurable content page on the public site
- No application forms or payment processing
- Content managed via Site Configuration or a dedicated configurable text block
- Describes the international residency program for prospective players

### 4.11 User & Role Management
- Invite users by email (Supabase Auth invite flow)
- Assign role upon invitation
- Activate / deactivate users
- Role-based access to modules (RBAC)
- A user can belong to multiple organizations with different roles

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Language | English (single language, no i18n) |
| Deployment | Vercel |
| Database | Supabase (PostgreSQL) via Prisma ORM |
| Auth | Supabase Auth (invitation-only) |
| Storage | Supabase Storage + CDN |
| Performance | LCP < 2.5s, CLS < 0.1 (Core Web Vitals) |
| Images | WebP format, lazy loading, responsive sizes |
| Accessibility | WCAG 2.1 AA minimum |
| Security | RLS on all tables, no public DB access |
| Mobile | Mobile-first responsive design |
| Scroll | Lenis smooth scroll on public site |

---

## 6. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| ORM | Prisma (connected to Supabase PostgreSQL) |
| Database | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| UI Components | shadcn/ui + Radix UI |
| Visual Effects | Magic UI |
| Styling | Tailwind CSS (utility-first, mobile-first) |
| Validation | Zod |
| Server Actions | next-safe-action |
| Variant Management | Class Variance Authority (CVA) |
| Scroll | Lenis |
| Deployment | Vercel |

---

## 7. Architecture Approach

- **Single Next.js app** with route groups: `(public)` for the club website, `(admin)` for the dashboard
- **Multi-tenant ready from day 1**: `organization_id` on all domain tables; RLS enforces isolation
- **DDD (Domain-Driven Design)**: 6 bounded contexts with clear ownership
- **Historical integrity**: Season archival seals all player records as immutable (3-layer protection)
- **No monorepo** for the initial implementation; single app structure

---

## 8. Roadmap by Phase

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Conceptual Architecture | In Progress |
| **Phase 2** | Database Design (Prisma schema + Supabase migrations + RLS) | Pending |
| **Phase 3** | RBAC System Design | Pending |
| **Phase 4** | Service & Domain Layer Definition | Pending |
| **Phase 5** | Dashboard UI Structure (shadcn/ui + Magic UI) | Pending |
| **Phase 6** | Full Implementation | Pending |

---

## 9. Out of Scope (Current Version)

- Live match scoring / real-time scoreboard
- Player application / recruitment forms
- Payment processing
- Multi-language support (i18n)
- Mobile native app
- Public user registration
- Fan engagement features (comments, polls)
- Ticket sales
- League administration panel (future multi-tenant feature)

---

## 10. Alcance de Desarrollo (Bloque YEPK)

En la fase actual de desarrollo se trabaja en paralelo con un segundo desarrollador (Bloque JD/JF). 
Las áreas de responsabilidad están estrictamente divididas para evitar conflictos en el merge a `main`.

**Funcionalidades del Bloque YEPK (Nuestro alcance exclusivo):**
- Listado del plantel por equipo/categoría con filtro por temporada.
- Contador regresivo para el próximo partido.
- Añadir todos los partidos de la liga (no solo del club).
- Opciones de configuración del sitio para ocultar secciones (resultados o tabla).
- Subida multimedia por URL externa (YouTube/Drive/links).
- CRUD de Sponsors.
- Biblioteca de imágenes con límite configurable.
- Integración nativa con Google Calendar.
- Módulo de exportación/uso de links externos.
- Mostrar primer equipo por defecto, filtrar por categorías y destacar goleadores.
- Dashboard administrativo para crear nuevas páginas y ver el changelog (updates).

**Reglas Estrictas de Integración:**
- **Prohibido** modificar la lógica de incidencias o estadísticas.
- **Prohibido** tocar la "Tabla de posiciones" (Standings).
- **Prohibido** editar los modelos Prisma relacionados con goles, asistencias, tarjetas o cambios (`MatchEvent`, `PlayerStatsSeason`).
- **Prohibido** refactorizar código global que afecte al bloque paralelo.
- **Prohibido** cambiar nombres de campos existentes o alterar las relaciones en modelos compartidos.
- Todo cambio en campos de la base de datos (Ej., añadir la URL externa en multimedia) debe ser opcional (`?`) e incluir solo lo estrictamente necesario.

