# MVP Polish & Hardening Plan

## Overview
Address critical usability issues, fix bugs, and harden the application for alpha launch. Focus on offline capabilities, data integrity, and cross-device responsiveness.

## Project Type
**MOBILE** (React Native / Expo) - Use `mobile-developer` agent.

## Success Criteria
- [ ] Dark mode text is fully legible on all screens (Sign In/Up).
- [ ] "Add Maintenance" button prevents double submissions.
- [ ] Application scales correctly on different screen sizes (specifically Samsung S23).
- [ ] Offline mode allows existing users to access cached data.
- [ ] New users are gracefully handled when offline (cannot sign up).
- [ ] Deleting a user/record from DB automatically deletes associated files from Storage.
- [ ] No high-severity security vulnerabilities found.

## Tech Stack
- **Frontend:** React Native (Expo), NativeWind (Tailwind CSS)
- **Database (Local):** WatermelonDB (Offline-first)
- **Backend:** Supabase (Auth, Storage, Edge Functions/Triggers)

## File Structure
No major structural changes expected. Work will focus on existing components in:
- `components/` (UI fixes)
- `screens/` (Layout & logic)
- `utils/` or `services/` (Sync/Offline logic)
- `supabase/` (Backend triggers)

---

## Task Breakdown

### Phase 1: Quick Wins & Visuals (Easy/Medium)

#### 1. Fix Dark Mode Text Visibility [P0]
**Context:** Sign-in/Sign-up text is black on dark backgrounds.
**Agent:** `mobile-developer`
- [ ] Identify `TextInput` and `Text` components in Auth screens.
- [ ] Apply `dark:text-white` or correct NativeWind classes.
- [ ] **Verify:** Switch device to Dark Mode; text must be white/readable.

#### 2. Prevent Double Submission [P1]
**Context:** "Add Maintenance" creates duplicates if clicked fast.
**Agent:** `mobile-developer`
- [ ] Add loading state (`isLoading`) to the submission button.
- [ ] Disable button immediately `onPress`.
- [ ] Debounce the submit handler if necessary.
- [ ] **Verify:** Click button rapidly; only one record should be created.

#### 3. Responsive UI Fixes [P1]
**Context:** Text is too big/proportions wrong on real devices (e.g., S23).
**Agent:** `mobile-developer`
- [ ] Review `className` usage for hardcoded pixels vs relative units (`rem` or `text-base`).
- [ ] Ensure `SafeAreaView` is correctly implemented.
- [ ] Fix "S'inscrire" / "Se connecter" layout collision in Auth screen.
- [ ] **Verify:** Test on emulator with changed densities/sizes. Text should scale appropriately.

### Phase 2: Offline & Connectivity (Hard)

#### 4. Offline Connectivity Logic [P0]
**Context:** App needs to work without internet for existing users.
**Agent:** `mobile-developer`
- [ ] Implement `NetInfo` listener to track connection state.
- [ ] **New Users:** Show "No Internet Connection" blocking screen or modal on Auth screens.
- [ ] **Existing Users:**
    - Ensure WatermelonDB loads cached data on boot without network.
    - Suppress "Network Request Failed" errors for background syncs.
    - Queue critical actions (if possible) or disable online-only features (e.g., generic file upload) when offline.
- [ ] **Verify:** Turn off WiFi/Data -> Open App -> Should see Garage/Maintenance data.

### Phase 3: Data Integrity (Hard/Backend)

#### 5. Automate Storage Cleanup [P2]
**Context:** DB deletion leaves orphaned files in Supabase Storage.
**Agent:** `backend-specialist`
- [ ] Create a Supabase Database Webhook or Trigger (PL/pgSQL).
- [ ] **Logic:** `AFTER DELETE ON users/documents` -> Invoke Edge Function or direct Storage API to delete file at `path`.
- [ ] **Verify:** Upload file -> Delete record in DB -> Verify file is gone from Storage bucket.

### Phase 4: Final Verification (P3)

#### 6. Security & Stability Audit [P0]
**Context:** Ensure no vulnerabilities for alpha export.
**Agent:** `security-auditor`
- [ ] Run `security_scan.py`.
- [ ] Verify RLS (Row Level Security) policies on Supabase.
- [ ] **Verify:** Report generated with 0 high-risk issues.

---

## ✅ PHASE X: Verification Checklist
- [ ] **Visuals:** Dark mode text readable?
- [ ] **UX:** No double submissions?
- [ ] **Responsiveness:** Layout fits S23/iPhone screens?
- [ ] **Offline:** App opens and shows data without internet?
- [ ] **Cleanup:** Deleted data = Deleted files?
- [ ] **Security:** Scan passed?
