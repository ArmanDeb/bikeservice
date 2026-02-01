import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'

// Simple placeholder icons for now
function Icon({ name, color }: { name: string, color: string }) {
    return <Text style={{ color }}>{name}</Text>
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#111', borderTopColor: '#333' },
                tabBarActiveTintColor: '#facc15', // Yellow-400 (Moto vibe)
                tabBarInactiveTintColor: '#666',
            }}
        >
            <Tabs.Screen
                name="garage/index"
                options={{
                    title: 'Garage',
                    tabBarIcon: ({ color }) => <Icon name="🏍️" color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Icon name="📊" color={color} />,
                }}
            />
            <Tabs.Screen
                name="maintenance"
                options={{
                    title: 'Maintenance',
                    tabBarIcon: ({ color }) => <Icon name="🔧" color={color} />,
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({ color }) => <Icon name="📁" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Icon name="⚙️" color={color} />,
                }}
            />
            <Tabs.Screen
                name="garage/[id]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    )
}
