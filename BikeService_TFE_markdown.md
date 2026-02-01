# 

Epreuve intégrée de la section 

Bachelier en informatique de gestion 

# Bike Service

*Application destinée aux propriétaires de motos, offrant un carnet d'entretien numérique indépendant ainsi qu'un outil de gestion pour leurs documents administratifs.*

Travail de fin d'études présenté par Debongnie Arman 

En vue de l'obtention du diplôme de Bachelier en Informatique de Gestion

**Année académique 2025-2026**

## 

[1\. Introduction](#1.-introduction)

[2\. Contexte](#2.-contexte)

[2.1 Description du client](#2.1-description-du-client)

[2.2 Demande initiale](#2.2-demande-initiale)

[2.3 Produits existants](#2.3-produits-existants)

[2.3.1 Les Solutions Généralistes (Gestion de Flotte)](#2.3.1-les-solutions-généralistes-\(gestion-de-flotte\))

[2.3.2 Les Solutions Spécialisées Moto](#2.3.2-les-solutions-spécialisées-moto)

[2.3.3 Synthèse : Pourquoi une application sur mesure ?](#2.3.3-synthèse-:-pourquoi-une-application-sur-mesure-?)

[3\. Cahier des charges](#3.-cahier-des-charges)

[3.1 Élaboration](#3.1-élaboration)

[3.1.1 La première rencontre de travail (Analyse de l'existant)](#3.1.1-la-première-rencontre-de-travail-\(analyse-de-l'existant\))

[3.1.2 La solution retenue](#3.1.2-la-solution-retenue)

[3.2 Flux d'informations identifiés](#3.2-flux-d'informations-identifiés)

[3.2.1 Flux d'informations existants à conserver (Intrants physiques)](#3.2.1-flux-d'informations-existants-à-conserver-\(intrants-physiques\))

[3.2.2 Flux d'informations existants à remplacer (Intrants/Extrants obsolètes)](#3.2.2-flux-d'informations-existants-à-remplacer-\(intrants/extrants-obsolètes\))

[3.2.3 Flux d'informations à produire (Extrants du système)](#3.2.3-flux-d'informations-à-produire-\(extrants-du-système\))

[3.3 Acteurs de l'environnement et d'exploitation](#3.3-acteurs-de-l'environnement-et-d'exploitation)

[3.3.1 Acteurs Directs (Utilisateurs)](#3.3.1-acteurs-directs-\(utilisateurs\))

[3.3.2 Acteurs Indirects (Contributeurs passifs)](#3.3.2-acteurs-indirects-\(contributeurs-passifs\))

[3.3.3 Acteurs Système](#3.3.3-acteurs-système)

[3.3.4 Scénarios d'une session d'utilisation ordinaire](#3.3.4-scénarios-d'une-session-d'utilisation-ordinaire)

[3.4 Infrastructure Informatique](#3.4-infrastructure-informatique)

[3.4.1 Infrastructure Client (Matériel)](#3.4.1-infrastructure-client-\(matériel\))

[3.4.2 Infrastructure Logicielle et Réseau](#3.4.2-infrastructure-logicielle-et-réseau)

[3.4.3 Infrastructure Serveur (Backend)](#3.4.3-infrastructure-serveur-\(backend\))

[3.5 Perspectives d'évolution (Version Ultérieure)](#3.5-perspectives-d'évolution-\(version-ultérieure\))

[4\. Analyse](#4.-analyse)

[4.1 Diagramme de Cas d'Utilisation (Use Case)](#4.1-diagramme-de-cas-d'utilisation-\(use-case\))

[4.2 Scénarios Textuels (Description des Cas d'Utilisation)](#4.2-scénarios-textuels-\(description-des-cas-d'utilisation\))

[Cas d'Utilisation n°1 : Enregistrer une Maintenance](#cas-d'utilisation-n°1-:-enregistrer-une-maintenance)

[4.3 Diagramme de Classes d'Analyse (Modèle du Domaine)](#4.3-diagramme-de-classes-d'analyse-\(modèle-du-domaine\))

[Les Entités Identifiées :](#les-entités-identifiées-:)

[Relations et Cardinalités :](#relations-et-cardinalités-:)

[4.4 Analyse des classes stéréotypées (Modèle MVC / Jacobson)](#4.4-analyse-des-classes-stéréotypées-\(modèle-mvc-/-jacobson\))

[4.5 Diagramme d'Activité](#4.5-diagramme-d'activité)

[4.6 Diagramme de Séquence (Basé sur le scénario nominal)](#4.6-diagramme-de-séquence-\(basé-sur-le-scénario-nominal\))

[4.7 Étude des Opérations Systèmes](#4.7-étude-des-opérations-systèmes)

[4.8 Classes Participatives & MVC (Modèle-Vue-Contrôleur)](#4.8-classes-participatives-&-mvc-\(modèle-vue-contrôleur\))

[4.9 Diagramme d'État (State Diagram)](#4.9-diagramme-d'état-\(state-diagram\))

[4.10 Diagramme de Composants](#4.10-diagramme-de-composants)

[4.11 Diagramme de Déploiement](#4.11-diagramme-de-déploiement)

## 

## 

## **1\. Introduction** {#1.-introduction}

Ce Travail de Fin d'Études marque l'aboutissement de mon cursus en Informatique de Gestion. Il représente l'opportunité de synthétiser les compétences techniques et analytiques acquises durant ma formation au travers d'un projet concret et personnel.

Alliant ma passion pour la moto à mon expertise de développeur, ce projet naît d'un constat personnel : l'absence d'outils équilibrés pour le motard qui, comme moi, souhaite suivre l'entretien de sa machine sans être mécanicien ni s'encombrer de dossiers papier. Ma motivation est de concevoir la solution que je ne trouvais pas sur le marché : une application fiable, simple et centralisée.

À travers la réalisation de *Bike Service*, je poursuis un double objectif :

* **Objectif d'apprentissage technique :** Maîtriser le développement mobile moderne et l'architecture "Offline-First". Le défi est de monter en compétence sur l'écosystème React Native (Expo) et TypeScript, tout en appréhendant la complexité de la synchronisation de données locale (WatermelonDB) vers le cloud (Supabase).  
* **Objectif d'expérience professionnelle :** Dépasser le stade du simple prototype pour livrer un produit fini et robuste. Je souhaite acquérir l'expérience de la gestion complète du cycle de vie d'une application, de la conception de la base de données à l'expérience utilisateur, en mettant un accent particulier sur la qualité et l'intégrité des données.

# 

## **2\. Contexte** {#2.-contexte}

Le développement de *Bike Service* naît d'une demande spécifique : fournir une solution numérique agile pour pallier les déficiences organisationnelles liées à la possession d'un deux-roues. Ce chapitre définit le profil du demandeur, le périmètre initial du projet et l'analyse de l'offre existante qui justifie le développement d'une solution sur mesure.

### **2.1 Description du client**  {#2.1-description-du-client}

Le client ( moi ) est un particulier, propriétaire d'une moto, correspondant au profil du "motard usager" plutôt que du "motard mécanicien". Bien que ne gérant qu'un seul véhicule pour l'instant, il fait face à des difficultés organisationnelles qui nuisent à sa sérénité :

* **Manque d'assiduité :** Une difficulté à maintenir une rigueur constante dans le suivi des entretiens périodiques.  
* **Insécurité administrative :** Une crainte récurrente de l'oubli, de la perte ou de la non-disponibilité des documents de bord obligatoires (assurances, immatriculation) lors des déplacements.

Le client est conscient que cette désorganisation administrative peut avoir des conséquences directes sur l'intégrité physique : une moto mal suivie est une moto potentiellement dangereuse. Il recherche donc un système qui compense son manque de rigueur naturelle par une structure claire et assistée.

### **2.2 Demande initiale** {#2.2-demande-initiale}

La demande initiale porte sur la création d'un outil de gestion personnel, impérativement mobile ("Mobile First"), capable d'agir comme une extension numérique de la moto. Le cahier des charges sommaire s'articule autour de trois axes prioritaires :

1. **Sécurité et Maintenance (Priorité Absolue) :** L'application doit garantir que le véhicule est techniquement sûr. Elle doit permettre d'enregistrer et de consulter l'historique des interventions pour éviter les oublis critiques (freins, pneus, vidanges) pouvant causer des accidents.  
2. **Centralisation Documentaire :** Le système doit intégrer un module de stockage numérique (Wallet) pour les documents officiels, garantissant qu'ils soient toujours "dans la poche" du pilote, éliminant le risque d'oubli physique.  
3. **Ergonomie Contextuelle :** Contrairement à un outil de bureau, l'interface doit être pensée pour une utilisation rapide sur téléphone, potentiellement dans un garage ou sur le bord de la route, avec une navigation simple et épurée.  
   

### 

### **2.3 Produits existants** {#2.3-produits-existants}

L'analyse du marché applicatif actuel révèle une offre abondante mais polarisée entre des solutions généralistes (conçues pour l'automobile) et des solutions de niche (focalisées sur la sécurité ou le tracé GPS). Aucune ne répond parfaitement à la triade de besoins du client : *Simplicité \- TCO Réel \- Administratif*.

#### **2.3.1 Les Solutions Généralistes (Gestion de Flotte)** {#2.3.1-les-solutions-généralistes-(gestion-de-flotte)}

Ces applications dominent le marché par leur volume de téléchargements. Elles sont robustes mais souffrent d'un défaut d'adaptation au contexte "Moto".

* **Drivvo**  
  * **Points Forts :** Leader du marché, il excelle dans le calcul des coûts opérationnels (carburant, services). Il offre une gestion multi-véhicules et des graphiques de dépenses très détaillés.  
  * **Points Faibles :** L'interface et la terminologie sont "voiture-centriques" (icônes, types de services). Le calcul du TCO (Total Cost of Ownership) est incomplet car il intègre mal la dépréciation réelle du véhicule, pourtant critique pour une moto. De plus, le modèle gratuit est pollué par la publicité.

![][image1]

* **Fuelio (Sygic)**  
  * **Points Forts :** Interface épurée et moderne. Il intègre un "Trip Log" (suivi GPS) et le crowdsourcing des prix du carburant, ce qui est utile pour les petits réservoirs moto.  
  * **Points Faibles :** Focalisation excessive sur le carburant (OpEx) au détriment des coûts fixes (CapEx) comme l'équipement du pilote ou l'assurance. La gestion documentaire (Wallet) est inexistante ou anecdotique.

![][image2]

* **Excel / Google Sheets**  
  * **Points Forts :** Flexibilité totale et gratuité.  
  * **Points Faibles :** Inutilisable efficacement sur mobile (ergonomie non tactile). Absence de notifications proactives et impossibilité de stocker des photos (factures, documents) de manière liée aux données.

![][image3]

#### **2.3.2 Les Solutions Spécialisées Moto** {#2.3.2-les-solutions-spécialisées-moto}

Ces applications tentent d'adresser les besoins spécifiques des motards mais introduisent souvent une complexité technique excessive ou dépendent de services tiers.

* **MotoLog**  
  * **Points Forts :** Conçu par des motards, il distingue la consommation "Ville" vs "Autoroute" (crucial pour l'aérodynamisme moto). Il gère bien les intervalles de maintenance spécifiques.  
  * **Points Faibles :** L'interface reste austère (style tableur). La saisie des données demande trop de "clics", ce qui est rédhibitoire pour un motard équipé de gants à la station-service.

![][image4]

*   
* **Liberty Rider**  
  * **Points Forts :** Excellent pour la sécurité (détection d'accident) et le GPS. La maintenance est automatisée via le kilométrage GPS.  
  * **Points Faibles :** La gestion financière est un produit dérivé, pas le cœur du système. Il ne permet pas un archivage rigoureux des factures ou des documents administratifs pour la revente.

![][image5]

* **CodeNekt / MotoBook**  
  * **Points Forts :** Tentent de valider l'historique via la Blockchain ou la connexion avec des garages partenaires (carnet certifié).  
  * **Points Faibles :** Trop complexes pour l'utilisateur qui fait sa mécanique lui-même. Dépendance forte à un réseau de garages partenaires pour être pleinement utile.

![][image6]

#### 

#### **2.3.3 Synthèse : Pourquoi une application sur mesure ?** {#2.3.3-synthèse-:-pourquoi-une-application-sur-mesure-?}

| Solution | Forces | Faiblesses | À garder | À éviter |
| ----- | ----- | ----- | ----- | ----- |
| **Drivvo** | Coûts détaillés, graphiques clairs, multi-véhicules. | Interface auto, TCO incomplet (dépréciation), pubs. | Graphiques dépenses, structure coûts (OpEx). | Ergonomie auto, modèle pub. |
| **Fuelio** | UI moderne et épurée, Suivi GPS. | Focalisation carburant, ignore coûts fixes (équipement, assurance), pas de "Wallet". | Design épuré, simplicité de lecture. | Vision tunnel carburant, manque gestion documentaire. |
| **Excel / Sheets** | Gratuit, flexibilité. | Inutilisable mobile/tactile, pas de photos, mélange données. | Liberté de structure. | Absence de liens données/preuves (photos). |
| **MotoLog** | Logique 100% Moto, Distinction Ville/Autoroute. | Interface austère (Win 95), saisie trop longue. | Intervalles entretien spécifiques moto. | Complexité formulaires, design vieillissant. |
| **Liberty Rider** | Sécurité, GPS, Automatisation kilométrage. | Gestion financière anecdotique, pas d'archivage sérieux. | Automatisation kilométrage (vision cible). | Dépendance réseau (Cloud), manque rigueur administrative. |
| **MotoBook** | Certification historique, carnet vérifié. | Dépendance garages partenaires, trop complexe pour "bricoleur". | Intégrité de l'historique. | Dépendance à un tiers pour validation, lourdeur certification. |

L'étude comparative démontre qu'aucun produit existant ne couvre le périmètre spécifique du projet *Bike Service*. Le client rejette les solutions actuelles pour trois raisons majeures qui justifient le développement "In-House" :

1. **Le Manque de "Coffre-fort" Administratif (Wallet) :** Les concurrents se concentrent sur la mécanique ou le carburant. Aucun ne propose une gestion centralisée et sécurisée des pièces critiques (Permis, Assurance, Carte Grise) adaptée au contexte de contrôle routier belge.  
2. **L'Approche TCO est biaisée :** Les applications existantes calculent combien la moto *consomme*, mais pas combien elle *coûte réellement* (incluant la dépréciation et l'équipement du pilote).  
3. **L'Expérience "Offline-First" :** Le client souhaite une garantie absolue de souveraineté sur ses données. Contrairement aux solutions cloud (Drivvo, Liberty Rider) qui nécessitent du réseau ou un compte, *Bike Service* doit fonctionner en autonomie totale (base de données locale), indispensable dans les zones blanches ou les parkings souterrains.

## **3\. Cahier des charges** {#3.-cahier-des-charges}

Ce chapitre formalise les besoins fonctionnels et techniques du projet. Il est le résultat de l'analyse des besoins du client et définit le périmètre strict de l'application *Bike Service*.

### **3.1 Élaboration** {#3.1-élaboration}

La phase d'élaboration a consisté à traduire un besoin utilisateur ressenti en spécifications techniques concrètes. Cette étape s'est déroulée via une auto-analyse du processus de gestion actuel (méthode de l'observation participative, le développeur étant également le client).

#### **3.1.1 La première rencontre de travail (Analyse de l'existant)** {#3.1.1-la-première-rencontre-de-travail-(analyse-de-l'existant)}

L'analyse initiale a mis en lumière la désorganisation du processus actuel ("l'état des lieux"). Le constat est celui d'une dispersion critique de l'information :

* Les preuves d'entretien (factures) sont stockées physiquement dans des classeurs ou numériquement dans des emails non triés.  
* Le suivi kilométrique est purement mental ou noté sur des supports volatils (post-it, notes smartphone).  
* Les documents légaux sont soit laissés à domicile (risque d'amende), soit laissés sous la selle de la moto (risque de vol ou d'humidité).

#### **3.1.2 La solution retenue**  {#3.1.2-la-solution-retenue}

Face à ce constat, la décision a été prise de développer une application mobile native (Android/iOS) nommée *Bike Service*. La solution retenue est une application "compagnon" qui centralise ces flux épars. Elle se substitue aux outils partiels (Excel, Notes) tout en cohabitant avec les documents officiels obligatoires. L'architecture technique privilégie une approche "Offline-First" pour garantir la disponibilité des données dans les environnements sans réseau (garages en sous-sol, zones rurales).

### **3.2 Flux d'informations identifiés** {#3.2-flux-d'informations-identifiés}

Cette section inventorie les données entrant et sortant du périmètre de l'application. Elle distingue les supports physiques à conserver, ceux à numériser, et les nouvelles données générées par le système.

#### 

#### **3.2.1 Flux d'informations existants à conserver (Intrants physiques)** {#3.2.1-flux-d'informations-existants-à-conserver-(intrants-physiques)}

Il s'agit des documents originaux qui, pour des raisons légales ou pratiques, continuent d'exister physiquement mais dont une copie numérique servira d'entrée au système.

* **Les Factures d'atelier (Papier/PDF) :** Source primaire pour valider les coûts et les dates.  
* **Les Documents de bord (Carte grise, Assurance) :** Doivent être conservés pour les contrôles de police, mais sont dupliqués dans l'application.  
* **L'Odomètre (Compteur moto) :** Source de vérité absolue pour le kilométrage.

#### **3.2.2 Flux d'informations existants à remplacer (Intrants/Extrants obsolètes)** {#3.2.2-flux-d'informations-existants-à-remplacer-(intrants/extrants-obsolètes)}

Ces supports d'information sont voués à disparaître au profit de l'application *Bike Service*.

* **Le Carnet d'entretien constructeur (Papier) :** Remplacé par le module "Journal de Maintenance".  
* **Le fichier de suivi Excel/Google Sheets :** Jugé inadapté au mobile, il est totalement remplacé par la base de données de l'application.  
* **Les notes éparses (Rappels de vidange) :** Remplacées par les indicateurs du tableau de bord.

#### **3.2.3 Flux d'informations à produire (Extrants du système)** {#3.2.3-flux-d'informations-à-produire-(extrants-du-système)}

L'application doit générer et restituer de nouvelles informations à valeur ajoutée, inexistantes auparavant sous cette forme.

* **Fiche d'Identité Numérique du Véhicule :** Une vue synthétique regroupant les caractéristiques techniques et administratives (Plaque, VIN, Année, Modèle).  
* **Tableau de bord financier (TCO) :** Un affichage dynamique calculant le coût total de possession et le coût au kilomètre (Sortie visuelle).  
* **Historique Chronologique Unifié :** Une "Timeline" interactive fusionnant les entretiens réalisés, les coûts associés et les documents justificatifs.  
* **Alertes de maintenance (Prévisionnel) :** Indicateurs visuels basés sur le kilométrage actuel vs la dernière intervention connue.

### 

### **3.3 Acteurs de l'environnement et d'exploitation** {#3.3-acteurs-de-l'environnement-et-d'exploitation}

Ce point identifie les parties prenantes interagissant directement ou indirectement avec le système *Bike Service*.

#### **3.3.1 Acteurs Directs (Utilisateurs)** {#3.3.1-acteurs-directs-(utilisateurs)}

* **Le Propriétaire/Conducteur (Administrateur) :**  
  * *Rôle :* Il est l'acteur principal. Il alimente le système (saisie des entretiens, photos des documents) et consulte les tableaux de bord. Il possède les droits complets (création, modification, suppression).

#### **3.3.2 Acteurs Indirects (Contributeurs passifs)** {#3.3.2-acteurs-indirects-(contributeurs-passifs)}

* **Le Garagiste / Mécanicien :**  
  * *Rôle :* Il ne manipule pas l'application directement, mais ses actions (réparations) et ses productions (factures) sont la source des données saisies par le Propriétaire.  
* **Les Forces de l'Ordre / Administration :**  
  * *Rôle :* Ils sont les "consommateurs" potentiels du module *Wallet*. En cas de contrôle, ils visualisent les documents affichés par l'application (Permis, Assurance).

#### **3.3.3 Acteurs Système** {#3.3.3-acteurs-système}

* **Le Service Backend (Supabase) :**  
  * *Rôle :* Acteur invisible assurant la sauvegarde, la synchronisation et l'intégrité des données lorsque la connexion réseau est rétablie.

#### **3.3.4 Scénarios d'une session d'utilisation ordinaire** {#3.3.4-scénarios-d'une-session-d'utilisation-ordinaire}

Cette section décrit le parcours utilisateur ("User Journey") pour les fonctionnalités clés de l'application. Elle traduit la logique métier en séquences d'actions concrètes.

**Scénario A : L'initialisation du Garage (Onboarding)**

1. **Contexte :** L'utilisateur lance l'application pour la première fois ou vient d'acheter une nouvelle moto.  
2. **Action :** Il accède à l'onglet "Garage" et sélectionne "Ajouter un véhicule".  
3. **Saisie :** Il remplit les champs statiques (Marque, Modèle, Année, VIN) et initialise le kilométrage courant (ex: 12 500 km).  
4. **Résultat :** La fiche véhicule est créée. Le tableau de bord s'ouvre, vierge de tout historique mais affichant l'odomètre initialisé. La base de données locale est mise à jour immédiatement.

**Scénario B : L'enregistrement d'une maintenance (Opérationnel)**

1. **Contexte :** L'utilisateur sort du garage après une révision ou vient d'effectuer une vidange lui-même.  
2. **Action :** Sur le tableau de bord de la moto concernée, il appuie sur le bouton flottant d'action "Ajouter un Log".  
3. **Saisie :**  
   * Il sélectionne le type : "Entretien Périodique".  
   * Il saisit le nouveau kilométrage (ex: 18 000 km). *Le système valide que 18 000 \> 12 500\.*  
   * Il indique le coût (ex: 150€) et une note ("Vidange \+ Filtre à huile").  
   * Il prend une photo de la facture via le module caméra intégré.  
4. **Résultat :** L'entretien est ajouté à l'historique chronologique. L'odomètre principal du véhicule se met à jour automatiquement à 18 000 km. Le coût total de possession (TCO) est recalculé instantanément.

**Scénario C : Contrôle routier (Consultation Wallet)**

1. **Contexte :** L'utilisateur est arrêté sur le bord de la route pour un contrôle de police. Il n'a pas ses papiers originaux sur lui.  
2. **Action :** Il ouvre l'application (même sans réseau 4G/5G). Il navigue vers l'onglet "Documents".  
3. **Consultation :** Il sélectionne "Assurance" et "Certificat d'Immatriculation".  
4. **Résultat :** L'application affiche les scans haute définition des documents. L'utilisateur peut zoomer pour prouver la validité des dates et des numéros de châssis.

**Scénario D : Analyse financière (Aide à la décision)**

1. **Contexte :** L'utilisateur envisage de vendre sa moto et veut évaluer ses dépenses réelles.  
2. **Action :** Il consulte le "Tableau de Bord Analytique".  
3. **Analyse :** Il visualise le graphique de répartition des coûts. Il constate que le véhicule lui a coûté 0,15€/km hors essence.  
4. **Résultat :** Il dispose d'un argumentaire chiffré pour la négociation de revente ou pour son propre bilan financier.

### 

### **3.4 Infrastructure Informatique** {#3.4-infrastructure-informatique}

Cette section détaille l'environnement technique nécessaire au déploiement et à l'exécution de la solution *Bike Service*.

#### **3.4.1 Infrastructure Client (Matériel)**  {#3.4.1-infrastructure-client-(matériel)}

L'application est conçue pour l'écosystème mobile standard.

* **Terminal :** Smartphone sous Android (version 8.0+) ou iOS (version 13+).  
* **Capteurs requis :** Caméra arrière (pour la numérisation des documents).  
* **Stockage :** Espace disque minimum de 100 Mo disponible pour la base de données locale et le cache des images.

#### **3.4.2 Infrastructure Logicielle et Réseau** {#3.4.2-infrastructure-logicielle-et-réseau}

* **Architecture :** Modèle "Thick Client" (Client lourd) avec architecture "Offline-First". La logique métier réside majoritairement sur le téléphone.  
* **Connectivité :** L'application fonctionne en mode déconnecté par défaut. Une connexion Internet (Wi-Fi/4G) est requise ponctuellement pour la synchronisation avec le serveur distant.  
* **Base de Données Embarquée :** WatermelonDB (basé sur SQLite) assure la persistance locale immédiate.

#### **3.4.3 Infrastructure Serveur (Backend)**  {#3.4.3-infrastructure-serveur-(backend)}

Le backend est externalisé (Serverless) pour minimiser la maintenance.

* **Fournisseur :** Supabase (Hébergé sur AWS).  
* **Base de Données Maître :** PostgreSQL.  
* **Stockage Fichiers :** Supabase Storage (Object Storage compatible S3) pour héberger les photos des documents et factures.

### 

### **3.5 Perspectives d'évolution (Version Ultérieure)** {#3.5-perspectives-d'évolution-(version-ultérieure)}

Le périmètre actuel (V1) se concentre sur les fonctionnalités essentielles (MVP). Des évolutions sont déjà identifiées pour les versions futures afin d'enrichir l'expérience utilisateur :

1. **Module de Rappels Proactifs (Notifications) :** Implémentation de notifications locales ("Push Notifications") basées sur le temps (ex: "Contrôle technique dans 1 mois") ou sur une estimation kilométrique (ex: "Vidange probable dans 500 km" basée sur la moyenne de roulage).  
2. **Exportation PDF pour Revente :** Génération automatique d'un rapport PDF complet ("Dossier de vente") regroupant l'historique de maintenance et la chronologie des coûts, transmissible à un acheteur potentiel pour prouver le sérieux de l'entretien.  
3. **Connectivité OBD-II (IoT) :** Interface avec un dongle Bluetooth OBD pour récupérer le kilométrage réel directement depuis l'ECU (Engine Control Unit) de la moto, éliminant la saisie manuelle.  
4. **Mode Multi-Utilisateurs (Partage) :** Gestion des droits pour permettre à plusieurs utilisateurs (ex: un couple) de gérer une même moto et de synchroniser leurs actions sur un garage commun.

## **4\. Analyse** {#4.-analyse}

Cette phase vise à modéliser le comportement interne et la structure du système *Bike Service* afin de préparer la phase de développement.

### **4.1 Diagramme de Cas d'Utilisation (Use Case)** {#4.1-diagramme-de-cas-d'utilisation-(use-case)}

Le diagramme de cas d'utilisation définit le périmètre fonctionnel du système en illustrant les interactions entre les acteurs et les fonctionnalités offertes par l'application mobile.

**Identification des Acteurs :**

* **Le Motard (Acteur Principal) :** Initiateur de toutes les actions métier (création, consultation, modification).  
* **Supabase / Serveur (Acteur Secondaire/Système) :** Sollicité pour la synchronisation des données et l'authentification.

**Organisation des Cas d'Utilisation (Packages) :** Pour assurer la lisibilité du diagramme, les cas d'utilisation sont regroupés par modules fonctionnels :

1. **Module Garage (Gestion de flotte)**  
   * *Gérer les véhicules* (CRUD : Créer, Lire, Mettre à jour, Supprimer).  
   * *Sélectionner le véhicule actif* (Context switching).  
2. **Module Maintenance (Cœur du système)**  
   * *Enregistrer une intervention* (Vidange, Réparation).  
   * *Consulter l'historique*.  
   * *Consulter les échéances* (Maintenance prédictive).  
   * **Contrainte :** Le cas *Enregistrer une intervention* inclut (\<\<include\>\>) systématiquement la vérification de cohérence kilométrique.  
3. **Module Wallet (Administratif)**  
   * *Gérer les documents* (Ajout/Suppression).  
   * *Visualiser un document* (Zoom/Lecture).  
   * Ce module étend (\<\<extend\>\>) le cas *Gérer les documents* avec la fonctionnalité *Prendre une photo*.  
4. **Module Transverse**  
   * *Synchroniser les données*.  
   * *S'authentifier* (Pré-requis à la synchronisation, mais pas à l'usage local).

![][image7]

### 

### **4.2 Scénarios Textuels (Description des Cas d'Utilisation)** {#4.2-scénarios-textuels-(description-des-cas-d'utilisation)}

Cette section détaille le déroulement des processus clés. Nous nous concentrons ici sur le cas d'utilisation le plus critique en termes de logique métier : **"Enregistrer une nouvelle maintenance"**.

#### **Cas d'Utilisation n°1 : Enregistrer une Maintenance** {#cas-d'utilisation-n°1-:-enregistrer-une-maintenance}

**1\. Sommaire d'identification**

* **Titre :** Création d'un log de maintenance.  
* **Acteur principal :** Le Motard.  
* **But :** Mémoriser une intervention technique et mettre à jour le kilométrage global du véhicule.  
* **Niveau :** Tâche utilisateur (Objectif principal).

**2\. Description des enchaînements**

**Pré-conditions :**

* L'application est lancée.  
* Un véhicule est sélectionné (Véhicule Actif).  
* Le kilométrage actuel du véhicule est connu du système (ex: 10 000 km).

**Scénario Nominal (Le cas idéal) :**

1. Le Motard sélectionne l'action "Ajouter un entretien".  
2. Le Système affiche le formulaire de saisie pré-rempli avec la date du jour.  
3. Le Motard saisit les informations : Titre, Type (Vidange), Coût.  
4. Le Motard saisit le kilométrage au moment de l'entretien (ex: 10 500 km).  
5. Le Motard valide le formulaire.  
6. **Le Système vérifie la cohérence kilométrique :** Le kilométrage saisi (10 500\) est supérieur au dernier connu (10 000).  
7. Le Système enregistre l'entretien dans la base locale (WatermelonDB).  
8. Le Système met à jour l'attribut current\_mileage du véhicule avec la nouvelle valeur (10 500).  
9. Le Système recalcule les indicateurs financiers (TCO).  
10. Le Système affiche une confirmation et redirige vers l'historique.

**Scénarios Alternatifs (Gestion des erreurs et cas limites) :**

* **A1 : Kilométrage Incohérent (Erreur de saisie)**  
  * *Au pas 6 du nominal :* Le Motard a saisi un kilométrage inférieur au dernier connu (ex: 9 000 km alors que la moto a 10 000 km).  
  * *Système :* Détecte l'incohérence et bloque la validation. Affiche un message d'erreur : *"Le kilométrage ne peut pas être inférieur à la dernière valeur connue (10 000 km)."*  
  * *Motard :* Corrige la saisie ou active le mode "Correction forcée" (si c'est une correction rétroactive).  
  * *Système :* Reprend au pas 7\.  
* **A2 : Mode Hors-Connexion (Offline)**  
  * *Au pas 7 du nominal :* Le système tente de synchroniser avec Supabase mais ne détecte aucun réseau.  
  * *Système :* Marque l'enregistrement comme to\_sync (à synchroniser) dans la base locale.  
  * *Système :* Continue l'exécution normalement (l'utilisateur n' est pas bloqué).  
  * *Post-condition :* La donnée est visible localement mais absente du serveur jusqu'au retour du réseau.

**Post-conditions :**

* L'entretien est visible dans la chronologie.  
* Le kilométrage total du véhicule est à jour.  
* Le coût de l'intervention est intégré aux statistiques globales.

![][image8]

![][image9]

### **4.3 Diagramme de Classes d'Analyse (Modèle du Domaine)** {#4.3-diagramme-de-classes-d'analyse-(modèle-du-domaine)}

L'objectif ici est de modéliser les entités du monde réel et les relations qui les unissent, sans se soucier de la technologie.

#### **Les Entités Identifiées :** {#les-entités-identifiées-:}

1. **User (Utilisateur) :** Le compte propriétaire.  
2. **Vehicle (Véhicule) :** La moto ou le scooter géré.  
3. **MaintenanceLog (Journal d'entretien) :** Une intervention technique précise.  
4. **Document (Pièce administrative) :** Un fichier numérisé lié au véhicule ou à l'utilisateur.  
5. **Brand/Model (Référentiel) :** (Optionnel) Pour normaliser les noms des constructeurs.

#### **Relations et Cardinalités :** {#relations-et-cardinalités-:}

* Un **Utilisateur** possède **0..n Véhicules**.  
* Un **Véhicule** possède **0..n MaintenanceLogs**.  
* Un **Véhicule** est lié à **0..n Documents** (Carte grise, assurance).  
* Un **MaintenanceLog** peut être lié à **0..1 Document** (La photo de la facture).

### **![][image10]**

### 

### **4.4 Analyse des classes stéréotypées (Modèle MVC / Jacobson)** {#4.4-analyse-des-classes-stéréotypées-(modèle-mvc-/-jacobson)}

Pour justifier ton architecture logicielle (React Native), nous utilisons les objets de Jacobson pour séparer les responsabilités.

1. **Classes de Frontière (Boundary \- Vue) :**  
   * GarageScreen : Interface de liste des motos.  
   * MaintenanceForm : Formulaire de saisie des travaux.  
   * WalletView : Galerie de visualisation des documents.  
2. **Classes de Contrôle (Control \- Logique) :**  
   * SyncController : Gère le flux de données entre le local et Supabase.  
   * MaintenanceValidator : Vérifie la cohérence du kilométrage avant insertion.  
   * ImageProcessor : Gère la compression et l'envoi des photos vers le stockage S3.  
3. **Classes d'Entité (Entity \- Modèle) :**  
   * Ce sont les classes définies dans le diagramme de conception (Vehicle, Log, Document).

Voici l'analyse détaillée des points restants, structurée pour s'intégrer directement dans votre rapport technique.

J'ai filtré les diagrammes pour ne retenir que ceux qui apportent une valeur ajoutée réelle à la compréhension de l'architecture "Offline-First" spécifique à *Bike Service*.

### 

### **4.5 Diagramme d'Activité** {#4.5-diagramme-d'activité}

**Pertinence :** Ce diagramme est indispensable pour illustrer le cœur technologique du projet : le mécanisme de synchronisation. Contrairement à une application web classique, le flux ne s'arrête pas à la validation du formulaire.

**Focus :** Processus de "Sauvegarde et Synchronisation d'un entretien".

**Description du flux :**

1. **Point de départ :** L'utilisateur appuie sur "Valider" dans le formulaire de maintenance.  
2. **Action locale (Immédiate) :** Le système écrit les données dans la base locale (WatermelonDB).  
   * *État :* La donnée est marquée comme \_status: created.  
   * *Feedback :* L'interface se met à jour instantanément pour l'utilisateur (confiance).  
3. **Branchement (Processus d'arrière-plan) :** Le "Sync Manager" s'éveille.  
4. **Décision :** "Réseau disponible ?"  
   * **NON :** Fin du processus actif. La donnée reste en attente locale. Le processus redémarrera au retour du réseau (Event Listener NetInfo).  
   * **OUI :** Le système push les changements vers Supabase (API).  
5. **Validation distante :** Supabase confirme la réception.  
6. **Mise à jour locale :** Le système local marque la donnée comme \_status: synced.

![][image11]

### **4.6 Diagramme de Séquence (Basé sur le scénario nominal)** {#4.6-diagramme-de-séquence-(basé-sur-le-scénario-nominal)}

**Pertinence :** Montre l'interaction chronologique entre l'utilisateur et les composants internes, en isolant la logique de validation.

**Acteurs et Lignes de vie :**

* :Utilisateur  
* :IHM (Interface Maintenance)  
* :Contrôleur (Logique Métier)  
* :DB\_Locale (WatermelonDB)

**Séquence des messages :**

1. :Utilisateur \-\> saisirDonnées(km, coût, type) \-\> :IHM  
2. :Utilisateur \-\> valider() \-\> :IHM  
3. :IHM \-\> verifierCoherence(km\_saisi) \-\> :Contrôleur  
4. :Contrôleur \-\> getDernierKm() \-\> :DB\_Locale  
5. :DB\_Locale \-- retourne(10000) \--\> :Contrôleur  
6. **ALT (Alternative) : Validation**  
   * *Si (km\_saisi \< 10000\) :* :Contrôleur \-- Erreur(Incohérence) \--\> :IHM  
   * *Sinon :*  
     1. :Contrôleur \-\> createLog() \-\> :DB\_Locale  
     2. :Contrôleur \-\> updateVehicleMileage() \-\> :DB\_Locale  
     3. :DB\_Locale \-- Succès \--\> :IHM

![][image12]

### **4.7 Étude des Opérations Systèmes** {#4.7-étude-des-opérations-systèmes}

**Pertinence :** Définit le "Contrat" strict des fonctions principales. C'est ici qu'on formalise les règles métier avec une pseudo-logique mathématique.

**Opération :** createNewMaintenanceLog(vehicleId, date, mileage, cost, type)

* **Responsabilités :** Créer une entrée d'historique et mettre à jour l'état du véhicule parent.  
* **Références croisées :** Cas d'utilisation "Enregistrer une maintenance".  
* **Pré-conditions (Ce qui doit être vrai avant) :**  
  * vehicleId existe et appartient à l'utilisateur connecté (RLS).  
  * mileage (saisi) $\\ge$ vehicle.current\_mileage (sauf flag correction).  
  * cost $\\ge$ 0\.  
* **Post-conditions (L'état du système après) :**  
  * Une instance ml de MaintenanceLog est créée.  
  * ml.vehicleId est associé.  
  * vehicle.current\_mileage est mis à jour à la valeur de ml.mileage.  
  * La propriété \_status de l'instance est définie sur created (pour la synchro).

### **4.8 Classes Participatives & MVC (Modèle-Vue-Contrôleur)** {#4.8-classes-participatives-&-mvc-(modèle-vue-contrôleur)}

**Pertinence :** Adapte la théorie académique à l'architecture React Native / Expo choisie.

1. **Modèle (Model) \- La Donnée :**  
   * *Technologie :* Classes WatermelonDB (@Model).  
   * *Rôle :* Définit le schéma de la table, les relations (@relation) et les champs typés. Ne contient aucune logique d'interface.  
2. **Vue (View) \- L'Interface :**  
   * *Technologie :* Composants React (.tsx).  
   * *Rôle :* Affiche les données. Elle est "réactive" : elle observe (@withObservables) la base de données. Si la donnée change en background, la Vue se redessine automatiquement.  
3. **Contrôleur (Controller) \- La Logique :**  
   * *Technologie :* Services TypeScript / Hooks personnalisés.  
   * *Rôle :* Reçoit les actions de l'utilisateur (clic bouton), exécute les validations (Opérations Systèmes), et appelle les méthodes d'écriture du Modèle.

![][image13]

### **4.9 Diagramme d'État (State Diagram)** {#4.9-diagramme-d'état-(state-diagram)}

**Pertinence :** Analyse du cycle de vie d'un objet spécifique. Pour *Bike Service*, l'objet le plus complexe n'est pas la moto, mais l'état de synchronisation d'une donnée ("Row").

**Objet :** SyncStatus (État de synchronisation d'une ligne).

**États et Transitions :**

1. **État Initial :** CREATED (Créé localement, n'existe pas sur le serveur).  
2. **Transition :** Synchronisation réussie $\\rightarrow$ **État :** SYNCED (Identique local/serveur).  
3. **Transition :** Modification locale $\\rightarrow$ **État :** UPDATED (Version locale plus récente que serveur).  
4. **Transition :** Suppression locale $\\rightarrow$ **État :** DELETED (Marqué pour suppression, le serveur doit être notifié).  
5. **État d'Erreur :** CONFLICT (Modifié sur le serveur ET sur le mobile simultanément). Nécessite une résolution (Last Write Wins).

![][image14]

### **4.10 Diagramme de Composants** {#4.10-diagramme-de-composants}

**Pertinence :** Vue d'hélicoptère de l'architecture technique du code.

* **Composant UI (Frontend) :** Gère l'affichage (Expo, React Navigation).  
* **Composant Logic (Services) :** Contient les validateurs et les calculateurs (TCO).  
* **Composant Data Access (DAO) :**  
  * *Adapter SQLite :* Interface bas niveau avec le fichier du téléphone.  
  * *WatermelonDB Core :* Gestionnaire d'ORM et de cache.  
* **Composant Network (API Client) :**  
  * *Supabase JS :* Client REST/Websocket pour parler au Cloud.  
  * *SyncAdapter :* Orchestrateur qui fait le pont entre WatermelonDB et Supabase.

![][image15] 

### **4.11 Diagramme de Déploiement** {#4.11-diagramme-de-déploiement}

**Pertinence :** Montre la répartition physique du matériel.

**Nœud 1 : Client Mobile (Smartphone)**

* *Artefact :* Application (.apk / .ipa).  
* *Artefact :* Base de données SQLite (Fichier local bike\_service.db).  
* *Périphérique :* Caméra (Capture documents).

**Nœud 2 : Cloud Provider (AWS via Supabase)**

* *Serveur de Base de Données :* Instance PostgreSQL.  
* *Service d'Authentification :* GoTrue (Auth server).  
* *Stockage de Fichiers :* Bucket S3 (Pour les images du Wallet).

**Lien de communication :** HTTPS / WebSocket (Secure Transport).

