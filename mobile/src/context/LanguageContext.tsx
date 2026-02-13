import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

type Translations = {
    [key: string]: {
        fr: string;
        en: string;
    }
};

export const translations: Translations = {
    // Tabs
    'tabs.garage': { fr: 'Garage', en: 'Garage' },
    'tabs.wallet': { fr: 'Portefeuille', en: 'Wallet' },
    'tabs.maintenance': { fr: 'Entretien', en: 'Maintenance' },
    'tabs.settings': { fr: 'Réglages', en: 'Settings' },
    'tabs.dashboard': { fr: 'Dashboard', en: 'Dashboard' },

    // Auth
    'auth.welcome': { fr: 'Bienvenue', en: 'Welcome Back' },
    'auth.join_the_club': { fr: 'Rejoindre le Club', en: 'Join the Club' },
    'auth.register_title': { fr: 'Créer un compte', en: 'Create Account' },
    'auth.email': { fr: 'Email', en: 'Email' },
    'auth.password': { fr: 'Mot de passe', en: 'Password' },
    'auth.password_confirm': { fr: 'Confirmer le mot de passe', en: 'Confirm Password' },
    'auth.passwords_do_not_match': { fr: 'Les mots de passe ne correspondent pas.', en: 'Passwords do not match.' },
    'auth.sign_in': { fr: 'Se connecter', en: 'Sign In' },
    'auth.sign_up': { fr: 'S\'inscrire', en: 'Sign Up' },
    'auth.no_account': { fr: 'Pas encore de compte ?', en: 'Don\'t have an account?' },
    'auth.have_account': { fr: 'Déjà un compte ?', en: 'Already have an account?' },
    'auth.signing_in': { fr: 'Connexion...', en: 'Signing In...' },
    'auth.signing_up': { fr: 'Création...', en: 'Signing Up...' },
    'auth.register_subtitle': { fr: 'Commencez à gérer votre garage plus intelligemment.', en: 'Start managing your garage smarter.' },
    'auth.check_inbox': { fr: 'Vérifiez votre boîte mail', en: 'Check your inbox' },
    'auth.verify_email': { fr: 'Veuillez vérifier votre adresse e-mail pour continuer.', en: 'Please verify your email address to continue.' },
    'auth.back_to_signin': { fr: 'Retour à la connexion', en: 'Back to Sign In' },
    'auth.forgot_password': { fr: 'Mot de passe oublié ?', en: 'Forgot Password?' },
    'auth.forgot_password_desc': { fr: 'Entrez votre email pour recevoir un code de vérification.', en: 'Enter your email to receive a verification code.' },
    'auth.email_required': { fr: 'L\'email est requis', en: 'Email is required' },
    'auth.otp_sent': { fr: 'Code de vérification envoyé à votre email.', en: 'Verification code sent to your email.' },
    'auth.enter_code': { fr: 'Entrez le code', en: 'Enter Code' },
    'auth.enter_code_desc': { fr: 'Nous avons envoyé un code à', en: 'We sent a code to' },
    'auth.code': { fr: 'Code de vérification', en: 'Verification Code' },
    'auth.send_code': { fr: 'Envoyer le code', en: 'Send Code' },
    'auth.verify': { fr: 'Vérifier', en: 'Verify' },
    'auth.invalid_code': { fr: 'Veuillez entrer un code valide', en: 'Please enter a valid code' },
    'auth.reset_password': { fr: 'Réinitialiser le mot de passe', en: 'Reset Password' },
    'auth.reset_password_desc': { fr: 'Entrez votre nouveau mot de passe ci-dessous.', en: 'Enter your new password below.' },
    'auth.new_password': { fr: 'Nouveau mot de passe', en: 'New Password' },
    'auth.update_password': { fr: 'Mettre à jour le mot de passe', en: 'Update Password' },
    'auth.password_updated': { fr: 'Votre mot de passe a été mis à jour avec succès.', en: 'Your password has been updated successfully.' },
    'auth.password_min_length': { fr: 'Le mot de passe doit contenir au moins 6 caractères', en: 'Password must be at least 6 characters' },

    // Auth Errors
    'auth.error.invalid_credentials': { fr: 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.', en: 'Invalid credentials. Please check your email and password.' },
    'auth.error.user_not_found': { fr: 'Utilisateur introuvable. Veuillez vérifier votre email.', en: 'User not found. Please check your email.' },
    'auth.error.email_taken': { fr: 'Cet email est déjà utilisé.', en: 'This email is already taken.' },
    'auth.error.weak_password': { fr: 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.', en: 'Password is too weak. It should be at least 6 characters.' },
    'auth.error.rate_limit': { fr: 'Trop de tentatives. Veuillez réessayer plus tard.', en: 'Too many attempts. Please try again later.' },
    'auth.error.generic': { fr: 'Une erreur est survenue. Veuillez réessayer.', en: 'An error occurred. Please try again.' },

    // Common
    'alert.cancel': { fr: 'Annuler', en: 'Cancel' },
    'common.back': { fr: 'Retour', en: 'Back' },
    'alert.confirm': { fr: 'Confirmer', en: 'Confirm' },
    'alert.success': { fr: 'Succès', en: 'Success' },
    'common.success': { fr: 'Succès', en: 'Success' },
    'alert.error': { fr: 'Erreur', en: 'Error' },
    'common.delete': { fr: 'Supprimer', en: 'Delete' },
    'common.save': { fr: 'Enregistrer', en: 'Save' },
    'common.cancel': { fr: 'Annuler', en: 'Cancel' },
    'common.edit': { fr: 'Modifier', en: 'Edit' },
    'common.version': { fr: 'Version', en: 'Version' },
    'common.powered_by': { fr: 'Propulsé par', en: 'Powered by' },
    'common.close': { fr: 'Fermer', en: 'Close' },
    'common.ok': { fr: 'OK', en: 'OK' },
    'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
    'common.search': { fr: 'Rechercher', en: 'Search' },
    'common.select': { fr: 'Choisir', en: 'Select' },
    'common.no_results': { fr: 'Aucun résultat trouvé', en: 'No results found' },

    // Garage Screen
    'garage.title': { fr: 'Garage', en: 'Garage' },
    'garage.all_machines': { fr: 'TOUT', en: 'ALL' },
    'garage.no_motorcycles': { fr: 'Pas encore de moto.', en: 'No motorcycles yet.' },
    'garage.no_motorcycles_desc': { fr: 'Ajoutez votre première machine pour commencer le suivi.', en: 'Add your first ride to start tracking.' },
    'garage.missing_info': { fr: 'Informations manquantes. Veuillez remplir la marque, le modèle et le kilométrage.', en: 'Missing Info. Please fill in brand, model and mileage' },
    'garage.modal.add_title': { fr: 'Nouvelle Machine', en: 'New Machine' },
    'garage.modal.edit_title': { fr: 'Modifier la Machine', en: 'Edit Machine' },
    'garage.modal.brand': { fr: 'Marque', en: 'Brand' },
    'garage.modal.brand_placeholder': { fr: 'Honda, Yamaha, BMW...', en: 'Honda, Yamaha, BMW...' },
    'garage.modal.model': { fr: 'Modèle', en: 'Model' },
    'garage.modal.model_placeholder': { fr: 'MT-07, R1, GS...', en: 'MT-07, R1, GS...' },
    'garage.modal.model_placeholder_no_brand': { fr: 'Sélectionnez une marque', en: 'Select brand first' },
    'garage.modal.year': { fr: 'Année', en: 'Year' },
    'garage.modal.mileage': { fr: 'KM', en: 'Mileage' },
    'garage.modal.vin': { fr: 'Numéro de Châssis (Optionnel)', en: 'VIN (Optional)' },
    'garage.modal.submit_add': { fr: 'Ajouter au Garage', en: 'Add to Garage' },
    'garage.modal.submit_edit': { fr: 'Enregistrer', en: 'Save Changes' },
    'garage.modal.delete': { fr: 'Supprimer le véhicule', en: 'Delete Vehicle' },
    'garage.modal.delete_confirm_title': { fr: 'Supprimer la moto', en: 'Delete Vehicle' },
    'garage.modal.delete_confirm_desc': { fr: 'Attention, ceci est irréversible. Toutes les données associées seront perdues.', en: 'Warning: this is irreversible. All associated data will be lost.' },
    'garage.modal.vin_placeholder': { fr: 'Numéro de Châssis', en: 'VIN' },

    // Maintenance Screen
    'maintenance.title': { fr: 'Entretien', en: 'Maintenance' },
    'maintenance.select_bike': { fr: 'Sélectionnez un véhicule pour voir le carnet', en: 'Select a bike to view logs' },
    'maintenance.all_vehicles': { fr: 'Tous les véhicules', en: 'All Vehicles' },
    'maintenance.no_logs': { fr: "Pas d'entretien enregistré.", en: 'No maintenance logs.' },
    'maintenance.no_logs_bike': { fr: 'Pour cette machine.', en: 'For this machine.' },
    'maintenance.no_logs_desc': { fr: 'Prêt à vous salir les mains ?', en: 'Time to get your hands dirty?' },
    'maintenance.modal.add_title': { fr: 'Nouvel Entretien', en: 'New Maintenance' },
    'maintenance.modal.edit_title': { fr: "Modifier l'Entretien", en: 'Edit Maintenance' },
    'maintenance.assistant_ia': { fr: 'ASSISTANT IA ✨', en: 'AI ASSISTANT ✨' },
    'maintenance.assistant_ia_scanner': { fr: 'Scanner', en: 'Scanner' },
    'maintenance.assistant_ia_scanning': { fr: 'Analyse...', en: 'Scanning...' },
    'maintenance.assistant_ia_scanned': { fr: 'Scanné', en: 'Scanned' },
    'maintenance.assistant_ia_dictate': { fr: 'Dicter', en: 'Dictate' },
    'maintenance.select_vehicle': { fr: 'Choisir le véhicule', en: 'Select Vehicle' },
    'maintenance.type.periodic': { fr: 'Entretien', en: 'Periodic' },
    'maintenance.type.repair': { fr: 'Réparation', en: 'Repair' },
    'maintenance.type.modification': { fr: 'Modif', en: 'Mod' },
    'maintenance.field.title': { fr: 'Titre (ex: Vidange)', en: 'Title (e.g. Oil Change)' },
    'maintenance.field.cost': { fr: 'Coût (€)', en: 'Cost (€)' },
    'maintenance.field.date': { fr: 'Date', en: 'Date' },
    'maintenance.field.mileage': { fr: 'Kilométrage', en: 'New Mileage' },
    'maintenance.field.notes': { fr: 'Notes (Optionnel)', en: 'Notes (Optional)' },
    'maintenance.modal.submit_add': { fr: "Ajouter l'entretien", en: 'Save Record' },
    'maintenance.modal.submit_edit': { fr: 'Mettre à jour', en: 'Update Record' },
    'maintenance.modal.delete': { fr: 'Supprimer', en: 'Delete' },
    'maintenance.modal.delete_confirm_title': { fr: "Supprimer l'entrée", en: 'Delete Log' },
    'maintenance.modal.delete_confirm_desc': { fr: 'Voulez-vous vraiment supprimer cet entretien ?', en: 'Are you sure you want to delete this maintenance record?' },
    'maintenance.field.type': { fr: 'Type d\'opération', en: 'Operation Type' },
    'maintenance.detail.notes': { fr: 'Notes', en: 'Notes' },
    'maintenance.document.view': { fr: 'Voir le document', en: 'View Document' },
    'maintenance.sort_by': { fr: 'Trier par', en: 'Sort By' },
    'maintenance.sort.date_added': { fr: 'Date d\'ajout', en: 'Date Added' },
    'maintenance.sort.mileage': { fr: 'Kilométrage', en: 'Mileage' },
    'maintenance.sort.service_date': { fr: 'Date d\'entretien', en: 'Service Date' },
    'maintenance.alert.ia_success': { fr: 'IA Succès', en: 'AI Success' },
    'maintenance.alert.ia_success_desc': { fr: 'Données extraites avec succès ! L\'image sera sauvegardée dans le Wallet.', en: 'Data extracted successfully! The image will be saved in the Wallet.' },
    'maintenance.alert.ia_error': { fr: 'Erreur IA', en: 'AI Error' },
    'maintenance.alert.ia_error_desc': { fr: 'Impossible d\'analyser l\'image.', en: 'Unable to analyze the image.' },
    'maintenance.select_bike_title': { fr: 'Choisir une moto', en: 'Select a Bike' },
    'maintenance.select_bike_desc_full': { fr: 'Sélectionnez une machine pour consulter son carnet d\'entretien complet.', en: 'Select a machine to view its full maintenance log.' },

    // Wallet Screen
    'wallet.title': { fr: 'Portefeuille', en: 'Wallet' },
    'wallet.select_bike': { fr: 'Sélectionnez un véhicule pour voir les docs', en: 'Select a bike to view documents' },
    'wallet.no_documents': { fr: 'Aucun document.', en: 'No documents.' },
    'wallet.no_documents_desc': { fr: 'Ajoutez des papiers pour cette moto.', en: 'Add papers for this bike.' },
    'wallet.section.legal': { fr: 'Légal & Papiers', en: 'Legal & Papers' },
    'wallet.section.history': { fr: 'Factures & Historique', en: 'Invoices & History' },
    'wallet.document.untitled': { fr: 'Sans titre', en: 'Untitled' },
    'wallet.document.no_image': { fr: 'Aucune image jointe', en: 'No image attached' },
    'wallet.document.expires': { fr: 'Expire le', en: 'Expires' },
    'wallet.modal.add_title': { fr: 'Ajouter un document', en: 'Add Document' },
    'wallet.modal.edit_title': { fr: 'Modifier le document', en: 'Edit Document' },
    'wallet.modal.type': { fr: 'Type de document', en: 'Document Type' },
    'wallet.type.registration': { fr: 'Certificat d\'immatriculation', en: 'Registration' },
    'wallet.type.license': { fr: 'Permis', en: 'License' },
    'wallet.type.insurance': { fr: 'Assurance', en: 'Insurance' },
    'wallet.type.technical_control': { fr: 'Contrôle Technique', en: 'Technical Control' },
    'wallet.type.coc': { fr: 'Certificat de Conformité', en: 'Certificate of Conformity' },
    'wallet.type.invoice': { fr: 'Facture', en: 'Invoice' },
    'wallet.type.maintenance_invoice': { fr: 'Facture Entretien', en: 'Maintenance Invoice' },
    'wallet.type.other': { fr: 'Autre', en: 'Other' },
    'wallet.type.placeholder': { fr: 'Choisir le type de document', en: 'Select document type' },
    'wallet.field.documents': { fr: 'Documents', en: 'Documents' },
    'wallet.field.add_page': { fr: 'Ajouter page', en: 'Add Page' },
    'wallet.field.title': { fr: 'Titre (ex: Assurance)', en: 'Title (e.g. Insurance)' },
    'wallet.field.expiry': { fr: 'Expiration (JJ-MM-AAAA) - Optionnel', en: 'Expiry (DD-MM-YYYY) - Optional' },
    'wallet.field.attach_photo': { fr: 'Joindre une photo', en: 'Attach Photo' },
    'wallet.field.change_photo': { fr: 'Changer l\'image', en: 'Change Image' },
    'wallet.modal.delete': { fr: 'Supprimer', en: 'Delete' },
    'wallet.modal.delete_confirm_title': { fr: 'Supprimer le document', en: 'Delete Document' },
    'wallet.modal.delete_confirm_desc': { fr: 'Voulez-vous vraiment supprimer ce document ?', en: 'Are you sure you want to delete this document?' },
    'wallet.modal.delete_confirm_desc_maintenance': { fr: 'Ce document est lié à une maintenance. En le supprimant, la maintenance n\'aura plus de pièce jointe, mais l\'entretien restera visible.', en: 'This document is linked to a maintenance log. Deleting it will remove the attachment, but the maintenance record will remain.' },
    'wallet.select_bike_title': { fr: 'Mon Portefeuille', en: 'My Wallet' },
    'wallet.select_bike_desc_full': { fr: 'Choisissez une moto pour gérer ses documents (Carte grise, assurance, etc).', en: 'Choose a bike to manage its documents (Registration, insurance, etc).' },

    // Dashboard Screen
    'dashboard.title': { fr: 'Tableau de bord', en: 'Dashboard' },
    'dashboard.export_pdf': { fr: 'Exporter PDF', en: 'Export PDF' },
    'dashboard.overview_garage': { fr: 'Vue d\'ensemble du Garage', en: 'Garage Overview' },
    'dashboard.overview_vehicle': { fr: 'Vue d\'ensemble : ', en: 'Overview: ' },
    'dashboard.total_cost_garage': { fr: 'Coût Total Garage (TCO)', en: 'Total Garage Cost (TCO)' },
    'dashboard.total_cost_vehicle': { fr: 'Coût Total Véhicule', en: 'Vehicle Total Cost' },
    'dashboard.cost_breakdown': { fr: 'Répartition des coûts', en: 'Cost Breakdown' },
    'dashboard.periodic_maintenance': { fr: 'Entretien', en: 'Periodic Maintenance' },
    'dashboard.repairs': { fr: 'Réparations', en: 'Repairs' },
    'dashboard.modifications': { fr: 'Modifications', en: 'Modifications' },
    'dashboard.total': { fr: 'TOTAL', en: 'TOTAL' },
    'dashboard.latest_activity': { fr: 'Dernières Activités', en: 'Latest Activity' },
    'dashboard.no_activity': { fr: "Aucun entretien enregistré.", en: 'No maintenance logs recorded yet.' },
    'dashboard.vehicles_count': { fr: 'Véhicules', en: 'Vehicles' },
    'dashboard.all_vehicles': { fr: 'Tous', en: 'All' },
    'dashboard.vehicle': { fr: 'Véhicule', en: 'Vehicle' },
    'dashboard.alert.select_vehicle': { fr: 'Sélectionnez un véhicule', en: 'Select a Vehicle' },
    'dashboard.alert.select_vehicle_desc': { fr: 'Veuillez d\'abord sélectionner une moto dans le Garage.', en: 'Please first select a bike in the Garage.' },
    'dashboard.alert.pdf_error': { fr: 'Erreur PDF', en: 'PDF Error' },

    // Settings Screen
    'settings.title': { fr: 'Réglages', en: 'Settings' },
    'settings.account': { fr: 'Compte', en: 'Account' },
    'settings.user': { fr: 'Utilisateur', en: 'User' },
    'settings.logout': { fr: 'Se déconnecter', en: 'Log Out' },
    'settings.appearance': { fr: 'Apparence', en: 'Appearance' },
    'settings.readingMode': { fr: 'Mode Lecture', en: 'Reading Mode' },
    'settings.readingMode.on': { fr: 'Clair (Papier)', en: 'Light (Paper)' },
    'settings.readingMode.off': { fr: 'Sombre', en: 'Dark' },
    'settings.readingMode.system': { fr: 'Système (Auto)', en: 'System (Auto)' },
    'settings.language': { fr: 'Langue', en: 'Language' },
    'settings.language.current': { fr: 'Langue actuelle', en: 'Current Language' },
    'settings.data': { fr: 'Données', en: 'Data' },
    'settings.sync': { fr: 'Synchronisation', en: 'Synchronization' },
    'settings.sync.never': { fr: 'Jamais synchronisé', en: 'Never synced' },
    'settings.sync.just_now': { fr: 'À l\'instant', en: 'Just now' },
    'settings.sync.minutes': { fr: 'Il y a {n} min', en: '{n} min ago' },
    'settings.sync.today': { fr: 'Aujourd\'hui à {t}', en: 'Today at {t}' },
    'settings.sync.yesterday': { fr: 'Hier à {t}', en: 'Yesterday at {t}' },
    'settings.notifications': { fr: 'Notifications', en: 'Notifications' },
    'settings.maintenance_reminders': { fr: "Rappels d'entretien (à venir)", en: 'Maintenance Reminders (Coming Soon)' },
    'settings.maintenance_reminders_desc': { fr: 'Alertes maintenance et échéances', en: 'Maintenance alerts and due dates' },
    'settings.support': { fr: 'Aide & Support', en: 'Help & Support' },
    'settings.report_bug': { fr: 'Signaler un problème', en: 'Report a Bug' },
    'settings.suggest_idea': { fr: 'Suggérer une idée', en: 'Suggest an Idea' },
    'settings.about': { fr: 'À propos', en: 'About' },
    'settings.danger_zone': { fr: 'Zone de Danger', en: 'Danger Zone' },
    'settings.delete_account': { fr: 'Supprimer mon compte', en: 'Delete Account' },
    'settings.delete_account_desc': { fr: 'Cette action est irréversible. Toutes vos données seront effacées définitivement.', en: 'This action is irreversible. All your data will be permanently deleted.' },
    'settings.delete_account_success': { fr: 'Compte supprimé. Au revoir !', en: 'Account deleted. Goodbye!' },
    'settings.legal': { fr: 'Mentions Légales', en: 'Legal' },
    'settings.privacy_policy': { fr: 'Politique de Confidentialité', en: 'Privacy Policy' },
    'settings.terms_of_service': { fr: 'Conditions d\'Utilisation', en: 'Terms of Service' },
    'settings.sync_error': { fr: 'Erreur de synchronisation', en: 'Sync Error' },
    'settings.link_error': { fr: 'Impossible d\'ouvrir le lien', en: 'Cannot open link' },
    'settings.syncing': { fr: 'Synchronisation...', en: 'Syncing...' },

    // Intro
    'intro.title': { fr: 'Gérez votre garage comme un pro', en: 'Manage your garage like a pro' },
    'intro.subtitle': { fr: 'Suivi d\'entretien, documents, coûts et rappels. Tout au même endroit.', en: 'Maintenance tracking, documents, costs and reminders. All in one place.' },
    'intro.feature1.title': { fr: 'Suivi d\'entretien', en: 'Maintenance Tracking' },
    'intro.feature1.desc': { fr: 'Gardez une trace de chaque modification et réparation.', en: 'Keep track of every mod and repair.' },
    'intro.feature_garage.title': { fr: 'Mon Garage', en: 'My Garage' },
    'intro.feature_garage.desc': { fr: 'Centralisez tous vos véhicules au même endroit.', en: 'Centralize all your vehicles in one place.' },
    'intro.feature2.title': { fr: 'Assistant IA', en: 'AI Assistant' },
    'intro.feature2.desc': { fr: 'Scannez vos factures et documents en un clin d\'œil.', en: 'Scan invoices and documents in a snap.' },
    'intro.feature3.title': { fr: 'Digital Wallet', en: 'Digital Wallet' },
    'intro.feature3.desc': { fr: 'Tous vos papiers (carte grise, assurance) toujours sur vous.', en: 'All your papers (registration, insurance) always with you.' },
    'intro.button': { fr: 'Démarrer l\'aventure', en: 'Start the Adventure' },

    // Onboarding
    'onboarding.welcome.title': { fr: 'Bienvenue sur Bike Service', en: 'Welcome to Bike Service' },
    'onboarding.welcome.subtitle': { fr: "L'assistant intelligent pour l'entretien de votre moto.", en: 'The smart assistant for your motorcycle maintenance.' },
    'onboarding.add_vehicle_title': { fr: 'Ajouter une moto', en: 'Add a Motorcycle' },
    'onboarding.add_vehicle_subtitle': { fr: 'Ajoutez votre première moto pour commencer le suivi.', en: 'Add your first motorcycle to start tracking.' },
    'onboarding.step1.title': { fr: 'Commençons par votre moto', en: "Let's start with your bike" },
    'onboarding.step1.subtitle': { fr: 'Quelle machine allons-nous suivre ensemble ?', en: 'Which machine are we tracking together?' },
    'onboarding.step1.subtitle_model_brand': { fr: 'Quel modèle de {brand} avez-vous ?', en: 'Which {brand} model do you have?' },
    'onboarding.step1.subtitle_model_default': { fr: 'Sélectionnez un modèle', en: 'Select a model' },
    'onboarding.step1.year': { fr: 'Année', en: 'Year' },
    'onboarding.step1.subtitle_year': { fr: 'Quelle est l\'année de fabrication de votre {brand} {model} ?', en: 'What year was your {brand} {model} manufactured?' },
    'onboarding.step2.title': { fr: 'Dernière étape', en: 'Last step' },
    'onboarding.step2.subtitle': { fr: 'Quel est son kilométrage actuel ?', en: 'What is its current mileage?' },
    'onboarding.step2.subtitle_mileage': { fr: 'Quel est le kilométrage actuel de votre moto ?', en: 'What is the current mileage of your bike?' },
    'onboarding.summary.title': { fr: 'Confirmer les détails', en: 'Confirm Details' },
    'onboarding.summary.subtitle': { fr: 'Veuillez vérifier les informations ci-dessous.', en: 'Please review the information below.' },
    'onboarding.buttons.start': { fr: 'C\'est parti !', en: 'Let\'s Go!' },
    'onboarding.buttons.next': { fr: 'Suivant', en: 'Next' },
    'onboarding.buttons.back': { fr: 'Retour', en: 'Back' },
    'onboarding.buttons.finish': { fr: 'Terminer', en: 'Finish' },
    'onboarding.success.title': { fr: 'Configuration terminée', en: 'Setup Complete' },
    'onboarding.success.subtitle': { fr: 'Votre garage est prêt.', en: 'Your garage is ready.' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@BikeService:language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fr');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage === 'en' || savedLanguage === 'fr') {
                    setLanguageState(savedLanguage as Language);
                }
            } catch (e) {
                console.error('Failed to load language', e);
            } finally {
                setIsReady(true);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (newLanguage: Language) => {
        setLanguageState(newLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const entry = translations[key];
        if (!entry) return key;

        let text = entry[language];
        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param].toString());
            });
        }
        return text;
    };

    if (!isReady) return null;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
