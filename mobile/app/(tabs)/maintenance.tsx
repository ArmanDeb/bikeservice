import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView, StatusBar, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import * as ImagePicker from 'expo-image-picker'
import { Scan, ChevronLeft, Bike, Calendar, Wrench, FlaskConical, FileText, ChevronRight, X, Plus, ChevronDown, ArrowUpDown, Check, Minus, ArrowUp, ArrowDown } from 'lucide-react-native'
import { database } from '../../src/database'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import Vehicle from '../../src/database/models/Vehicle'
import { TableName } from '../../src/database/constants'
import { MaintenanceService } from '../../src/services/MaintenanceService'
import MaintenanceLog from '../../src/database/models/MaintenanceLog'
import { useVehicle } from '../../src/context/VehicleContext'
import { Q } from '@nozbe/watermelondb'
import { AIService } from '../../src/services/AIService'
import { DocumentService } from '../../src/services/DocumentService'
import { VehicleService } from '../../src/services/VehicleService'
import { sync } from '../../src/services/SyncService'

// Styles definition
const styles = StyleSheet.create({
    // Modal Styles
    aiScanButton: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // primary/20
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)', // primary/30
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    typeButtonDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    typeButtonSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    cancelButton: {
        padding: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    // Screen Styles
    addButton: {
        backgroundColor: '#3B82F6',
        padding: 8,
        borderRadius: 9999,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    backButton: {
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    backButtonDark: {
        backgroundColor: '#1E293B',
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    logItem: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    logItemDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    vehicleCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleCardDark: {
        backgroundColor: '#1E293B',
        borderColor: 'rgba(51, 65, 85, 0.5)',
    }
});

// Maintenance Modal Component
const MaintenanceModal = ({ visible, onClose, log, vehicles }: { visible: boolean, onClose: () => void, log?: MaintenanceLog | null, vehicles: Vehicle[] }) => {
    const { selectedVehicleId } = useVehicle()
    const { t, language } = useLanguage()
    const { isDark } = useTheme()
    const [title, setTitle] = useState('')
    const [cost, setCost] = useState('')
    const [mileageAtLog, setMileageAtLog] = useState('')
    const [notes, setNotes] = useState('')
    const [type, setType] = useState<'periodic' | 'repair' | 'modification'>('periodic')
    const [vehicleId, setVehicleId] = useState('')
    const [date, setDate] = useState<Date>(new Date())
    const [isScanning, setIsScanning] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [scannedDocumentUri, setScannedDocumentUri] = useState<string | null>(null)

    useEffect(() => {
        if (visible) {
            if (log) {
                setTitle(log.title)
                setCost(log.cost.toString())
                setMileageAtLog(log.mileageAtLog.toString())
                setNotes(log.notes || '')
                setType(log.type)
                setVehicleId(log.vehicleId)
                setDate(log.date)
            } else {
                setTitle('')
                setCost('')
                setMileageAtLog('')
                setNotes('')
                setType('periodic')
                setVehicleId(selectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : ''))
                setDate(new Date())
                setScannedDocumentUri(null)
            }
        }
    }, [visible, log, selectedVehicleId, vehicles])

    const performAIScan = async (source: 'camera' | 'library') => {
        const { status } = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== 'granted') {
            Alert.alert(t('alert.error'), `Permission to access ${source === 'camera' ? 'camera' : 'gallery'} was denied`)
            return
        }

        const pickerOptions: ImagePicker.ImagePickerOptions = {
            base64: true,
            quality: 0.8,
        }

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync(pickerOptions)
            : await ImagePicker.launchImageLibraryAsync(pickerOptions)

        if (!result.canceled && result.assets[0].base64) {
            setIsScanning(true)
            try {
                const data = await AIService.analyzeInvoice(result.assets[0].base64, language)
                if (data.title) setTitle(data.title)
                if (data.cost) setCost(data.cost.toString())
                if (data.type) setType(data.type as any)
                if (data.notes) setNotes(data.notes)
                if (data.mileage) setMileageAtLog(data.mileage.toString())
                if (data.date) setDate(data.date)

                // Store document URI for later - will be linked to the log when form is submitted
                setScannedDocumentUri(result.assets[0].uri)

                Alert.alert(t('maintenance.alert.ia_success'), t('maintenance.alert.ia_success_desc'))
            } catch (err: any) {
                Alert.alert(t('maintenance.alert.ia_error'), t('maintenance.alert.ia_error_desc'))
            } finally {
                setIsScanning(false)
            }
        }
    }

    const handleAIScanOptions = () => {
        Alert.alert(
            t('maintenance.assistant_ia'),
            language === 'fr' ? 'Choisissez une source pour l\'analyse' : 'Choose a source for analysis',
            [
                { text: language === 'fr' ? 'Appareil Photo' : 'Camera', onPress: () => performAIScan('camera') },
                { text: language === 'fr' ? 'Galerie Photo' : 'Gallery', onPress: () => performAIScan('library') },
                { text: t('common.cancel'), style: 'cancel' }
            ]
        )
    }

    const handleSubmit = async () => {
        if (!title || !cost || !mileageAtLog || !vehicleId) {
            Alert.alert(t('alert.error'), 'Please fill in all required fields')
            return
        }

        const selectedVehicle = vehicles.find(v => v.id === vehicleId)
        if (!selectedVehicle) {
            Alert.alert(t('alert.error'), 'Vehicle not found')
            return
        }

        if (log) {
            // updateLog: (log, title, type, cost, date, notes?, mileageAtLog?)
            await MaintenanceService.updateLog(log, title, type, parseFloat(cost), date, notes || undefined, parseInt(mileageAtLog))
        } else {
            // createLog: (vehicle, title, type, cost, mileageAtLog, date, notes?, documentUri?)
            // Pass the scanned document URI so it gets linked to this maintenance log
            await MaintenanceService.createLog(selectedVehicle, title, type, parseFloat(cost), parseInt(mileageAtLog), date, notes || undefined, scannedDocumentUri || undefined)
        }
        onClose()
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface p-6 rounded-t-3xl border-t border-border max-h-[90%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-heading text-text">
                            {log ? t('maintenance.modal.edit_title') : t('maintenance.modal.add_title')}
                        </Text>
                        <Pressable
                            onPress={handleAIScanOptions}
                            disabled={isScanning}
                            style={styles.aiScanButton}
                        >
                            {isScanning ? (
                                <ActivityIndicator size="small" color="#EAB308" />
                            ) : (
                                <Scan size={20} color="#EAB308" />
                            )}
                            <Text className="text-primary-dark font-heading ml-2">
                                {isScanning 
                                    ? (language === 'fr' ? 'Analyse...' : 'Scanning...') 
                                    : (language === 'fr' ? 'Scanner facture' : 'Scan invoice')}
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Selected Vehicle Display (ReadOnly) */}
                        {!log && (
                            <View className="mb-4">
                                <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">{t('maintenance.select_vehicle')}</Text>
                                <View className="bg-surface-highlight p-4 rounded-xl border border-border flex-row items-center opacity-80">
                                    <Bike size={20} color={isDark ? "#EAB308" : "#3B82F6"} />
                                    <Text className="text-text font-heading ml-3">
                                        {vehicleId 
                                            ? `${vehicles.find(v => v.id === vehicleId)?.brand} ${vehicles.find(v => v.id === vehicleId)?.model}`
                                            : (language === 'fr' ? 'Sélectionner un véhicule' : 'Select a vehicle')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Type Picker */}
                        <View className="flex-row gap-2 mb-4">
                            {(['periodic', 'repair', 'modification'] as const).map((tType) => (
                                <Pressable
                                    key={tType}
                                    onPress={() => setType(tType)}
                                    style={[
                                        styles.typeButton,
                                        isDark && styles.typeButtonDark,
                                        type === tType && styles.typeButtonSelected
                                    ]}
                                >
                                    <Text className={`font-heading text-xs uppercase ${type === tType ? 'text-white' : 'text-text-secondary'}`}>
                                        {t(`maintenance.type.${tType}`)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Date Picker */}
                        <View className="mb-4">
                            <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">
                                {language === 'fr' ? 'Date de l\'intervention' : 'Service date'}
                            </Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className="bg-surface-highlight p-4 rounded-xl border border-border flex-row justify-between items-center"
                            >
                                <View className="flex-row items-center">
                                    <Calendar size={20} color={isDark ? "#EAB308" : "#3B82F6"} />
                                    <Text className="text-text font-heading ml-3">
                                        {date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <ChevronDown size={20} color="#9CA3AF" />
                            </Pressable>

                            {/* Custom Date Picker Modal */}
                            <Modal visible={showDatePicker} transparent animationType="fade">
                                <Pressable 
                                    className="flex-1 bg-black/50 justify-center items-center"
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Pressable 
                                        className="bg-surface rounded-2xl w-[85%] overflow-hidden"
                                        onPress={(e) => e.stopPropagation()}
                                    >
                                        <View className="p-4 border-b border-border">
                                            <Text className="text-text font-heading text-lg text-center">
                                                {language === 'fr' ? 'Choisir la date' : 'Choose date'}
                                            </Text>
                                        </View>
                                        
                                        <View className="p-6">
                                            {/* Quick date buttons */}
                                            <View className="flex-row gap-2 mb-6">
                                                <Pressable
                                                    onPress={() => setDate(new Date())}
                                                    className="flex-1 bg-primary/10 p-3 rounded-xl items-center"
                                                >
                                                    <Text className="text-primary-dark font-heading text-sm">
                                                        {language === 'fr' ? "Aujourd'hui" : 'Today'}
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => {
                                                        const yesterday = new Date()
                                                        yesterday.setDate(yesterday.getDate() - 1)
                                                        setDate(yesterday)
                                                    }}
                                                    className="flex-1 bg-surface-highlight p-3 rounded-xl items-center border border-border"
                                                >
                                                    <Text className="text-text font-heading text-sm">
                                                        {language === 'fr' ? 'Hier' : 'Yesterday'}
                                                    </Text>
                                                </Pressable>
                                            </View>

                                            {/* Date display */}
                                            <View className="bg-surface-highlight p-4 rounded-xl mb-6 items-center border border-border">
                                                <Text className="text-text font-heading text-xl">
                                                    {date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </Text>
                                            </View>

                                            {/* Day/Month/Year adjusters */}
                                            <View className="flex-row gap-4">
                                                {/* Day */}
                                                <View className="flex-1 items-center">
                                                    <Text className="text-text-secondary text-xs uppercase mb-2">
                                                        {language === 'fr' ? 'Jour' : 'Day'}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setDate(newDate.getDate() - 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Minus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                        <Text className="text-text font-heading text-xl mx-3 w-8 text-center">
                                                            {date.getDate()}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setDate(newDate.getDate() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Plus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {/* Month */}
                                                <View className="flex-1 items-center">
                                                    <Text className="text-text-secondary text-xs uppercase mb-2">
                                                        {language === 'fr' ? 'Mois' : 'Month'}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setMonth(newDate.getMonth() - 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Minus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                        <Text className="text-text font-heading text-xl mx-3 w-8 text-center">
                                                            {date.getMonth() + 1}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setMonth(newDate.getMonth() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Plus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {/* Year */}
                                                <View className="flex-1 items-center">
                                                    <Text className="text-text-secondary text-xs uppercase mb-2">
                                                        {language === 'fr' ? 'Année' : 'Year'}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setFullYear(newDate.getFullYear() - 1)
                                                                setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Minus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                        <Text className="text-text font-heading text-lg mx-2 w-12 text-center">
                                                            {date.getFullYear()}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setFullYear(newDate.getFullYear() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center border border-border"
                                                        >
                                                            <Plus size={16} color="#9CA3AF" />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="p-4 border-t border-border">
                                            <Pressable
                                                onPress={() => setShowDatePicker(false)}
                                                className="bg-primary p-4 rounded-xl items-center"
                                            >
                                                <Text className="text-black font-heading text-lg">OK</Text>
                                            </Pressable>
                                        </View>
                                    </Pressable>
                                </Pressable>
                            </Modal>
                        </View>

                        <TextInput
                            placeholder={t('maintenance.field.title')}
                            placeholderTextColor="#9CA3AF"
                            className="bg-surface-highlight text-text p-4 rounded-xl mb-4 text-lg border border-border"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <View className="flex-row gap-4 mb-4">
                            <TextInput
                                placeholder={t('maintenance.field.cost')}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="bg-surface-highlight text-text p-4 rounded-xl text-lg flex-1 border border-border"
                                value={cost}
                                onChangeText={setCost}
                            />
                            <TextInput
                                placeholder={t('maintenance.field.mileage')}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="bg-surface-highlight text-text p-4 rounded-xl text-lg flex-1 border border-border"
                                value={mileageAtLog}
                                onChangeText={setMileageAtLog}
                            />
                        </View>

                        <TextInput
                            placeholder={t('maintenance.field.notes')}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            className="bg-surface-highlight text-text p-4 rounded-xl mb-6 text-lg border border-border"
                            style={{ textAlignVertical: 'top' }}
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <Pressable onPress={handleSubmit} style={styles.submitButton}>
                            <Text className="text-white font-heading text-lg">
                                {log ? t('maintenance.modal.submit_edit') : t('maintenance.modal.submit_add')}
                            </Text>
                        </Pressable>

                        {log && (
                            <Pressable
                                onPress={async () => {
                                    // Check if there are linked documents
                                    const linkedDocuments = await database.collections
                                        .get(TableName.DOCUMENTS)
                                        .query(Q.where('log_id', log.id))
                                        .fetch()
                                    
                                    const hasLinkedDocument = linkedDocuments.length > 0
                                    
                                    if (hasLinkedDocument) {
                                        // Show choice: delete both or keep document
                                        Alert.alert(
                                            t('maintenance.modal.delete_confirm_title'),
                                            language === 'fr'
                                                ? 'Cet entretien a un document lié (facture). Voulez-vous aussi supprimer le document du portefeuille ?'
                                                : 'This maintenance log has a linked document (invoice). Do you also want to delete the document from your wallet?',
                                            [
                                                { text: t('common.cancel'), style: 'cancel' },
                                                {
                                                    text: language === 'fr' ? 'Garder le document' : 'Keep document',
                                                    onPress: async () => {
                                                        // Unlink document first, then delete log only
                                                        await database.write(async () => {
                                                            for (const doc of linkedDocuments) {
                                                                await doc.update(d => {
                                                                    // @ts-ignore - clear the log_id link
                                                                    d._raw.log_id = null
                                                                })
                                                            }
                                                            await log.markAsDeleted()
                                                        })
                                                        sync() // Sync changes to cloud
                                                        onClose()
                                                    }
                                                },
                                                {
                                                    text: language === 'fr' ? 'Tout supprimer' : 'Delete all',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        await MaintenanceService.deleteLog(log)
                                                        onClose()
                                                    }
                                                }
                                            ]
                                        )
                                    } else {
                                        // No linked document, simple confirmation
                                        Alert.alert(
                                            t('maintenance.modal.delete_confirm_title'),
                                            t('maintenance.modal.delete_confirm_desc'),
                                            [
                                                { text: t('common.cancel'), style: 'cancel' },
                                                {
                                                    text: t('common.delete'),
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        await MaintenanceService.deleteLog(log)
                                                        onClose()
                                                    }
                                                }
                                            ]
                                        )
                                    }
                                }}
                                style={styles.deleteButton}
                            >
                                <Text className="text-red-500 font-bold text-lg">{t('maintenance.modal.delete')}</Text>
                            </Pressable>
                        )}

                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text className="text-text-secondary font-bold">{t('common.cancel')}</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const MaintenanceScreen = ({ logs, vehicles }: { logs: MaintenanceLog[], vehicles: Vehicle[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [modalVisible, setModalVisible] = useState(false)
    const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null)
    const [sortBy, setSortBy] = useState<'date_added' | 'mileage' | 'service_date'>('date_added')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [showSortDropdown, setShowSortDropdown] = useState(false)

    const sortOptions = [
        { key: 'date_added' as const, labelFr: 'Date d\'ajout', labelEn: 'Date added' },
        { key: 'service_date' as const, labelFr: 'Date d\'intervention', labelEn: 'Service date' },
        { key: 'mileage' as const, labelFr: 'Kilométrage', labelEn: 'Mileage' },
    ]

    // Reactive filtering: Show NOTHING if no vehicle is selected (Focus Mode)
    const filteredLogs = selectedVehicleId
        ? logs.filter(l => l.vehicleId === selectedVehicleId)
        : []

    const sortedLogs = [...filteredLogs].sort((a, b) => {
        let diff = 0
        if (sortBy === 'mileage') {
            diff = a.mileageAtLog - b.mileageAtLog
        } else if (sortBy === 'service_date') {
            diff = a.date.getTime() - b.date.getTime()
        } else {
            // date_added
            const aTime = a.createdAt?.getTime() || a.date.getTime()
            const bTime = b.createdAt?.getTime() || b.date.getTime()
            diff = aTime - bTime
        }
        
        return sortOrder === 'asc' ? diff : -diff
    })

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 p-6">
                {/* Header Contextuel */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-heading text-text">
                        {selectedVehicleId ? t('maintenance.title') : t('maintenance.select_bike_title')}
                    </Text>
                    {selectedVehicleId && (
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            style={styles.addButton}
                        >
                            <Plus size={24} color="white" />
                        </Pressable>
                    )}
                </View>

                {selectedVehicleId ? (
                    <>
                        {/* Vehicle Indicator (Dashboard Style) */}
                        <View className="mb-6 items-start">
                            <View className="bg-primary px-5 py-3 rounded-full flex-row items-center shadow-sm">
                                <Bike size={20} color="white" />
                                <Text className="text-white font-heading text-base ml-3">
                                    {vehicles.find(v => v.id === selectedVehicleId)?.brand} {vehicles.find(v => v.id === selectedVehicleId)?.model}
                                </Text>
                            </View>
                        </View>

                        {/* Sort Controls */}
                        <View className="mb-4 flex-row gap-2">
                            <Pressable
                                onPress={() => setShowSortDropdown(true)}
                                className="bg-surface-highlight px-4 py-3 rounded-xl border border-border flex-row justify-between items-center flex-1"
                            >
                                <View className="flex-row items-center">
                                    <ArrowUpDown size={16} color={isDark ? "#EAB308" : "#3B82F6"} />
                                    <Text className="text-text font-heading ml-2 text-sm">
                                        {language === 'fr' 
                                            ? sortOptions.find(o => o.key === sortBy)?.labelFr 
                                            : sortOptions.find(o => o.key === sortBy)?.labelEn}
                                    </Text>
                                </View>
                                <ChevronDown size={16} color="#9CA3AF" className="ml-2" />
                            </Pressable>

                            <Pressable
                                onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="bg-surface-highlight w-12 items-center justify-center rounded-xl border border-border"
                            >
                                {sortOrder === 'desc' ? (
                                    <ArrowDown size={20} color={isDark ? "#EAB308" : "#3B82F6"} />
                                ) : (
                                    <ArrowUp size={20} color={isDark ? "#EAB308" : "#3B82F6"} />
                                )}
                            </Pressable>
                        </View>

                        {/* Sort Dropdown Modal */}
                            <Modal visible={showSortDropdown} transparent animationType="fade">
                                <Pressable 
                                    className="flex-1 bg-black/50 justify-center items-center"
                                    onPress={() => setShowSortDropdown(false)}
                                >
                                    <View className="bg-surface rounded-2xl w-[75%] overflow-hidden">
                                        <View className="p-4 border-b border-border">
                                            <Text className="text-text font-heading text-lg text-center">
                                                {language === 'fr' ? 'Trier par' : 'Sort by'}
                                            </Text>
                                        </View>
                                        {sortOptions.map((option) => (
                                            <Pressable
                                                key={option.key}
                                                onPress={() => {
                                                    setSortBy(option.key)
                                                    setShowSortDropdown(false)
                                                }}
                                                className={`p-4 flex-row items-center justify-between border-b border-border/50 ${sortBy === option.key ? 'bg-primary/10' : ''}`}
                                            >
                                                <Text className={`font-heading ${sortBy === option.key ? 'text-primary-dark' : 'text-text'}`}>
                                                    {language === 'fr' ? option.labelFr : option.labelEn}
                                                </Text>
                                                {sortBy === option.key && (
                                                    <Check size={20} color="#EAB308" />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                </Pressable>
                            </Modal>

                        <FlatList
                            data={sortedLogs}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setEditingLog(item)
                                        setModalVisible(true)
                                    }}
                                    style={[styles.logItem, isDark && styles.logItemDark]}
                                >
                                    <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${item.type === 'periodic' ? 'bg-blue-500/10' : item.type === 'repair' ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                                        {item.type === 'periodic' && <Calendar size={24} color='#3B82F6' />}
                                        {item.type === 'repair' && <Wrench size={24} color='#EF4444' />}
                                        {item.type === 'modification' && <FlaskConical size={24} color='#A855F7' />}
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-text font-heading text-lg flex-1 mr-2">{item.title}</Text>
                                            <Text className="text-primary-dark font-heading text-lg">{item.cost} €</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <Text className="text-text-secondary font-body text-sm">{item.date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</Text>
                                                <Text className="text-text-secondary font-body text-sm font-medium">{item.mileageAtLog.toLocaleString()} km</Text>
                                            </View>
                                            <View className="bg-surface-highlight px-2 py-0.5 rounded border border-border/50">
                                                <Text className="text-[10px] font-heading text-text-secondary uppercase">{t(`maintenance.type.${item.type}`)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-20 px-10">
                                    <View className="bg-surface-highlight w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm">
                                        <FileText size={40} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-text font-heading text-xl text-center mb-2">{t('maintenance.no_logs')}</Text>
                                    <Text className="text-text-secondary font-body text-center text-lg">{t('maintenance.no_logs_desc')}</Text>
                                </View>
                            }
                        />
                    </>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-text-secondary mb-6 text-lg">{t('maintenance.select_bike_desc_full')}</Text>
                        {vehicles.map(v => (
                            <Pressable
                                key={v.id}
                                onPress={() => setSelectedVehicleId(v.id)}
                                style={[styles.vehicleCard, isDark && styles.vehicleCardDark]}
                            >
                                <View className="bg-primary/10 w-14 h-14 rounded-full items-center justify-center mr-4">
                                    <Bike size={30} color="#EAB308" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-text font-heading text-xl">{v.brand} {v.model}</Text>
                                    <Text className="text-text-secondary font-body text-sm">{v.year} • {v.currentMileage.toLocaleString()} km</Text>
                                </View>
                                <ChevronRight size={24} color="#9CA3AF" />
                            </Pressable>
                        ))}
                        {vehicles.length === 0 && (
                            <View className="items-center justify-center py-20">
                                <Bike size={60} color="#9CA3AF" />
                                <Text className="text-text-secondary font-body mt-4 text-center">{t('garage.no_vehicles')}</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                <MaintenanceModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false)
                        setEditingLog(null)
                    }}
                    log={editingLog}
                    vehicles={vehicles}
                />
            </View>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    logs: MaintenanceService.observeAllLogs(),
    vehicles: VehicleService.observeVehicles(),
}))

export default enhance(MaintenanceScreen)
