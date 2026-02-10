import { Tabs } from 'expo-router'
import { View, Text, Platform } from 'react-native'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import { useVehicle } from '../../src/context/VehicleContext'
import { withObservables } from '@nozbe/watermelondb/react'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { BrandLogo } from '../../src/components/common/BrandLogo'

import { Bike, BarChart2, Wrench, Folder, Settings, Wallet } from 'lucide-react-native'

// Enhanced icon component for the Garage tab
const GarageIconBase = ({ vehicles, color }: { vehicles: Vehicle[], color: string }) => {
    const { selectedVehicleId } = useVehicle();
    const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

    if (activeVehicle) {
        return (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                <BrandLogo
                    brand={activeVehicle.brand}
                    variant="icon"
                    size={24}
                    color={color}
                />
            </View>
        );
    }

    return <Bike size={24} color={color} />;
};

const GarageTabIcon = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
}))(GarageIconBase);

export default function TabsLayout() {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDark ? '#1C1C1E' : '#FDFCF8',
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#2C2C2E' : '#E6E5E0',
                    elevation: 0,
                    shadowOpacity: 0,
                    paddingTop: 8,
                    height: 60 + (Platform.OS === 'ios' ? 15 : 0), // Add extra height for iOS home indicator area if needed, but safe area should handle it. Better to just use a generous height.
                    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
                },
                tabBarActiveTintColor: isDark ? '#E5E5E0' : '#1C1C1E',
                tabBarInactiveTintColor: isDark ? '#666660' : '#9CA3AF',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontFamily: 'WorkSans_500Medium',
                    fontSize: 10,
                    marginBottom: 4,
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.garage'),
                    tabBarIcon: ({ color }) => <GarageTabIcon color={color} />,
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
                    tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
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
    )
}
