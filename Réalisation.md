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
34: 
35: #### Détails de l'implémentation technique (Scanner)
36: Pour réaliser cette fonctionnalité, j'ai dû orchestrer plusieurs briques techniques :
37: 1.  **Capture d'image :** Utilisation de `expo-image-picker` pour accéder à la caméra/galerie et convertir l'image en Base64.
38: 2.  **L'appel API (Prompt Engineering) :** Le défi était de forcer l'IA à répondre *uniquement* en JSON structuré pour que mon application puisse le lire. J'ai conçu un prompt système strict : *"You are an expert mechanic... Extract structured data... Return ONLY raw JSON"*.
39: 3.  **Gestion des versions Gemini :** J'ai rencontré des problèmes de quota avec les modèles `gemini-2.0`. J'ai donc implémenté une stratégie de repli sur l'alias `gemini-flash-latest`, qui pointe dynamiquement vers le modèle le plus performant disponible dans le Free Tier.
40: 4.  **Parsing et Injection :** L'application reçoit le JSON, le nettoie (suppression des balises markdown ```json) et mappe automatiquement les champs (titre, coût, date) dans le state du formulaire React.

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

## 6. Lancement (Préparation au déploiement)

Cette section documente la phase de lancement de l'application : la mise en place des outils de monitoring, la préparation du Play Store et les étapes nécessaires pour passer d'un projet de développement à un produit utilisable par de vrais utilisateurs.

### 9 Avril 2026 : Comptes & Infrastructure de lancement

*   **Décision :** Avant de distribuer l'application, il est indispensable de pouvoir (1) détecter les crashs à distance et (2) comprendre comment les utilisateurs se servent de l'app. Deux outils gratuits répondent à ces besoins : **Sentry** et **PostHog**.
*   **Supabase Pro :** Migration vers le plan Pro ($25/mois). Le Free Tier met l'instance en pause après 1 semaine d'inactivité — incompatible avec des bêta-testeurs qui dépendent du backend.
*   **Google Play Developer :** Création du compte développeur ($25 unique). Vérification d'identité en cours.
*   **Comptes créés :** Sentry (sentry.io) et PostHog (posthog.com), tous deux sur leur Free Tier.

---

### Étape 6.1 : Sentry — Suivi des erreurs et crashs

**Qu'est-ce que Sentry ?**
Sentry est un outil de **surveillance des erreurs en temps réel**. Quand l'application plante ou rencontre une erreur sur le téléphone d'un utilisateur, Sentry capture automatiquement la trace complète (quel écran, quelle fonction, quelle ligne de code) et l'envoie sur un tableau de bord en ligne. Sans cet outil, un crash chez un testeur resterait invisible — l'utilisateur quitterait l'app sans jamais signaler le problème.

