# Plan: UI Responsiveness Fixes

## Goal Description
Address UI responsiveness issues reported on Android devices (S23), specifically focusing on font sizes, button visibility, and layout overflows in the Garage, Dashboard, and Maintenance screens.

## User Review Required
> [!NOTE]
> Changes involve reducing font sizes and potentially truncating long text strings to fit smaller screens.

## Proposed Changes

### Garage Screen
#### [MODIFY] [index.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/index.tsx)
- Reduce `vehicleName` font size from `22` to `20` or `18`.
- Add `numberOfLines={1}` and `ellipsizeMode="tail"` to vehicle name text.
- Adjust card padding if necessary for compact views.

### Dashboard Screen
#### [MODIFY] [dashboard.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/dashboard.tsx)
- Update the vehicle indicator row layout.
- Add `flex: 1` and `flexShrink: 1` to the vehicle name container.
- Ensure the PDF Export button has a fixed minimum width or doesn't get pushed off-screen.
- Add `numberOfLines={1}` to the dashboard vehicle name display.

### Maintenance Screen
#### [MODIFY] [maintenance.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/maintenance.tsx)
- Make the "Scanner" button responsive:
  - Reduce text size or hide text on very small screens (if feasible) or adjust padding.
  - Ensure the modal header row handles wrapping or shrinking gracefully.

## Verification Plan

### Manual Verification
1.  **Garage Screen**:
    -   Add a vehicle with a long name (e.g., "Honda CB1000 Hornet SP Edition Limited").
    -   Verify text truncates correctly and doesn't break layout.
2.  **Dashboard Screen**:
    -   Select the long-named vehicle.
    -   Verify the "Export PDF" button is visible and clickable next to the vehicle name.
3.  **Maintenance Modal**:
    -   Open "New Log" modal.
    -   Verify "Scanner" button is fully visible and aligned with the title.
