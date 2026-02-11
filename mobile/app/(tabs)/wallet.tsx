import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Image, Alert, ScrollView, StatusBar, StyleSheet, Pressable, Platform } from 'react-native'
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import * as ImagePicker from 'expo-image-picker'
import ImageViewing from 'react-native-image-viewing'
import { DocumentService } from '../../src/services/DocumentService'
import { StorageService } from '../../src/services/StorageService'
import * as FileSystem from 'expo-file-system/legacy'
import Document from '../../src/database/models/Document'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { Camera, FileText, ChevronRight, ChevronLeft, Bike, FolderOpen, X, Plus, Pencil } from 'lucide-react-native'
import { useVehicle } from '../../src/context/VehicleContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import { BrandLogo } from '../../src/components/common/BrandLogo'
import { ModalInput } from '../../src/components/common/ModalInput'
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal'
import { SmartImage } from '../../src/components/SmartImage'

// Styles definition
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 32,
        color: '#1C1C1E',
    },
    titleDark: {
        color: '#FDFCF8',
    },
    // Modal Overlay
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(28, 28, 30, 0.8)', // Darker overlay
    },
    modalContent: {
        borderTopWidth: 1,
        borderTopColor: '#D6D5D0',
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        // maxHeight constraint removed
        // maxHeight: '90%',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 }, // Deeper shadow
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    modalContentDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        borderTopColor: '#3A3A3C',
    },
    // Vehicle Selection in Modal
    vehicleSelector: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FFFFFF', // White background
        borderColor: '#D6D5D0',
    },
    vehicleSelectorDark: {
        backgroundColor: '#323234',
        borderColor: '#3A3A3C',
    },
    // Inputs
    input: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        backgroundColor: '#FFFFFF', // White background
        borderColor: '#D6D5D0',
        fontFamily: 'WorkSans_400Regular',
        color: '#1C1C1E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputDark: {
        backgroundColor: '#323234',
        color: '#F8FAFC',
        borderColor: '#3A3A3C',
    },
    // Buttons
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        borderColor: '#D6D5D0',
        marginRight: 8,
        marginBottom: 8,
    },
    typeButtonDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    typeButtonSelected: {
        backgroundColor: '#1C1C1E', // Dark Stone
        borderColor: '#1C1C1E',
    },
    typeButtonSelectedDark: {
        backgroundColor: '#FDFCF8',
        borderColor: '#FDFCF8',
    },
    typeText: {
        fontFamily: 'WorkSans_500Medium',
        fontSize: 14,
        color: '#666660',
    },
    typeTextDark: {
        color: '#9CA3AF',
    },
    typeTextSelected: {
        color: '#FFFFFF',
    },
    typeTextSelectedDark: {
        color: '#1C1C1E',
    },

    cameraButton: {
        backgroundColor: '#F5F5F0',
        borderWidth: 1,
        borderColor: '#D6D5D0',
        borderStyle: 'dashed',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    cameraButtonDark: {
        backgroundColor: '#323234',
        borderColor: '#3A3A3C',
    },
    submitButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitButtonDark: {
        backgroundColor: '#FDFCF8',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
    },
    submitButtonTextDark: {
        color: '#1C1C1E',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#BA4444',
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
        backgroundColor: '#1C1C1E',
        padding: 8,
        borderRadius: 12,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonDark: {
        backgroundColor: '#FDFCF8',
    },

    docItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Added shadow
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    docItemDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowOpacity: 0.2, // Kept existing shadow opacity for dark mode logic if any
    },
    docIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#F5F5F0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    docIconContainerDark: {
        backgroundColor: '#3A3A3C',
    },
    vehicleCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Added shadow
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    vehicleCardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowOpacity: 0.2,
    },
    vehicleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        backgroundColor: '#F5F5F0',
    },
    vehicleIconContainerDark: {
        backgroundColor: '#3A3A3C',
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
    vehicleIndicatorDark: {
        backgroundColor: '#FDFCF8',
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    previewCloseButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 9999,
    },
    // No documents state
    emptyStateIcon: {
        backgroundColor: '#F5F5F0',
        padding: 24,
        borderRadius: 9999,
        marginBottom: 24,
    },
    emptyStateIconDark: {
        backgroundColor: '#2C2C2E',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#9CA3AF',
    },
});