**Actions :**
*   **Installation :** `npx expo install @sentry/react-native` dans le dossier `mobile/`
*   **Configuration :** Récupérer le **DSN** (Data Source Name) depuis le dashboard Sentry → Project Settings → Client Keys
*   **Variable d'environnement :** Ajouter `EXPO_PUBLIC_SENTRY_DSN` dans le fichier `.env`
*   **Initialisation :** Configurer Sentry dans `app/_layout.tsx` (point d'entrée racine) pour capturer toutes les erreurs non gérées
*   **Plugin Expo :** Ajouter `@sentry/react-native/expo` dans le tableau `plugins` de `app.json` pour activer les source maps (traces lisibles)
*   **Alertes :** Configurer une règle d'alerte dans le dashboard Sentry : notification par email dès la première occurrence d'une nouvelle erreur
*   **Test :** Déclencher un `throw new Error('Sentry test')` manuellement et vérifier qu'il apparaît dans le dashboard

**Fichiers modifiés :**
*   `mobile/app/_layout.tsx` — initialisation Sentry
*   `mobile/app.json` — ajout du plugin Sentry
*   `mobile/.env` — ajout du DSN

---

### Étape 6.2 : PostHog — Analyse d'usage ✅

**Qu'est-ce que PostHog ?**
PostHog est un outil d'**analytics produit**. Il enregistre ce que les utilisateurs font réellement dans l'application : quels écrans ils visitent, quelles fonctionnalités ils utilisent, où ils abandonnent. Contrairement à Sentry qui détecte les problèmes, PostHog mesure l'**adoption**. Exemple concret : on pourrait supposer que le scanner IA est la fonctionnalité phare, mais PostHog pourrait révéler que 80% des utilisateurs ne l'essaient jamais — c'est une donnée exploitable pour prioriser les améliorations.

**Actions :**
*   **Installation :** `npx expo install posthog-react-native` dans le dossier `mobile/` ✅
*   **Configuration :** Clé API récupérée depuis le dashboard PostHog (EU Cloud) ✅
*   **Variable d'environnement :** `EXPO_PUBLIC_POSTHOG_KEY` ajouté dans `.env` ✅
*   **Initialisation :** Application enveloppée dans `<PostHogProvider>` dans `app/_layout.tsx` ✅
*   **Événements instrumentés :** ✅
    *   `screen_view` — chaque changement de route via `usePathname()` d'Expo Router
    *   `vehicle_added` — ajout d'un véhicule (avec `brand`, `model`, `year`)
    *   `maintenance_log_created` — création d'un log (avec `type`, `cost`, `hasDocuments`)
    *   `document_uploaded` — upload d'un document (avec `type`, `pageCount`)
    *   `ai_scan_used` — utilisation du scanner IA (sur succès uniquement)
    *   `pdf_exported` — export PDF (avec `method: 'save' | 'share'` et nom du véhicule)
*   **Test :** Événements `screen_view` et `Application Opened` visibles dans PostHog → Live Events ✅

**Décision d'architecture — Singleton analytics :**
Les fichiers de services (`VehicleService`, `MaintenanceService`, etc.) sont du TypeScript pur, sans accès au contexte React. Il est donc impossible d'y utiliser le hook `usePostHog()`. J'ai résolu ce problème en créant un fichier `src/services/analytics.ts` qui instancie un client PostHog singleton (pattern classique pour les services non-React). Ce singleton est importé directement dans chaque service, tandis que le `<PostHogProvider>` dans `_layout.tsx` utilise ce même client via la prop `client={posthog}` — garantissant qu'il n'existe qu'une seule instance dans toute l'application.

**Fichiers modifiés :**
*   `mobile/src/services/analytics.ts` — singleton PostHog (EU host)
*   `mobile/app/_layout.tsx` — `PostHogProvider` + `screen_view` sur chaque changement de pathname
*   `mobile/.env` — ajout de `EXPO_PUBLIC_POSTHOG_KEY`
*   `mobile/src/services/VehicleService.ts` — `vehicle_added`
*   `mobile/src/services/MaintenanceService.ts` — `maintenance_log_created`
*   `mobile/src/services/DocumentService.ts` — `document_uploaded`
*   `mobile/src/services/AIService.ts` — `ai_scan_used`
*   `mobile/src/services/PDFService.ts` — `pdf_exported` (deux chemins : save & share)

**Dashboard PostHog — "Bike Service Beta" ✅ (2026-04-10)**

Un dashboard de suivi a été créé manuellement dans PostHog avec 4 insights :

1. **Écrans les plus visités** (Trends) — event `screen_view`, breakdown par propriété `screen`. Affiche quels écrans sont le plus consultés. Aggregation : Unique users.
2. **Fonctionnalités utilisées** (Trends) — 5 séries : `vehicle_added`, `maintenance_log_created`, `document_uploaded`, `ai_scan_used`, `pdf_exported`. Permet de voir quelles fonctionnalités sont réellement utilisées.
3. **Funnel adoption core** (Funnel) — Step 1 : `vehicle_added` → Step 2 : `maintenance_log_created`. Indique le % d'utilisateurs qui vont jusqu'à enregistrer un entretien après avoir ajouté une moto.
4. **Utilisateurs actifs par jour** (Trends) — event `screen_view`, aggregation Unique users, last 30 days.

Les events ont été vérifiés en conditions réelles (utilisation manuelle des fonctionnalités) — toutes les données arrivent correctement dans PostHog. *Captures d'écran disponibles pour le rapport.*

---

### Étape 6.3 : Bouton de feedback in-app ✅

**Raison :** Les analytics montrent le "quoi", mais pas le "pourquoi". Un formulaire de feedback permet aux testeurs d'exprimer ce qui fonctionne et ce qui frustre.

**Actions :**
*   **Google Form créé :** "Formulaire de Feedback — BikeService" avec les champs suivants :
    *   Note globale (1–5 étoiles) — `entry.2134169288`
    *   Fonctionnalités utilisées (cases à cocher : Journal d'entretien / Dashboard / Wallet / Scanner IA / Export PDF) — `entry.2135198560`
    *   Ce qui a bien fonctionné (texte libre) — `entry.2075602113`
    *   Ce qui était frustrant ou confus (texte libre) — `entry.1929144732`
    *   Recommanderiez-vous l'app ? (Oui / Peut-être / Non) — `entry.2119261993`
    *   Version de l'app (pré-rempli automatiquement) — `entry.1725831997`
*   **Formulaire publié** avec accès "Tous les utilisateurs" en mode Répondant ✅
*   **Bouton intégré** dans l'écran Settings (section Support, icône `Lightbulb`), via `Linking.openURL` ✅
*   **Pré-remplissage automatique** de la version (`Constants.expoConfig?.version`) via le paramètre `entry.1725831997` dans l'URL ✅

**Fichiers modifiés :**
*   `mobile/app/(tabs)/settings.tsx` — bouton feedback + constante `FEEDBACK_FORM_URL` avec l'URL réelle
*   `mobile/src/context/LanguageContext.tsx` — clé de traduction `settings.send_feedback`

---

### Étape 6.4 : Mise à jour des pages légales ✅ (2026-04-10)

**Raison :** L'intégration de Sentry et PostHog implique une collecte de données supplémentaire (traces d'erreurs, événements d'usage). La politique de confidentialité doit être mise à jour pour rester conforme, et c'est une exigence du Play Store.

**Actions réalisées :**
*   **Date** mise à jour : 05 Février → 10 Avril 2026
*   **Section 2 (Données collectées)** — 2 nouvelles puces ajoutées :
    *   "Données de diagnostic anonymisées (rapports de plantage, erreurs techniques)"
    *   "Données d'utilisation anonymisées (écrans visités, fonctionnalités utilisées)"
*   **Nouvelle section 6 (Services tiers)** ajoutée :
    *   **Sentry** : traces d'erreurs anonymisées, aucune donnée personnelle identifiable
    *   **PostHog** : événements anonymisés, hébergement EU Cloud, pas de contenu personnel transmis
*   Ancienne section 6 (Contact) devient section 7
*   **Accessibilité :** La route `/legal` est déjà whitelistée dans `_layout.tsx` — accessible sans être connecté (exigence Play Store confirmée).

**Fichiers modifiés :**
*   `mobile/app/legal/privacy.tsx` — date, section 2, nouvelle section 6 Services tiers

---

### Étape 6.5 : Vérifications backend ✅ (2026-04-10)

**Actions réalisées :**

*   **Supabase Storage ✅ :** Bucket `documents` vérifié via MCP. Bucket privé (`public: false`). 4 policies en place (SELECT, INSERT, UPDATE, DELETE) — toutes isolées par `auth.uid() = foldername[1]`. Aucune correction nécessaire.

*   **Backup schéma ✅ :** `database/schema.sql` entièrement réécrit pour refléter l'état de production. Ajouts vs brouillon initial :
    *   Colonnes `user_id` sur `vehicles`, `maintenance_logs`, `documents`
    *   Colonnes `display_order` et `catalog_id` sur `vehicles`
    *   Table `document_pages` (avec colonnes `width`, `height`)
    *   Table `motorcycle_catalog` (catalogue de référence, lecture publique)
    *   `cost` en `numeric` (était `integer` dans le brouillon)
    *   Vraies policies RLS par `user_id` (les placeholders "all authenticated" supprimés)
    *   Indexes `user_id` ajoutés sur les 3 tables principales
    *   Section commentée résumant les policies Storage

*   **Quotas Gemini ✅ :** Free Tier actuel — 15 req/min, 1 500 req/jour, 1M tokens/min. Largement suffisant pour le MVP. Alerte budget à configurer manuellement dans Google Cloud Console → Billing → Budgets & alerts (seuils recommandés : $1, $5).

**Fichiers modifiés :**
*   `database/schema.sql` — réécriture complète (snapshot production 2026-04-10)

---

### Étape 6.6 : Préparation Play Store ✅ (2026-04-16)

**Prérequis :** Vérification du compte Google Play terminée (2026-04-16).

**Problème rencontré — nom de package déjà pris :**
`com.bikeservice.app` était associé à 4 certificats de signature appartenant à d'autres développeurs dans l'écosystème Android. Google Play Console affiche une erreur de conflit à l'enregistrement. Solution : changement du package en `com.armandebongnie.bikeservice` (namespace personnel, garantit l'unicité).

**Fichiers modifiés :**
*   `mobile/app.json` — `ios.bundleIdentifier` et `android.package` mis à jour vers `com.armandebongnie.bikeservice`

**Enregistrement du nom de package :**
*   Via Play Console → Validation des développeurs Android → Noms des packages
*   Saisie de `com.armandebongnie.bikeservice`
*   Ajout de la clé : empreinte **SHA-256** du keystore EAS de production (`mobile/@armano__mobile.jks`) — `C6:E6:C8:AF:ED:9F:A6:46:99:D9:F7:22:E8:0F:42:61:54:E7:D4:2B:6C:97:94:65:17:33:4B:58:DF:91:A5:A1`
*   Validation confirmée par Play Console ✅

**Création de l'application :**
*   Play Console → Accueil → Créer une application
*   Nom : `BikeService`, langue : Français (France), type : Appli, gratuite
*   Application créée avec succès ✅

**Prochaines actions (fiche Play Store) :**
*   Upload AAB sur le track Tests internes
*   Icône haute résolution 512×512 PNG
*   Feature Graphic 1024×500 PNG
*   Screenshots (minimum 2)
*   Description courte (80 chars max) : *"Carnet d'entretien moto — hors-ligne, assisté par IA"*
*   URL politique de confidentialité (hébergement public requis)
*   Questionnaire de classification de contenu

---

### Étape 6.7 : Build de production & distribution ✅ (2026-04-16)

**Build EAS — 2ème build :**
*   Relancé après le changement de package (`com.armandebongnie.bikeservice`), avec le keystore existant
*   Commande : `eas build --profile production --platform android` depuis `mobile/`
*   AAB signé téléchargé depuis le dashboard EAS ✅

**Prochaine action :** Upload de l'AAB sur Play Console → Tests internes → Créer une version

---

### Étape 6.8 : Publication Tests internes & Politique de confidentialité publique ✅ (2026-04-17)

**AAB uploadé sur Play Console :**
*   Version `1.0.0 (1)` publiée sur le track **Tests internes** ✅
*   Notes de version en français ajoutées
*   Erreur bloquante résolue : l'AAB initial avait l'ancien package `com.bikeservice.app` — le bon AAB (2ème build EAS) a été utilisé

**Politique de confidentialité hébergée publiquement :**
*   Exigence déclenchée par la permission `android.permission.CAMERA` (Play Console l'impose)
*   Fichier `docs/privacy.html` créé et hébergé via **GitHub Pages** : `https://armandeb.github.io/bikeservice/privacy.html`
*   URL renseignée dans Play Console → Surveiller et améliorer → Règles et programmes → Contenu de l'application → Règles de confidentialité
*   Email de contact corrigé : `arman@omistudio.be`

**Fichiers modifiés :**
*   `docs/privacy.html` — nouvelle page HTML publique
*   `mobile/app/legal/privacy.tsx` — email de contact mis à jour

---

### Checklist de validation finale

| Vérification | Statut |
| :--- | :--- |
| Crash test → visible dans Sentry | ◻️ |
| Navigation → événements dans PostHog Live Events | ✅ |
| Bouton feedback → Google Form s'ouvre avec version pré-remplie | ◻️ |
| Pages légales accessibles sans connexion | ◻️ |
| Build de production compile sans erreurs | ◻️ |
| AAB uploadé sur Play Console sans warnings | ◻️ |

---

*(Note : Ce document est mis à jour à chaque étape clé du développement.)*
