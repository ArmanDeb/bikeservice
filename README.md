# 🏍️ Bike Service

**Application mobile de carnet d'entretien moto — Offline-First**

> Travail de Fin d'Études — Bachelier en Informatique de Gestion (2025-2026)
> Arman Debongnie

---

## 📋 Description

Bike Service est une application mobile conçue pour les propriétaires de motos. Elle centralise le suivi d'entretien, la gestion documentaire et l'analyse financière (TCO) dans un outil unique, disponible même sans connexion Internet.

**Le problème résolu :** Aucune application existante ne couvre à la fois le suivi mécanique, le portefeuille documentaire (permis, assurance, carte grise) et le calcul du coût réel de possession — tout en fonctionnant hors-ligne.

### Fonctionnalités principales

- **🔧 Journal de maintenance** — Enregistrement des interventions avec validation kilométrique, historique chronologique et pièces jointes (photos de factures)
- **📄 Wallet documentaire** — Coffre-fort numérique pour les documents administratifs (permis, assurance, carte grise), consultable lors d'un contrôle routier
- **📊 Tableau de bord TCO** — Calcul automatique du coût total de possession et du coût au kilomètre
- **🤖 Scanner IA** — Extraction automatique des données depuis une photo de facture (montant, date, type d'intervention) via Google Gemini
- **📱 Multi-véhicules** — Gestion d'un garage complet avec réorganisation par glisser-déposer
- **📤 Export PDF** — Génération de rapports professionnels pour la revente
- **🌐 Bilingue** — Interface disponible en français et en anglais

---

## 🏗️ Architecture

L'application suit une architecture **Offline-First** (Client Lourd) :

```
┌──────────────────────────────┐
│     Application Mobile       │
│    (React Native / Expo)     │
│                              │
│  ┌────────────────────────┐  │
│  │     WatermelonDB       │  │
│  │   (SQLite - Local)     │  │
│  └──────────┬─────────────┘  │
└─────────────┼────────────────┘
              │ Sync (quand réseau disponible)
              ▼
┌──────────────────────────────┐
│     Supabase (Cloud)         │
│  ┌──────────┐ ┌───────────┐  │
│  │PostgreSQL│ │  Storage  │  │
│  │  + RLS   │ │  (S3)     │  │
│  └──────────┘ └───────────┘  │
└──────────────────────────────┘
```

- **Données locales d'abord** : Toute opération est écrite en local (WatermelonDB/SQLite) avant synchronisation
- **Synchronisation automatique** : Les données remontent sur Supabase dès qu'une connexion est détectée
- **Row Level Security (RLS)** : Isolation stricte des données par utilisateur côté serveur

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| **Framework** | React Native (Expo) |
| **Langage** | TypeScript |
| **Base de données locale** | WatermelonDB (SQLite) |
| **Backend / Auth** | Supabase (PostgreSQL + Auth + Storage) |
| **Style** | NativeWind (Tailwind CSS pour mobile) |
| **IA** | Google Gemini 1.5 Flash (scanner de factures) |
| **PDF** | expo-print + expo-sharing |
| **Sécurité** | expo-secure-store (chiffrement des tokens) |
| **Connectivité** | @react-native-community/netinfo |

---

## 📁 Structure du projet

```
bikeservice/
├── mobile/                         # Application React Native
│   ├── app/                        # Écrans (Expo Router)
│   │   ├── (tabs)/                 # Navigation principale
│   │   │   ├── dashboard.tsx       # Tableau de bord TCO
│   │   │   ├── maintenance.tsx     # Journal d'entretien
│   │   │   ├── wallet.tsx          # Portefeuille documentaire
│   │   │   ├── settings.tsx        # Paramètres
│   │   │   └── index.tsx           # Garage (page d'accueil)
│   │   ├── auth/                   # Authentification
│   │   ├── onboarding/             # Ajout premier véhicule
│   │   └── legal/                  # Pages légales (CGU, Confidentialité)
│   ├── src/
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── common/             # Modaux, inputs, confirmations
│   │   │   ├── maintenance/        # Composants maintenance
│   │   │   └── vehicle/            # Formulaire et liste véhicules
│   │   ├── context/                # Providers (Auth, Theme, i18n, Network)
│   │   ├── database/               # Schéma WatermelonDB et migrations
│   │   │   ├── models/             # Modèles (Vehicle, MaintenanceLog, Document)
│   │   │   ├── schema.ts           # Définition du schéma
│   │   │   └── migrations.ts       # Migrations v1 → v3
│   │   ├── services/               # Logique métier
│   │   │   ├── AIService.ts        # Scanner Gemini
│   │   │   ├── SyncService.ts      # Synchronisation WatermelonDB ↔ Supabase
│   │   │   ├── VehicleService.ts   # CRUD véhicules
│   │   │   ├── MaintenanceService.ts
│   │   │   ├── DocumentService.ts
│   │   │   ├── PDFService.ts       # Génération de rapports
│   │   │   ├── StorageService.ts   # Upload fichiers vers Supabase Storage
│   │   │   └── SecureStorage.ts    # Gestion sécurisée des tokens
│   │   ├── data/                   # Données de référence (marques, modèles)
│   │   └── hooks/                  # Hooks personnalisés
│   └── assets/                     # Images, icônes, logos de marques
├── database/                       # Scripts SQL Supabase
│   ├── schema.sql                  # Schéma de la base de données
│   ├── rls_migration.sql           # Politiques Row Level Security
│   └── storage_migration.sql       # Configuration du bucket Storage
├── BikeService_TFE_markdown.md     # Rapport TFE complet
├── Réalisation.md                  # Journal de développement
└── eas.json                        # Configuration EAS Build
```

---

## 🚀 Installation et lancement

### Prérequis

- **Node.js** ≥ 18
- **npm** ou **yarn**
- **Expo CLI** : `npm install -g expo-cli`
- Un compte **Supabase** (pour le backend)
- Une clé API **Google Gemini** (pour le scanner IA)
- **Android Studio** ou un appareil Android/iOS pour le développement

### Configuration

1. **Cloner le repository**
   ```bash
   git clone https://github.com/ArmanDeb/bikeservice.git
   cd bikeservice/mobile
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer le fichier d'environnement**
   ```bash
   cp .env.example .env
   ```
   Puis remplir les variables :
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   EXPO_PUBLIC_GEMINI_API_KEY=votre_clé_gemini
   ```

4. **Lancer l'application**
   ```bash
   npx expo start
   ```

### Configuration Supabase

Exécuter les scripts SQL dans l'ordre suivant sur votre instance Supabase :
1. `database/schema.sql` — Création des tables
2. `database/rls_migration.sql` — Activation du Row Level Security
3. `database/storage_migration.sql` — Configuration du bucket de stockage

---

## 🗄️ Modèle de données

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │       │     Vehicle       │       │   Document   │
│ (Supabase    │1────N │                   │1────N │              │
│  Auth)       │       │ brand             │       │ type         │
│              │       │ model             │       │ file_path    │
│              │       │ year              │       │ storage_url  │
│              │       │ vin               │       │ vehicle_id?  │
│              │       │ current_mileage   │       │ log_id?      │
│              │       │ display_order     │       │ user_id      │
│              │       │ user_id           │       └──────────────┘
│              │       └──────────┬────────┘
│              │                  │
│              │            1────N│
│              │       ┌──────────┴────────┐
│              │       │  MaintenanceLog    │
│              │       │                    │
│              │       │ title              │
│              │       │ type               │
│              │       │ cost               │
│              │       │ mileage            │
│              │       │ date               │
│              │       │ notes              │
│              │       │ vehicle_id         │
│              │       │ user_id            │
│              │       └───────────────────┘
```

---

## 📄 Documentation complémentaire

- **[BikeService_TFE_markdown.md](BikeService_TFE_markdown.md)** — Rapport complet du Travail de Fin d'Études (contexte, cahier des charges, analyse UML)
- **[Réalisation.md](Réalisation.md)** — Journal de bord technique (choix technologiques, développement des modules, problèmes & solutions)

---

## 👤 Auteur

**Arman Debongnie**
Bachelier en Informatique de Gestion — Année académique 2025-2026

---

## 📝 Licence

[MIT](LICENSE)
