# Réalisation technique de Bike Service

Ce document retrace les étapes clés du développement de mon application, les choix techniques que j'ai effectués et la manière dont j'ai structuré le code pour répondre aux exigences de mon TFE.

## 1. Choix technologiques et architecture

Pour ce projet, j'ai décidé de partir sur des technologies modernes qui permettent une grande agilité tout en garantissant des performances solides sur mobile.

*   **Frontend :** J'ai choisi **React Native** avec l'écosystème **Expo**. Cela m'a permis de développer simultanément pour iOS et Android avec une base de code unique en TypeScript.
*   **Base de données (Offline-First) :** C'est le cœur technique du projet. Pour que l'application reste utilisable dans un garage sans réseau, j'ai implémenté **WatermelonDB**. Contrairement à une API classique, l'application écrit d'abord dans une base SQLite locale, ce qui rend l'interface extrêmement réactive.
*   **Backend & Synchro :** J'utilise **Supabase** (PostgreSQL) pour le stockage déporté et l'authentification. La synchronisation entre le téléphone et le cloud est gérée par un "Sync Engine" que j'ai configuré pour réconcilier les données dès qu'une connexion est détectée.
*   **Design :** Pour le stylage, j'utilise **NativeWind** (Tailwind CSS pour mobile), ce qui me permet d'avoir un design cohérent et facile à maintenir.
*   **Reporting :** Génération de rapports PDF professionnels via **expo-print** et **expo-sharing**, enrichis par une analyse IA (Gemini).

## 2. Développement des modules

### 2.1 Le Garage (Gestion des Véhicules)
J'ai commencé par créer le module de gestion des motos. Chaque véhicule est une entité dans WatermelonDB avec des champs spécifiques (Marque, Modèle, VIN, Kilométrage actuel). 
*   **Défi :** Il a fallu que je m'assure que le kilométrage global du véhicule soit toujours synchronisé avec le dernier log de maintenance ajouté.

### 2.2 Le Journal de Maintenance
C'est ici que l'utilisateur enregistre ses factures et interventions. J'ai structuré ce module autour d'un service (`MaintenanceService`) qui gère la logique de création des logs.
*   **Validation :** J'ai implémenté une sécurité qui empêche de saisir un kilométrage inférieur au précédent pour éviter les erreurs de saisie.
*   **Flexibilité :** J'ai ajouté la possibilité de **modifier** et **supprimer** des logs existants. La suppression est gérée en "cascade" pour s'assurer que si on efface une intervention, les éventuelles corrections de kilométrage ou documents liés sont traités proprement.

