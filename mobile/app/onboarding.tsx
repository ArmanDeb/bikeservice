import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Animated, Dimensions, StatusBar, Alert, StyleSheet, Pressable, Image, Platform } from 'react-native';
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/context/LanguageContext';
import { useTheme } from '../src/context/ThemeContext';
import { MOTORCYCLE_DATA, BRANDS } from '../src/data/motorcycleData';
import { AutocompleteInput } from '../src/components/common/AutocompleteInput';
import { ModalInput } from '../src/components/common/ModalInput';
import { VehicleService } from '../src/services/VehicleService';
import { ConfirmationModal } from '../src/components/common/ConfirmationModal';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarContainer: {
        position: 'absolute',
        top: 60,
        left: 40,
        right: 40,
        height: 4,
        backgroundColor: '#F5F5F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarContainerDark: {
        backgroundColor: '#2C2C2E',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1C1C1E', // Dark Stone
    },
    progressBarFillDark: {
        backgroundColor: '#FDFCF8',
    },
    primaryButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 14,
        shadowColor: 'transparent',
        alignItems: 'center',
        marginTop: 24,
    },
    primaryButtonDark: {
        backgroundColor: '#FDFCF8',
    },
    primaryButtonDisabled: {
        opacity: 0.5,
    },
    backButton: {
        padding: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    buttonTextDark: {
        color: '#1C1C1E',
    },
    backButtonText: {
        color: '#666660',
        fontFamily: 'WorkSans_500Medium',
        fontSize: 16,
    },
    backButtonTextDark: {
        color: '#9CA3AF',
    },
    // Step Content Styles
    stepContainer: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconCircle: {
        backgroundColor: '#F5F5F0',
        width: 120,
        height: 120,
        borderRadius: 30,
        marginBottom: 32,
        overflow: 'hidden',
    },
    iconCircleDark: {
        backgroundColor: '#2C2C2E',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
        textAlign: 'center',
        textDecorationLine: 'none',
        marginBottom: 16,
    },
    titleDark: {
        color: '#FDFCF8',
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 26,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
        alignSelf: 'flex-start',
    },
    inputLabelDark: {
        color: '#9CA3AF',
    },
    input: {
        backgroundColor: '#F5F5F0',
        width: '100%',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        fontSize: 18,
        fontFamily: 'WorkSans_400Regular',
        color: '#1C1C1E',
        marginBottom: 24,
    },
    inputDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        color: '#FDFCF8',
    },
    mileageInput: {
        fontSize: 32,
        textAlign: 'center',
        fontFamily: 'Outfit_700Bold',
    },
    navigationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        alignItems: 'center',
    },
});

