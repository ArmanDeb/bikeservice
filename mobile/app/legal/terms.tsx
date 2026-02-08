import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfServiceScreen() {
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
                <Text style={styles.title}>Conditions d'Utilisation</Text>

                <Text style={styles.paragraph}>Dernière mise à jour : 05 Février 2026</Text>

                <Text style={styles.sectionTitle}>1. Acceptation</Text>
                <Text style={styles.paragraph}>
                    En téléchargeant ou en utilisant l'application BikeService, vous acceptez d'être lié par ces conditions d'utilisation.
                </Text>

                <Text style={styles.sectionTitle}>2. Usage de l'application</Text>
                <Text style={styles.paragraph}>
                    BikeService est un outil personnel de gestion d'entretien moto. Vous êtes responsable des données que vous y inscrivez. L'application est fournie "telle quelle".
                </Text>

                <Text style={styles.sectionTitle}>3. Responsabilité</Text>
                <Text style={styles.paragraph}>
                    BikeService ne peut être tenu responsable des pertes de données, erreurs dans les suivis d'entretien ou dommages résultant de l'utilisation de l'application. Veuillez toujours vous référer au manuel constructeur de votre véhicule.
                </Text>

                <Text style={styles.sectionTitle}>4. Propriété intellectuelle</Text>
                <Text style={styles.paragraph}>
                    Tous les droits de conception, textes, graphismes et autres contenus de l'application sont la propriété de BikeService.
                </Text>

                <Text style={styles.sectionTitle}>5. Modifications</Text>
                <Text style={styles.paragraph}>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Continuant à utiliser l'application après ces changements, vous acceptez les nouvelles conditions.
                </Text>
            </ScrollView>
        </View>
    );
}