// Document Modal Component
const DocumentModal = ({ visible, onClose, onPreview, document, vehicles, documents }: { visible: boolean, onClose: () => void, onPreview: (uri: string) => void, document?: Document | null, vehicles: Vehicle[], documents: Document[] }) => {
    const { selectedVehicleId } = useVehicle()
    const { t, language } = useLanguage()
    const { isDark } = useTheme()
    const [title, setTitle] = useState('')
    const [type, setType] = useState<'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other'>('invoice')
    const [expiryDate, setExpiryDate] = useState('')
    const [localUri, setLocalUri] = useState<string | null>(null)
    const [vehicleId, setVehicleId] = useState('')

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>()
    const [alertConfirmText, setAlertConfirmText] = useState<string | undefined>()
    const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default')

    const showAlert = (
        title: string,
        message: string,
        options?: {
            onConfirm?: () => void;
            confirmText?: string;
            variant?: 'default' | 'danger';
        }
    ) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOnConfirm(() => options?.onConfirm || (() => setAlertVisible(false)))
        setAlertConfirmText(options?.confirmText)
        setAlertVariant(options?.variant || 'default')
        setAlertVisible(true)
    }

    React.useEffect(() => {
        if (visible) {
            if (document) {
                setTitle(document.reference || '')
                setType(document.type)
                setExpiryDate(document.expiryDate ? document.expiryDate.toISOString().split('T')[0] : '')
                setLocalUri(document.localUri || null)
                setVehicleId(document.vehicleId || '')
            } else {
                setTitle('')
                setType('invoice')
                setExpiryDate('')
                setLocalUri(null)
                setVehicleId(selectedVehicleId || (vehicles.length > 0 ? vehicles[0].id : ''))
            }
        }
    }, [visible, document, selectedVehicleId, vehicles])

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        })

        if (!result.canceled && result.assets[0].uri) {
            setLocalUri(result.assets[0].uri)
        }
    }

    const handleSubmit = async () => {
        if (!title || !vehicleId) {
            showAlert(t('alert.error'), 'Title and Vehicle are required')
            return
        }

        const expiry = expiryDate ? new Date(expiryDate) : null

        if (document) {
            await DocumentService.updateDocument(document, title, expiry, localUri, type)
        } else {
            await DocumentService.createDocument(title, type, expiry, localUri, vehicleId)
        }
        onClose()
    }

    const docTypes = [
        { id: 'registration', label: t('wallet.type.registration') },
        { id: 'license', label: t('wallet.type.license') },
        { id: 'insurance', label: t('wallet.type.insurance') },
        { id: 'technical_control', label: t('wallet.type.technical_control') },
        { id: 'coc', label: t('wallet.type.coc') },
        { id: 'invoice', label: t('wallet.type.invoice') },
        { id: 'other', label: t('wallet.type.other') },
    ] as const

    // Filter available document types
    const uniqueTypes = ['registration', 'coc', 'license', 'technical_control', 'insurance'] // Added insurance/technical_control if we want them unique per year? No, maybe just registration/coc/license for now? 
    // Wait, license is per person usually, but here attached to a bike? Or generic? 
    // Let's stick to the plan: registration, coc, license.
    // Actually, insurance changes every year, technical control every 2 years. 
    // Registration and COC are lifetime (usually). License is user-bound but let's assume one main license doc.
    const ONE_TIME_DOCS = ['registration', 'coc', 'license']

    const availableDocTypes = React.useMemo(() => {
        if (!vehicleId) return docTypes

        // If we are editing, we should definitely show the current document's type even if it's unique
        const currentType = document?.type

        const existingTypesForVehicle = documents
            .filter(d => d.vehicleId === vehicleId)
            .map(d => d.type)

        return docTypes.filter(dt => {
            // Always show the type of the document being edited
            if (currentType === dt.id) return true

            // If it's a one-time doc and already exists, hide it
            if (ONE_TIME_DOCS.includes(dt.id) && existingTypesForVehicle.includes(dt.id)) {
                return false
            }
            return true
        })
    }, [vehicleId, documents, document])

    const vehicleSelectorStyle = isDark ? styles.vehicleSelectorDark : styles.vehicleSelector
    const inputStyle = isDark ? styles.inputDark : styles.input

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
                        <Text style={[styles.title, isDark && styles.titleDark, { fontSize: 24, marginBottom: 24 }]}>
                            {document ? t('wallet.modal.edit_title') : t('wallet.modal.add_title')}
                        </Text>


                        <View style={{ marginBottom: 16 }}>
                            <View style={[styles.vehicleSelector, vehicleSelectorStyle]}>
                                {vehicleId ? (
                                    <BrandLogo
                                        brand={vehicles.find(v => v.id === vehicleId)?.brand || ''}
                                        variant="icon"
                                        size={24}
                                        color={isDark ? "#E5E5E0" : "#1C1C1E"}
                                    />
                                ) : (
                                    <Bike size={24} color={isDark ? "#E5E5E0" : "#1C1C1E"} />
                                )}
                                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 16, marginLeft: 12, color: isDark ? '#FDFCF8' : '#1C1C1E' }}>
                                    {vehicleId
                                        ? `${vehicles.find(v => v.id === vehicleId)?.brand} ${vehicles.find(v => v.id === vehicleId)?.model}`
                                        : (language === 'fr' ? 'Sélectionner un véhicule' : 'Select a vehicle')}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('wallet.modal.type')}</Text>
                        <View style={{ marginBottom: 24 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 24 }}
                            >
                                {availableDocTypes.map((dt) => (
                                    <Pressable
                                        key={dt.id}
                                        onPress={() => setType(dt.id as any)}
                                        style={[
                                            styles.typeButton,
                                            isDark && styles.typeButtonDark,
                                            type === dt.id && (isDark ? styles.typeButtonSelectedDark : styles.typeButtonSelected)
                                        ]}
                                    >
                                        <Text style={[
                                            styles.typeText,
                                            isDark && styles.typeTextDark,
                                            type === dt.id && (isDark ? styles.typeTextSelectedDark : styles.typeTextSelected)
                                        ]}>{dt.label}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <ModalInput
                            label={t('wallet.field.title')}
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t('wallet.field.title')}
                        />

                        <ModalInput
                            label={t('wallet.field.expiry')}
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                            placeholder="YYYY-MM-DD"
                        />

                        {/* Disable file modification in edit mode */}
                        {document && localUri ? (
                            <Pressable
                                onPress={() => onPreview(localUri)}
                                style={[styles.cameraButton, isDark && styles.cameraButtonDark, { opacity: 1, padding: 0, overflow: 'hidden' }]}
                            >
                                <SmartImage
                                    localUri={localUri}
                                    remotePath={document.remotePath}
                                    style={{ width: '100%', height: 250, borderRadius: 12 }}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        ) : !document && localUri ? (
                            <Pressable
                                onPress={() => onPreview(localUri)}
                                style={[styles.cameraButton, isDark && styles.cameraButtonDark, { opacity: 1, padding: 0, overflow: 'hidden' }]}
                            >
                                <Image source={{ uri: localUri }} style={{ width: '100%', height: 250, borderRadius: 12 }} resizeMode="contain" />
                            </Pressable>
                        ) : null}

                        {!document && !localUri && (
                            <Pressable
                                onPress={pickImage}
                                style={[styles.cameraButton, isDark && styles.cameraButtonDark]}
                            >
                                <Camera size={32} color="#9CA3AF" />
                                <Text style={{ fontFamily: 'WorkSans_400Regular', color: '#666660', marginTop: 8 }}>{t('wallet.field.attach_photo')}</Text>
                            </Pressable>
                        )}

                        <Pressable onPress={handleSubmit} style={[styles.submitButton, isDark && styles.submitButtonDark]}>
                            <Text style={[styles.submitButtonText, isDark && styles.submitButtonTextDark]}>
                                {document ? t('common.save') : t('wallet.modal.add_title')}
                            </Text>
                        </Pressable>

                        {document && (
                            <Pressable
                                onPress={() => {
                                    const isMaintenanceDoc = !!document.logId
                                    showAlert(
                                        t('wallet.modal.delete_confirm_title'),
                                        isMaintenanceDoc
                                            ? t('wallet.modal.delete_confirm_desc_maintenance')
                                            : t('wallet.modal.delete_confirm_desc'),
                                        {
                                            confirmText: t('common.delete'),
                                            variant: 'danger',
                                            onConfirm: async () => {
                                                await DocumentService.deleteDocument(document)
                                                setAlertVisible(false)
                                                onClose()
                                            }
                                        }
                                    )
                                }}
                                style={styles.deleteButton}
                            >
                                <Text style={{ fontFamily: 'Outfit_700Bold', color: '#BA4444', fontSize: 16 }}>{t('wallet.modal.delete')}</Text>
                            </Pressable>
                        )}

                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={{ fontFamily: 'WorkSans_500Medium', color: '#666660' }}>{t('common.cancel')}</Text>
                        </Pressable>

                    </Pressable>
                </KeyboardAwareScrollView>
            </Pressable>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onCancel={() => setAlertVisible(false)}
                confirmText={alertConfirmText || t('common.ok')}
                variant={alertVariant}
            />
        </Modal>
    )
}

