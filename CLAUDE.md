# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bike Service is a vehicle maintenance tracking app. It's a monorepo with two independent apps (no shared workspace tooling):

- **`mobile/`** — React Native (Expo 54, SDK 54) mobile app (primary codebase)
- **`web/`** — Next.js 16 marketing/docs site

## Commands

### Mobile App (`mobile/`)
```bash
cd mobile
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

### Web App (`web/`)
```bash
cd web
npm run dev        # Next.js dev server
npm run build      # Production build
npm run lint       # ESLint
```

## Architecture

### Offline-First Data Sync

The core architectural pattern is **offline-first** using WatermelonDB (SQLite) as the local database with Supabase (PostgreSQL) as the cloud backend.

- **WatermelonDB** provides the local data layer with reactive queries via RxJS `.observe()`
- **SyncService** (`mobile/src/services/SyncService.ts`) implements the WatermelonDB sync protocol: pull changes from Supabase where `updated_at > lastPulledAt`, then push local changes
- Push phase respects FK constraints: deletes in reverse order (documents → logs → vehicles), creates/updates in forward order
- Supabase uses **soft deletes** (`deleted_at` column) for sync consistency
- Sync is triggered on app launch after authentication (in `mobile/app/_layout.tsx`)

### Database Schema

WatermelonDB schema at version 6 (`mobile/src/database/schema.ts`), with migrations in `mobile/src/database/migrations.ts`.

Four tables: `vehicles`, `maintenance_logs`, `documents`, `document_pages`

Key relationships:
- `maintenance_logs.vehicle_id` → `vehicles.id`
- `documents.vehicle_id` → `vehicles.id` (nullable — `null` for user-level docs like license)
- `documents.log_id` → `maintenance_logs.id` (nullable — links invoices to logs)
- `document_pages.document_id` → `documents.id`

Models use WatermelonDB decorators (`@field`, `@children`, `@writer`) in `mobile/src/database/models/`.

### Context Providers

State management uses React Context (`mobile/src/context/`):
- **AuthContext** — Supabase session, sign-out, account deletion with full data cleanup
- **VehicleContext** — Currently selected vehicle
- **ThemeContext** — Dark/light mode with CSS variable injection for NativeWind
- **LanguageContext** — i18n with ~20 supported languages (translation strings inline)
- **NetworkContext** — Online/offline detection

### Services Layer

All business logic lives in `mobile/src/services/`:
- **SyncService** — WatermelonDB ↔ Supabase sync
- **VehicleService** — Vehicle CRUD, reordering, cascade delete
- **MaintenanceService** — Maintenance log operations
- **DocumentService** — Document lifecycle (upload/download/delete with Supabase Storage)
- **PDFService** — PDF generation from maintenance records via `expo-print`
- **AIService** — Google Gemini (`gemini-flash-latest`) invoice scanning: image → base64 → Gemini → extracted maintenance data
- **StorageService** — Expo file system operations
- **SecureStorage** — Secure token storage adapter for Supabase auth
- **TCOService** — Total Cost of Ownership calculations

### Navigation

Expo Router file-based routing (`mobile/app/`):
- `intro.tsx` → `auth/login.tsx` → `onboarding.tsx` → `(tabs)/`
- Root `_layout.tsx` handles auth gating and initial sync
- Tabs: Garage (index), Maintenance, Dashboard, Wallet (documents), Settings

### Environment Variables

Mobile app uses `EXPO_PUBLIC_` prefix for client-side env vars:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Configured in `mobile/src/services/Supabase.ts`.

## Key Technical Details

- **TypeScript strict mode** enabled in both apps
- **Decorators** are used for WatermelonDB models — Babel config includes `@babel/plugin-proposal-decorators` with `legacy: true` and `react-native-reanimated/plugin`
- **NativeWind** (Tailwind for React Native) with custom semantic color tokens defined via CSS variables in `mobile/tailwind.config.js`
- Supabase schema with RLS policies is in `supabase_schema.sql` at the repo root
- When adding new WatermelonDB tables/columns: update `schema.ts`, add a migration in `migrations.ts`, bump schema version, and update the corresponding Supabase table
