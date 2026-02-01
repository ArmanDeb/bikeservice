# Réalisation technique de Bike Service

Ce document retrace les étapes clés du développement de mon application, les choix techniques que j'ai effectués et la manière dont j'ai structuré le code pour répondre aux exigences de mon TFE.

## 1. Choix technologiques et architecture

Pour ce projet, j'ai décidé de partir sur des technologies modernes qui permettent une grande agilité tout en garantissant des performances solides sur mobile.

*   **Frontend :** J'ai choisi **React Native** avec l'écosystème **Expo**. Cela m'a permis de développer simultanément pour iOS et Android avec une base de code unique en TypeScript.
*   **Base de données (Offline-First) :** C'est le cœur technique du projet. Pour que l'application reste utilisable dans un garage sans réseau, j'ai implémenté **WatermelonDB**. Contrairement à une API classique, l'application écrit d'abord dans une base SQLite locale, ce qui rend l'interface extrêmement réactive.
*   **Backend & Synchro :** J'utilise **Supabase** (PostgreSQL) pour le stockage déporté et l'authentification. La synchronisation entre le téléphone et le cloud est gérée par un "Sync Engine" que j'ai configuré pour réconcilier les données dès qu'une connexion est détectée.
*   **Design :** Pour le stylage, j'utilise **NativeWind** (Tailwind CSS pour mobile), ce qui me permet d'avoir un design cohérent et facile à maintenir.

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

*(Note : Ce document est mis à jour à chaque étape clé du développement.)*
