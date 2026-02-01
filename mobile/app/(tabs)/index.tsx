import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react'
import { database } from '../../src/database'
import Vehicle from '../../src/database/models/Vehicle'
import { TCOService } from '../../src/services/TCOService'
import { VehicleService } from '../../src/services/VehicleService'

import { useVehicle } from '../../src/context/VehicleContext'

import { Q } from '@nozbe/watermelondb'
import { TableName } from '../../src/database/constants'
import { MaintenanceService } from '../../src/services/MaintenanceService'
import MaintenanceLog from '../../src/database/models/MaintenanceLog'

const DashboardScreen = ({ vehicles, logs }: { vehicles: Vehicle[], logs: MaintenanceLog[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()

    // 1. Identify Active Vehicle
    const activeVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null

    // 2. Filter Logs (Reactive)
    // If a vehicle is selected, only show its logs. Otherwise, show all (for global stats).
    // Note: If you want 'Global' to mean ALL vehicles, keep this. 
    // If Global Header means just summary, logic is fine.
    const activeLogs = selectedVehicleId
        ? logs.filter(l => l.vehicleId === selectedVehicleId)
        : logs

    // 3. Compute Stats (Reactive)
    const totalGarageCost = activeLogs.reduce((sum, log) => sum + log.cost, 0)

    // Sort logs by date desc for display (Observables usually sort, but filter might mess order if not careful)
    // The query in observeAllLogs already sorts by date desc.
    const recentLogs = activeLogs

    // Cost Breakdown Logic
    const costBreakdown = activeLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.cost
        return acc
    }, {} as Record<string, number>)

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView
                contentContainerStyle={{ padding: 24 }}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-4xl font-bold text-white">Dashboard</Text>
                </View>
                <Text className="text-neutral-400 text-lg mb-8">
                    {activeVehicle ? `Overview: ${activeVehicle.brand} ${activeVehicle.model}` : 'Garage Overview'}
                </Text>

                {/* Total Cost Card */}
                <View className="bg-neutral-900 p-6 rounded-2xl mb-6 border border-neutral-800">
                    <Text className="text-neutral-400 text-sm uppercase tracking-wider mb-2">
                        {activeVehicle ? 'Vehicle Total Cost' : 'Total Garage Cost (TCO)'}
                    </Text>
                    <Text className="text-5xl font-bold text-yellow-500">{totalGarageCost.toLocaleString()} <Text className="text-2xl text-neutral-500">€</Text></Text>
                </View>

                {/* Selected Vehicle specific views OR Global Summary */}
                {/* Cost Summary Table */}
                <View className="bg-neutral-900 rounded-2xl mb-6 border border-neutral-800 overflow-hidden">
                    <View className="p-4 border-b border-neutral-800 bg-neutral-800/50">
                        <Text className="text-white font-bold text-lg">Cost Breakdown</Text>
                    </View>
                    <View className="p-4">
                        {[
                            { label: 'Periodic Maintenance', value: costBreakdown['periodic'] || 0 },
                            { label: 'Repairs', value: costBreakdown['repair'] || 0 },
                            { label: 'Modifications', value: costBreakdown['modification'] || 0 },
                        ].map((row, idx) => (
                            <View key={idx} className="flex-row justify-between py-2 border-b border-neutral-800 last:border-0">
                                <Text className="text-neutral-400">{row.label}</Text>
                                <Text className="text-white font-bold">{row.value.toLocaleString()} €</Text>
                            </View>
                        ))}
                        <View className="flex-row justify-between pt-4 mt-2 border-t border-neutral-700">
                            <Text className="text-white font-bold">TOTAL</Text>
                            <Text className="text-yellow-500 font-bold">{totalGarageCost.toLocaleString()} €</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity Timeline */}
                <Text className="text-xl font-bold text-white mb-4">Latest Activity</Text>
                <View className="pl-4 border-l-2 border-neutral-800 ml-2">
                    {recentLogs.length > 0 ? (
                        recentLogs.slice(0, 5).map((log, index) => (
                            <View key={log.id} className="mb-6 relative">
                                <View className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-yellow-500 border-4 border-black" />
                                <Text className="text-neutral-500 text-xs mb-1">{log.date.toLocaleDateString('fr-FR')}</Text>
                                <View className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-white font-bold text-lg flex-1 mr-2">{log.title}</Text>
                                        <View className={`px-2 py-0.5 rounded ${log.type === 'periodic' ? 'bg-blue-500/10' :
                                            log.type === 'repair' ? 'bg-red-500/10' : 'bg-purple-500/10'
                                            }`}>
                                            <Text className={`text-xs font-bold uppercase ${log.type === 'periodic' ? 'text-blue-500' :
                                                log.type === 'repair' ? 'text-red-500' : 'text-purple-500'
                                                }`}>{log.type}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-neutral-400 text-sm">@{log.mileageAtLog.toLocaleString()} km</Text>
                                        <Text className="text-yellow-500 font-bold">- {log.cost} €</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-neutral-500 italic mb-4">No maintenance logs recorded yet.</Text>
                    )}
                </View>

                {/* Quick Stats (Only show Global Vehicle count if NO vehicle is selected) */}
                {!selectedVehicleId && (
                    <View className="flex-row gap-4 mb-6">
                        <View className="bg-neutral-900 p-6 rounded-2xl flex-1 border border-neutral-800">
                            <Text className="text-neutral-400 text-sm uppercase mb-1">Vehicles</Text>
                            <Text className="text-3xl font-bold text-white">{vehicles.length}</Text>
                        </View>
                    </View>
                )}

                {/* Development Only: Reset Button */}
                <TouchableOpacity
                    onPress={() => {
                        Alert.alert(
                            "Reset Local Data?",
                            "This will wipe all data from your device to match the empty server. Cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Wipe Everything",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await database.write(async () => {
                                                await database.unsafeResetDatabase()
                                            })
                                            // Reloading might be needed, but usually WatermelonDB handles reset reasonably well or requires app restart.
                                            // Let's force a JS reload update if possible or just alert.
                                            Alert.alert("Success", "Local database reset. Please restart the app if you see errors.")
                                        } catch (e: any) {
                                            Alert.alert("Error", e.message)
                                        }
                                    }
                                }
                            ]
                        )
                    }}
                    className="bg-red-900/20 p-4 rounded-xl items-center border border-red-900/50 mb-8"
                >
                    <Text className="text-red-500 font-bold">⚠️ Reset Local Data (Fix Ghost Data)</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
    logs: MaintenanceService.observeAllLogs(), // Make Logs Reactive!
}))

export default enhance(DashboardScreen)
