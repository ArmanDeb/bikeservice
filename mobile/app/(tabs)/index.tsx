import React, { useState } from 'react'
import { View, Text, Pressable, StatusBar, Modal, Alert, StyleSheet, Platform, ScrollView } from 'react-native'
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView'
import { SafeAreaView } from 'react-native-safe-area-context'
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { withObservables } from '@nozbe/watermelondb/react'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'

import { MOTORCYCLE_DATA, BRANDS } from '../../src/data/motorcycleData'

import { Grid, Plus, Edit2, Trash2, X } from 'lucide-react-native'

import { AutocompleteInput } from '../../src/components/common/AutocompleteInput'
import { ModalInput } from '../../src/components/common/ModalInput'

// Reusable Vehicle Modal for Add & Edit
import { BrandLogo } from '../../src/components/common/BrandLogo'
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal'

// Observer wrapper for individual list item to ensure reactivity
const VehicleListItem = withObservables(['vehicle'], ({ vehicle }) => ({
    vehicle: vehicle.observe()
}))(({ vehicle, isDark, onPress, onEdit, isSelected, drag, isActive }: { vehicle: Vehicle, isDark: boolean, onPress: () => void, onEdit: () => void, isSelected: boolean, drag: () => void, isActive: boolean }) => {
    return (
        <View style={[styles.itemContainer, isActive && { opacity: 0.8, transform: [{ scale: 1.02 }] }]}>
            <View style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                isSelected && styles.cardSelected,
                isSelected && { backgroundColor: isDark ? '#2C2C2E' : '#FFEDD5' },
                isActive && {
                    borderColor: '#F97316',
                    borderWidth: 2,
                    shadowOpacity: 0.3,
                    elevation: 10
                }
            ]}>
                <Pressable
                    onPress={onPress}
                    onLongPress={drag}
                    style={styles.pressableArea}
                >
                    <View style={styles.cardContent}>
                        {/* Left: Logo */}
                        <BrandLogo brand={vehicle.brand} variant="icon" size={48} color={isDark ? '#FDFCF8' : '#1C1C1E'} />

                        {/* Right: Info & Actions */}
                        <View style={styles.vehicleInfoContainer}>

                            {/* Top Row: Brand/Model + Edit Button */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text
                                        style={[styles.vehicleBrand, isDark ? styles.vehicleDetailsDark : styles.vehicleDetailsLight]}
                                        numberOfLines={1}
                                    >
                                        {vehicle.brand}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.vehicleModel,
                                            isDark ? styles.vehicleNameDark : styles.vehicleNameLight,
                                            isSelected && !isDark && { color: '#000000' }
                                        ]}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        {vehicle.model}
                                    </Text>
                                </View>

                                {/* Edit Button (Top Right) */}
                                {isSelected && (
                                    <Pressable
                                        onPress={onEdit}
                                        style={[styles.inlineEditButton, isDark ? styles.editButtonContainerDark : styles.editButtonContainerLight]}
                                        hitSlop={8}
                                    >
                                        <Edit2 size={16} color={isDark ? '#F8FAFC' : '#1E293B'} />
                                    </Pressable>
                                )}
                            </View>

                            {/* Bottom Row: Year/VIN + Mileage */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                <View style={styles.vehicleMetaRow}>
                                    <Text style={[styles.vehicleYear, isDark ? styles.vehicleDetailsDark : styles.vehicleDetailsLight]}>
                                        {vehicle.year}
                                    </Text>
                                    {vehicle.vin ? (
                                        <Text style={[styles.vehicleVin, isDark ? styles.vehicleDetailsDark : styles.vehicleDetailsLight]}>
                                            • {vehicle.vin}
                                        </Text>
                                    ) : null}
                                </View>

                                <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                                    <Text style={isDark ? styles.badgeTextDark : styles.badgeTextLight}>
                                        {vehicle.currentMileage.toLocaleString()} km
                                    </Text>
                                </View>
                            </View>

                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    )
})

