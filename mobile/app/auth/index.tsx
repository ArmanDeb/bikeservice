import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/services/Supabase';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useNetwork } from '../../src/context/NetworkContext';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';
import { ModalInput } from '../../src/components/common/ModalInput';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
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
        backgroundColor: '#1C1C1E', // Dark Stone
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: 'transparent',
    },
    primaryButtonDark: {
        backgroundColor: '#FDFCF8', // Invert for dark mode
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
        color: '#FFFFFF',
    },
    footerTextDark: {
        color: '#9CA3AF',
    }
});

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { isConnected } = useNetwork();

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    async function signUpWithEmail() {
        if (!isConnected) {
            setAlertTitle(t('alert.no_internet') || 'No Internet Connection');
            setAlertMessage(t('alert.no_internet_desc') || 'Please check your internet connection and try again.');
            setAlertVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            setAlertTitle(t('alert.error'));
            setAlertMessage(t('auth.passwords_do_not_match') || 'Passwords do not match');
            setAlertVisible(true);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setAlertTitle(t('alert.error'));
            setAlertMessage(error.message);
            setAlertVisible(true);
            setLoading(false);
            return;
        }

        if (data.session) {
            // Keep loading true while redirection happens
        } else {
            setAlertTitle(t('auth.check_inbox'));
            setAlertMessage(t('auth.verify_email'));
            setAlertVisible(true);
            setLoading(false);
        }
    }

    const iconColor = isDark ? '#64748B' : '#9CA3AF';

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <View>
                        <Text style={[styles.title, isDark && styles.titleDark]}>{t('auth.register_title')}</Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{t('auth.register_subtitle')}</Text>

                        <View>
                            <ModalInput
                                label={t('auth.email')}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <ModalInput
                                label={t('auth.password')}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                secureTextEntry={true}
                            />
                        </View>

                        <View>
                            <ModalInput
                                label={t('auth.password_confirm')}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                secureTextEntry={true}
                            />
                        </View>

                        <Pressable
                            onPress={signUpWithEmail}
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
                                    {t('auth.sign_up')}
                                </Text>
                            )}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>{t('auth.have_account')} </Text>
                            <Pressable onPress={() => router.push('/auth/login')}>
                                <Text style={[styles.footerLink, isDark && styles.footerLinkDark]}>{t('auth.sign_in')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
