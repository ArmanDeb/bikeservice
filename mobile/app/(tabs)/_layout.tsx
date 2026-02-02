import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import { VehicleProvider } from '../../src/context/VehicleContext'

import { Bike, BarChart2, Wrench, Folder, Settings, Wallet } from 'lucide-react-native'

export default function TabsLayout() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDark = theme === 'dark';

    return (
        <VehicleProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: isDark ? '#111' : '#FFFFFF',
                        borderTopColor: isDark ? '#333' : '#E5E7EB',
                    },
                    tabBarActiveTintColor: isDark ? '#facc15' : '#CA8A04', // Yellow-400 (Moto vibe) : Blue-600 (Paper)
                    tabBarInactiveTintColor: isDark ? '#666' : '#9CA3AF',
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t('tabs.garage'),
                        tabBarIcon: ({ color }) => <Bike size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: t('tabs.dashboard'),
                        tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="maintenance"
                    options={{
                        title: t('tabs.maintenance'),
                        tabBarIcon: ({ color }) => <Wrench size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="wallet"
                    options={{
                        title: t('tabs.wallet'),
                        tabBarIcon: ({ color }) => <Folder size={24} color={color} />, // Or Wallet icon if available, Folder maps to previous concept
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: t('tabs.settings'),
                        tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                    }}
                />
            </Tabs>
        </VehicleProvider>
    )
}
