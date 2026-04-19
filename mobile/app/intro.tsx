import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    StatusBar,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withSpring,
    withTiming,
    interpolate,
    interpolateColor,
    Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bike, Wrench, Wallet } from 'lucide-react-native';
import { useLanguage } from '../src/context/LanguageContext';
import { useTheme } from '../src/context/ThemeContext';
import { SPRING_SNAPPY, FADE_IN_CONFIG } from '../src/utils/animations';

const { width } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<SlideData>);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SlideData {
    id: string;
    type: 'hero' | 'feature';
    icon?: React.FC<{ size: number; color: string; strokeWidth: number }>;
    titleKey: string;
    descKey: string;
}

const SLIDES: SlideData[] = [
    { id: 'welcome', type: 'hero', titleKey: 'intro.title', descKey: 'intro.subtitle' },
    { id: 'garage', type: 'feature', icon: Bike, titleKey: 'intro.feature_garage.title', descKey: 'intro.feature_garage.desc' },
    { id: 'maintenance', type: 'feature', icon: Wrench, titleKey: 'intro.feature1.title', descKey: 'intro.feature1.desc' },
    { id: 'wallet', type: 'feature', icon: Wallet, titleKey: 'intro.feature3.title', descKey: 'intro.feature3.desc' },
];

const LAST_INDEX = SLIDES.length - 1;

async function markSeen() {
    await AsyncStorage.setItem('has_seen_intro', '1');
}

export default function IntroScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    const scrollX = useSharedValue(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<FlatList<SlideData>>(null);

    const primaryScale = useSharedValue(1);
    const secondaryScale = useSharedValue(1);

    const primaryBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: primaryScale.value }],
    }));

    const secondaryBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: secondaryScale.value }],
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
    });

    const goTo = (index: number) => {
        listRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
    };

    const handlePrimary = async () => {
        if (activeIndex < LAST_INDEX) {
            goTo(activeIndex + 1);
        } else {
            await markSeen();
            router.replace('/auth/');
        }
    };

    const handleSecondaryOrSkip = async () => {
        await markSeen();
        router.replace('/auth/login');
    };

    const colors = {
        bg: isDark ? '#1C1C1E' : '#FDFCF8',
        text: isDark ? '#FFFFFF' : '#1C1C1E',
        textSecondary: isDark ? '#A1A1AA' : '#666660',
        iconCircle: isDark ? 'rgba(250,201,2,0.15)' : 'rgba(250,201,2,0.12)',
        dotInactive: isDark ? '#3A3A3C' : '#D4D4D4',
        secondaryText: isDark ? '#A1A1AA' : '#1C1C1E',
    };

    const isLastSlide = activeIndex === LAST_INDEX;

    const renderSlide = ({ item }: { item: SlideData }) => {
        if (item.type === 'hero') {
            return (
                <View style={styles.slide}>
                    <View style={styles.heroLogoContainer}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.heroLogo}
                        />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>Bike Service</Text>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>{t(item.titleKey)}</Text>
                    <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{t(item.descKey)}</Text>
                </View>
            );
        }

        const Icon = item.icon!;
        return (
            <View style={styles.slide}>
                <View style={[styles.iconCircle, { backgroundColor: colors.iconCircle }]}>
                    <Icon size={52} color="#FAC902" strokeWidth={1.5} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{t(item.titleKey)}</Text>
                <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{t(item.descKey)}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.skipRow}>
                {!isLastSlide && (
                    <TouchableOpacity onPress={handleSecondaryOrSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Text style={[styles.skipText, { color: colors.textSecondary }]}>{t('intro.skip')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <AnimatedFlatList
                ref={listRef as any}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setActiveIndex(newIndex);
                }}
                renderItem={renderSlide}
            />

            <View style={styles.footer}>
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <DotIndicator
                            key={i}
                            index={i}
                            scrollX={scrollX}
                            inactiveColor={colors.dotInactive}
                            onPress={() => goTo(i)}
                        />
                    ))}
                </View>

                <AnimatedPressable
                    style={[styles.primaryButton, primaryBtnStyle]}
                    onPressIn={() => { primaryScale.value = withSpring(0.96, SPRING_SNAPPY); }}
                    onPressOut={() => { primaryScale.value = withSpring(1, SPRING_SNAPPY); }}
                    onPress={handlePrimary}
                >
                    <Text style={styles.primaryButtonText}>
                        {isLastSlide ? t('auth.join_the_club') : t('intro.next')}
                    </Text>
                </AnimatedPressable>

                <AnimatedPressable
                    style={[styles.secondaryButton, secondaryBtnStyle]}
                    onPressIn={() => { secondaryScale.value = withSpring(0.96, SPRING_SNAPPY); }}
                    onPressOut={() => { secondaryScale.value = withSpring(1, SPRING_SNAPPY); }}
                    onPress={handleSecondaryOrSkip}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.secondaryText }]}>
                        {t('auth.have_account')}
                    </Text>
                </AnimatedPressable>
            </View>
        </SafeAreaView>
    );
}

function DotIndicator({
    index,
    scrollX,
    inactiveColor,
    onPress,
}: {
    index: number;
    scrollX: Animated.SharedValue<number>;
    inactiveColor: string;
    onPress: () => void;
}) {
    const dotStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP);
        const backgroundColor = interpolateColor(
            scrollX.value,
            inputRange,
            [inactiveColor, '#FAC902', inactiveColor],
        );
        return {
            width: withSpring(dotWidth, SPRING_SNAPPY),
            opacity: withTiming(opacity, FADE_IN_CONFIG),
            backgroundColor,
        };
    });

    return (
        <TouchableOpacity onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}>
            <Animated.View style={[styles.dot, dotStyle]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipRow: {
        height: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    skipText: {
        fontFamily: 'WorkSans_500Medium',
        fontSize: 15,
    },
    slide: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    heroLogoContainer: {
        width: width * 0.44,
        height: width * 0.44,
        marginBottom: 36,
        borderRadius: 36,
        overflow: 'hidden',
    },
    heroLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    appName: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontFamily: 'WorkSans_600SemiBold',
        textAlign: 'center',
        marginBottom: 14,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    featureTitle: {
        fontSize: 26,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        marginBottom: 14,
    },
    slideDesc: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        textAlign: 'center',
        lineHeight: 26,
        maxWidth: '85%',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 36,
        gap: 14,
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    primaryButton: {
        backgroundColor: '#FAC902',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#FAC902',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#1C1C1E',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    secondaryButton: {
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    secondaryButtonText: {
        fontFamily: 'WorkSans_600SemiBold',
        fontSize: 15,
        textAlign: 'center',
    },
});
