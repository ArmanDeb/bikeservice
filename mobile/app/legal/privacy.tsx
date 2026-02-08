import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
    const { isDark } = useTheme();
    const router = useRouter();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#1C1C1E' : '#FDFCF8',
        },
        content: {
            padding: 24,
            paddingBottom: 40,
        },
        title: {
            fontSize: 28,
            fontFamily: 'Outfit_700Bold',
            color: isDark ? '#FDFCF8' : '#1C1C1E',
            marginBottom: 24,
            marginTop: 16,
        },
        sectionTitle: {
            fontSize: 20,
            fontFamily: 'Outfit_700Bold',
            color: isDark ? '#FDFCF8' : '#1C1C1E',
            marginTop: 24,
            marginBottom: 12,
        },
        paragraph: {
            fontSize: 16,
            fontFamily: 'WorkSans_400Regular',
            color: isDark ? '#E5E5E0' : '#4A4A45',
            lineHeight: 24,
            marginBottom: 16,
        },
        backButton: {
            marginLeft: 16,
            padding: 8,
        }
    });

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerStyle: { backgroundColor: isDark ? '#1C1C1E' : '#FDFCF8' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} style={{ marginLeft: 0 }}>
                            <ArrowLeft size={24} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                        </Pressable>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Politique de Confidentialité</Text>

                <Text style={styles.paragraph}>Dernière mise à jour : 05 Février 2026</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    BikeService respecte votre vie privée. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre application mobile.
                </Text>

                <Text style={styles.sectionTitle}>2. Données collectées</Text>
                <Text style={styles.paragraph}>
                    Nous collectons les informations suivantes pour fournir nos services :
                    {'\n'}• Informations de compte (email, identifiant).
                    {'\n'}• Données des véhicules (marque, modèle, VIN, année, kilométrage).
                    {'\n'}• Historiques d'entretien et documents associés (photos, factures).
                </Text>

                <Text style={styles.sectionTitle}>3. Utilisation des données</Text>
                <Text style={styles.paragraph}>
                    Vos données sont utilisées pour :
                    {'\n'}• Gérer votre garage virtuel et vos suivis d'entretien.
                    {'\n'}• Synchroniser vos informations sur plusieurs appareils.
                    {'\n'}• Améliorer les fonctionnalités de l'application.
                </Text>

                <Text style={styles.sectionTitle}>4. Sécurité</Text>
                <Text style={styles.paragraph}>
                    Nous prenons la sécurité au sérieux. Vos données sont stockées de manière sécurisée et nous ne vendons jamais vos informations personnelles à des tiers.
                </Text>

                <Text style={styles.sectionTitle}>5. Suppression des données</Text>
                <Text style={styles.paragraph}>
                    Vous pouvez supprimer votre compte et toutes vos données associées à tout moment depuis les réglages de l'application (Zone de Danger → Supprimer mon compte).
                </Text>

                <Text style={styles.sectionTitle}>6. Contact</Text>
                <Text style={styles.paragraph}>
                    Pour toute question concernant cette politique, veuillez nous contacter à support@bikeservice.app.
                </Text>
            </ScrollView>
        </View>
    );
}
