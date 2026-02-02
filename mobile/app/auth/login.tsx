import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/services/Supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/context/LanguageContext';
import { useTheme } from '../../src/context/ThemeContext';

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center'
    },
    primaryButtonDisabled: {
        opacity: 0.7
    }
});

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert(t('alert.error'), error.message);
            setLoading(false);
        } else {
            // Keep loading true while redirection happens
            // Router will handle navigation based on auth state change in _layout.tsx
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-6 justify-center">
            <View>
                <Text className="text-4xl font-bold text-text mb-2">{t('auth.welcome')}</Text>
                <Text className="text-text-secondary text-lg mb-10">{t('auth.register_subtitle')}</Text>

                <View className="space-y-4">
                    <View className="mb-4">
                        <Text className="text-text-secondary text-xs uppercase mb-2 tracking-widest">{t('auth.email')}</Text>
                        <TextInput
                            onChangeText={setEmail}
                            value={email}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="bg-surface text-text p-4 rounded-xl border border-border focus:border-primary"
                            placeholder="you@example.com"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-text-secondary text-xs uppercase mb-2 tracking-widest">{t('auth.password')}</Text>
                        <TextInput
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            className="bg-surface text-text p-4 rounded-xl border border-border focus:border-primary"
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <Pressable
                        onPress={signInWithEmail}
                        disabled={loading}
                        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Text className="text-black text-center font-bold text-lg">{t('auth.sign_in')}</Text>
                        )}
                    </Pressable>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-text-secondary">{t('auth.no_account')} </Text>
                        <Pressable onPress={() => router.back()}>
                            <Text className="text-primary font-bold">{t('auth.sign_up')}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
