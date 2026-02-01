import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../../src/database'
import Vehicle from '../../src/database/models/Vehicle'
import { TableName } from '../../src/database/constants'
import { MaintenanceService } from '../../src/services/MaintenanceService'
import { AIService } from '../../src/services/AIService'
import { useVehicle } from '../../src/context/VehicleContext'
import MaintenanceLog from '../../src/database/models/MaintenanceLog'
import VehicleItem from '../../src/components/vehicle/VehicleItem'
import { VehicleService } from '../../src/services/VehicleService'

// --- Log Item ---
const LogItem = ({ log, showVehicleName, onPress }: { log: MaintenanceLog, showVehicleName: boolean, onPress: (log: MaintenanceLog) => void }) => (
    <TouchableOpacity onPress={() => onPress(log)} className="bg-neutral-800 p-4 rounded-xl mb-3 border border-neutral-700">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">{log.title}</Text>
                {showVehicleName && (
                    <Text className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
                        {/* Context handled by parent listing */}
                    </Text>
                )}
            </View>
            <View className="items-end">
                <Text className="text-yellow-500 font-bold">{log.cost} €</Text>
                <View className={`px-2 py-0.5 rounded mt-1 ${log.type === 'periodic' ? 'bg-blue-500/10' :
                    log.type === 'repair' ? 'bg-red-500/10' : 'bg-purple-500/10'
                    }`}>
                    <Text className={`text-xs font-bold uppercase ${log.type === 'periodic' ? 'text-blue-500' :
                        log.type === 'repair' ? 'text-red-500' : 'text-purple-500'
                        }`}>{log.type}</Text>
                </View>
            </View>
        </View>
        <View className="flex-row justify-between mt-1">
            <Text className="text-neutral-400 text-sm">{log.date.toLocaleDateString('fr-FR')}</Text>
            <Text className="text-neutral-400 text-sm">{log.mileageAtLog.toLocaleString()} km</Text>
        </View>
        {log.notes ? <Text className="text-neutral-500 text-sm mt-2 italic">{log.notes}</Text> : null}
    </TouchableOpacity>
)