const DocumentViewModal = ({ visible, onClose, onEdit, onPreview, document }: { visible: boolean, onClose: () => void, onEdit: () => void, onPreview: () => void, document: Document | null }) => {
    const { t, language } = useLanguage()
    const { isDark } = useTheme()

    if (!document) return null

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, isDark && styles.modalContentDark, { height: '80%' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Text style={[styles.title, isDark && styles.titleDark, { fontSize: 24, flex: 1, marginRight: 16 }]} numberOfLines={1}>
                            {document.reference || t('wallet.document.untitled')}
                        </Text>
                        <Pressable
                            onPress={onEdit}
                            style={[styles.addButton, isDark && styles.addButtonDark, { width: 44, height: 44, borderRadius: 12 }]}
                        >
                            <Pencil size={20} color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <Pressable onPress={onPreview} style={{ width: '100%', height: 400 }}>
                                <SmartImage
                                    localUri={document.localUri}
                                    remotePath={document.remotePath}
                                    style={{ width: '100%', height: '100%', borderRadius: 16, backgroundColor: isDark ? '#323234' : '#F5F5F0' }}
                                    resizeMode="contain"
                                    fallbackIconSize={48}
                                />
                            </Pressable>
                        </View>

                        <View style={{ gap: 20, paddingBottom: 40 }}>
                            <View>
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('wallet.modal.type')}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#323234' : '#F5F5F0', padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 16, color: isDark ? '#FDFCF8' : '#1C1C1E' }}>
                                        {t(`wallet.type.${document.type}`)}
                                    </Text>
                                </View>
                            </View>

                            {document.expiryDate && (
                                <View>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('wallet.field.expiry')}</Text>
                                    <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 18, color: '#BA4444' }}>
                                        {document.expiryDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <Pressable onPress={onClose} style={[styles.submitButton, isDark && styles.submitButtonDark, { backgroundColor: isDark ? '#323234' : '#F5F5F0', marginTop: 16 }]}>
                        <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 16, color: isDark ? '#FDFCF8' : '#1C1C1E' }}>{t('common.close')}</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

