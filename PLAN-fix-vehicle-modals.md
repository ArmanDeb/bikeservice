# PLAN-fix-vehicle-modals

## Goal
Fix clipping issues in "Add Machine" and "Edit Machine" modals (`VehicleModal`) and align their styling (darker overlay, better scrolling) with the previously updated Maintenance and Wallet modals.

## Project Type
**MOBILE** (React Native / Expo)

## Success Criteria
- [ ] `VehicleModal` overlay is darker (`rgba(28, 28, 30, 0.8)`).
- [ ] "Add Vehicle" modal: Inputs and "Save" button are fully visible and scrollable.
- [ ] "Edit Vehicle" modal: "Delete" button is fully visible at the bottom.
- [ ] No `maxHeight` constraint clipping the content.
- [ ] Keyboard does not obscure input fields (`extraScrollHeight={120}`).

## Tech Stack
- React Native
- Expo
- `react-native-keyboard-aware-scroll-view`

## File Structure
- `app/(tabs)/index.tsx` (Contains `VehicleModal`)

## Task Breakdown

### 1. Style & Layout Updates
- [ ] **Modify `app/(tabs)/index.tsx`**:
    - [ ] Update `modalOverlay` background color to `rgba(28, 28, 30, 0.8)`.
    - [ ] Remove `maxHeight: '90%'` from `modalContent` style.
    - [ ] Update `KeyboardAwareScrollView` props:
        - [ ] Set `contentContainerStyle` to include `paddingTop: '15%'`.
        - [ ] Set `extraScrollHeight={120}`.

### 2. Verification (Phase X)
- [ ] **Manual Check**:
    - [ ] Open "Add Vehicle": Verify scroll to bottom, buttons visible.
    - [ ] Open "Edit Vehicle": Verify "Delete" button visible.
    - [ ] Check keyboard interaction (inputs stay visible).
- [ ] **Automated**: `npx tsc --noEmit`

## Next Steps
- Run `/create` or start implementation manually after approval.