### 2.3 Le Wallet (Gestion Documentaire)
Le but est de stocker les preuves (photos des factures, carte grise). Les fichiers sont stockés localement sur le téléphone pour une consultation rapide et envoyés sur un bucket S3 (Supabase Storage) pour la sauvegarde.
*   **Lien logique :** Chaque document peut être lié soit à un véhicule (ex: Assurance), soit directement à un log de maintenance (ex: Facture d'entretien).
*   **Contrôle d'unicité :** Pour éviter le désordre, j'ai mis en place une logique qui empêche d'ajouter des doublons pour les documents uniques (Permis, Carte Grise, Assurance) sur un même véhicule. L'interface filtre intelligemment les options déjà existantes.

### 2.4 L'Assistant IA (Réduction de la friction)
C'est la partie la plus "sophistiquée" que j'ai décidé d'ajouter pour passer d'une simple application de saisie à un véritable assistant.
*   **Objectif :** Supprimer la corvée de devoir tout taper à la main. 
*   **Technologie :** J'ai choisi d'intégrer **Gemini 1.5 Flash**. C'est un modèle multimodal qui peut "lire" une image (OCR intelligent) ou "écouter" un vocal.
*   **Fonctionnement :** Quand je prends une photo d'une facture de garage, l'IA analyse le texte, extrait le montant, la date et même les travaux effectués pour pré-remplir le formulaire de maintenance.
*   **Interface :** J'ai intégré un petit bandeau "Assistant IA ✨" directement dans le formulaire d'ajout d'entretien. Ça permet de déclencher le scan sans avoir à naviguer ailleurs dans l'appli.

### 2.5 Authentification et Sécurité Multi-Utilisateurs
Pour transformer l'application en un véritable service SaaS, j'ai implémenté un système d'authentification complet et une isolation stricte des données.
*   **Fournisseur :** Utilisation de **Supabase Auth** (Email/Mot de passe).
*   **Protection des Routes :** J'ai mis en place un `AuthProvider` qui enveloppe l'application. Un composant de navigation surveille l'état de la session : si l'utilisateur n'est pas connecté, il est automatiquement redirigé vers l'écran de login, verrouillant ainsi l'accès aux données du garage.
*   **Isolation des Données (Multi-Tenancy) :** 
    *   **Côté Supabase :** J'ai activé le **Row Level Security (RLS)** sur toutes les tables. Chaque ligne de données possède désormais une colonne `user_id`. Des politiques SQL (`POLICIES`) vérifient que le `auth.uid()` de la session correspond au propriétaire de la donnée.
    *   **Côté Mobile :** J'ai migré le schéma WatermelonDB en **version 3** pour inclure cette colonne `user_id`. Le `SyncService` a été modifié pour injecter l'ID de l'utilisateur lors de chaque synchronisation.
*   **Hygiène des Données (Clean Slate) :** Pour éviter que deux utilisateurs partageant le même téléphone ne puissent voir les données l'un de l'autre en cache, l'application exécute un `unsafeResetDatabase()` (Wipe local) dès qu'un utilisateur se déconnecte.

#### Détails de l'implémentation technique (Scanner)
Pour réaliser cette fonctionnalité, j'ai dû orchestrer plusieurs briques techniques :
1.  **Capture d'image :** Utilisation de `expo-image-picker` pour accéder à la caméra/galerie et convertir l'image en Base64.
2.  **L'appel API (Prompt Engineering) :** Le défi était de forcer l'IA à répondre *uniquement* en JSON structuré pour que mon application puisse le lire. J'ai conçu un prompt système strict : *"You are an expert mechanic... Extract structured data... Return ONLY raw JSON"*.
3.  **Gestion des versions Gemini :** J'ai rencontré des problèmes de quota avec les modèles `gemini-2.0`. J'ai donc implémenté une stratégie de repli sur l'alias `gemini-flash-latest`, qui pointe dynamiquement vers le modèle le plus performant disponible dans le Free Tier.
4.  **Parsing et Injection :** L'application reçoit le JSON, le nettoie (suppression des balises markdown ```json) et mappe automatiquement les champs (titre, coût, date) dans le state du formulaire React.

## 3. Implémentation de la persistance (WatermelonDB & Supabase)

J'ai passé pas mal de temps sur la configuration du schéma de la base de données. Voici comment j'ai structuré mes modèles :

1.  **Vehicle** : L'entité parente.
2.  **MaintenanceLog** : Relié au véhicule (Relation 1-N).
3.  **Document** : Relié au véhicule ou au log.

Le passage à une architecture asynchrone a été un vrai challenge, car chaque écriture en base doit être traitée via des fonctions "action" pour garantir l'intégrité des données lors de la synchronisation.

## 4. Journal de bord & Décisions (Chronologie)

Cette section retrace l'évolution du projet au jour le jour, mes hésitations et mes choix finaux.

### 31 Janvier 2026 : Infrastructure et Intelligence Artificielle
*   **Action :** Déploiement du schéma SQL complet (`vehicles`, `maintenance_logs`, `documents`) sur l'instance Supabase.
*   **Décision :** Après avoir analysé les besoins utilisateurs, j'ai décidé d'ajouter une brique d'intelligence artificielle. Saisir des factures manuellement est une barrière à l'utilisation.
*   **Action :** Mise en place du module `AIService` et intégration du scanner de factures.
*   **Techno :** Choix de **Gemini 1.5 Flash** pour ses performances multimodales et son accessibilité.
*   **Planification :** Priorité au scanner OCR pour le module Wallet, suivi de l'assistant vocal pour améliorer l'expérience "mains sales" au garage.
*   **Action :** Raffinement de l'expérience utilisateur (UX) sur le journal de maintenance. Ajout des fonctionnalités d'édition et de suppression avec gestion de l'intégrité des données (Cascade Delete).
*   **Debug & Sync :** Résolution des problèmes de "données fantômes" locales après un reset serveur via l'ajout d'une commande de "Wipe Local DB".

### 1er Février 2026 : Documents Utilisateur (Permis Partagé)
*   **Réflexion :** J'ai réalisé que le permis de conduire est un document **personnel**, pas lié à un véhicule spécifique. L'utilisateur ne devrait pas avoir à l'ajouter pour chaque moto dans son garage.
*   **Décision Architecture :** J'ai introduit le concept de **documents de niveau utilisateur** (`user-level documents`). Ces documents ont un `vehicle_id = NULL` dans la base de données.
*   **Modifications :**
    *   Schéma WatermelonDB : `vehicle_id` rendu optionnel dans la table `documents`.
    *   Migration SQL (Supabase) : Conversion des permis existants en documents partagés.
    *   `DocumentService` : Nouvelle logique pour créer les permis sans `vehicle_id` et nouvelle méthode `observeDocumentsForVehicle()` qui retourne les documents du véhicule **+ les documents utilisateur** (comme le permis).
    *   `wallet.tsx` : Refonte de l'observable pour afficher le permis dans tous les wallets, et masquer l'option "LICENSE" dans le sélecteur de type une fois qu'un permis existe.
*   **Résultat :** Ajouter un permis une fois le rend visible pour toutes les motos. Modifier le permis depuis n'importe quel wallet met à jour l'unique document partagé.

### 1er Février 2026 (fin d'après-midi) : Authentification et Sécurisation totale
*   **Action :** Mise en place du module d'Authentification Supabase.
*   **Infrastructure :** Activation du RLS sur Supabase via MCP et modification du schéma local (v3) pour supporter le multi-utilisateur.
*   **UX :**
    *   Création des écrans **Login** et **Register** avec navigation sécurisée (`_layout.tsx` réactif).
    *   Ajout d'une fonctionnalité de **Auto-Login** après inscription pour réduire la friction.
    *   Implémentation d'un écran **Settings** dédié avec une fonction de déconnexion sécurisée (Sign Out + Wipe Local).
*   **Sécurité :** Audit des politiques RLS pour garantir qu'un utilisateur A ne peut en aucun cas lire ou modifier les motos d'un utilisateur B, même en connaissant leurs IDs.

## 5. Problèmes rencontrés & Solutions

| Problème | Solution |
| :--- | :--- |
| **Friction de saisie** | Mise en place d'un assistant IA capable d'extraire les données depuis une photo. |
| **Erreur Quota IA** | Migration du modèle vers un alias dynamique (`gemini-flash-latest`) pour contourner les limitations du Free Tier sur les modèles 2.0. |
| **Conflits de Synchro** | Passage d'une logique "Insert" à "Upsert" dans `SyncService` pour rendre la synchronisation auto-réparatrice (Self-Healing) et gérer les doublons. |
| **Réactivité Dashboard** | Refonte complète du `DashboardScreen` avec `withObservables` pour que les coûts et graphiques se mettent à jour instantanément sans rechargement manuel. |
| **Gestion du typage TypeScript** | Correction de plusieurs erreurs de type 'any' dans les composants de rendu pour stabiliser l'application. |
| **Synchronisation des données** | Mise en place de Row Level Security (RLS) sur Supabase pour sécuriser les accès lors de la synchro. |
| **Connexion Cloud** | Configuration et test des variables d'environnement pour assurer une liaison robuste avec le backend Supabase. |
| **Erreur Foreign Key (Supression)** | Implémentation d'une suppression en cascade (`cascade delete`) dans le service Véhicule : supprimer une moto supprime d'abord ses logs et documents pour contenter la base de données relationnelle. |
| **Persistance Données "Fantômes"** | Création d'un bouton "Reset Local Data" utilisant `unsafeResetDatabase()` pour forcer l'alignement du client mobile avec un serveur remis à zéro. |
| **Permis dupliqué par véhicule** | Refonte du modèle de données pour supporter les "documents utilisateur" (`vehicle_id = NULL`). Le permis est désormais partagé entre toutes les motos du garage. |
| **Sélection de modèle peu intuitive** | Remplacement des listes horizontales scrollables par des champs `AutocompleteInput` dynamiques avec filtrage intelligent. |
| **Base de modèles motos incomplète** | Enrichissement massif de `MOTORCYCLE_DATA` : ajout de 400+ modèles classiques (FZR, CBF, ZZR, Bandit, etc.) pour les 4 grandes marques japonaises. |
| **Wallet trop chargé visuellement** | Implémentation de sections pliables (`CollapsibleSection`) pour "Legal & Papers" et "Invoices & History" afin de libérer de l'espace écran. |
| **Leak de données entre comptes** | Mise en place de Row Level Security (RLS) et d'un mécanisme de "Wipe"本地 base de données à la déconnexion. |
| **Incompatibilité Schéma DB** | Création d'une migration WatermelonDB (v2 -> v3) pour supporter la colonne `user_id` nécessaire à l'isolation des données. |
| **Double Authentification bloquante** | Désactivation du "Confirm Email" sur Supabase pour simplifier la phase de test utilisateur. |
| **PDF non sauvegardable localement** | Implémentation du Storage Access Framework (SAF) d'Android pour permettre la sauvegarde directe dans le dossier Downloads, avec mémorisation du choix utilisateur via AsyncStorage. |
| **Images absentes dans le PDF** | Conversion des URIs locales en Base64 et vérification de l'existence des fichiers avant lecture pour garantir l'affichage des annexes. |
| **Page d'accueil non intuitive** | Changement de la route par défaut : le Garage est maintenant la première page affichée au lieu du Dashboard. |
| **Application mélangeant les langues** | Centralisation de l'i18n dans un Context pour une application 100% bilingue, y compris pour les données extraites par l'IA. |
| **Confusion sans véhicule sélectionné** | Implémentation d'un "Focus Mode" masquant les données vagues et proposant un sélecteur premium quand aucune moto n'est choisie. |
| **Date AI ignorée dans formulaire** | Stockage de l'URI du document scanné puis liaison au log lors de la soumission, permettant à la date extraite de pré-remplir le champ. |
| **Suppression entretien bloque sur FK** | Migration Supabase : `ON DELETE SET NULL` sur `documents.log_id` + choix utilisateur (garder ou supprimer le document lié). |
| **Perte images (changement téléphone)** | Activation de **Supabase Storage** : upload automatique des photos dans un bucket sécurisé (RLS) pour une sauvegarde cloud pérenne. |
| **Fichiers orphelins (Cloud)** | Implémentation d'un **Trigger SQL automatique** : la suppression d'une ligne document entraîne la suppression physique du fichier sur le Storage. |
| **Fichiers accessibles en clair** | Migration de l'Auth vers **expo-secure-store** : les jetons de session sont maintenant chiffrés sur le matériel mobile. |
| **Désordre dans le garage** | Ajout d'une fonctionnalité de réorganisation par **Drag & Drop** avec persistance de l'ordre de tri. |
| **Instabilité Réseau** | Intégration de `NetInfo` pour bloquer les actions critiques hors-ligne et déclencher une synchronisation automatique au retour du signal. |
| **Lisibilité Mode Sombre** | Audit et correction des contrastes sur les formulaires d'authentification et d'onboarding. |

### 1er Février 2026 (après-midi) : UX Garage & Wallet
*   **Amélioration Garage :** Refonte complète de la sélection marque/modèle.
    *   Remplacement des listes scrollables par des champs **Autocomplete** avec dropdown dynamique.
    *   Ajout d'un système de **filtrage intelligent** : `startsWith` pour les marques (taper "H" → Honda, Harley...) et `includes` pour les modèles (taper "600" → CBR600RR, CB600F...).
    *   La dropdown n'apparaît qu'après la saisie du premier caractère pour éviter l'encombrement.
*   **Enrichissement Base de Données Motos :**
    *   Ajout massif de modèles classiques et vintage pour Yamaha, Honda, Kawasaki, Suzuki.
    *   Couverture des gammes : FZR, FZ, XJ, TDM (Yamaha) | CBF, CBR, VFR, NTV (Honda) | ZZR, GPZ, ZRX, Zephyr (Kawasaki) | Bandit, GSF, RF, Intruder (Suzuki).
    *   Total estimé : **500+ modèles** couvrant 1980 à 2025.
*   **Amélioration Wallet :** Implémentation de **sections dépliables** (accordion).
    *   Les sections "Legal & Papers" et "Invoices & History" peuvent maintenant être repliées/dépliées au tap.
    *   Badge indiquant le nombre de documents dans chaque section.
    *   Permet de gagner de l'espace pour visualiser les factures quand les documents légaux n'ont pas besoin d'être consultés.

---

### 1er Février 2026 (soir) : Reporting PDF & Export Android
*   **PDF Builder :** Implémentation du `PDFService`.
    *   Mise en page HTML/CSS premium (Thème sombre/jaune, badges, tableaux, annexes).
    *   **Sauvegarde Automatique Android :** Utilisation du **Storage Access Framework (SAF)** pour un enregistrement direct dans "Downloads", avec mémorisation du dossier via `AsyncStorage`.
*   **Navigation :** Le **Garage** devient la page d'accueil par défaut pour une meilleure pertinence utilisateur.

### 1er Février 2026 (nuit) : Internationalisation et Raffinement UI
*   **Internationalisation (i18n) :** Application bilingue (**FR/EN**).
    *   **IA Localisée :** Le `AIService` et le scanner de factures adaptent leurs langues d'extraction à l'utilisateur.
    *   **PDF Localisé :** Adaptation automatique des formats de dates et des étiquettes administratifs.
*   **Expérience "Focus Mode" :** Refonte des écrans Maintenance et Wallet. Masquage des données sans véhicule sélectionné et ajout d'un sélecteur de moto premium.
*   **Décision Produit :** Simplification du rapport PDF en retirant le résumé IA technique pour privilégier la clarté factuelle.

---

### 1er Février 2026 (suite) : Maintenance UX & Intégrité des données
*   **Bug Fix (Scanner IA) :** La date extraite de la facture pré-remplit maintenant correctement le formulaire. Auparavant, la date du jour était utilisée par défaut.
*   **Refonte UX Maintenance :**
    *   Renommage du bouton "Assistant IA" → **"Scanner facture"** pour plus de clarté.
    *   Ajout d'un **DatePicker visible** permettant de voir et modifier la date d'intervention.
    *   Remplacement des sélecteurs horizontaux (véhicule, tri) par des **dropdowns modaux** plus ergonomiques.
*   **Suppression intelligente :** Lors de la suppression d'un entretien avec document lié, l'utilisateur a désormais le choix :
    *   **"Garder le document"** : L'entretien est supprimé mais la facture reste dans le portefeuille.
    *   **"Tout supprimer"** : Suppression en cascade (entretien + document).
*   **Migration Supabase :** Modification de la contrainte FK `documents.log_id` → `ON DELETE SET NULL` pour supporter la suppression flexible sans violation de clé étrangère.

### 1er Février 2026 (nuit avancée) : Cloud Storage & Nettoyage
*   **Sauvegarde Cloud des Images :**
    *   Création d'un bucket `documents` sur Supabase Storage.
    *   Mise en place de politiques RLS strictes : chaque utilisateur a son propre dossier privé (`user_id/`).
    *   Implémentation du `StorageService` : upload automatique des photos lors de l'ajout d'une facture ou d'un document.
*   **Gestion du cycle de vie des fichiers :**
    *   **Suppression propre :** Quand un utilisateur supprime un document (ou un entretien lié), l'application envoie une commande pour supprimer également le fichier sur le Cloud.
    *   **Résultat :** Plus de fichiers orphelins sur le serveur et une synchronisation parfaite entre l'état local et distant.

### 3 Février 2026 : Optimisations UX/UI en temps réel et Raffinement Visuel
*   **Synchronisation Temps Réel (Garage) :**
    *   **Problème :** Le kilométrage sur l'écran Garage ne se mettait pas à jour immédiatement après l'ajout d'un entretien.
    *   **Solution Technique :** Refonte de la liste des véhicules avec le pattern `withObservables` de WatermelonDB. Chaque item de la liste observe désormais ses propres changements, garantissant une mise à jour instantanée de l'interface sans rechargement.
    *   **Fiabilité des Données :** Correction d'un bug critique dans `MaintenanceService` où la comparaison du kilométrage utilisait parfois des données obsolètes. Force-fetch du véhicule avant toute mise à jour.
*   **Expérience Saisie (UX) :**
    *   **Formatage Intelligent :** Ajout de séparateurs de milliers (ex: 12.000) en temps réel sur tous les champs kilométriques pour une meilleure lisibilité.
    *   **Unités Persistantes :** Intégration visuelle des unités "**€**" et "**km**" directement dans les champs de formulaire (Maintenance). Elles restent visibles pendant la saisie pour lever toute ambiguïté.
*   **Harmonisation Visuelle :**
    *   Ajustement de l'alignement des éléments sur le Dashboard (Bouton PDF, Pastille Véhicule).
    *   Intégration d'un **Switch de Thème (Dark/Light)** fluide sur les écrans d'authentification.

---

### 5 Février 2026 : Finitions "Production-Ready" & Brand Safety
*   **Onboarding & Saisie :**
    *   **Sécurisation des inputs :** Année et Kilométrage restreints strictement aux chiffres (clavier numérique forcé, filtrage regex).
    *   **Formatage visuel :** Ajout automatique de séparateurs de milliers (ex: 12.000) dans le flow d'onboarding pour une meilleure lisibilité.
    *   **Tone of Voice :** Remplacement des messages familiers (ex: "Gaz ! ✌️") par des formulations professionnelles ("Configuration terminée"), adaptées à une audience plus large.
*   **Danger Zone & Gestion Compte :**
    *   **Clarification :** Remplacement de la fonction technique "Reset Data" par une véritable fonctionnalité "Supprimer mon compte" (Delete Account).
    *   **Logique de suppression :** Implémentation complète : suppression des données utilisateur sur Supabase (Cascade) + Wipe de la base locale (`unsafeResetDatabase`) + Redirection vers l'authentification.
*   **Conformité & Pages Légales :**
    *   **Intégration In-App :** Développement des écrans `Privacy` et `Terms` en natif dans l'application. Cela évite les redirections vers un site web externe non configuré (erreurs SSL) et maintient l'utilisateur dans l'écosystème de l'app.
    *   **Routage Sécurisé :** Modification critique du `_layout.tsx` pour "whitelister" la route `/legal`. Le garde-fou de navigation (qui redirige vers le Garage si connecté) bloquait auparavant l'accès à ces pages.
    *   **Settings Polish :** Nettoyage de l'interface Réglages (suppression des boutons "Suggérer une idée", "Powered by Antigravity") pour un rendu White Label professionnel v1.0.

### 8 Février 2026 : Robustesse Offline, Sécurité et Glisser-Déposer (Phase Finale MVP)

*   **Gestion de la Connectivité (Robustesse) :** 
    *   **Problème :** L'application pouvait tenter des synchronisations ou des actions réseau (Auth) alors que le tunnel internet était coupé, provoquant des crashs silencieux ou des états incohérents.
    *   **Solution :** Intégration de `@react-native-community/netinfo` via un `NetworkProvider`. L'application détecte maintenant en temps réel les changements d'état réseau.
    *   **Auto-Sync :** Une synchronisation est automatiquement déclenchée dès que la connexion est rétablie, assurant que les données saisies "au fond du garage" remontent sur le cloud sans action utilisateur.
*   **Sécurité et Protection des Données (Hardening) :**
    *   **Migration vers SecureStore :** Pour passer d'un prototype à une application "production-ready", j'ai remplacé `AsyncStorage` par `expo-secure-store` pour le stockage des jetons de session Supabase. Les données sensibles sont désormais chiffrées au niveau de l'OS (Keychain sur iOS / Keystore sur Android).
    *   **Audit RLS (Supabase) :** Vérification et renforcement des politiques de sécurité au niveau de la base de données. Chaque table (`vehicles`, `logs`, `documents`) est verrouillée par des règles PostgreSQL garantissant qu'un utilisateur ne peut accéder qu'aux lignes dont il est le propriétaire (`auth.uid() = user_id`).
*   **Nettoyage Automatisé du Cloud (Storage Integrity) :**
    *   **Défi :** Lorsqu'un utilisateur supprimait une facture dans l'appli, le fichier restait parfois "orphelin" sur Supabase Storage si la requête réseau de suppression échouait ou était oubliée.
    *   **Solution :** Implémentation d'un **Trigger SQL** sur Supabase. Désormais, c'est la base de données elle-même qui ordonne la suppression physique du fichier dans le bucket dès que la ligne correspondante est supprimée dans la table `documents`. C'est une garantie absolue de propreté et de conformité RGPD.
*   **Expérience "Premium" (Garage Reordering) :**
    *   **Fonctionnalité :** Ajout de la possibilité de réorganiser ses motos par simple **glisser-déposer (Drag & Drop)**.
    *   **Technique :** Utilisation de `react-native-draggable-flatlist` couplé à `react-native-gesture-handler`.
    *   **Persistance :** Ajout d'une colonne `display_order` dans WatermelonDB et Supabase. L'ordre est mis à jour en "batch" (lot) pour économiser de la batterie et de la bande passante.
*   **Polissage UI (Dark Mode & Accessibilité) :**
    *   Correction systématique des contrastes (textes blancs sur fond blanc) dans les écrans d'authentification et d'onboarding lors de l'utilisation du mode sombre.

---

*(Note : Ce document est mis à jour à chaque étape clé du développement.)*

### 13 Février 2026 : Récupération de mot de passe & Fiabilisation Synchro
*   **Récupération de mot de passe (OTP) :**
    *   **Choix Technique :** Abandon des "Magic Links" (souvent bloqués ou ouverts dans le mauvais navigateur) au profit d'un système **OTP (One-Time Password)** à 6 chiffres.
    *   **Flux :** L'utilisateur reçoit un code par email -> Saisie dans l'app -> Authentification temporaire -> Changement de mot de passe.
    *   **Sécurité (Force Logout) :** Après la modification du mot de passe, j'ai imposé une **déconnexion forcée** suivie d'une redirection vers l'écran de Login. Cela garantit que la session est proprement renouvelée et que le mécanisme de synchronisation (qui dépend de l'`user_id`) repart sur des bases saines.