const WalletScreen = ({ documents, vehicles }: { documents: Document[], vehicles: Vehicle[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [modalVisible, setModalVisible] = useState(false)
    const [viewModalVisible, setViewModalVisible] = useState(false)
    const [editingDoc, setEditingDoc] = useState<Document | null>(null)
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // Reactive filtering: Show NOTHING if no vehicle is selected (Focus Mode)
    const filteredDocs = selectedVehicleId
        ? documents.filter(d => d.vehicleId === selectedVehicleId || d.type === 'license')
        : []

    // Group documents: Legal vs History
    const legalDocs = filteredDocs.filter(d => ['registration', 'license', 'insurance', 'technical_control', 'coc'].includes(d.type))
    const historyDocs = filteredDocs.filter(d => ['invoice', 'other'].includes(d.type))

    const renderDocItem = (item: Document) => (
        <Pressable
            key={item.id}
            onPress={() => {
                setViewingDoc(item)
                setViewModalVisible(true)
            }}
            style={[styles.docItem, isDark && styles.docItemDark]}
        >
            <View
                style={[styles.docIconContainer, isDark && styles.docIconContainerDark]}
            >
                <SmartImage
                    localUri={item.localUri}
                    remotePath={item.remotePath}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    fallbackIconSize={20}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: isDark ? '#FDFCF8' : '#1C1C1E', marginBottom: 2 }} numberOfLines={1}>{item.reference || t('wallet.document.untitled')}</Text>
                <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: '#666660', textTransform: 'uppercase' }}>{t(`wallet.type.${item.type}`)}</Text>
                {item.expiryDate && (
                    <Text style={{ fontFamily: 'WorkSans_500Medium', fontSize: 12, color: '#BA4444', marginTop: 4 }}>
                        {t('wallet.document.expires')}: {item.expiryDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </Text>
                )}
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
    )

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={{ flex: 1, padding: 24 }}>
                {/* Header Contextuel */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {selectedVehicleId ? t('wallet.title') : t('wallet.select_bike_title')}
                    </Text>
                    {selectedVehicleId && (
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            style={[styles.addButton, isDark && styles.addButtonDark]}
                        >
                            <Plus size={24} color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                        </Pressable>
                    )}
                </View>

                {selectedVehicleId ? (
                    <>
                        {/* Vehicle Indicator (Dashboard Style) */}
                        <View style={{ marginBottom: 24, alignItems: 'flex-start' }}>
                            <View style={[styles.vehicleIndicator, isDark && styles.vehicleIndicatorDark, { gap: 8 }]}>
                                <BrandLogo
                                    brand={vehicles.find(v => v.id === selectedVehicleId)?.brand || ''}
                                    variant="icon"
                                    size={20}
                                    color={isDark ? '#1C1C1E' : '#1C1C1E'}
                                />
                                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#1C1C1E' }}>
                                    {vehicles.find(v => v.id === selectedVehicleId)?.brand} {vehicles.find(v => v.id === selectedVehicleId)?.model}
                                </Text>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {legalDocs.length > 0 && (
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('wallet.section.legal')}</Text>
                                    {legalDocs.map(renderDocItem)}
                                </View>
                            )}

                            {historyDocs.length > 0 && (
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('wallet.section.history')}</Text>
                                    {historyDocs.map(renderDocItem)}
                                </View>
                            )}

                            {filteredDocs.length === 0 && (
                                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
                                    <View style={[styles.emptyStateIcon, isDark && styles.emptyStateIconDark]}>
                                        <FolderOpen size={40} color="#9CA3AF" />
                                    </View>
                                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: isDark ? '#FDFCF8' : '#1C1C1E', textAlign: 'center', marginBottom: 8 }}>{t('wallet.no_documents')}</Text>
                                    <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 16, color: '#666660', textAlign: 'center' }}>{t('wallet.no_documents_desc')}</Text>
                                </View>
                            )}
                        </ScrollView>
                    </>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 18, color: '#666660', marginBottom: 24 }}>{t('wallet.select_bike_desc_full')}</Text>
                        {vehicles.map(v => (
                            <Pressable
                                key={v.id}
                                onPress={() => setSelectedVehicleId(v.id)}
                                style={[styles.vehicleCard, isDark && styles.vehicleCardDark]}
                            >
                                <View style={[styles.vehicleIconContainer, isDark && styles.vehicleIconContainerDark]}>
                                    <BrandLogo brand={v.brand} variant="icon" size={24} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: isDark ? '#FDFCF8' : '#1C1C1E' }}>{v.brand} {v.model}</Text>
                                    <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14, color: '#666660' }}>{v.year} • {v.currentMileage.toLocaleString()} km</Text>
                                </View>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </Pressable>
                        ))}
                        {vehicles.length === 0 && (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                                <Bike size={60} color="#9CA3AF" />
                                <Text style={{ fontFamily: 'WorkSans_400Regular', fontSize: 16, color: '#666660', marginTop: 16, textAlign: 'center' }}>{t('garage.no_vehicles')}</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                <DocumentViewModal
                    visible={viewModalVisible}
                    onClose={() => {
                        setViewModalVisible(false)
                        setViewingDoc(null)
                    }}
                    onEdit={() => {
                        setViewModalVisible(false)
                        // Slight delay to allow modal transition
                        setTimeout(() => {
                            setEditingDoc(viewingDoc)
                            setModalVisible(true)
                        }, 100)
                    }}
                    onPreview={async () => {
                        if (viewingDoc) {
                            let uri: string | null | undefined = viewingDoc.localUri

                            // Check if local file exists
                            if (uri) {
                                const info = await FileSystem.getInfoAsync(uri)
                                if (!info.exists) {
                                    uri = null
                                }
                            }

                            // If no local, try remote
                            if (!uri && viewingDoc.remotePath) {
                                uri = await StorageService.downloadFile(viewingDoc.remotePath)
                            }

                            if (uri) {
                                setPreviewImage(uri)
                            }
                        }
                    }}
                    document={viewingDoc}
                />

                <DocumentModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false)
                        setEditingDoc(null)
                    }}
                    onPreview={(uri) => setPreviewImage(uri)}
                    document={editingDoc}
                    vehicles={vehicles}
                    documents={documents}
                />

                {/* Full Screen Image Preview Modal */}
                <ImageViewing
                    images={previewImage ? [{ uri: previewImage }] : []}
                    imageIndex={0}
                    visible={!!previewImage}
                    onRequestClose={() => setPreviewImage(null)}
                    swipeToCloseEnabled={true}
                    doubleTapToZoomEnabled={true}
                />
            </View>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    documents: DocumentService.observeDocuments(),
    vehicles: VehicleService.observeVehicles(),
}))

export default enhance(WalletScreen)
