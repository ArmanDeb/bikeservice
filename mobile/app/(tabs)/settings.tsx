import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SettingsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView className="px-6 py-8">
                <Text className="text-4xl font-bold text-white mb-8">Settings</Text>

                <View className="space-y-6">
                    <View>
                        <Text className="text-neutral-500 font-bold mb-3 uppercase tracking-wider text-xs">Profile</Text>
                        <TouchableOpacity className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                            <Text className="text-white font-semibold">User Info</Text>
                            <Text className="text-neutral-500 text-sm mt-1">Manage your account details</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="text-neutral-500 font-bold mb-3 uppercase tracking-wider text-xs">Sync</Text>
                        <TouchableOpacity className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-semibold">Supabase Sync</Text>
                                <View className="bg-green-500/10 px-2 py-1 rounded">
                                    <Text className="text-green-500 text-xs font-bold uppercase">Active</Text>
                                </View>
                            </View>
                            <Text className="text-neutral-500 text-sm mt-1">Last synced: Just now</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="text-neutral-500 font-bold mb-3 uppercase tracking-wider text-xs">Theme & Vibe</Text>
                        <TouchableOpacity className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                            <Text className="text-white font-semibold">Garage Dark Mode</Text>
                            <Text className="text-neutral-500 text-sm mt-1">High-contrast moto aesthetics</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mt-8">
                        <Text className="text-red-500 font-bold text-center">Logout</Text>
                    </TouchableOpacity>

                    <Text className="text-neutral-700 text-center text-xs mt-8">
                        BikeService v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
