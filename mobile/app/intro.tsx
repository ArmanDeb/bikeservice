import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/context/LanguageContext';
import { useTheme } from '../src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Feature Card Component
const FeatureCard = ({ icon, title, desc, delay, isDark }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className={`flex-row items-center p-4 mb-4 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-white/60'} border ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}
        >
            <View className={`p-3 rounded-full mr-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-100'}`}>
                <Ionicons name={icon} size={24} color={isDark ? '#818cf8' : '#4f46e5'} />
            </View>
            <View className="flex-1">
                <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</Text>
            </View>
        </Animated.View>
    );
};

// Styles
const styles = StyleSheet.create({
    actionButton: {
        backgroundColor: '#3B82F6', // Primary Blue
        width: '100%',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default function IntroScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    const finishIntro = async () => {
        try {
            await AsyncStorage.setItem('has_seen_intro', 'true');
            router.replace('/auth');
        } catch (e) {
            console.error('Failed to save intro state', e);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-[#F8F5F2]'} justify-between`}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header Content */}
            <View className="px-6 pt-10">
                <View className="items-center mb-10">
                    <View className="bg-primary/20 p-6 rounded-full mb-6">
                        <Ionicons name="speedometer" size={60} color="#FFD700" />
                    </View>
                    <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Bike Service
                    </Text>
                    <Text className={`text-xl font-medium text-center mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {t('intro.title')}
                    </Text>
                    <Text className={`text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('intro.subtitle')}
                    </Text>
                </View>

                {/* Features */}
                <View>
                    <FeatureCard
                        icon="build"
                        title={t('intro.feature1.title')}
                        desc={t('intro.feature1.desc')}
                        delay={300}
                        isDark={isDark}
                    />
                    <FeatureCard
                        icon="scan-circle"
                        title={t('intro.feature2.title')}
                        desc={t('intro.feature2.desc')}
                        delay={600}
                        isDark={isDark}
                    />
                    <FeatureCard
                        icon="wallet"
                        title={t('intro.feature3.title')}
                        desc={t('intro.feature3.desc')}
                        delay={900}
                        isDark={isDark}
                    />
                </View>
            </View>

            {/* Bottom Action */}
            <View className="p-6 mb-4">
                <Pressable
                    onPress={finishIntro}
                    style={styles.actionButton}
                >
                    <Text className="text-black text-center font-bold text-lg uppercase tracking-wider">
                        {t('intro.button')}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
