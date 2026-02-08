import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/services/Supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/context/LanguageContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Sun, Moon } from 'lucide-react-native';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';

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
        fontSize: 40,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    titleDark: {
        color: '#FDFCF8',
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
        marginBottom: 48,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    label: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    labelDark: {
        color: '#9CA3AF',
    },
    input: {
        backgroundColor: '#F5F5F0',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        color: '#1C1C1E',
        marginBottom: 24,
    },
    inputDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        color: '#FDFCF8',
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
    themeToggle: {
        position: 'absolute',
        bottom: 40,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F5F5F0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    themeToggleDark: {
        backgroundColor: '#2C2C2E',
        shadowColor: '#000', // Stronger shadow in dark mode? Or just border?
        borderWidth: 1,
        borderColor: '#3A3A3C',
    }
});

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark, toggleTheme } = useTheme();

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    async function signUpWithEmail() {
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

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <View>
                <Text style={[styles.title, isDark && styles.titleDark]}>{t('auth.register_title')}</Text>
                <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{t('auth.register_subtitle')}</Text>

                <View>
                    <View>
                        <Text style={[styles.label, isDark && styles.labelDark]}>{t('auth.email')}</Text>
                        <TextInput
                            onChangeText={setEmail}
                            value={email}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="you@example.com"
                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                        />
                    </View>

                    <View>
                        <Text style={[styles.label, isDark && styles.labelDark]}>{t('auth.password')}</Text>
                        <TextInput
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="••••••••"
                            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                        />
                    </View>

                    <Pressable
                        onPress={signUpWithEmail}
                        disabled={loading}
                        style={[styles.primaryButton, isDark && styles.primaryButtonDark, loading && styles.primaryButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                        ) : (
                            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>{t('auth.sign_up')}</Text>
                        )}
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, isDark && styles.labelDark]}>{t('auth.have_account')} </Text>
                        <Pressable onPress={() => router.push('/auth/login')}>
                            <Text style={[styles.footerLink, isDark && styles.footerLinkDark]}>{t('auth.sign_in')}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <Pressable
                onPress={toggleTheme}
                style={[styles.themeToggle, isDark && styles.themeToggleDark]}
            >
                {isDark ? (
                    <Sun color="#FDFCF8" size={24} />
                ) : (
                    <Moon color="#1C1C1E" size={24} />
                )}
            </Pressable>

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
