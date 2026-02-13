import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, StatusBar, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useTheme } from '../src/context/ThemeContext';
import {
    SPRING_ENTRANCE,
    SPRING_SNAPPY,
    FADE_IN_CONFIG,
    STAGGER_DELAY,
    ENTRANCE_TRANSLATE_Y,
} from '../src/utils/animations';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function IntroScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    // Staggered entrance triggers (0 = hidden, 1 = visible)
    const logoProgress = useSharedValue(0);
    const nameProgress = useSharedValue(0);
    const titleProgress = useSharedValue(0);
    const subtitleProgress = useSharedValue(0);
    const primaryBtnProgress = useSharedValue(0);
    const secondaryBtnProgress = useSharedValue(0);

    // Button press scales
    const primaryScale = useSharedValue(1);
    const secondaryScale = useSharedValue(1);

    useEffect(() => {
        // Stagger content elements
        logoProgress.value = 1;
        nameProgress.value = 1;
        titleProgress.value = 1;
        subtitleProgress.value = 1;
        // Buttons after content
        primaryBtnProgress.value = 1;
        secondaryBtnProgress.value = 1;
    }, []);

    // Logo: fade + slide up + scale
    const logoStyle = useAnimatedStyle(() => ({
        opacity: withDelay(0, withTiming(logoProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(0, withSpring(logoProgress.value === 1 ? 0 : ENTRANCE_TRANSLATE_Y, SPRING_ENTRANCE)) },
            { scale: withDelay(0, withSpring(logoProgress.value === 1 ? 1 : 0.85, SPRING_ENTRANCE)) },
        ],
    }));

    // App name: fade + slide up
    const nameStyle = useAnimatedStyle(() => ({
        opacity: withDelay(STAGGER_DELAY, withTiming(nameProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(STAGGER_DELAY, withSpring(nameProgress.value === 1 ? 0 : ENTRANCE_TRANSLATE_Y, SPRING_ENTRANCE)) },
        ],
    }));

    // Title: fade + slide up
    const titleStyle = useAnimatedStyle(() => ({
        opacity: withDelay(STAGGER_DELAY * 2, withTiming(titleProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(STAGGER_DELAY * 2, withSpring(titleProgress.value === 1 ? 0 : ENTRANCE_TRANSLATE_Y, SPRING_ENTRANCE)) },
        ],
    }));

    // Subtitle: fade + slide up
    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: withDelay(STAGGER_DELAY * 3, withTiming(subtitleProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(STAGGER_DELAY * 3, withSpring(subtitleProgress.value === 1 ? 0 : ENTRANCE_TRANSLATE_Y, SPRING_ENTRANCE)) },
        ],
    }));

    // Primary button: fade + slide up (after content)
    const primaryBtnStyle = useAnimatedStyle(() => ({
        opacity: withDelay(STAGGER_DELAY * 5, withTiming(primaryBtnProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(STAGGER_DELAY * 5, withSpring(primaryBtnProgress.value === 1 ? 0 : 20, SPRING_ENTRANCE)) },
            { scale: primaryScale.value },
        ],
    }));

    // Secondary button: fade + slide up
    const secondaryBtnStyle = useAnimatedStyle(() => ({
        opacity: withDelay(STAGGER_DELAY * 6, withTiming(secondaryBtnProgress.value, FADE_IN_CONFIG)),
        transform: [
            { translateY: withDelay(STAGGER_DELAY * 6, withSpring(secondaryBtnProgress.value === 1 ? 0 : 20, SPRING_ENTRANCE)) },
            { scale: secondaryScale.value },
        ],
    }));

    const handleJoin = () => {
        router.push('/auth/');
    };

    const handleSignIn = () => {
        router.push('/auth/login');
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <View style={styles.content}>
                <Animated.View style={[{ alignItems: 'center' }, logoStyle]}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logo}
                        />
                    </View>
                </Animated.View>

                <Animated.View style={nameStyle}>
                    <Text style={[styles.appName, isDark && styles.appNameDark]}>
                        Bike Service
                    </Text>
                </Animated.View>

                <Animated.View style={titleStyle}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {t('intro.title')}
                    </Text>
                </Animated.View>

                <Animated.View style={subtitleStyle}>
                    <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                        {t('intro.subtitle')}
                    </Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <AnimatedPressable
                    style={[
                        styles.button,
                        isDark && styles.buttonDark,
                        primaryBtnStyle,
                    ]}
                    onPressIn={() => { primaryScale.value = withSpring(0.96, SPRING_SNAPPY); }}
                    onPressOut={() => { primaryScale.value = withSpring(1, SPRING_SNAPPY); }}
                    onPress={handleJoin}
                >
                    <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
                        {t('auth.join_the_club') || "Join the Club"}
                    </Text>
                </AnimatedPressable>

                <AnimatedPressable
                    style={[styles.secondaryButton, secondaryBtnStyle]}
                    onPressIn={() => { secondaryScale.value = withSpring(0.96, SPRING_SNAPPY); }}
                    onPressOut={() => { secondaryScale.value = withSpring(1, SPRING_SNAPPY); }}
                    onPress={handleSignIn}
                >
                    <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
                        {t('auth.have_account') || "I have an account"}
                    </Text>
                </AnimatedPressable>
            </View>
        </SafeAreaView>
    );
}

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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    appName: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
        marginBottom: 16,
        textAlign: 'center',
    },
    appNameDark: {
        color: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontFamily: 'WorkSans_600SemiBold',
        color: '#1C1C1E',
        textAlign: 'center',
        marginBottom: 16,
    },
    titleDark: {
        color: '#E5E5E5',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
    },
    subtitleDark: {
        color: '#A1A1AA',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        width: '100%',
        gap: 16,
    },
    button: {
        backgroundColor: '#FAC902', // Brand Gold/Orange
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        elevation: 5,
        shadowColor: '#FAC902',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonDark: {
        backgroundColor: '#FAC902',
        shadowColor: '#FAC902',
        shadowOpacity: 0.3,
    },
    buttonText: {
        color: '#1C1C1E', // Dark text for contrast on Gold
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    buttonTextDark: {
        color: '#1C1C1E', // Dark text for contrast on Gold
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    secondaryButtonText: {
        color: '#1C1C1E',
        fontFamily: 'WorkSans_600SemiBold',
        fontSize: 16,
        textAlign: 'center',
    },
    secondaryButtonTextDark: {
        color: '#A1A1AA',
    },
});
