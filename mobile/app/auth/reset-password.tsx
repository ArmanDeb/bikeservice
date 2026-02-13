import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/services/Supabase';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useNetwork } from '../../src/context/NetworkContext';
import { ModalInput } from '../../src/components/common/ModalInput';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
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
});

export default function ResetPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const { isConnected } = useNetwork();

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const handleUpdatePassword = async () => {
        setError('');

        if (password !== confirmPassword) {
            setError(t('auth.passwords_do_not_match'));
            showAlert(t('alert.error'), t('auth.passwords_do_not_match'));
            return;
        }

        if (!password || password.length < 6) {
            showAlert(t('alert.error'), t('auth.password_min_length') || 'Password must be at least 6 characters');
            return;
        }

        if (!isConnected) {
            showAlert(t('alert.no_internet'), t('alert.no_internet_desc'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            console.log('✅ ResetPassword: Password updated. Waiting for events to settle...');
            // Wait for any side-effects of updateUser (like session refresh) to fire before signing out
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('✅ ResetPassword: Signing out now...');
            await supabase.auth.signOut();
            setSuccess(true);

            Alert.alert(
                t('alert.success'),
                t('auth.password_reset_success') || 'Password updated successfully. Please log in with your new password.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/auth/login');
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('❌ ResetPassword error:', error);
            showAlert(t('alert.error'), error.message || 'Failed to update password');
            setLoading(false);
        }
    };

    const handleConfirmSuccess = () => {
        setAlertVisible(false);
        if (success) {
            router.replace('/auth/login');
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View entering={FadeIn.duration(400)}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {t('auth.reset_password') || 'Reset Password'}
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                        {t('auth.reset_password_desc') || 'Enter your new password below.'}
                    </Text>

                    <ModalInput
                        label={t('auth.new_password') || 'New Password'}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry={true}
                    />

                    <ModalInput
                        label={t('auth.password_confirm') || 'Confirm Password'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        secureTextEntry={true}
                        error={!!error && error.includes('match')}
                    />

                    <Pressable
                        onPress={handleUpdatePassword}
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
                                {t('auth.update_password') || 'Update Password'}
                            </Text>
                        )}
                    </Pressable>
                </Animated.View>
            </KeyboardAwareScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={handleConfirmSuccess}
                confirmText={t('common.ok')}
                variant="default"
            />
        </SafeAreaView>
    );
}
