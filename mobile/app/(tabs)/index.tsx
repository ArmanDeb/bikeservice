import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, StatusBar, Modal, TextInput, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'

import { MOTORCYCLE_DATA, BRANDS } from '../../src/data/motorcycleData'

import { Grid, Plus, Edit2, Trash2, X } from 'lucide-react-native'

import { AutocompleteInput } from '../../src/components/common/AutocompleteInput'

// Reusable Vehicle Modal for Add & Edit
import { BrandLogo } from '../../src/components/common/BrandLogo'
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal'

// Observer wrapper for individual list item to ensure reactivity
const VehicleListItem = withObservables(['vehicle'], ({ vehicle }) => ({
    vehicle: vehicle.observe()
}))(({ vehicle, isDark, onPress, onEdit, isSelected }: { vehicle: Vehicle, isDark: boolean, onPress: () => void, onEdit: () => void, isSelected: boolean }) => {
    return (
        <View style={styles.itemContainer}>
            <View style={[
                styles.card,
                isDark ? styles.cardDark : styles.cardLight,
                isSelected && styles.cardSelected
            ]}>
                <Pressable
                    onPress={onPress}
                    style={styles.pressableArea}
                >
                    <View style={styles.cardContent}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <BrandLogo brand={vehicle.brand} variant="icon" size={32} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.vehicleName, isDark ? styles.vehicleNameDark : styles.vehicleNameLight]}>{vehicle.brand} {vehicle.model}</Text>
                                <Text style={[styles.vehicleDetails, isDark ? styles.vehicleDetailsDark : styles.vehicleDetailsLight, { marginTop: 4 }]}>
                                    {vehicle.year ? `${vehicle.year}` : ''}
                                    {vehicle.year && vehicle.vin ? ' • ' : ''}
                                    {vehicle.vin ? vehicle.vin : ''}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
                            <Text style={isDark ? styles.badgeTextDark : styles.badgeTextLight}>
                                {vehicle.currentMileage.toLocaleString()} km
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </View>
            {isSelected && (
                <View style={[
                    styles.editButtonContainer,
                    isDark ? styles.editButtonContainerDark : styles.editButtonContainerLight
                ]}>
                    <Pressable
                        onPress={onEdit}
                        style={styles.editButton}
                    >
                        <Edit2 size={16} color={isDark ? '#F8FAFC' : '#1E293B'} />
                    </Pressable>
                </View>
            )}
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
                    />

                    {/* Model Autocomplete */}
                    <AutocompleteInput
                        label={t('garage.modal.model')}
                        value={model}
                        onChangeText={setModel}
                        options={availableModels}
                        onSelect={handleModelSelect}
                        placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                    />

                    {/* Year and Mileage */}
                    <View style={styles.inputRow}>
                        <TextInput
                            placeholder={t('garage.modal.year')}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                            value={year}
                            onChangeText={setYear}
                        />
                        <TextInput
                            placeholder={t('garage.modal.mileage')}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                            value={mileage}
                            onChangeText={(text) => {
                                const numeric = text.replace(/[^0-9]/g, '');
                                const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                setMileage(formatted);
                            }}
                        />
                    </View>

                    <TextInput
                        placeholder={t('garage.modal.vin')}
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { marginBottom: 24 }]}
                        value={vin}
                        onChangeText={setVin}
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
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, isDark ? styles.headerTitleDark : styles.headerTitleLight]}>{t('garage.title')}</Text>
                    <View style={styles.headerActions}>
                        <Pressable
                            onPress={() => setSelectedVehicleId(null)}
                            style={[
                                styles.iconButton,
                                selectedVehicleId === null
                                    ? styles.iconButtonPrimary
                                    : (isDark ? styles.iconButtonSurfaceDark : styles.iconButtonSurfaceLight)
                            ]}
                        >
                            <Grid size={20} color={selectedVehicleId === null ? '#FFFFFF' : isDark ? '#F8FAFC' : '#1E293B'} />
                        </Pressable>
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

                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <VehicleListItem
                            vehicle={item}
                            isDark={isDark}
                            onPress={() => setSelectedVehicleId(item.id)}
                            onEdit={() => openEditModal(item)}
                            isSelected={selectedVehicleId === item.id}
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
    vehicleName: {
        fontSize: 22,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 4,
    },
    vehicleNameLight: {
        color: '#1C1C1E',
    },
    vehicleNameDark: {
        color: '#E5E5E0',
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
        borderRadius: 20, // Slightly less rounded than Pro Max
        borderWidth: 1,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2, // Minimal shadow
        elevation: 1,
    },
    cardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: {
        borderColor: '#4A4A45', // Dark Stone
        borderWidth: 2,
    },
    pressableArea: {
        padding: 24,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
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
        fontSize: 13,
        fontFamily: 'WorkSans_400Regular',
    },
    badgeTextDark: {
        color: '#D4D4CE',
        fontWeight: '600',
        fontSize: 13,
        fontFamily: 'WorkSans_400Regular',
    },
    editButtonContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        borderRadius: 12,
        borderWidth: 1,
        zIndex: 10,
    },
    editButtonContainerLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
    },
    editButtonContainerDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    editButton: {
        padding: 10,
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
        flex: 1,
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
});

export default enhance(GarageScreen)
