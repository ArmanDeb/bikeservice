import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView, StatusBar, StyleSheet, Pressable, Platform } from 'react-native'
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
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
import { BrandLogo } from '../../src/components/common/BrandLogo'
import { ModalInput } from '../../src/components/common/ModalInput'
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal'
import { LoadingModal } from '../../src/components/common/LoadingModal'
import MaintenanceLogItem from '../../src/components/maintenance/MaintenanceLogItem'
import MaintenanceDetailModal from '../../src/components/maintenance/MaintenanceDetailModal'

// Styles definition
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 28, 30, 0.8)', // Darker overlay for better focus
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: '#D6D5D0', // Darker border
        // maxHeight constraint removed to allow scrolling
        // maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 }, // Deeper shadow for modal
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    modalContentDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    aiScanButton: {
        backgroundColor: 'rgba(74, 74, 69, 0.1)', // Stone tint
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1C1C1E', // Black border for visibility
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiScanButtonDark: {
        backgroundColor: 'rgba(229, 229, 224, 0.1)',
        borderColor: '#FFFFFF', // White border for visibility
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // White background
        borderColor: '#D6D5D0',
    },
    typeButtonDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    typeButtonSelected: {
        backgroundColor: '#4A4A45', // Dark Stone
        borderColor: '#4A4A45',
        shadowColor: 'transparent',
    },
    submitButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#BA4444',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    cancelButton: {
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    // Screen Styles
    iconButton: {
        padding: 0,
        borderRadius: 14,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    iconButtonSurfaceLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
    },
    iconButtonSurfaceDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    backButton: {
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        marginRight: 12,
    },
    backButtonDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    logItem: {
        marginBottom: 16,
    },
    // Removed duplicate logItem styles as they are now in the component
    vehicleCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    vehicleCardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowOpacity: 0.2,
    },
    vehicleSelect: {
        backgroundColor: '#F5F5F0',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleSelectDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    datePicker: {
        backgroundColor: '#F5F5F0',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    input: {
        backgroundColor: '#FDFCF8',
        color: '#1C1C1E',
        padding: 16,
        borderRadius: 14,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        fontFamily: 'WorkSans_400Regular',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputDark: {
        backgroundColor: '#1C1C1E',
        color: '#E5E5E0',
        borderColor: '#3A3A3C',
    },
    sortDropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '75%',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    sortDropdownDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
    },
    headerTitleDark: {
        color: '#E5E5E0',
    },
    vehicleIndicator: {
        backgroundColor: '#F5F5F0', // Light Stone
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E6E5E0'
    },
    sortModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28,28,30,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputRowContainer: {
        backgroundColor: '#FDFCF8',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    inputRowContainerDark: {
        backgroundColor: '#1C1C1E',
        borderColor: '#3A3A3C',
    },
    inputInside: {
        flex: 1,
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
        color: '#1C1C1E',
        paddingVertical: 16,
    },
    inputInsideDark: {
        color: '#E5E5E0',
    },
    suffixText: {
        fontFamily: 'WorkSans_500Medium',
        fontSize: 16,
        color: '#666660',
        marginLeft: 4,
    },
    suffixTextDark: {
        color: '#9CA3AF',
    },
    logIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    // Removed duplicate logTag styles as they are now in the component
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        backgroundColor: '#F5F5F0',
        width: 80,
        height: 80,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyIconContainerDark: {
        backgroundColor: '#3A3A3C',
    },
    sortButton: {
        backgroundColor: '#F5F5F0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sortButtonDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    sortIconContainer: {
        backgroundColor: '#F5F5F0',
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    sortIconContainerDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    sortOption: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E6E5E0',
    },
    sortOptionDark: {
        borderBottomColor: '#3A3A3C',
    },
    sortOptionActive: {
        backgroundColor: 'rgba(74, 74, 69, 0.05)',
    },
    dateControlButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    dateControlButtonLight: {
        backgroundColor: '#F5F5F0',
        borderColor: '#E6E5E0',
    },
    dateControlButtonDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
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
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>()
    const [alertOnSecondary, setAlertOnSecondary] = useState<(() => void) | undefined>()
    const [alertConfirmText, setAlertConfirmText] = useState<string | undefined>()
    const [alertSecondaryText, setAlertSecondaryText] = useState<string | undefined>()
    const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default')

    // Initialize vehicleId when modal opens or selectedVehicleId changes
    useEffect(() => {
        if (visible) {
            if (log) {
                // For edit mode, use the log's vehicle
                setVehicleId(log.vehicleId)
                setTitle(log.title)
                setCost(log.cost.toString())
                setMileageAtLog(log.mileageAtLog?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || '')
                setNotes(log.notes || '')
                setType(log.type as 'periodic' | 'repair' | 'modification')
                setDate(new Date(log.date))
            } else {
                // For new log, use selectedVehicleId or first vehicle
                setVehicleId(selectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : ''))
                setTitle('')
                setCost('')
                setMileageAtLog('')
                setNotes('')
                setType('periodic')
                setDate(new Date())
                setNotes('')
                setType('periodic')
                setDate(new Date())
                setScannedDocumentUri(null)
                setErrors({})
            }
        }
    }, [visible, log, selectedVehicleId, vehicles])

    const showAlert = (
        title: string,
        message: string,
        options?: {
            onConfirm?: () => void;
            onSecondary?: () => void;
            confirmText?: string;
            secondaryText?: string;
            variant?: 'default' | 'danger';
        }
    ) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOnConfirm(() => options?.onConfirm || (() => setAlertVisible(false)))
        setAlertOnSecondary(() => options?.onSecondary)
        setAlertConfirmText(options?.confirmText)
        setAlertSecondaryText(options?.secondaryText)
        setAlertVariant(options?.variant || 'default')
        setAlertVisible(true)
    }

    const performAIScan = async (source: 'camera' | 'library') => {
        const { status } = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== 'granted') {
            showAlert(t('alert.error'), 'Permission to access ' + (source === 'camera' ? 'camera' : 'gallery') + ' was denied')
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
                if (data.mileage) setMileageAtLog(data.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
                if (data.date) setDate(data.date)

                // Store document URI for later - will be linked to the log when form is submitted
                setScannedDocumentUri(result.assets[0].uri)

                showAlert(t('maintenance.alert.ia_success'), t('maintenance.alert.ia_success_desc'))
            } catch (err: any) {
                showAlert(t('maintenance.alert.ia_error'), t('maintenance.alert.ia_error_desc'))
            } finally {
                setIsScanning(false)
            }
        }
    }

    const handleAIScanOptions = () => {
        showAlert(
            t('maintenance.assistant_ia'),
            language === 'fr' ? 'Choisissez une source pour l\'analyse' : 'Choose a source for analysis',
            {
                confirmText: language === 'fr' ? 'Galerie Photo' : 'Gallery',
                onConfirm: () => {
                    setAlertVisible(false)
                    performAIScan('library')
                },
                secondaryText: language === 'fr' ? 'Appareil Photo' : 'Camera',
                onSecondary: () => {
                    setAlertVisible(false)
                    performAIScan('camera')
                }
            }
        )
    }

    const handleSubmit = async () => {
        if (submitting) return

        const newErrors: { [key: string]: boolean } = {}
        if (!title) newErrors.title = true
        if (!cost) newErrors.cost = true
        if (!mileageAtLog) newErrors.mileageAtLog = true
        if (!vehicleId) newErrors.vehicleId = true // Only check vehicle check if likely to be empty, though it usually defaults

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const selectedVehicle = vehicles.find(v => v.id === vehicleId)
        if (!selectedVehicle) {
            showAlert(t('alert.error'), 'Vehicle not found')
            return
        }

        setSubmitting(true)

        try {
            if (log) {
                // updateLog: (log, title, type, cost, date, notes?, mileageAtLog?)
                await MaintenanceService.updateLog(log, title, type, parseFloat(cost), date, notes || undefined, parseInt(mileageAtLog.replace(/\./g, '')))
            } else {
                // createLog: (vehicle, title, type, cost, mileageAtLog, date, notes?, documentUri?)
                // Pass the scanned document URI so it gets linked to this maintenance log
                await MaintenanceService.createLog(selectedVehicle, title, type, parseFloat(cost), parseInt(mileageAtLog.replace(/\./g, '')), date, notes || undefined, scannedDocumentUri ? [scannedDocumentUri] : undefined)
            }
            onClose()
        } catch (error: any) {
            console.error('Error submitting log:', error)
            showAlert(t('alert.error'), 'Failed to save maintenance log')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingTop: '15%' }}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={120}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={{
                                    fontSize: 24,
                                    fontFamily: 'Outfit_700Bold',
                                    color: isDark ? '#FDFCF8' : '#1C1C1E',
                                    flex: 1,
                                    marginRight: 8
                                }}>
                                {log ? t('maintenance.modal.edit_title') : t('maintenance.modal.add_title')}
                            </Text>
                            <Pressable
                                onPress={handleAIScanOptions}
                                disabled={isScanning}
                                style={[styles.aiScanButton, isDark && styles.aiScanButtonDark]}
                            >
                                <Scan size={20} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                <Text style={{ color: isDark ? '#E5E5E0' : '#4A4A45', fontFamily: 'Outfit_700Bold', marginLeft: 6, fontSize: 13 }}>
                                    {language === 'fr' ? 'Scanner' : 'Scan'}
                                </Text>
                            </Pressable>
                        </View>


                        {/* Selected Vehicle Display (ReadOnly) */}
                        {!log && (
                            <View style={{ marginBottom: 16 }}>
                                <View style={[
                                    styles.vehicleSelect,
                                    isDark && styles.vehicleSelectDark,
                                    { opacity: 0.8 },
                                    errors.vehicleId && { borderColor: '#EF4444', borderWidth: 1 }
                                ]}>
                                    {vehicleId ? (
                                        <BrandLogo
                                            brand={vehicles.find(v => v.id === vehicleId)?.brand || ''}
                                            variant="icon"
                                            size={24}
                                            color={isDark ? "#E5E5E0" : "#4A4A45"}
                                        />
                                    ) : (
                                        <Bike size={24} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                    )}
                                    <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', marginLeft: 12 }}>
                                        {vehicleId
                                            ? (vehicles.find(v => v.id === vehicleId)?.brand + ' ' + vehicles.find(v => v.id === vehicleId)?.model + ' ')
                                            : (language === 'fr' ? 'Sélectionner un véhicule' : 'Select a vehicle')}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Type Picker */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
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
                                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, textTransform: 'uppercase', color: type === tType ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#666660') }}>
                                        {t('maintenance.type.' + tType)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Date Picker */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontSize: 12, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 }}>
                                {language === 'fr' ? 'Date de l\'intervention' : 'Service date'}
                            </Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                style={[styles.datePicker, isDark && styles.datePickerDark]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Calendar size={20} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                    <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', marginLeft: 12 }}>
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
                                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Pressable
                                        style={{
                                            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                                            borderRadius: 16,
                                            width: '85%',
                                            overflow: 'hidden',
                                            borderWidth: 1,
                                            borderColor: isDark ? '#3A3A3C' : '#E6E5E0'
                                        }}
                                        onPress={(e) => e.stopPropagation()}
                                    >
                                        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#3A3A3C' : '#E6E5E0' }}>
                                            <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 18, textAlign: 'center' }}>
                                                {language === 'fr' ? 'Choisir la date' : 'Choose date'}
                                            </Text>
                                        </View>

                                        <View style={{ padding: 24 }}>
                                            {/* Quick date buttons */}
                                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                                                <Pressable
                                                    onPress={() => setDate(new Date())}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: 'rgba(74, 74, 69, 0.1)',
                                                        padding: 12,
                                                        borderRadius: 12,
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Text style={{ color: '#4A4A45', fontFamily: 'Outfit_700Bold', fontSize: 14 }}>
                                                        {language === 'fr' ? "Aujourd'hui" : 'Today'}
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => {
                                                        const yesterday = new Date()
                                                        yesterday.setDate(yesterday.getDate() - 1)
                                                        setDate(yesterday)
                                                    }}
                                                    style={[styles.typeButton, isDark && styles.typeButtonDark, { flex: 1 }]}
                                                >
                                                    <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 14 }}>
                                                        {language === 'fr' ? 'Hier' : 'Yesterday'}
                                                    </Text>
                                                </Pressable>
                                            </View>

                                            {/* Date display */}
                                            <View style={[styles.vehicleSelect, isDark && styles.vehicleSelectDark, { justifyContent: 'center', marginBottom: 24 }]}>
                                                <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20 }}>
                                                    {date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </Text>
                                            </View>

                                            {/* Day/Month/Year adjusters */}
                                            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}>
                                                {/* Day */}
                                                <View style={{ alignItems: 'center' }}>
                                                    <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontSize: 12, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Outfit_700Bold' }}>
                                                        {language === 'fr' ? 'Jour' : 'Day'}
                                                    </Text>
                                                    <View style={{ alignItems: 'center', gap: 8 }}>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setDate(newDate.getDate() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Plus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                        <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20, height: 28, textAlign: 'center' }}>
                                                            {date.getDate()}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setDate(newDate.getDate() - 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Minus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {/* Month */}
                                                <View style={{ alignItems: 'center', flex: 1 }}>
                                                    <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontSize: 12, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Outfit_700Bold' }}>
                                                        {language === 'fr' ? 'Mois' : 'Month'}
                                                    </Text>
                                                    <View style={{ alignItems: 'center', gap: 8 }}>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setMonth(newDate.getMonth() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Plus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                        <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20, height: 28, textAlign: 'center' }}>
                                                            {date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setMonth(newDate.getMonth() - 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Minus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {/* Year */}
                                                <View style={{ alignItems: 'center' }}>
                                                    <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontSize: 12, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Outfit_700Bold' }}>
                                                        {language === 'fr' ? 'Année' : 'Year'}
                                                    </Text>
                                                    <View style={{ alignItems: 'center', gap: 8 }}>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setFullYear(newDate.getFullYear() + 1)
                                                                if (newDate <= new Date()) setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Plus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                        <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20, height: 28, textAlign: 'center' }}>
                                                            {date.getFullYear()}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                const newDate = new Date(date)
                                                                newDate.setFullYear(newDate.getFullYear() - 1)
                                                                setDate(newDate)
                                                            }}
                                                            style={[styles.dateControlButton, isDark ? styles.dateControlButtonDark : styles.dateControlButtonLight]}
                                                        >
                                                            <Minus size={20} color={isDark ? '#E5E5E0' : '#4A4A45'} />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: isDark ? '#3A3A3C' : '#E6E5E0' }}>
                                            <Pressable
                                                onPress={() => setShowDatePicker(false)}
                                                style={{ backgroundColor: '#4A4A45', padding: 16, borderRadius: 12, alignItems: 'center' }}
                                            >
                                                <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 18 }}>OK</Text>
                                            </Pressable>
                                        </View>
                                    </Pressable>
                                </Pressable>
                            </Modal>
                        </View>


                        <ModalInput
                            label={t('maintenance.field.title')}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text)
                                if (errors.title) setErrors({ ...errors, title: false })
                            }}
                            placeholder={t('maintenance.field.title')}
                            error={errors.title}
                        />

                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <ModalInput
                                label={t('maintenance.field.cost')}
                                value={cost}
                                onChangeText={(text) => {
                                    setCost(text)
                                    if (errors.cost) setErrors({ ...errors, cost: false })
                                }}
                                placeholder="0"
                                keyboardType="numeric"
                                containerStyle={{ flex: 1 }}
                                error={errors.cost}
                            />

                            <ModalInput
                                label={t('maintenance.field.mileage') + ' (km)'}
                                value={mileageAtLog}
                                onChangeText={(text) => {
                                    // Remove non-numeric characters first
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    // Format with dots
                                    const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    setMileageAtLog(formatted);
                                    if (errors.mileageAtLog) setErrors({ ...errors, mileageAtLog: false })
                                }}
                                formatValue={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                }}
                                placeholder="0"
                                keyboardType="numeric"
                                containerStyle={{ flex: 1 }}
                                error={errors.mileageAtLog}
                            />
                        </View>

                        <ModalInput
                            label={t('maintenance.field.notes')}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder={t('maintenance.field.notes')}
                            multiline={true}
                        />

                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting}
                            style={[
                                styles.submitButton,
                                submitting && { opacity: 0.7 }
                            ]}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 18 }}>
                                    {log ? t('maintenance.modal.submit_edit') : t('maintenance.modal.submit_add')}
                                </Text>
                            )}
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
                                        showAlert(
                                            t('maintenance.modal.delete_confirm_title'),
                                            language === 'fr'
                                                ? 'Cet entretien a un document lié (facture). Voulez-vous aussi supprimer le document du portefeuille ?'
                                                : 'This maintenance log has a linked document (invoice). Do you also want to delete the document from your wallet?',
                                            {
                                                secondaryText: language === 'fr' ? 'Garder le document' : 'Keep document',
                                                onSecondary: async () => {
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
                                                    setAlertVisible(false)
                                                    onClose()
                                                },
                                                confirmText: language === 'fr' ? 'Tout supprimer' : 'Delete all',
                                                variant: 'danger',
                                                onConfirm: async () => {
                                                    await MaintenanceService.deleteLog(log)
                                                    setAlertVisible(false)
                                                    onClose()
                                                }
                                            }
                                        )
                                    } else {
                                        // No linked document, simple confirmation
                                        showAlert(
                                            t('maintenance.modal.delete_confirm_title'),
                                            t('maintenance.modal.delete_confirm_desc'),
                                            {
                                                confirmText: t('common.delete'),
                                                variant: 'danger',
                                                onConfirm: async () => {
                                                    await MaintenanceService.deleteLog(log)
                                                    setAlertVisible(false)
                                                    onClose()
                                                }
                                            }
                                        )
                                    }
                                }}
                                style={styles.deleteButton}
                            >
                                <Text style={{ color: '#BA4444', fontFamily: 'Outfit_700Bold', fontSize: 18 }}>{t('maintenance.modal.delete')}</Text>
                            </Pressable>
                        )}

                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_500Medium', fontSize: 16, fontWeight: '500' }}>{t('common.cancel')}</Text>
                        </Pressable>

                    </Pressable>
                </KeyboardAwareScrollView>
            </Pressable>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onSecondary={alertOnSecondary}
                onCancel={() => setAlertVisible(false)}
                confirmText={alertConfirmText || t('common.ok')}
                secondaryText={alertSecondaryText}
                variant={alertVariant}
            />

            <LoadingModal
                visible={isScanning}
                message={language === 'fr' ? 'Analyse de votre facture...' : 'Analyzing your invoice...'}
            />
        </Modal>
    )
}