const VehicleModal = ({ visible, onClose, vehicle }: { visible: boolean, onClose: () => void, vehicle?: Vehicle | null }) => {
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')
    const [vin, setVin] = useState('')
    const { t } = useLanguage();
    const { isDark } = useTheme();

    // Alert state for errors/info
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertVisible(true)
    }

    // Get available models for selected brand (check both exact match and partial)
    const getModelsForBrand = () => {
        // First try exact match
        if (MOTORCYCLE_DATA[brand]) return MOTORCYCLE_DATA[brand]
        // Then try to find a brand that matches the input
        const matchingBrand = BRANDS.find(b => b.toLowerCase() === brand.toLowerCase())
        if (matchingBrand && MOTORCYCLE_DATA[matchingBrand]) return MOTORCYCLE_DATA[matchingBrand]
        return []
    }
    const availableModels = getModelsForBrand()

    // Reset/Populate form when modal opens or vehicle changes
    React.useEffect(() => {
        if (visible) {
            if (vehicle) {
                setBrand(vehicle.brand)
                setModel(vehicle.model)
                setYear(vehicle.year?.toString() || '')
                setMileage(vehicle.currentMileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
                setVin(vehicle.vin || '')
            } else {
                setBrand('')
                setModel('')
                setYear('')
                setMileage('')
                setVin('')
            }
        }
    }, [visible, vehicle])

    const handleBrandSelect = (selectedBrand: string) => {
        setBrand(selectedBrand)
        setModel('') // Reset model when brand changes
    }

    const handleModelSelect = (selectedModel: string) => {
        setModel(selectedModel)
    }

    const handleSubmit = async () => {
        if (!brand || !model || !mileage) {
            showAlert(t('alert.error'), t('garage.missing_info'))
            return
        }

        const yearInt = parseInt(year) || new Date().getFullYear()

        if (vehicle) {
            await VehicleService.updateVehicle(vehicle, brand, model, yearInt, vin || undefined, parseInt(mileage.replace(/\./g, '')))
        } else {
            await VehicleService.createVehicle(brand, model, yearInt, vin || undefined, parseInt(mileage.replace(/\./g, '')))
        }

        onClose()
    }

    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)

    const handleDelete = () => {
        if (!vehicle) return
        setDeleteConfirmVisible(true)
    }

    const confirmDelete = async () => {
        if (!vehicle) return
        await VehicleService.deleteVehicle(vehicle)
        setDeleteConfirmVisible(false)
        onClose()
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={20}
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>

                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark ? styles.modalTitleDark : styles.modalTitleLight]}>
                                {vehicle ? t('garage.modal.edit_title') : t('garage.modal.add_title')}
                            </Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={isDark ? "#94A3B8" : "#9CA3AF"} />
                            </Pressable>
                        </View>

                        {/* Brand Autocomplete */}
                        <AutocompleteInput
                            label={t('garage.modal.brand')}
                            value={brand}
                            onChangeText={setBrand}
                            options={BRANDS.filter(b => b !== 'Other')}
                            onSelect={handleBrandSelect}
                            placeholder={t('garage.modal.brand_placeholder')}
                            filterMode="startsWith"
                            containerStyle={{ marginBottom: 16 }}
                            inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight, { height: 'auto', paddingVertical: 18 }]} // Match other inputs
                            labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
                            placeholderTextColor="#9CA3AF"
                        />

                        {/* Model Autocomplete */}
                        <AutocompleteInput
                            label={t('garage.modal.model')}
                            value={model}
                            onChangeText={setModel}
                            options={availableModels}
                            onSelect={handleModelSelect}
                            placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                            containerStyle={{ marginBottom: 16 }}
                            inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight, { height: 'auto', paddingVertical: 18 }]} // Match other inputs
                            labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
                            placeholderTextColor="#9CA3AF"
                        />

                        {/* Year and Mileage */}
                        <View style={styles.inputRow}>
                            <ModalInput
                                label={t('garage.modal.year')}
                                value={year}
                                onChangeText={setYear}
                                placeholder="2024"
                                keyboardType="numeric"
                                containerStyle={{ flex: 1 }}
                            />
                            <ModalInput
                                label={t('garage.modal.mileage')}
                                value={mileage}
                                onChangeText={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    setMileage(formatted);
                                }}
                                formatValue={(text) => {
                                    const numeric = text.replace(/[^0-9]/g, '');
                                    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                }}
                                placeholder="10.000"
                                keyboardType="numeric"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <ModalInput
                            label={t('garage.modal.vin')}
                            value={vin}
                            onChangeText={setVin}
                            placeholder={t('garage.modal.vin_placeholder')}
                        />

                        <Pressable onPress={handleSubmit} style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>
                                {vehicle ? t('garage.modal.submit_edit') : t('garage.modal.submit_add')}
                            </Text>
                        </Pressable>

                        {vehicle && (
                            <Pressable onPress={handleDelete} style={styles.deleteButton}>
                                <Trash2 size={20} color="#ef4444" />
                                <Text style={styles.deleteButtonText}>{t('garage.modal.delete')}</Text>
                            </Pressable>
                        )}

                    </Pressable>
                </KeyboardAwareScrollView>
            </Pressable>


            <ConfirmationModal
                visible={deleteConfirmVisible}
                title={t('garage.modal.delete_confirm_title')}
                description={t('garage.modal.delete_confirm_desc')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmVisible(false)}
                variant="danger"
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
            />

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                confirmText={t('common.ok')}
            />
        </Modal >
    )
}


