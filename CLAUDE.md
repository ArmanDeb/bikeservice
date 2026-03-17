# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Réalisation.md — Mandatory Update Rule

After every session where code is changed, append an entry to `Réalisation.md`:
- New dated section under `## 4. Journal de bord` in French, matching the existing tone
- Bullet points for actions, decisions, and rationale (name specific files/services touched)
- New row in `## 5. Problèmes rencontrés & Solutions` for every bug fixed

## Agent Framework (Antigravity Kit)

`.agent/` contains the full protocol — follow `AGENT_FLOW.md` before any code or design work:

1. **Classify** the request (QUESTION / SURVEY / SIMPLE CODE / COMPLEX CODE / DESIGN / SLASH CMD)
2. **Route** to the correct agent → read `.agent/agents/{agent}.md`, announce `Applying knowledge of @[agent-name]...`, load its `skills:`
3. **Socratic Gate** — new features: ask ≥3 questions before coding; bug fixes: confirm impact
4. **Load skills selectively** — read `SKILL.md` index first, then only relevant sections
5. **Validate** with `python .agent/scripts/checklist.py .` before marking complete

| Domain | Agent | Key Skills |
|--------|-------|------------|
| Mobile (RN/Expo) | `mobile-developer` | `mobile-design` |
| Database / schema | `database-architect` | `database-design` |
| Debugging | `debugger` | `systematic-debugging` |
| Multi-domain | `orchestrator` | `parallel-agents`, `behavioral-modes` |
| Planning | `project-planner` | `brainstorming`, `plan-writing` |

**Mobile work always uses `mobile-developer`, never `frontend-specialist`.**

Slash commands → read `.agent/workflows/{command}.md`. Available: `/brainstorm`, `/create`, `/debug`, `/deploy`, `/enhance`, `/orchestrate`, `/plan`, `/preview`, `/status`, `/test`, `/ui-ux-pro-max`

Full reference: `.agent/ARCHITECTURE.md`

---

## Project Overview

Monorepo with two independent apps:
- **`mobile/`** — React Native (Expo 54) mobile app (primary codebase)
- **`web/`** — Next.js 16 marketing site

## Commands

```bash
# Mobile (cd mobile first)
npm start                                              # Expo dev server
npm run ios / npm run android                         # Native simulator builds

# EAS (from repo root)
eas build --profile development --platform android    # Dev client APK
eas build --profile preview --platform android        # Preview APK
eas build --profile production                        # Store build

# Web (cd web first)
npm run dev / npm run build / npm run lint
```

## Architecture

### Offline-First Sync

**WatermelonDB** (SQLite) is the local DB; **Supabase** (PostgreSQL) is the cloud backend. `SyncService` pulls `updated_at > lastPulledAt`, then pushes local changes respecting FK order (deletes: documents → logs → vehicles; creates: reverse). Supabase uses soft deletes (`deleted_at`). Sync triggers on app launch in `mobile/app/_layout.tsx`.

### Database Schema (v6)

Four tables: `vehicles`, `maintenance_logs`, `documents`, `document_pages`. Key FKs:
- `maintenance_logs.vehicle_id` → `vehicles.id`
- `documents.vehicle_id` → nullable (null = user-level doc, e.g. license shared across vehicles)
- `documents.log_id` → nullable (links invoices to logs)
- `document_pages.document_id` → `documents.id`

Models in `mobile/src/database/models/` use `@field`, `@children`, `@writer` decorators. Always use `TableName` enum from `mobile/src/database/constants.ts`, never raw strings. Schema changes require updating `schema.ts` + `migrations.ts` (bump version) + Supabase table.

### State Management

React Context in `mobile/src/context/`:
- **AuthContext** — Supabase session, sign-out, account deletion + local DB wipe
- **VehicleContext** — currently selected vehicle
- **ThemeContext** — `dark` / `paper` (warm cream) / `system`; injects CSS vars via NativeWind `vars()`
- **LanguageContext** — FR/EN only; translation strings inline in the file
- **NetworkContext** — online/offline detection, triggers auto-sync on reconnect

### Services (`mobile/src/services/`)

`VehicleService`, `MaintenanceService`, `DocumentService` (Supabase Storage), `PDFService` (expo-print), `AIService` (Gemini `gemini-flash-latest`, invoice OCR), `StorageService`, `SecureStorage`, `TCOService`, `SyncService`

### Navigation

Expo Router: `intro.tsx` → `auth/login.tsx` → `onboarding.tsx` → `(tabs)/`
Tabs: Garage (index), Maintenance, Dashboard, Wallet, Settings. Auth gating in root `_layout.tsx`.

## Key Technical Details

- **Decorators**: Babel config uses `@babel/plugin-proposal-decorators` (`legacy: true`) + `react-native-reanimated/plugin`
- **NativeWind**: semantic color tokens via CSS variables in `mobile/tailwind.config.js`
- **Env vars**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (configured in `mobile/src/services/Supabase.ts`)
- **RLS policies + full schema**: `supabase_schema.sql` at repo root
