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
import { View, ActivityIndicator, Text, Image, Dimensions } from 'react-native'
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
        // const isOnboarding = segments[0] === 'onboarding' // Removed

        const handleNavigation = async () => {
            if (!user && !inAuthGroup) {
                // Always show intro as the landing page if not logged in
                if (segments[0] !== 'intro') {
                    router.replace('/intro');
                }
            } else if (user) {
                // If user is logged in, properly route them.
                const inLegalGroup = segments[0] === 'legal'
                const inOnboardingGroup = segments[0] === 'onboarding'
                // Safe check for segments[1] to avoid Tuple type error
                const isResetFlow = segments[0] === 'auth' && segments.length > 1 && (segments[1] === 'reset-password' || segments[1] === 'forgot-password');
                const needsRouting = !isResetFlow && (inAuthGroup || segments[0] === 'intro' || (!inLegalGroup && !inOnboardingGroup && segments[0] !== '(tabs)'))

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
                        // Ideally show a toast or non-blocking alert here if it fails
                    }

                    // Strict check after sync
                    const count = await database.get('vehicles').query().fetchCount()
                    console.log(`Found ${count} vehicles. Routing accordingly...`)

                    if (count === 0) {
                        router.replace('/onboarding/add-vehicle')
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
        const { width } = Dimensions.get('window');
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1C1C1E' : '#FDFCF8' }}>
                <View style={{
                    width: width * 0.4,
                    height: width * 0.4,
                    backgroundColor: '#1C1C1E', // Always dark background for BS logo box
                    borderRadius: 32,
                    overflow: 'hidden',
                    marginBottom: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                </View>
                <ActivityIndicator size="large" color="#FAC902" />
                {isNavigating && (
                    <Text style={{
                        color: isDark ? '#E5E5E0' : '#1C1C1E',
                        marginTop: 20,
                        fontFamily: 'WorkSans_500Medium',
                        fontSize: 16
                    }}>
                        Syncing your garage...
                    </Text>
                )}
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
                <Stack.Screen name="onboarding/add-vehicle" options={{ headerShown: false }} />
                <Stack.Screen name="intro" options={{ headerShown: false }} />
                <Stack.Screen name="legal" options={{ headerShown: false }} />
            </Stack>
        </NavThemeProvider>
    )
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        <GestureHandlerRootView style={{ flex: 1 }}>
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
        </GestureHandlerRootView>
    )
}
