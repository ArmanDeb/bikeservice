import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/services/Supabase';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useNetwork } from '../../src/context/NetworkContext';
import { ModalInput } from '../../src/components/common/ModalInput';
import { ChevronLeft } from 'lucide-react-native';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: 'WorkSans_600SemiBold',
        color: '#1C1C1E',
        marginLeft: 8,
    },
    backButtonTextDark: {
        color: '#FDFCF8',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
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
        marginBottom: 32,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    primaryButton: {
        backgroundColor: '#1C1C1E',
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
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
        marginTop: 24,
        alignItems: 'center',
    },
    footerLink: {
        color: '#1C1C1E',
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 16,
    },
    footerLinkDark: {
        color: '#FDFCF8',
    },
});

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const { isConnected } = useNetwork();

    const iconColor = isDark ? '#FDFCF8' : '#1C1C1E';

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const handleSendCode = async () => {
        if (!email) {
            showAlert(t('alert.error'), t('auth.email_required') || 'Email is required');
            return;
        }

        if (!isConnected) {
            showAlert(t('alert.no_internet'), t('alert.no_internet_desc'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
            });

            if (error) throw error;

            setStep('otp');
            showAlert(t('common.success') || 'Success', t('auth.otp_sent') || 'Verification code sent to your email.');
        } catch (error: any) {
            showAlert(t('alert.error'), error.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!otp || otp.length < 6) {
            showAlert(t('alert.error'), t('auth.invalid_code') || 'Please enter a valid 6-digit code');
            return;
        }

        if (!isConnected) {
            showAlert(t('alert.no_internet'), t('alert.no_internet_desc'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (error) throw error;

            // Redirect to Reset Password screen upon successful verification & login
            router.replace('/auth/reset-password');
        } catch (error: any) {
            console.error('Verify error:', error);
            showAlert(t('alert.error'), error.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => {
                        if (step === 'otp') {
                            setStep('email');
                        } else {
                            router.back();
                        }
                    }}
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                >
                    <ChevronLeft size={24} color={iconColor} />
                    <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
                        {step === 'otp' ? (t('common.back') || 'Back') : (t('auth.sign_in') || 'Login')}
                    </Text>
                </Pressable>
            </View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View entering={FadeIn.duration(400)}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {step === 'email' ? (t('auth.forgot_password') || 'Forgot Password?') : (t('auth.enter_code') || 'Enter Code')}
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                        {step === 'email'
                            ? (t('auth.forgot_password_desc') || 'Enter your email to receive a verification code.')
                            : (t('auth.enter_code_desc') || `We sent a code to ${email}`)}
                    </Text>

                    {step === 'email' ? (
                        <ModalInput
                            label={t('auth.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    ) : (
                        <ModalInput
                            label={t('auth.code') || 'Verification Code'}
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="123456"
                            keyboardType="number-pad"
                            maxLength={8}
                        />
                    )}

                    <Pressable
                        onPress={step === 'email' ? handleSendCode : handleVerifyCode}
                        disabled={loading}
                        style={[
                            styles.primaryButton,
                            isDark && styles.primaryButtonDark,
                            loading && styles.primaryButtonDisabled
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                        ) : (
                            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
                                {step === 'email' ? (t('auth.send_code') || 'Send Code') : (t('auth.verify') || 'Verify')}
                            </Text>
                        )}
                    </Pressable>
                </Animated.View>
            </KeyboardAwareScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                confirmText={t('common.ok')}
                variant="default"
            />
        </SafeAreaView>
    );
}
