import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, TextInput, Image, Alert, ScrollView, StatusBar, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import * as ImagePicker from 'expo-image-picker'
import { DocumentService } from '../../src/services/DocumentService'
import Document from '../../src/database/models/Document'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { Camera, FileText, ChevronRight, ChevronLeft, Bike, FolderOpen, X, Plus } from 'lucide-react-native'
import { useVehicle } from '../../src/context/VehicleContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'

// Styles definition
const styles = StyleSheet.create({
    // Modal Styles
    vehicleChip: {
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    vehicleChipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    vehicleChipDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    typeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: '#F1F5F9',
        borderColor: 'rgba(226, 232, 240, 0.5)',
    },
    typeButtonDark: {
        backgroundColor: '#334155',
        borderColor: 'rgba(51, 65, 85, 0.5)',
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
    cameraButton: {
        backgroundColor: '#F1F5F9',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    cameraButtonDark: {
        backgroundColor: '#334155',
        borderColor: '#475569',
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
    docItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    docItemDark: {
        backgroundColor: '#1E293B',
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    docIconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#F1F5F9', // surface-highlight
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
        overflow: 'hidden',
    },
    docIconContainerDark: {
        backgroundColor: '#334155',
        borderColor: 'rgba(51, 65, 85, 0.5)',
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
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    previewCloseButton: {
        position: 'absolute',
        top: 48,
        right: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 9999,
    }
});



// Document Modal Component
const DocumentModal = ({ visible, onClose, document, vehicles }: { visible: boolean, onClose: () => void, document?: Document | null, vehicles: Vehicle[] }) => {
    const { selectedVehicleId } = useVehicle()
    const { t, language } = useLanguage()
    const { isDark } = useTheme()
    const [title, setTitle] = useState('')
    const [type, setType] = useState<'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other'>('invoice')
    const [expiryDate, setExpiryDate] = useState('')
    const [localUri, setLocalUri] = useState<string | null>(null)
    const [vehicleId, setVehicleId] = useState('')

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
            Alert.alert(t('alert.error'), 'Title and Vehicle are required')
            return
        }

        const expiry = expiryDate ? new Date(expiryDate) : null

        if (document) {
            // updateDocument: (document, title, expiryDate, filePath, type?)
            await DocumentService.updateDocument(document, title, expiry, localUri, type)
        } else {
            // createDocument: (title, type, expiryDate, filePath, vehicleId?)
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

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface p-6 rounded-t-3xl border-t border-border/50 shadow-lg max-h-[90%]">
                    <Text className="text-2xl font-heading text-text mb-6">
                        {document ? t('wallet.modal.edit_title') : t('wallet.modal.add_title')}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
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

                        <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">{t('wallet.modal.type')}</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {docTypes.map((dt) => (
                                <Pressable
                                    key={dt.id}
                                    onPress={() => setType(dt.id as any)}
                                    style={[
                                        styles.typeButton,
                                        isDark && styles.typeButtonDark,
                                        type === dt.id && styles.typeButtonSelected
                                    ]}
                                >
                                    <Text className={`font-heading text-xs ${type === dt.id ? 'text-white' : 'text-text-secondary'}`}>{dt.label}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <TextInput
                            placeholder={t('wallet.field.title')}
                            placeholderTextColor="#9CA3AF"
                            className="bg-surface-highlight text-text p-4 rounded-xl mb-4 text-lg border border-border"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <TextInput
                            placeholder={t('wallet.field.expiry')}
                            placeholderTextColor="#9CA3AF"
                            className="bg-surface-highlight text-text p-4 rounded-xl mb-4 text-lg border border-border"
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                        />

                        <Pressable
                            onPress={pickImage}
                            style={[styles.cameraButton, isDark && styles.cameraButtonDark]}
                        >
                            {localUri ? (
                                <Image source={{ uri: localUri }} className="w-full h-40 rounded-xl" />
                            ) : (
                                <>
                                    <Camera size={32} color="#9CA3AF" />
                                    <Text className="text-text-secondary font-body mt-2 font-medium">{t('wallet.field.attach_photo')}</Text>
                                </>
                            )}
                        </Pressable>

                        <Pressable onPress={handleSubmit} style={styles.submitButton}>
                            <Text className="text-white font-heading text-lg">
                                {document ? t('common.save') : t('wallet.modal.add_title')}
                            </Text>
                        </Pressable>

                        {document && (
                            <Pressable
                                onPress={() => {
                                    Alert.alert(
                                        t('wallet.modal.delete_confirm_title'),
                                        t('wallet.modal.delete_confirm_desc'),
                                        [
                                            { text: t('common.cancel'), style: 'cancel' },
                                            {
                                                text: t('common.delete'), style: 'destructive', onPress: async () => {
                                                    await DocumentService.deleteDocument(document)
                                                    onClose()
                                                }
                                            }
                                        ]
                                    )
                                }}
                                style={styles.deleteButton}
                            >
                                <Text className="text-red-500 font-bold text-lg">{t('wallet.modal.delete')}</Text>
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

const WalletScreen = ({ documents, vehicles }: { documents: Document[], vehicles: Vehicle[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [modalVisible, setModalVisible] = useState(false)
    const [editingDoc, setEditingDoc] = useState<Document | null>(null)
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
                setEditingDoc(item)
                setModalVisible(true)
            }}
            style={[styles.docItem, isDark && styles.docItemDark]}
        >
            <Pressable
                onPress={() => item.localUri && setPreviewImage(item.localUri)}
                style={[styles.docIconContainer, isDark && styles.docIconContainerDark]}
            >
                {item.localUri ? (
                    <Image source={{ uri: item.localUri }} className="w-full h-full" />
                ) : (
                    <FileText size={24} color="#9CA3AF" />
                )}
            </Pressable>
            <View className="flex-1">
                <Text className="text-text font-heading text-lg" numberOfLines={1}>{item.reference || t('wallet.document.untitled')}</Text>
                <Text className="text-text-secondary font-body text-xs uppercase font-medium">{t(`wallet.type.${item.type}`)}</Text>
                {item.expiryDate && (
                    <Text className="text-red-400 font-body text-[10px] mt-1 font-bold">
                        {t('wallet.document.expires')}: {item.expiryDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </Text>
                )}
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
    )

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 p-6">
                {/* Header Contextuel */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-heading text-text">
                        {selectedVehicleId ? t('wallet.title') : t('wallet.select_bike_title')}
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

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {legalDocs.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-text-secondary text-xs uppercase mb-3 tracking-widest font-bold">{t('wallet.section.legal')}</Text>
                                    {legalDocs.map(renderDocItem)}
                                </View>
                            )}

                            {historyDocs.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-text-secondary text-xs uppercase mb-3 tracking-widest font-bold">{t('wallet.section.history')}</Text>
                                    {historyDocs.map(renderDocItem)}
                                </View>
                            )}

                            {filteredDocs.length === 0 && (
                                <View className="items-center justify-center py-20 px-10">
                                    <View className="bg-surface-highlight w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm">
                                        <FolderOpen size={40} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-text font-heading text-xl text-center mb-2">{t('wallet.no_documents')}</Text>
                                    <Text className="text-text-secondary font-body text-center text-lg">{t('wallet.no_documents_desc')}</Text>
                                </View>
                            )}
                        </ScrollView>
                    </>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-text-secondary mb-6 text-lg">{t('wallet.select_bike_desc_full')}</Text>
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

                <DocumentModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false)
                        setEditingDoc(null)
                    }}
                    document={editingDoc}
                    vehicles={vehicles}
                />

                {/* Full Screen Image Preview Modal */}
                {previewImage && (
                    <Modal visible={!!previewImage} transparent animationType="fade">
                        <View style={styles.previewOverlay}>
                            <Pressable
                                className="w-full h-full justify-center items-center"
                                onPress={() => setPreviewImage(null)}
                            >
                                <Image
                                    source={{ uri: previewImage }}
                                    className="w-full h-[80%] rounded-2xl"
                                    resizeMode="contain"
                                />
                            </Pressable>
                            <Pressable
                                onPress={() => setPreviewImage(null)}
                                style={styles.previewCloseButton}
                            >
                                <X size={30} color="white" />
                            </Pressable>
                        </View>
                    </Modal>
                )}
            </View>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    documents: DocumentService.observeDocuments(),
    vehicles: VehicleService.observeVehicles(),
}))

export default enhance(WalletScreen)
