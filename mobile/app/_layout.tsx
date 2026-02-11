import 'react-native-gesture-handler';
import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts, Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { WorkSans_300Light, WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { VehicleProvider } from '../src/context/VehicleContext'
import { ThemeProvider, useTheme } from '../src/context/ThemeContext'
import { LanguageProvider } from '../src/context/LanguageContext'
import { NetworkProvider, useNetwork } from '../src/context/NetworkContext'
import { sync } from '../src/services/SyncService'
import { View, ActivityIndicator, Text } from 'react-native'
import '../global.css'
import { database } from '../src/database'


function RootLayoutNav() {
    const { user, isLoading } = useAuth()
    const { isDark, resolvedTheme } = useTheme()
    const segments = useSegments()
    const router = useRouter()
    const { isConnected } = useNetwork()
    const [isNavigating, setIsNavigating] = useState(false)

    useEffect(() => {
        if (isLoading || isNavigating) return

        const inAuthGroup = segments[0] === 'auth'
        const isOnboarding = segments[0] === 'onboarding'

        const handleNavigation = async () => {
            if (!user && !inAuthGroup) {
                // Check if intro has been seen
                const hasSeenIntro = await AsyncStorage.getItem('has_seen_intro');

                if (!hasSeenIntro && segments[0] !== 'intro') {
                    router.replace('/intro');
                } else if (hasSeenIntro && segments[0] !== 'intro') {
                    // Only redirect to auth if not already there and not in intro
                    router.replace('/auth');
                }
            } else if (user) {
                // If user is logged in, and we are either in auth, or at root, or not in tabs/onboarding/intro
                // properly route them.
                const inLegalGroup = segments[0] === 'legal'
                const needsRouting = inAuthGroup || segments[0] === 'intro' || (!isOnboarding && !inLegalGroup && segments[0] !== '(tabs)')

                if (needsRouting) {
                    setIsNavigating(true)
                    try {
                        if (isConnected) {
                            console.log('🔄 Performing Initial Sync...')
                            await sync() // Wait for sync to populate DB
                            console.log('✅ Initial Sync Done.')
                        } else {
                            console.log('⚠️ Offline: Skipping Initial Sync')
                        }
                    } catch (e) {
                        console.error('❌ Initial sync failed:', e)
                    }

                    // Strict check after sync
                    const count = await database.get('vehicles').query().fetchCount()
                    console.log(`Found ${count} vehicles. Routing accordingly...`)

                    if (count === 0) {
                        router.replace('/onboarding')
                    } else {
                        router.replace('/(tabs)')
                    }
                    setIsNavigating(false)
                }
            }
        }

        handleNavigation()
    }, [user, isLoading, segments, isConnected])


    if (isLoading || isNavigating) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#F8F5F2' }}>
                <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
                {isNavigating && <Text style={{ color: isDark ? '#fff' : '#000', marginTop: 20 }}>Syncing your garage...</Text>}
            </View>
        )
    }

    const navigationTheme = resolvedTheme === 'dark' ? {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: '#000000', // Match --color-background for dark
        },
    } : {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#F8F5F2', // Match --color-background for paper
        },
    };

    return (
        <NavThemeProvider value={navigationTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="intro" options={{ headerShown: false }} />
                <Stack.Screen name="legal" options={{ headerShown: false }} />
            </Stack>
        </NavThemeProvider>
    )
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_300Light,
        Outfit_400Regular,
        Outfit_500Medium,
        Outfit_600SemiBold,
        Outfit_700Bold,
        WorkSans_300Light,
        WorkSans_400Regular,
        WorkSans_500Medium,
        WorkSans_600SemiBold,
        WorkSans_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            // SplashScreen.hideAsync(); // If using standard expo splash screen
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Or a custom loading component
    }

    return (
        <AuthProvider>
            <NetworkProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <VehicleProvider>
                            <RootLayoutNav />
                        </VehicleProvider>
                    </ThemeProvider>
                </LanguageProvider>
            </NetworkProvider>
        </AuthProvider>
    )
}
