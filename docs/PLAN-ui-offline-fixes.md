# Plan: UI Fixes & Offline Refinement

## Context
The user has identified several UI inconsistencies and issues with the offline experience. Specifically:
- **Sign Up Button**: Missing label text.
- **Theme Toggle**: Inconsistent positioning and shadow artifacts.
- **Welcome Screen**: Wrong image (bicycle instead of logo).
- **Offline Logic**: Confusion around button text ("Offline") and access for logged-out users.

## User Question: Offline Access
> "Si je n'ai pas d'internet mais que je suis un user existant et que je suis déconnecté, comment fais-je pour accéder à mon application? Est-ce possible?"

**Answer**: 
- **If you are logged OUT (signed out)**: You **cannot** log back in without an internet connection. This is a security requirement (cannot verify password locally).
- **If you are logged IN (session active)**: You **can** access the app offline. The session persists locally. 
- **Action**: We must ensure the app does not log users out unnecessarily and clearly communicates "No Internet" when trying to log in, rather than just disabling the UI without explanation.

## Proposed Changes

### 1. UI Consistency (Auth Screens)
#### [MODIFY] [login.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/auth/login.tsx)
-   **Theme Toggle**: 
    -   Fix positioning to match `index.tsx` exactly (`top: 10`, `right: 24`).
    -   Remove `elevation` or `shadow` styles that cause the "square shadow" artifact on the light mode icon.
-   **Button Text**: Revert "Offline" text change. The button should always say "Se connecter".
-   **Offline Handling**: Add `onPress` check: if `!isConnected`, show `Alert("Pas d'internet", "Veuillez vérifier votre connexion.")`.
-   **Footer**: Ensure "S'inscrire" link is visible and correctly styled.

#### [MODIFY] [index.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/auth/index.tsx)
-   **Button Text**: Fix the "S'inscrire" button label (User reported it doesn't show "S'inscrire").
-   **Theme Toggle**: Ensure positioning matches `login.tsx`.
-   **Offline Handling**: Revert "Offline" text. Keep "S'inscrire". Show Alert on press if offline.

### 2. Branding & Content
#### [MODIFY] [intro.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/intro.tsx)
-   **Logo**: Replace the current generic bicycle image/icon with the application logo (if available in assets) or a more appropriate icon/text representation as requested.

### 3. Verification Plan
-   **Visual**: Toggle between Login/Sign Up. Toggle Dark/Light mode. Verify no jumping UI or artifacts.
-   **Offline**: Turn off WiFi -> Text remains "Se connecter" -> Press -> Alert appears.
-   **Logo**: Check Welcome screen.
