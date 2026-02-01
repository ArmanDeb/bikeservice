import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { AIService } from '../../../src/services/AIService'
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { withObservables } from '@nozbe/watermelondb/react'
import { database } from '../../../src/database'
import Vehicle from '../../../src/database/models/Vehicle'
import MaintenanceLog from '../../../src/database/models/MaintenanceLog'
import { MaintenanceService } from '../../../src/services/MaintenanceService'
import { TableName } from '../../../src/database/constants'

// --- Log Item Component ---
const LogItem = ({ log }: { log: MaintenanceLog }) => (
    <View className="bg-neutral-800 p-4 rounded-xl mb-3 border border-neutral-700">
        <View className="flex-row justify-between mb-1">
            <Text className="text-white font-bold text-lg">{log.title}</Text>
            <Text className="text-yellow-500 font-bold">{log.cost} €</Text>
        </View>
        <View className="flex-row justify-between">
            <Text className="text-neutral-400 text-sm">{log.date.toLocaleDateString()}</Text>
            <Text className="text-neutral-400 text-sm">{log.mileageAtLog.toLocaleString()} km</Text>
        </View>
        {log.notes ? <Text className="text-neutral-500 text-sm mt-2 italic">{log.notes}</Text> : null}
    </View>
)

// --- Detail Screen ---
const VehicleDetailScreen = ({ vehicle, logs }: { vehicle: Vehicle, logs: MaintenanceLog[] }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [title, setTitle] = useState('')
    const [cost, setCost] = useState('')
    const [mileage, setMileage] = useState('')
    const [notes, setNotes] = useState('')
    const [type, setType] = useState<'periodic' | 'repair' | 'modification'>('periodic')
    const [isScanning, setIsScanning] = useState(false)
    const router = useRouter()

    if (!vehicle) return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Loading...</Text></View>

    const handleScanInvoice = async () => {
        Alert.alert("Select Image", "Choose an option to scan invoice", [
            {
                text: "Camera",
                onPress: () => launchPicker("camera")
            },
            {
                text: "Gallery",
                onPress: () => launchPicker("gallery")
            },
            {
                text: "Cancel",
                style: "cancel"
            }
        ])
    }

    const launchPicker = async (mode: "camera" | "gallery") => {
        try {
            let result;
            if (mode === "camera") {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.5,
                    base64: true,
                })
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.5,
                    base64: true,
                })
            }

            if (!result.canceled && result.assets[0].base64) {
                setIsScanning(true)
                try {
                    const data = await AIService.analyzeInvoice(result.assets[0].base64)

                    if (data.title) setTitle(data.title)
                    if (data.cost) setCost(data.cost.toString())
                    if (data.date) {
                        Alert.alert("Date Found", data.date.toDateString())
                    }
                    if (data.type) setType(data.type)
                    if (data.notes) setNotes(data.notes)
                    if (data.mileage) setMileage(data.mileage.toString())

                    Alert.alert("Success", "Invoice analyzed! Please verify the details.")
                } catch (error: any) {
                    Alert.alert("AI Error", error.message)
                } finally {
                    setIsScanning(false)
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to launch image picker")
            setIsScanning(false)
        }
    }

    const handleAddLog = async () => {
        try {
            const newMileage = parseInt(mileage)
            if (isNaN(newMileage)) throw new Error("Invalid mileage")

            // Call Service (Will throw if validation fails)
            await MaintenanceService.createLog(
                vehicle,
                title,
                type,
                parseFloat(cost) || 0,
                newMileage,
                new Date(), // TODO: Allow user to pick date
                notes
            )
            setModalVisible(false)
            // Reset form
            setTitle(''); setCost(''); setMileage(''); setNotes(''); setType('periodic')
        } catch (e: any) {
            Alert.alert("Validation Error", e.message)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <Stack.Screen options={{ title: `${vehicle.brand} ${vehicle.model}`, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />

            <ScrollView className="p-4">
                {/* Header Stats */}
                <View className="bg-neutral-900 p-6 rounded-2xl mb-6 border border-neutral-800">
                    <Text className="text-neutral-400 text-sm uppercase tracking-wider mb-1">Current Mileage</Text>
                    <Text className="text-4xl font-bold text-yellow-500">{vehicle.currentMileage.toLocaleString()} <Text className="text-xl text-neutral-500">km</Text></Text>
                </View>

                {/* Timeline */}
                <Text className="text-xxl font-bold text-white mb-4">Maintenance History</Text>
                {logs.length === 0 ? (
                    <Text className="text-neutral-600 italic">No maintenance history recorded.</Text>
                ) : (
                    logs.map(log => <LogItem key={log.id} log={log} />)
                )}
                <View className="h-24" /> {/* Spacer for FAB */}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-10 right-6 bg-yellow-500 w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-yellow-900"
            >
                <Text className="text-3xl font-bold text-black">+</Text>
            </TouchableOpacity>

            {/* Add Log Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/90 justify-end">
                    <View className="bg-neutral-900 p-6 rounded-t-3xl border-t border-neutral-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-white">New Maintenance</Text>
                            <TouchableOpacity
                                onPress={handleScanInvoice}
                                disabled={isScanning}
                                className="bg-neutral-800 px-4 py-2 rounded-full border border-neutral-700 flex-row items-center gap-2"
                            >
                                {isScanning ? <ActivityIndicator color="#EAB308" /> : <Text className="text-yellow-500 font-bold">📷 Scan Invoice</Text>}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            {(['periodic', 'repair', 'modification'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setType(t)}
                                    className={`flex-1 p-3 rounded-xl border ${type === t
                                        ? 'bg-yellow-500 border-yellow-500'
                                        : 'bg-neutral-800 border-neutral-700'
                                        }`}
                                >
                                    <Text className={`text-center font-bold capitalize ${type === t ? 'text-black' : 'text-neutral-400'
                                        }`}>
                                        {t === 'modification' ? 'Mod' : t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            placeholder="Title (e.g. Oil Change)"
                            placeholderTextColor="#666"
                            className="bg-neutral-800 text-white p-4 rounded-xl mb-3 text-lg"
                            value={title} onChangeText={setTitle}
                        />
                        <View className="flex-row gap-3 mb-3">
                            <TextInput
                                placeholder="Cost (€)"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                className="bg-neutral-800 text-white p-4 rounded-xl flex-1 text-lg"
                                value={cost} onChangeText={setCost}
                            />
                            <TextInput
                                placeholder="Mileage"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                className="bg-neutral-800 text-white p-4 rounded-xl flex-1 text-lg"
                                value={mileage} onChangeText={setMileage}
                            />
                        </View>
                        <TextInput
                            placeholder="Notes (Optional)"
                            placeholderTextColor="#666"
                            multiline
                            className="bg-neutral-800 text-white p-4 rounded-xl mb-6 h-24 text-lg"
                            value={notes} onChangeText={setNotes}
                        />

                        <TouchableOpacity onPress={handleAddLog} className="bg-yellow-500 p-4 rounded-xl items-center mb-3">
                            <Text className="text-black font-bold text-lg">Save Record</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="p-4 items-center">
                            <Text className="text-neutral-500 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

// Enhance with Observables
const enhance = withObservables(['id'], ({ id }: { id: string }) => ({
    vehicle: database.collections.get<Vehicle>(TableName.VEHICLES).findAndObserve(id),
    logs: MaintenanceService.observeLogsForVehicle(id)
}))

const EnhancedVehicleDetailScreen = enhance(VehicleDetailScreen)

// Wrapper to get ID from Params 
// Note: withObservables needs props.id, but route params come from hook.
// We make a wrapper component.
export default function VehicleDetailWrapper() {
    const { id } = useLocalSearchParams()
    // Type guard
    if (typeof id !== 'string') return null
    return <EnhancedVehicleDetailScreen id={id} />
}
