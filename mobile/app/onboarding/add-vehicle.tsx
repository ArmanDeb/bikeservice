import React from 'react'
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useLanguage } from '../../src/context/LanguageContext'
import { useTheme } from '../../src/context/ThemeContext'
import { VehicleForm } from '../../src/components/vehicle/VehicleForm'
import { VehicleService } from '../../src/services/VehicleService'
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView'

export default function AddFirstVehicleScreen() {
    const { t } = useLanguage()
    const { isDark } = useTheme()
    const router = useRouter()

    const handleSubmit = async (data: { brand: string, model: string, year: number, mileage: number, vin?: string }) => {
        try {
            await VehicleService.createVehicle(data.brand, data.model, data.year, data.vin, data.mileage)
            // Navigate to main app
            router.replace('/(tabs)')
        } catch (e) {
            console.error('Failed to create vehicle:', e)
            Alert.alert(
                t('common.error') || 'Error',
                t('garage.add_error') || 'Failed to add vehicle. Please try again.'
            )
        }
    }

    return (
        <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <View style={{ flex: 1 }}>
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingTop: '5%' }}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={120}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                >
                    <View style={[styles.formContainer, isDark ? styles.cardDark : styles.cardLight]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
                                {t('onboarding.add_vehicle_title') || "Let's get started!"}
                            </Text>
                            <Text style={[styles.subtitle, isDark ? styles.textSubDark : styles.textSubLight]}>
                                {t('onboarding.add_vehicle_subtitle') || "Add your first motorcycle to begin tracking maintenance and documents."}
                            </Text>
                        </View>

                        <VehicleForm
                            onSubmit={handleSubmit}
                            submitLabel={t('garage.modal.submit_add') || "Add Motorcycle"}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        lineHeight: 24,
    },
    textLight: {
        color: '#1C1C1E',
    },
    textDark: {
        color: '#FFFFFF',
    },
    textSubLight: {
        color: '#666660',
    },
    textSubDark: {
        color: '#A1A1AA',
    },
    formContainer: {
        padding: 32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        margin: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
    },
    cardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
})