const OnboardingScreen = () => {
    const [step, setStep] = useState(0);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');

    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>()
    const [alertConfirmText, setAlertConfirmText] = useState<string | undefined>()

    const showAlert = (
        title: string,
        message: string,
        options?: {
            onConfirm?: () => void;
            confirmText?: string;
        }
    ) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOnConfirm(() => options?.onConfirm || (() => setAlertVisible(false)))
        setAlertConfirmText(options?.confirmText)
        setAlertVisible(true)
    }

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const nextStep = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true })
        ]).start(() => {
            setStep(s => s + 1);
            slideAnim.setValue(50);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start();
        });
    };

    const prevStep = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 50, duration: 200, useNativeDriver: true })
        ]).start(() => {
            setStep(s => s - 1);
            slideAnim.setValue(-50);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start();
        });
    };

    const handleFinish = async () => {
        if (!brand || !model || !mileage || !year) {
            showAlert(t('alert.error'), t('garage.missing_info'));
            return;
        }

        try {
            const cleanMileage = mileage.replace(/\./g, '');
            await VehicleService.createVehicle(brand, model, parseInt(year), undefined, parseInt(cleanMileage));
            // Show success for a moment
            nextStep();
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000);
        } catch (error) {
            showAlert(t('alert.error'), "Failed to create vehicle");
        }
    };

    const getModelsForBrand = () => {
        // First try exact match
        if (MOTORCYCLE_DATA[brand]) return MOTORCYCLE_DATA[brand]
        // Then try to find a brand that matches the input
        const matchingBrand = BRANDS.find(b => b.toLowerCase() === brand.toLowerCase())
        if (matchingBrand && MOTORCYCLE_DATA[matchingBrand]) return MOTORCYCLE_DATA[matchingBrand]
        return []
    }
    const availableModels = getModelsForBrand()

    const renderContent = () => {
        switch (step) {
            case 0:
                return (
                    <View style={styles.stepContainer}>
                        <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={[styles.title, isDark && styles.titleDark]}>
                            {t('onboarding.welcome.title')}
                        </Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                            {t('onboarding.welcome.subtitle')}
                        </Text>
                        <Pressable
                            onPress={nextStep}
                            style={[styles.primaryButton, isDark && styles.primaryButtonDark]}
                        >
                            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>{t('onboarding.buttons.start')}</Text>
                        </Pressable>
                    </View>
                );

            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>{t('onboarding.step1.title')}</Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{t('onboarding.step1.subtitle')}</Text>

                        {/* Note: AutocompleteInput styles might need internal update or accepting wrapper style */}
                        <View style={{ width: '100%', marginBottom: 16 }}>
                            <AutocompleteInput
                                label={t('garage.modal.brand')}
                                value={brand}
                                onChangeText={(text) => { setBrand(text); setModel(''); }}
                                options={BRANDS.filter(b => b !== 'Other')}
                                onSelect={(b) => { setBrand(b); setModel(''); }}
                                placeholder={t('garage.modal.brand_placeholder')}
                                filterMode="startsWith"
                            />
                        </View>

                        <View style={{ width: '100%', marginBottom: 16 }}>
                            <AutocompleteInput
                                label={t('garage.modal.model')}
                                value={model}
                                onChangeText={setModel}
                                options={availableModels}
                                onSelect={setModel}
                                placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                            />
                        </View>

                        <View style={{ width: '100%' }}>
                            <ModalInput
                                label={t('onboarding.step1.year')}
                                value={year}
                                onChangeText={(text) => setYear(text.replace(/[^0-9]/g, ''))}
                                placeholder="2023"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.navigationRow}>
                            <Pressable onPress={prevStep} style={styles.backButton}>
                                <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>{t('onboarding.buttons.back')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={nextStep}
                                disabled={!brand || !model || !year}
                                style={[styles.primaryButton, isDark && styles.primaryButtonDark, { marginTop: 0 }, (!brand || !model || !year) && styles.primaryButtonDisabled]}
                            >
                                <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>{t('onboarding.buttons.next')}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>{t('onboarding.step2.title')}</Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{t('onboarding.step2.subtitle')}</Text>

                        <View style={{ width: '100%' }}>
                            <ModalInput
                                label={t('garage.modal.mileage')}
                                value={mileage}
                                onChangeText={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    setMileage(formatted);
                                }}
                                formatValue={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                }}
                                placeholder="12.500"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.navigationRow}>
                            <Pressable onPress={prevStep} style={styles.backButton}>
                                <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>{t('onboarding.buttons.back')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleFinish}
                                disabled={!mileage}
                                style={[styles.primaryButton, isDark && styles.primaryButtonDark, { marginTop: 0 }, !mileage && styles.primaryButtonDisabled]}
                            >
                                <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>{t('onboarding.buttons.finish')}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)' }]}>
                            <Ionicons name="checkmark-circle" size={100} color="#22C55E" />
                        </View>
                        <Text style={[styles.title, isDark && styles.titleDark]}>
                            {t('onboarding.success.title')}
                        </Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                            {t('onboarding.success.subtitle')}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentContainer}>
                    {/* Progress Bar */}
                    {step > 0 && step < 3 && (
                        <View style={[styles.progressBarContainer, isDark && styles.progressBarContainerDark]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    isDark && styles.progressBarFillDark,
                                    { width: `${(step / 2) * 100}%` }
                                ]}
                            />
                        </View>
                    )}

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                            width: '100%'
                        }}
                    >
                        {renderContent()}
                    </Animated.View>
                </View>
            </KeyboardAwareScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onCancel={() => setAlertVisible(false)}
                confirmText={alertConfirmText || t('common.ok')}
            />
        </SafeAreaView>
    );
};

export default OnboardingScreen;
