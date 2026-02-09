# Plan: UI/UX Refinement (Input Focus)

## Goal
Ensure the keyboard never covers the input fields when typing, improving the user experience on mobile devices.

## Proposed Changes

### Mobile App - Screens & Modals

We will wrap the main content or the Modal content in a `KeyboardAvoidingView` with `behavior={Platform.OS === "ios" ? "padding" : "height"}`.

#### [MODIFY] [maintenance.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/maintenance.tsx)
- Wrap `MaintenanceModal` content (inside the `Modal`) with `KeyboardAvoidingView`.
- Adjust `keyboardVerticalOffset` if necessary (usually needed for header height).

#### [MODIFY] [wallet.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/wallet.tsx)
- Wrap `DocumentModal` content (inside the `Modal`) with `KeyboardAvoidingView`.
- Wrap `DocumentViewModal` content if it has inputs (it has Edit mode, so yes).

#### [MODIFY] [auth/login.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/auth/login.tsx)
- Wrap the main `SafeAreaView` or `View` content in `KeyboardAvoidingView`.

#### [MODIFY] [auth/index.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/auth/index.tsx)
- Wrap the main `SafeAreaView` or `View` content in `KeyboardAvoidingView` (Sign Up screen).

#### [MODIFY] [onboarding.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/onboarding.tsx)
- Wrap the `SafeAreaView` content in `KeyboardAvoidingView` to ensure inputs in the wizard steps are visible.

## Verification Plan

### Manual Verification
1.  **Maintenance**:
    -   Go to Maintenance.
    -   Open "Add" modal.
    -   Tap "Notes" or a bottom field.
    -   Verify keyboard pushes the modal up so the field is visible.
2.  **Wallet**:
    -   Go to Wallet.
    -   Add Document.
    -   Tap input fields.
    -   Verify visibility.
3.  **Auth (Login/SignUp)**:
    -   Logout.
    -   Go to Login.
    -   Tap Password field.
    -   Verify visibility.
    -   Go to Sign Up.
    -   Tap inputs.
    -   Verify visibility.
4.  **Onboarding**:
    -   Start Onboarding (might need to create new account or reset).
    -   Typing in "Mileage" or "Brand" search.
    -   Verify visibility.
