# PLAN: Garage Drag & Drop Reordering

L'objectif est de permettre à l'utilisateur de réorganiser ses motos dans le garage par simple glisser-déposer (appui long).

## 🛠 Tech Stack & Dépendances
- **UI**: `react-native-draggable-flatlist`
- **Gestures**: `react-native-gesture-handler`
- **Database**: WatermelonDB (local) & Supabase (remote)

## 📋 Étapes d'implémentation

### Phase 1: Schéma & Modèle (Data Layer)
- [ ] **Supabase**: Ajouter la colonne `display_order` (type: integer, default: 0) à la table `vehicles`.
- [ ] **WatermelonDB (Schema)**: Passer à la version 4 du schéma et ajouter la colonne `display_order` à la table `vehicles`.
- [ ] **WatermelonDB (Model)**: Mettre à jour le modèle `Vehicle.ts` pour inclure le champ `@field('display_order') displayOrder`.

### Phase 2: Services & Logique (Business Layer)
- [ ] **VehicleService.observeVehicles**: Modifier la requête pour trier par `display_order` (ASC).
- [ ] **VehicleService.createVehicle**: S'assurer que chaque nouvelle moto reçoit un `display_order` incrémenté (plus grand que le max actuel).
- [ ] **VehicleService.updateVehiclesOrder**: Créer une méthode pour mettre à jour en lot l'ordre des motos après un drag.

### Phase 3: Interface Utilisateur (UI Layer)
- [ ] **Installation**: Ajouter `react-native-draggable-flatlist` au `package.json`.
- [ ] **GarageScreen (index.tsx)**:
    - Implémenter `DraggableFlatList`.
    - Utiliser l'action `drag()` fournie par le renderItem lors d'un `onLongPress`.
    - Implémenter `onDragEnd` pour appeler le service de mise à jour de l'ordre.
    - Ajouter un feedback visuel (vibration légère via `Haptics` si possible).

### Phase 4: Synchronisation & Finalisation
- [ ] Vérifier que l'ordre est bien synchronisé avec Supabase.
- [ ] Gérer l'initialisation de `display_order` pour les motos existantes (basé sur la date de création).

---

## ⚠️ Notes Techniques
- L'utilisation de `DraggableFlatList` nécessite que `GestureHandlerRootView` soit présent à la racine de l'application (normalement déjà le cas avec Expo Router).
- Un re-build natif (`npx expo run:android`) sera nécessaire après l'installation des dépendances.