import { useVehicle } from '../../src/context/VehicleContext'

const GarageScreen = ({ vehicles }: { vehicles: Vehicle[] }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t } = useLanguage()

    // Local state for optimistic updates
    const [localVehicles, setLocalVehicles] = useState(vehicles)

    // Sync local state when prop changes (e.g. initial load, add/edit/delete from other sources)
    // We strictly check for order changes to avoid unnecessary re-renders/glitches during drag-and-drop sync
    React.useEffect(() => {
        const newIds = vehicles.map(v => v.id).join(',')
        setLocalVehicles(prev => {
            const prevIds = prev.map(v => v.id).join(',')
            if (prevIds === newIds) return prev // Skip update if order matches (prevents layout jump)
            return vehicles
        })
    }, [vehicles])

    // Auto-select first vehicle if none selected or selected one is gone
    React.useEffect(() => {
        if (vehicles.length > 0) {
            const isSelectedValid = vehicles.some(v => v.id === selectedVehicleId);
            if (!selectedVehicleId || !isSelectedValid) {
                setSelectedVehicleId(vehicles[0].id);
            }
        }
    }, [vehicles, selectedVehicleId]);

    const openAddModal = () => {
        setEditingVehicle(null)
        setModalVisible(true)
    }

    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setModalVisible(true)
    }

    return (
        <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, isDark ? styles.headerTitleDark : styles.headerTitleLight]}>{t('garage.title')}</Text>
                        <View style={styles.headerActions}>
                            <Pressable
                                onPress={openAddModal}
                                style={[
                                    styles.iconButton,
                                    isDark ? styles.iconButtonSurfaceDark : styles.iconButtonSurfaceLight
                                ]}
                            >
                                <Plus size={24} color={isDark ? '#F97316' : '#F97316'} />
                            </Pressable>
                        </View>
                    </View>

                    <DraggableFlatList
                        data={localVehicles}
                        onDragEnd={({ data }) => {
                            setLocalVehicles(data) // Immediate UI update
                            VehicleService.reorderVehicles(data) // Background DB sync
                        }}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item, drag, isActive }: RenderItemParams<Vehicle>) => (
                            <VehicleListItem
                                vehicle={item}
                                isDark={isDark}
                                onPress={() => setSelectedVehicleId(item.id)}
                                onEdit={() => openEditModal(item)}
                                isSelected={selectedVehicleId === item.id}
                                drag={drag}
                                isActive={isActive}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Grid size={48} color={isDark ? '#334155' : '#CBD5E1'} />
                                <Text style={[styles.emptyStateText, isDark ? { color: '#94A3B8' } : { color: '#64748B' }]}>{t('garage.no_motorcycles')}</Text>
                                <Text style={[styles.emptyStateDesc, isDark ? { color: '#94A3B8' } : { color: '#64748B' }]}>{t('garage.no_motorcycles_desc')}</Text>
                            </View>
                        }
                    />

                    <VehicleModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        vehicle={editingVehicle}
                    />
                </View>
            </GestureHandlerRootView>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
}))

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E', // Warm dark gray
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        letterSpacing: -0.5,
    },
    headerTitleLight: {
        color: '#1C1C1E',
    },
    headerTitleDark: {
        color: '#E5E5E0',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    vehicleBrand: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
        opacity: 0.7,
    },
    vehicleModel: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 4,
        lineHeight: 22,
    },
    vehicleName: {
        // Deprecated but kept to avoid breakage if used elsewhere, or remove if unused. 
        // Checking usage: seems only used in the block we replaced.
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 6,
        lineHeight: 24,
    },
    vehicleNameLight: {
        color: '#1C1C1E',
    },
    vehicleNameDark: {
        color: '#E5E5E0',
    },
    vehicleInfoContainer: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    vehicleMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    vehicleYear: {
        fontSize: 15,
        fontFamily: 'WorkSans_600SemiBold',
    },
    vehicleVin: {
        fontSize: 13,
        fontFamily: 'WorkSans_400Regular',
        opacity: 0.6,
    },
    vehicleDetails: {
        fontSize: 14,
        fontFamily: 'WorkSans_400Regular',
    },
    vehicleDetailsLight: {
        color: '#666660',
    },
    vehicleDetailsDark: {
        color: '#9CA3AF',
    },
    itemContainer: {
        marginBottom: 20,
        borderRadius: 20,
        position: 'relative',
    },
    card: {
        borderRadius: 24, // More modern rounded corners
        borderWidth: 1,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12, // Softer, more spread out shadow
        elevation: 4,
    },
    cardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, // Slightly stronger for dark mode
        shadowRadius: 12,
        elevation: 4,
    },
    cardSelected: {
        borderColor: '#F97316', // Orange highlight when selected
        borderWidth: 2,
    },
    pressableArea: {
        padding: 24, // More breathing room
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center', // Better alignment
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-end',
    },
    badgeLight: {
        backgroundColor: '#F5F5F0',
    },
    badgeDark: {
        backgroundColor: '#3A3A3C',
    },
    badgeTextLight: {
        color: '#4A4A45',
        fontWeight: '600',
        fontSize: 12,
        fontFamily: 'WorkSans_400Regular',
    },
    badgeTextDark: {
        color: '#D4D4CE',
        fontWeight: '600',
        fontSize: 12,
        fontFamily: 'WorkSans_400Regular',
    },
    editButtonContainerLight: {
        backgroundColor: '#F5F5F0', // Match badge bg for subtle look
        borderRadius: 8,
    },
    editButtonContainerDark: {
        backgroundColor: '#3A3A3C',
        borderRadius: 8,
    },
    inlineEditButton: {
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        padding: 0,
        borderRadius: 14,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    iconButtonPrimary: {
        backgroundColor: '#1C1C1E', // Dark for primary action
        borderColor: '#1C1C1E',
    },
    iconButtonSurfaceLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
    },
    iconButtonSurfaceDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        opacity: 0.8,
    },
    emptyStateText: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        marginTop: 16,
    },
    emptyStateDesc: {
        fontSize: 14,
        fontFamily: 'WorkSans_400Regular',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(28, 28, 30, 0.4)', // Warm overlay
    },
    modalContent: {
        padding: 32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        maxHeight: '90%',
    },
    modalContentLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
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
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
    },
    modalTitleLight: {
        color: '#1C1C1E',
    },
    modalTitleDark: {
        color: '#E5E5E0',
    },
    input: {
        fontFamily: 'WorkSans_400Regular',
        padding: 18,
        borderRadius: 14,
        fontSize: 16,
        // flex: 1, // REMOVED: potentially causing collapse in undefined height containers
        borderWidth: 1,
    },
    inputLight: {
        backgroundColor: '#FDFCF8',
        color: '#1C1C1E',
        borderColor: '#E6E5E0',
    },
    inputDark: {
        backgroundColor: '#1C1C1E',
        color: '#E5E5E0',
        borderColor: '#3A3A3C',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
        marginTop: 12,
    },
    primaryButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#BA4444',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#BA4444',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        marginLeft: 8,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 999,
    },
    inputLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
        fontFamily: 'Outfit_700Bold',
    },
    inputLabelLight: {
        color: '#6B7280',
    },
    inputLabelDark: {
        color: '#9CA3AF',
    },
    suffixContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 18,
        flex: 1,
    },
    suffixText: {
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
        marginLeft: 8,
    },
});

export default enhance(GarageScreen)
