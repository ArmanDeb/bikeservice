import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Animated, Dimensions, StatusBar, Alert, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/context/LanguageContext';
import { useTheme } from '../src/context/ThemeContext';
import { MOTORCYCLE_DATA, BRANDS } from '../src/data/motorcycleData';
import { AutocompleteInput } from '../src/components/common/AutocompleteInput';
import { VehicleService } from '../src/services/VehicleService';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: '#3B82F6', // primary
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center'
    },
    primaryButtonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0
    },
    backButton: {
        padding: 16
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18
    },
    backButtonText: {
        color: '#64748B', // text-secondary
        fontWeight: 'bold',
        fontSize: 18
    }
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
            Alert.alert(t('alert.error'), t('garage.missing_info'));
            return;
        }

        try {
            await VehicleService.createVehicle(brand, model, parseInt(year), undefined, parseInt(mileage));
            // Show success for a moment
            nextStep();
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000);
        } catch (error) {
            Alert.alert(t('alert.error'), "Failed to create vehicle");
        }
    };

    const availableModels = brand ? (MOTORCYCLE_DATA[brand] || []) : [];

    const renderContent = () => {
        switch (step) {
            case 0:
                return (
                    <View className="items-center px-10">
                        <View className="bg-primary/20 p-8 rounded-full mb-8">
                            <Ionicons name="bicycle" size={80} color="#FFD700" />
                        </View>
                        <Text className="text-3xl font-bold text-text text-center mb-4">
                            {t('onboarding.welcome.title')}
                        </Text>
                        <Text className="text-lg text-text-secondary text-center mb-12">
                            {t('onboarding.welcome.subtitle')}
                        </Text>
                        <Pressable
                            onPress={nextStep}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.buttonText}>{t('onboarding.buttons.start')}</Text>
                        </Pressable>
                    </View>
                );

            case 1:
                return (
                    <View className="px-6 w-full">
                        <Text className="text-3xl font-bold text-text mb-2 text-center">{t('onboarding.step1.title')}</Text>
                        <Text className="text-lg text-text-secondary mb-8 text-center">{t('onboarding.step1.subtitle')}</Text>

                        <AutocompleteInput
                            label={t('garage.modal.brand')}
                            value={brand}
                            onChangeText={(text) => { setBrand(text); setModel(''); }}
                            options={BRANDS.filter(b => b !== 'Other')}
                            onSelect={(b) => { setBrand(b); setModel(''); }}
                            placeholder={t('garage.modal.brand_placeholder')}
                            filterMode="startsWith"
                        />

                        <AutocompleteInput
                            label={t('garage.modal.model')}
                            value={model}
                            onChangeText={setModel}
                            options={availableModels}
                            onSelect={setModel}
                            placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                        />

                        <View className="mb-4">
                            <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">{t('onboarding.step1.year')}</Text>
                            <TextInput
                                placeholder="2023"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                className="bg-surface-highlight text-text p-4 rounded-xl border border-border"
                                value={year}
                                onChangeText={setYear}
                            />
                        </View>

                        <View className="flex-row justify-between mt-8 items-center">
                            <Pressable onPress={prevStep} style={styles.backButton}>
                                <Text style={styles.backButtonText}>{t('onboarding.buttons.back')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={nextStep}
                                disabled={!brand || !model || !year}
                                style={[styles.primaryButton, (!brand || !model || !year) && styles.primaryButtonDisabled]}
                            >
                                <Text style={styles.buttonText}>{t('onboarding.buttons.next')}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View className="px-6 w-full">
                        <Text className="text-3xl font-bold text-text mb-2 text-center">{t('onboarding.step2.title')}</Text>
                        <Text className="text-lg text-text-secondary mb-8 text-center">{t('onboarding.step2.subtitle')}</Text>

                        <View className="mb-6">
                            <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">{t('garage.modal.mileage')}</Text>
                            <TextInput
                                placeholder="ex: 12500"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                className="bg-surface-highlight text-text p-4 rounded-2xl text-2xl border border-border text-center"
                                value={mileage}
                                onChangeText={setMileage}
                                autoFocus
                            />
                        </View>

                        <View className="flex-row justify-between mt-8 items-center">
                            <Pressable onPress={prevStep} style={styles.backButton}>
                                <Text style={styles.backButtonText}>{t('onboarding.buttons.back')}</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleFinish}
                                disabled={!mileage}
                                style={[styles.primaryButton, !mileage && styles.primaryButtonDisabled]}
                            >
                                <Text style={styles.buttonText}>{t('onboarding.buttons.finish')}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View className="items-center px-10">
                        <View className="bg-green-500/20 p-8 rounded-full mb-8">
                            <Ionicons name="checkmark-circle" size={100} color="#22C55E" />
                        </View>
                        <Text className="text-4xl font-bold text-text text-center mb-4">
                            {t('onboarding.success.title')}
                        </Text>
                        <Text className="text-xl text-text-secondary text-center">
                            {t('onboarding.success.subtitle')}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 justify-center items-center">
                {/* Progress Bar */}
                {step > 0 && step < 3 && (
                    <View className="absolute top-16 left-10 right-10 h-1.5 bg-surface-highlight rounded-full overflow-hidden">
                        <View
                            style={{ width: `${(step / 2) * 100}%` }}
                            className="h-full bg-primary"
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
        </SafeAreaView>
    );
};

export default OnboardingScreen;