*   **Fiabilisation de la Synchronisation (Data Loss Fix) :**
    *   **Problème Critique :** Des utilisateurs rapportaient perdre leurs données (garage vide) après une déconnexion/reconnexion.
    *   **Diagnostic :** Le `SyncService` gardait en mémoire le timestamp de la dernière synchro (`LAST_SYNC_KEY`) même après un changement d'utilisateur. Le serveur ne renvoyait donc que les "nouveautés" (delta), ignorant les données de base nécessaires au nouvel utilisateur.
    *   **Solution :** Modification du `AuthContext` pour **effacer systématiquement** la clé de synchronisation (`AsyncStorage.removeItem`) lors de la déconnexion ou du changement de compte. Chaque nouvelle session déclenche ainsi une "Full Sync" garantie.

### 14 Février 2026 : Raffinement du Dashboard et Harmonisation UI

*   **Optimisation du Dashboard (Hiérarchie de l'information) :**
    *   **Restructuration des Stats :** Séparation du "Coût Total" et du "Nombre de Véhicules" en deux cartes distinctes. Cela permet une lecture plus rapide et équilibrée, particulièrement en mode "Tous les véhicules".
    *   **Nettoyage :** Suppression des compteurs redondants en bas de page pour épurer l'interface et éviter la surcharge cognitive.
*   **Harmonisation des composants (Logique de Design System) :**
    *   **Unification :** Les "Activités Récentes" du Dashboard utilisent désormais le composant officiel `MaintenanceLogItem`. Cela garantit que toute amélioration de style sur le journal de maintenance se répercute instantanément sur le tableau de bord.
    *   **Contextualisation :** Ajout d'un en-tête avec la marque et le modèle au-dessus des logs dans le mode "Global" pour identifier immédiatement quelle moto est concernée.
*   **Refonte ergonomique de la carte de maintenance (`MaintenanceLogItem`) :**
    *   **Gestion des débordements :** Refonte du footer pour permettre un retour à la ligne naturel en cas de textes longs, évitant que les informations ne sortent de la carte.
    *   **Lisibilité accrue :**
        *   Empilement vertical de la **Date** et du **Kilométrage** (suppression du séparateur central) pour un meilleur alignement.
        *   Mise en avant du **Coût** : placé sur la droite, en gras (`Outfit_700Bold`), pour une lecture instantanée du montant.
        *   Correction typographique : utilisation d'une espace insécable avant l'unité "km" pour éviter que celle-ci ne se retrouve seule à la ligne.
*   **Fiabilisation des rapports de coûts :**
    *   **Correction de mapping :** Résolution d'un bug dans le tableau "Répartition des coûts" qui ignorait les logs de type "Modification" suite à une erreur de clé (`modifications` vs `modification`). La répartition est désormais 100% fidèle à la réalité du garage.