const MaintenanceScreen = ({ logs, vehicles }: { logs: MaintenanceLog[], vehicles: Vehicle[] }) => {
    const router = useRouter()
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [modalVisible, setModalVisible] = useState(false)
    const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null)
    const [viewingLog, setViewingLog] = useState<MaintenanceLog | null>(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)
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

    const handleLogPress = (log: MaintenanceLog) => {
        setViewingLog(log)
        setDetailModalVisible(true)
    }

    const handleDeleteLogConfirm = async () => {
        if (!viewingLog) return

        try {
            await MaintenanceService.deleteLog(viewingLog)
            setDetailModalVisible(false)
            setViewingLog(null)
        } catch (error) {
            console.error('Error deleting log:', error)
            Alert.alert(t('alert.error'), 'Failed to delete maintenance log')
        }
    }

    const renderItem = ({ item }: { item: MaintenanceLog }) => (
        <MaintenanceLogItem
            log={item}
            onPress={() => handleLogPress(item)}
        />
    )

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={{ flex: 1, padding: 24 }}>
                {/* Header Contextuel */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
                        {selectedVehicleId ? t('maintenance.title') : t('maintenance.select_bike_title')}
                    </Text>
                    <Pressable
                        onPress={() => {
                            if (!selectedVehicleId) {
                                Alert.alert(
                                    language === 'fr' ? "Aucune moto sélectionnée" : "No moto is selected",
                                    language === 'fr' ? "Veuillez en sélectionner une dans votre garage" : "Please select one from your garage",
                                    [
                                        { text: language === 'fr' ? "Annuler" : "Cancel", style: "cancel" },
                                        {
                                            text: language === 'fr' ? "Aller au garage" : "Go to garage",
                                            onPress: () => router.push('/(tabs)') // Navigate to Garage tab
                                        }
                                    ]
                                )
                                return
                            }
                            setModalVisible(true)
                        }}
                        style={[
                            styles.iconButton,
                            isDark ? styles.iconButtonSurfaceDark : styles.iconButtonSurfaceLight
                        ]}
                    >
                        <Plus size={24} color="#F97316" />
                    </Pressable>
                </View>

                {selectedVehicleId ? (
                    (() => {
                        const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);
                        return (
                            <>
                                {/* Vehicle Indicator (Dashboard Style) */}
                                <View style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                                    <View style={[styles.vehicleIndicator, isDark && { backgroundColor: '#FDFCF8' }, { gap: 8 }]}>
                                        {activeVehicle && (
                                            <BrandLogo
                                                brand={activeVehicle.brand}
                                                variant="icon"
                                                size={20}
                                                color={isDark ? '#1C1C1E' : '#1C1C1E'}
                                            />
                                        )}
                                        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: isDark ? '#1C1C1E' : '#1C1C1E' }}>
                                            {activeVehicle ? (activeVehicle.brand + ' ' + activeVehicle.model) : (language === 'fr' ? 'Tous les véhicules' : 'All Vehicles')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Sort Controls */}
                                <View style={{ marginBottom: 16, flexDirection: 'row', gap: 8 }}>
                                    <Pressable
                                        onPress={() => setShowSortDropdown(true)}
                                        style={[styles.sortButton, isDark && styles.sortButtonDark, { flex: 1 }]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ArrowUpDown size={16} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                            <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', marginLeft: 8, fontSize: 14 }}>
                                                {language === 'fr'
                                                    ? sortOptions.find(o => o.key === sortBy)?.labelFr
                                                    : sortOptions.find(o => o.key === sortBy)?.labelEn}
                                            </Text>
                                        </View>
                                        <ChevronDown size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                                    </Pressable>

                                    <Pressable
                                        onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                        style={[styles.sortIconContainer, isDark && styles.sortIconContainerDark]}
                                    >
                                        {sortOrder === 'desc' ? (
                                            <ArrowDown size={20} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                        ) : (
                                            <ArrowUp size={20} color={isDark ? "#E5E5E0" : "#4A4A45"} />
                                        )}
                                    </Pressable>
                                </View>

                                {/* Sort Dropdown Modal */}
                                <Modal visible={showSortDropdown} transparent animationType="fade">
                                    <Pressable
                                        style={styles.sortModalOverlay}
                                        onPress={() => setShowSortDropdown(false)}
                                    >
                                        <View style={[styles.sortDropdown, isDark && styles.sortDropdownDark]}>
                                            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#3A3A3C' : '#E6E5E0' }}>
                                                <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 18, textAlign: 'center' }}>
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
                                                    style={[styles.sortOption, isDark && styles.sortOptionDark, sortBy === option.key && styles.sortOptionActive]}
                                                >
                                                    <Text style={{ fontFamily: 'Outfit_700Bold', color: sortBy === option.key ? '#4A4A45' : (isDark ? '#FDFCF8' : '#1C1C1E') }}>
                                                        {language === 'fr' ? option.labelFr : option.labelEn}
                                                    </Text>
                                                    {sortBy === option.key && (
                                                        <Check size={20} color="#E5E5E0" />
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
                                    renderItem={renderItem}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <View style={[styles.emptyIconContainer, isDark && styles.emptyIconContainerDark]}>
                                                <FileText size={40} color="#9CA3AF" />
                                            </View>
                                            <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20, textAlign: 'center', marginBottom: 8 }}>{t('maintenance.no_logs')}</Text>
                                            <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_400Regular', fontSize: 18, textAlign: 'center' }}>{t('maintenance.no_logs_desc')}</Text>
                                        </View>
                                    }
                                />
                            </>
                        );
                    })()
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={{ color: isDark ? '#9CA3AF' : '#666660', marginBottom: 24, fontSize: 18, fontFamily: 'WorkSans_400Regular' }}>{t('maintenance.select_bike_desc_full')}</Text>
                        {vehicles.map(v => (
                            <Pressable
                                key={v.id}
                                onPress={() => setSelectedVehicleId(v.id)}
                                style={[styles.vehicleCard, isDark && styles.vehicleCardDark]}
                            >
                                <View style={{ backgroundColor: isDark ? 'rgba(253, 252, 248, 0.1)' : 'rgba(74, 74, 69, 0.1)', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                    <BrandLogo brand={v.brand} variant="icon" size={30} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 20 }}>{v.brand} {v.model}</Text>
                                    <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_400Regular', fontSize: 14 }}>{v.year} • {v.currentMileage.toLocaleString()} km</Text>
                                </View>
                                <ChevronRight size={24} color="#9CA3AF" />
                            </Pressable>
                        ))}
                        {vehicles.length === 0 && (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                                <Bike size={60} color="#9CA3AF" />
                                <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_400Regular', marginTop: 16, textAlign: 'center', fontSize: 16 }}>{t('garage.no_vehicles')}</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Maintenance Detail Modal */}
                <MaintenanceDetailModal
                    visible={detailModalVisible}
                    onClose={() => setDetailModalVisible(false)}
                    log={viewingLog}
                    onEdit={() => {
                        setDetailModalVisible(false)
                        setEditingLog(viewingLog)
                        setModalVisible(true)
                    }}
                    onDelete={() => {
                        Alert.alert(
                            t('alert.confirm'),
                            t('maintenance.alert.delete_confirm'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                {
                                    text: t('common.delete'),
                                    style: 'destructive',
                                    onPress: handleDeleteLogConfirm
                                }
                            ]
                        )
                    }}
                />

                {/* Maintenance Add/Edit Modal */}
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
