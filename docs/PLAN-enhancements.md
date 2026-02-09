# Plan: Wallet Zoom & Maintenance UX Enhancements

## Goal
1.  **Wallet**: Enable pinch-to-zoom for document previews.
2.  **Maintenance**: Allow users to attempt to add a log even if no vehicle is selected, but block them with a helpful alert directing them to the Garage.

## User Review Required
> [!NOTE]
> Installing `react-native-image-viewing` for robust zoom capabilities.

## Proposed Changes

### Dependencies
#### [NEW] `react-native-image-viewing`
- Install via `npm install react-native-image-viewing`.

### Mobile App

#### [MODIFY] [wallet.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/wallet.tsx)
- Import `ImageViewing` from `react-native-image-viewing`.
- Replace the custom `Modal` image preview with `ImageViewing`.
- Ensure it handles the `visible`, `imageIndex`, and `onRequestClose` props correctly.
- Pass the `localUri` as an array `[{ uri: localUri }]`.

#### [MODIFY] [maintenance.tsx](file:///Users/arman/Documents/Projects/bikeservice/mobile/app/(tabs)/maintenance.tsx)
- Logic change for the "Add" (+) button in the header.
- **Current**: Button is conditionally rendered `{selectedVehicleId && <Pressable ... />}`.
- **New**: Render button always.
- **in onPress**:
    ```typescript
    if (!selectedVehicleId) {
        Alert.alert(
            language === 'fr' ? "Aucune moto sélectionnée" : "No moto is selected",
            language === 'fr' ? "Veuillez en sélectionner une dans votre garage" : "Please select one from your garage",
            [
                { text: language === 'fr' ? "Annuler" : "Cancel", style: "cancel" },
                { 
                    text: language === 'fr' ? "Aller au garage" : "Go to garage", 
                    onPress: () => router.push('/(tabs)') // Navigate to Garage tab
                }
            ]
        )
        return
    }
    setModalVisible(true)
    ```
- Need to ensure `router` is imported from `expo-router`.

## Verification Plan

### Automated Tests
- None for UI interactions.

### Manual Verification
1.  **Wallet Zoom**:
    - Open Wallet.
    - Select a vehicle with documents (or add one).
    - Tap a document to view it.
    - Click the image preview (or "eye" icon).
    - Verify regular pinch-to-zoom works.
    - Verify double-tap to zoom works.
    - Verify swipe down to close works.

2.  **Maintenance Check**:
    - Go to Maintenance tab.
    - Deselect vehicle (if possible, or start fresh/reset app state to have no selection).
    - *Note*: The standard behavior of the app selects a vehicle if `selectedVehicleId` is persisted. I might need to manually set it to null in code or add a "Deselect" feature to test, OR just switch to a vehicle-less state if possible.
    - Alternatively, standard use case: fresh install/login where no vehicle is selected yet.
    - Press the "+" button (top right).
    - Verify Alert appears with correct text.
    - Press "Go to garage".
    - Verify navigation to Garage screen.
