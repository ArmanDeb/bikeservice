import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import Animated, {
    SharedValue,
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withSpring,
    withTiming,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/services/Supabase';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useNetwork } from '../../src/context/NetworkContext';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';
import { ModalInput } from '../../src/components/common/ModalInput';
import { ChevronLeft } from 'lucide-react-native';
import {
    SPRING_ENTRANCE,
    FADE_IN_CONFIG,
    STAGGER_DELAY,
    ENTRANCE_TRANSLATE_Y,
} from '../../src/utils/animations';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: 'WorkSans_600SemiBold',
        color: '#1C1C1E',
        marginLeft: 8,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    backButtonTextDark: {
        color: '#FDFCF8',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    titleDark: {
        color: '#FDFCF8',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
        marginBottom: 48,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    primaryButton: {
        backgroundColor: '#1C1C1E',
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: 'transparent',
    },
    primaryButtonDark: {
        backgroundColor: '#FDFCF8',
    },
    primaryButtonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
    },
    buttonTextDark: {
        color: '#1C1C1E',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    footerText: {
        color: '#666660',
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
    },
    footerLink: {
        color: '#1C1C1E',
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        marginLeft: 4,
    },
    footerLinkDark: {
        color: '#FDFCF8',
    },
    footerTextDark: {
        color: '#9CA3AF',
    }
});

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const { isConnected } = useNetwork();

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    // Staggered entrance values
    const titleProgress = useSharedValue(0);
    const subtitleProgress = useSharedValue(0);
    const emailProgress = useSharedValue(0);
    const passwordProgress = useSharedValue(0);
    const buttonProgress = useSharedValue(0);
    const footerProgress = useSharedValue(0);

    useEffect(() => {
        titleProgress.value = 1;
        subtitleProgress.value = 1;
        emailProgress.value = 1;
        passwordProgress.value = 1;
        buttonProgress.value = 1;
        footerProgress.value = 1;
    }, []);

    const makeEntranceStyle = (progress: SharedValue<number>, index: number) => {
        return useAnimatedStyle(() => ({
            opacity: withDelay(STAGGER_DELAY * index, withTiming(progress.value, FADE_IN_CONFIG)),
            transform: [
                { translateY: withDelay(STAGGER_DELAY * index, withSpring(progress.value === 1 ? 0 : ENTRANCE_TRANSLATE_Y, SPRING_ENTRANCE)) },
            ],
        }));
    };

    const titleStyle = makeEntranceStyle(titleProgress, 0);
    const subtitleStyle = makeEntranceStyle(subtitleProgress, 1);
    const emailStyle = makeEntranceStyle(emailProgress, 2);
    const passwordStyle = makeEntranceStyle(passwordProgress, 3);
    const buttonStyle = makeEntranceStyle(buttonProgress, 4);
    const footerStyle = makeEntranceStyle(footerProgress, 5);

    async function signInWithEmail() {
        if (!isConnected) {
            setAlertTitle(t('alert.no_internet') || 'No Internet Connection');
            setAlertMessage(t('alert.no_internet_desc') || 'Please check your internet connection and try again.');
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setAlertTitle(t('alert.error'));
            setAlertMessage(error.message);
            setAlertVisible(true);
            setLoading(false);
        } else {
            // Keep loading true while redirection happens
        }
    }

    const iconColor = isDark ? '#FDFCF8' : '#1C1C1E';

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <Animated.View entering={FadeIn.duration(300)}>
                <Pressable
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/intro')}
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <ChevronLeft size={24} color={iconColor} />
                    <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
                        {t('common.back') || 'Back'}
                    </Text>
                </Pressable>
            </Animated.View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: Dimensions.get('window').height * 0.15,
                    paddingHorizontal: 24,
                    paddingBottom: 40
                }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Animated.View style={titleStyle}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>{t('auth.welcome')}</Text>
                    </Animated.View>
                    <Animated.View style={subtitleStyle}>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{t('auth.register_subtitle')}</Text>
                    </Animated.View>

                    <Animated.View style={emailStyle}>
                        <ModalInput
                            label={t('auth.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                        />
                    </Animated.View>

                    <Animated.View style={passwordStyle}>
                        <ModalInput
                            label={t('auth.password')}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry={true}
                        />
                    </Animated.View>

                    <Animated.View style={buttonStyle}>
                        <Pressable
                            onPress={signInWithEmail}
                            disabled={loading}
                            style={[
                                styles.primaryButton,
                                isDark && styles.primaryButtonDark,
                                loading && styles.primaryButtonDisabled
                            ]}
                        >
                            {loading ? (
                                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                                    <ActivityIndicator color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                                </Animated.View>
                            ) : (
                                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
                                    <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
                                        {t('auth.sign_in')}
                                    </Text>
                                </Animated.View>
                            )}
                        </Pressable>
                    </Animated.View>

                    <Animated.View style={footerStyle}>
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>{t('auth.no_account')} </Text>
                            <Pressable onPress={() => router.replace('/auth/')}>
                                <Text style={[styles.footerLink, isDark && styles.footerLinkDark]}>{t('auth.sign_up')}</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAwareScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                confirmText={t('common.ok')}
                variant="default"
            />
        </SafeAreaView >
    );
}
