import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '../src/context/AuthContext'
import { VehicleProvider } from '../src/context/VehicleContext'
import { sync } from '../src/services/SyncService'
import '../global.css'

export default function RootLayout() {
    useEffect(() => {
        // Trigger sync on app launch
        const runSync = async () => {
            try {
                console.log('🔄 Starting initial sync...')
                await sync()
                console.log('✅ Sync completed')
            } catch (error) {
                console.error('❌ Sync failed:', error)
            }
        }
        runSync()
    }, [])

    return (
        <AuthProvider>
            <VehicleProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                </Stack>
            </VehicleProvider>
        </AuthProvider>
    )
}
