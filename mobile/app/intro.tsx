import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, StatusBar, ScrollView, Image } from 'react-native';
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
            style={[{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }, isDark ? styles.cardDark : styles.cardLight]}
        >
            <View style={[styles.iconContainer, isDark ? styles.iconContainerDark : styles.iconContainerLight]}>
                <Ionicons name={icon} size={24} color={isDark ? '#E5E5E0' : '#4A4A45'} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>{title}</Text>
                <Text style={[styles.cardDesc, isDark && styles.cardDescDark]}>{desc}</Text>
            </View>
        </Animated.View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
        justifyContent: 'space-between',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        backgroundColor: '#F5F5F0',
        width: 120,
        height: 120,
        borderRadius: 30,
        marginBottom: 24,
        overflow: 'hidden',
    },
    logoCircleDark: {
        backgroundColor: '#2C2C2E',
    },
    appName: {
        fontSize: 28,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        color: '#1C1C1E',
        marginBottom: 16,
    },
    appNameDark: {
        color: '#FDFCF8',
    },
    title: {
        fontSize: 18,
        fontFamily: 'WorkSans_500Medium',
        textAlign: 'center',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    titleDark: {
        color: '#E5E5E0',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        textAlign: 'center',
        color: '#666660',
        lineHeight: 24,
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    // Card Styles
    cardLight: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    cardDark: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#2C2C2E',
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    iconContainer: {
        padding: 12,
        borderRadius: 9999,
        marginRight: 16,
    },
    iconContainerLight: {
        backgroundColor: '#F5F5F0',
    },
    iconContainerDark: {
        backgroundColor: '#3A3A3C',
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    cardTitleDark: {
        color: '#FDFCF8',
    },
    cardDesc: {
        fontSize: 14,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
    },
    cardDescDark: {
        color: '#9CA3AF',
    },
    actionButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        width: '100%',
        padding: 20,
        borderRadius: 14,
        shadowColor: 'transparent',
        alignItems: 'center',
    },
    actionButtonDark: {
        backgroundColor: '#FDFCF8',
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttonTextDark: {
        color: '#1C1C1E',
    }
});

export default function IntroScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    const finishIntro = async () => {
        try {
            await AsyncStorage.setItem('has_seen_intro', 'true');
            router.replace('/auth/login');
        } catch (e) {
            console.error('Failed to save intro state', e);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Scrollable Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.header, { paddingTop: 20 }]}>
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, isDark && styles.logoCircleDark]}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={[styles.appName, isDark && styles.appNameDark]}>
                            Bike Service
                        </Text>
                        <Text style={[styles.title, isDark && styles.titleDark]}>
                            {t('intro.title')}
                        </Text>
                        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                            {t('intro.subtitle')}
                        </Text>
                    </View>

                    {/* Features */}
                    <View>
                        <FeatureCard
                            icon="build-outline"
                            title={t('intro.feature1.title')}
                            desc={t('intro.feature1.desc')}
                            delay={300}
                            isDark={isDark}
                        />
                        <FeatureCard
                            icon="scan-outline"
                            title={t('intro.feature2.title')}
                            desc={t('intro.feature2.desc')}
                            delay={600}
                            isDark={isDark}
                        />
                        <FeatureCard
                            icon="wallet-outline"
                            title={t('intro.feature3.title')}
                            desc={t('intro.feature3.desc')}
                            delay={900}
                            isDark={isDark}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={{ padding: 24, paddingBottom: 40 }}>
                <Pressable
                    onPress={finishIntro}
                    style={[styles.actionButton, isDark && styles.actionButtonDark]}
                >
                    <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
                        {t('intro.button')}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