// --- Add Modal ---
const MaintenanceModal = ({
    visible,
    onClose,
    vehicles,
    preSelectedVehicleId,
    existingLog
}: {
    visible: boolean,
    onClose: () => void,
    vehicles: Vehicle[],
    preSelectedVehicleId: string | null,
    existingLog?: MaintenanceLog | null
}) => {
    const [vehicleId, setVehicleId] = useState(preSelectedVehicleId || '')
    const [title, setTitle] = useState('')
    const [cost, setCost] = useState('')
    const [mileage, setMileage] = useState('')
    const [notes, setNotes] = useState('')
    const [type, setType] = useState<'periodic' | 'repair' | 'modification'>('periodic')
    const [isScanning, setIsScanning] = useState(false)
    const [scannedImageUri, setScannedImageUri] = useState<string | undefined>(undefined)
    const [serviceDate, setServiceDate] = useState<Date>(new Date())

    // Update internal state when preSelected changes or modal opens
    useEffect(() => {
        if (visible) {
            if (existingLog) {
                // EDIT MODE
                setVehicleId(existingLog.vehicle.id) // Assuming relation is synchronous or ID available. WatermelonDB access: log.vehicle.id might need await if not eager, but log.vehicleId (raw) is safest if public
                // Note: WatermelonDB models exposes _raw usually or you access relation. 
                // Let's assume we can get ID. Log has `vehicle_id` column.
                // We'll use the passed objects or just assume user doesn't change vehicle often.
                // Actually MaintenanceLog model likely has `vehicleId` updated in observe? 
                // Let's rely on standard access. If existingLog was passed, it's a Model.

                // @ts-ignore - Assuming relation or field availability.
                // Safest to access the ID via raw or property if defined in Model.
                // Let's try standard prop if defined in model, else raw.
                // @ts-ignore
                setVehicleId(existingLog._raw.vehicle_id || existingLog.vehicle?.id || '')

                setTitle(existingLog.title)
                setCost(existingLog.cost.toString())
                setMileage(existingLog.mileageAtLog.toString())
                setNotes(existingLog.notes || '')
                setType(existingLog.type)
                setScannedImageUri(undefined) // Don't show scan for edit unless they scan new
            } else {
                // CREATE MODE
                setVehicleId(preSelectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : ''))
                setTitle(''); setCost(''); setMileage(''); setNotes(''); setType('periodic'); setScannedImageUri(undefined); setServiceDate(new Date())
            }
        }
    }, [visible, preSelectedVehicleId, vehicles, existingLog])

    const handleSubmit = async () => {
        try {
            const selectedVehicle = vehicles.find(v => v.id === vehicleId)
            if (!selectedVehicle) throw new Error("Please select a vehicle")

            const newMileage = parseInt(mileage)
            if (isNaN(newMileage)) throw new Error("Invalid mileage")

            if (existingLog) {
                // UPDATE
                await MaintenanceService.updateLog(
                    existingLog,
                    title,
                    type,
                    parseFloat(cost) || 0,
                    existingLog.date, // Keep original date for now or add date picker later
                    notes,
                    newMileage
                )
            } else {
                // CREATE
                await MaintenanceService.createLog(
                    selectedVehicle,
                    title,
                    type,
                    parseFloat(cost) || 0,
                    newMileage,
                    serviceDate, // Use date from invoice (or today if not scanned)
                    notes,
                    scannedImageUri // Pass the image URI
                )
            }
            onClose()
            // Reset
            setTitle(''); setCost(''); setMileage(''); setNotes(''); setType('periodic'); setScannedImageUri(undefined); setServiceDate(new Date())
        } catch (e: any) {
            Alert.alert("Error", e.message)
        }
    }

    const handleDelete = () => {
        if (!existingLog) return
        Alert.alert(
            "Delete Log",
            "Are you sure you want to delete this maintenance record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await MaintenanceService.deleteLog(existingLog)
                        onClose()
                    }
                }
            ]
        )
    }

    const launchPicker = async (mode: 'camera' | 'gallery') => {
        try {
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ['images'],
                quality: 0.8,
                base64: true,
            }

            const result = mode === 'camera'
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options)

            if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
                setIsScanning(true)
                // Store URI for saving later
                setScannedImageUri(result.assets[0].uri)

                try {
                    const analysis = await AIService.analyzeInvoice(result.assets[0].base64)
                    if (analysis) {
                        setTitle(analysis.title || '')
                        setCost(analysis.cost?.toString() || '')
                        setMileage(analysis.mileage?.toString() || '')

                        if (analysis.type && ['periodic', 'repair', 'modification'].includes(analysis.type)) {
                            setType(analysis.type)
                        } else {
                            setType('periodic')
                        }

                        if (analysis.notes) setNotes(analysis.notes)

                        // Use the date from the invoice instead of today
                        if (analysis.date) setServiceDate(analysis.date)

                        Alert.alert("IA Success", "Données extraites avec succès ! L'image sera sauvegardée dans le Wallet.")
                    }
                } catch (error: any) {
                    Alert.alert("Erreur IA", error.message || "Impossible d'analyser l'image.")
                } finally {
                    setIsScanning(false)
                }
            }
        } catch (e) {
            Alert.alert("Error", "Failed to launch picker")
        }
    }

    const handleScanInvoice = () => {
        Alert.alert(
            "Invoice Scanner",
            "Choose a source",
            [
                { text: "Camera", onPress: () => launchPicker('camera') },
                { text: "Gallery", onPress: () => launchPicker('gallery') },
                { text: "Cancel", style: "cancel" }
            ]
        )
    }

    const handleVoiceAssistant = () => {
        Alert.alert("Bientôt disponible", "Cette fonctionnalité arrive bientôt dans une prochaine mise à jour.")
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-neutral-900 p-6 rounded-t-3xl border-t border-neutral-800">
                    <View className="flex-row justify-between items-start mb-6">
                        <Text className="text-2xl font-bold text-white">{existingLog ? 'Edit Maintenance' : 'New Maintenance'}</Text>
                        <TouchableOpacity onPress={onClose} className="bg-neutral-800 p-2 rounded-full">
                            <Text className="text-neutral-500 font-bold px-1">✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* AI ASSISTANT SECTION - Only show if ADDING new log */}
                    {!existingLog && (
                        <View className="bg-neutral-800 p-4 rounded-2xl mb-6 border border-yellow-500/20">
                            {/* AI Assistant Section */}
                            <View className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 mb-6 relative overflow-hidden">
                                {/* Gradient-like border or effect could go here */}
                                <Text className="text-yellow-500 font-bold mb-3 text-xs tracking-wider">ASSISTANT IA ✨</Text>
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={handleScanInvoice}
                                        disabled={isScanning}
                                        className={`flex-1 p-3 rounded-lg border items-center flex-row justify-center gap-2 ${scannedImageUri ? 'bg-green-500/20 border-green-500' : 'bg-neutral-900/50 border-neutral-700'}`}
                                    >
                                        {isScanning ? (
                                            <ActivityIndicator color="#EAB308" />
                                        ) : (
                                            <>
                                                <Ionicons name={scannedImageUri ? "checkmark-circle" : "camera-outline"} size={20} color={scannedImageUri ? "#4ade80" : "#EAB308"} />
                                                <Text className={scannedImageUri ? "text-green-500 font-bold" : "text-neutral-200 font-bold"}>
                                                    {scannedImageUri ? "Scanned" : "Scanner"}
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity className="flex-1 bg-neutral-900/50 p-3 rounded-lg border border-neutral-700 items-center flex-row justify-center gap-2">
                                        <Ionicons name="mic-outline" size={20} color="#666" />
                                        <Text className="text-neutral-500 font-bold">Dicter</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Vehicle Selector (Visual only for MVP, simple scroll) */}
                            <Text className="text-neutral-400 text-xs uppercase mb-2">Select Vehicle</Text>
                            <View className="flex-row mb-4 overflow-scroll">
                                <FlatList
                                    horizontal
                                    data={vehicles}
                                    keyExtractor={v => v.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => setVehicleId(item.id)}
                                            className={`mr-3 px-4 py-3 rounded-xl border ${vehicleId === item.id
                                                ? 'bg-neutral-700 border-yellow-500'
                                                : 'bg-neutral-800 border-neutral-700'
                                                }`}
                                        >
                                            <Text className={`font-bold ${vehicleId === item.id ? 'text-white' : 'text-neutral-500'}`}>
                                                {item.brand} {item.model}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    )}

                    {/* Type Selector */}
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
                            placeholder="New Mileage"
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
                        className="bg-neutral-800 text-white p-4 rounded-xl mb-6 h-20 text-lg"
                        value={notes} onChangeText={setNotes}
                    />

                    <View className="flex-row gap-3">
                        {existingLog && (
                            <TouchableOpacity onPress={handleDelete} className="bg-red-500/10 p-4 rounded-xl items-center flex-1 border border-red-500/20">
                                <Text className="text-red-500 font-bold text-lg">Delete</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleSubmit} className="bg-yellow-500 p-4 rounded-xl items-center flex-[2]">
                            <Text className="text-black font-bold text-lg">{existingLog ? 'Update Record' : 'Save Record'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onClose} className="p-4 items-center mt-2">
                        <Text className="text-neutral-500 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

// --- Main Screen ---
type SortOption = 'date_added' | 'mileage' | 'maintenance_date'

const MaintenanceScreen = ({ vehicles, logs }: { vehicles: Vehicle[], logs: MaintenanceLog[] }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('maintenance_date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [showSortMenu, setShowSortMenu] = useState(false)
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()

    // Filter logs
    const filteredLogs = selectedVehicleId
        ? logs.filter(l => l.vehicleId === selectedVehicleId)
        : logs

    // Sort logs
    const sortedLogs = [...filteredLogs].sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
            case 'date_added':
                // @ts-ignore - WatermelonDB has _raw with createdAt
                const aCreated = a._raw?.created_at || 0
                // @ts-ignore
                const bCreated = b._raw?.created_at || 0
                comparison = aCreated - bCreated
                break
            case 'mileage':
                comparison = a.mileageAtLog - b.mileageAtLog
                break
            case 'maintenance_date':
                comparison = a.date.getTime() - b.date.getTime()
                break
        }
        return sortOrder === 'desc' ? -comparison : comparison
    })

    // Vehicle Name Look up map
    const vehicleNames = vehicles.reduce((acc, v) => {
        acc[v.id] = `${v.brand} ${v.model}`
        return acc
    }, {} as Record<string, string>)

    const activeVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null

    const handleAdd = () => {
        setSelectedLog(null)
        setModalVisible(true)
    }

    const handleEdit = (log: MaintenanceLog) => {
        setSelectedLog(log)
        setModalVisible(true)
    }

    const handleSortSelect = (option: SortOption) => {
        if (sortBy === option) {
            // Toggle order if same option
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortBy(option)
            setSortOrder('desc') // Default to descending for new sort
        }
        setShowSortMenu(false)
    }

    const getSortLabel = (option: SortOption): string => {
        switch (option) {
            case 'date_added': return 'Date Added'
            case 'mileage': return 'Mileage'
            case 'maintenance_date': return 'Service Date'
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-3xl font-bold text-white">Maintenance</Text>
                        {selectedVehicleId ? (
                            <TouchableOpacity onPress={() => setSelectedVehicleId(null)}>
                                <Text className="text-neutral-400 text-sm font-bold uppercase tracking-wider flex-row items-center">
                                    <Text className="text-yellow-500">← </Text>
                                    {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'All Vehicles'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-neutral-500 text-sm">Select a bike to view logs</Text>
                        )}
                    </View>
                    {selectedVehicleId && (
                        <View className="flex-row gap-2">
                            {/* Sort Button */}
                            <TouchableOpacity
                                onPress={() => setShowSortMenu(true)}
                                className="bg-neutral-800 p-2 rounded-full w-10 h-10 items-center justify-center border border-neutral-700"
                            >
                                <Ionicons name="funnel-outline" size={18} color="#a3a3a3" />
                            </TouchableOpacity>
                            {/* Add Button */}
                            <TouchableOpacity onPress={handleAdd} className="bg-neutral-800 p-2 rounded-full w-10 h-10 items-center justify-center">
                                <Text className="text-white font-bold text-2xl">+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Sort indicator when a vehicle is selected */}
                {selectedVehicleId && filteredLogs.length > 1 && (
                    <TouchableOpacity
                        onPress={() => setShowSortMenu(true)}
                        className="flex-row items-center mb-4 self-start bg-neutral-800/50 px-3 py-1.5 rounded-full"
                    >
                        <Ionicons
                            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                            size={12}
                            color="#EAB308"
                        />
                        <Text className="text-neutral-400 text-xs ml-1.5">
                            {getSortLabel(sortBy)}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Sort Menu Modal */}
                <Modal visible={showSortMenu} transparent animationType="fade">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowSortMenu(false)}
                        className="flex-1 bg-black/80 justify-center items-center"
                    >
                        <View className="bg-neutral-900 rounded-2xl p-4 w-64 border border-neutral-800">
                            <Text className="text-white font-bold text-lg mb-4 text-center">Sort By</Text>
                            {(['date_added', 'mileage', 'maintenance_date'] as SortOption[]).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => handleSortSelect(option)}
                                    className={`p-3 rounded-xl mb-2 flex-row justify-between items-center ${sortBy === option ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-neutral-800'
                                        }`}
                                >
                                    <Text className={`font-bold ${sortBy === option ? 'text-yellow-500' : 'text-neutral-300'}`}>
                                        {getSortLabel(option)}
                                    </Text>
                                    {sortBy === option && (
                                        <Ionicons
                                            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                                            size={16}
                                            color="#EAB308"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => setShowSortMenu(false)}
                                className="p-3 items-center mt-2"
                            >
                                <Text className="text-neutral-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {!selectedVehicleId ? (
                    /* Vehicle List Selection */
                    <FlatList
                        data={vehicles}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <VehicleItem
                                vehicle={item}
                                onPress={(v: Vehicle) => setSelectedVehicleId(v.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-neutral-500 text-lg">No bikes in garage.</Text>
                            </View>
                        }
                    />
                ) : (
                    /* logs list */
                    <FlatList
                        data={sortedLogs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View>
                                {!selectedVehicleId && (
                                    <Text className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">
                                        {vehicleNames[item.vehicleId] || 'Unknown Machine'}
                                    </Text>
                                )}
                                <LogItem log={item} showVehicleName={false} onPress={handleEdit} />
                            </View>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-6xl mb-4">🔧</Text>
                                <Text className="text-neutral-500 text-lg">No maintenance logs.</Text>
                                <Text className="text-neutral-700 text-sm mt-2">
                                    {selectedVehicleId ? 'For this machine.' : 'Time to get your hands dirty?'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {modalVisible && (
                <MaintenanceModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    vehicles={vehicles}
                    preSelectedVehicleId={selectedVehicleId}
                    existingLog={selectedLog}
                />
            )}
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
    logs: MaintenanceService.observeAllLogs(),
}))

export default enhance(MaintenanceScreen)
