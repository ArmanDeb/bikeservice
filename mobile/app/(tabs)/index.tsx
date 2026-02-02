import React, { useState } from 'react'
import { View, Text, FlatList, Pressable, StatusBar, Modal, TextInput, Alert, useColorScheme, StyleSheet } from 'react-native'
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
const VehicleModal = ({ visible, onClose, vehicle }: { visible: boolean, onClose: () => void, vehicle?: Vehicle | null }) => {
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')
    const [vin, setVin] = useState('')
    const { t } = useLanguage();

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
                setMileage(vehicle.currentMileage.toString())
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
            Alert.alert(t('alert.error'), t('garage.missing_info'))
            return
        }

        const yearInt = parseInt(year) || new Date().getFullYear()

        if (vehicle) {
            await VehicleService.updateVehicle(vehicle, brand, model, yearInt, vin || undefined, parseInt(mileage))
        } else {
            await VehicleService.createVehicle(brand, model, yearInt, vin || undefined, parseInt(mileage))
        }

        onClose()
    }

    const handleDelete = () => {
        if (!vehicle) return

        Alert.alert(
            t('garage.modal.delete_confirm_title'),
            t('garage.modal.delete_confirm_desc'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: async () => {
                        await VehicleService.deleteVehicle(vehicle)
                        onClose() // Ensure modal closes
                    }
                }
            ]
        )
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface p-6 rounded-t-3xl border-t border-border/50 shadow-lg max-h-[90%]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-heading text-text">
                            {vehicle ? t('garage.modal.edit_title') : t('garage.modal.add_title')}
                        </Text>
                        <Pressable onPress={onClose}>
                            <X size={24} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Brand Autocomplete */}
                    <AutocompleteInput
                        label={t('garage.modal.brand')}
                        value={brand}
                        onChangeText={setBrand}
                        options={BRANDS.filter(b => b !== 'Other')} // Exclude "Other" from suggestions
                        onSelect={handleBrandSelect}
                        placeholder={t('garage.modal.brand_placeholder')}
                        filterMode="startsWith"
                    />

                    {/* Model Autocomplete - shows after brand is selected */}
                    <AutocompleteInput
                        label={t('garage.modal.model')}
                        value={model}
                        onChangeText={setModel}
                        options={availableModels}
                        onSelect={handleModelSelect}
                        placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                    />

                    {/* Year and Mileage */}
                    <View className="flex-row gap-4 mb-3 mt-3">
                        <TextInput
                            placeholder={t('garage.modal.year')}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="bg-surface-highlight text-text font-body p-3 rounded-xl text-lg flex-1 border border-border/50"
                            value={year}
                            onChangeText={setYear}
                        />
                        <TextInput
                            placeholder={t('garage.modal.mileage')}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="bg-surface-highlight text-text font-body p-3 rounded-xl text-lg flex-1 border border-border/50"
                            value={mileage}
                            onChangeText={setMileage}
                        />
                    </View>

                    <TextInput
                        placeholder={t('garage.modal.vin')}
                        placeholderTextColor="#9CA3AF"
                        className="bg-surface-highlight text-text font-body p-3 rounded-xl mb-4 text-lg border border-border/50"
                        value={vin}
                        onChangeText={setVin}
                    />

                    <Pressable onPress={handleSubmit} style={styles.primaryButton}>
                        <Text className="text-black font-heading text-lg">
                            {vehicle ? t('garage.modal.submit_edit') : t('garage.modal.submit_add')}
                        </Text>
                    </Pressable>

                    {vehicle && (
                        <Pressable onPress={handleDelete} style={styles.deleteButton}>
                            <Trash2 size={20} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-500 font-heading text-lg">{t('garage.modal.delete')}</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
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
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="p-6">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-heading text-text">{t('garage.title')}</Text>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => setSelectedVehicleId(null)}
                            style={[
                                styles.iconButton,
                                selectedVehicleId === null
                                    ? styles.iconButtonPrimary
                                    : (isDark ? styles.iconButtonSurfaceDark : styles.iconButtonSurfaceLight)
                            ]}
                        >
                            <Grid size={20} color={selectedVehicleId === null ? 'black' : isDark ? 'white' : 'black'} />
                        </Pressable>
                        <Pressable
                            onPress={openAddModal}
                            style={[
                                styles.iconButton,
                                isDark ? styles.iconButtonSurfaceDark : styles.iconButtonSurfaceLight
                            ]}
                        >
                            <Plus size={24} color={isDark ? 'white' : 'black'} />
                        </Pressable>
                    </View>
                </View>

                <FlatList
                    data={vehicles}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isSelected = selectedVehicleId === item.id;
                        return (
                            <View style={styles.itemContainer}>
                                <View style={[
                                    styles.card,
                                    isDark ? styles.cardDark : styles.cardLight,
                                    isSelected && styles.cardSelected
                                ]}>
                                    <Pressable
                                        onPress={() => setSelectedVehicleId(item.id)}
                                        style={styles.pressableArea}
                                    >
                                        <View style={styles.cardContent}>
                                            <View>
                                                <Text className="text-xl font-bold text-text">{item.brand} {item.model}</Text>
                                                <Text className="text-text-secondary text-sm">
                                                    {item.year ? `${item.year}` : ''}
                                                    {item.year && item.vin ? ' • ' : ''}
                                                    {item.vin ? item.vin : ''}
                                                </Text>
                                            </View>
                                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                                                <Text className="text-primary-dark font-bold">{item.currentMileage.toLocaleString()} km</Text>
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
                                            onPress={() => openEditModal(item)}
                                            style={styles.editButton}
                                        >
                                            <Edit2 size={16} color={isDark ? 'white' : 'black'} />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-text-secondary font-heading text-lg">{t('garage.no_motorcycles')}</Text>
                            <Text className="text-text-secondary font-body text-sm mt-2">{t('garage.no_motorcycles_desc')}</Text>
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
    itemContainer: {
        marginBottom: 16,
        borderRadius: 12,
        position: 'relative',
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
    },
    cardDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: '#3B82F6',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 3,
    },
    pressableArea: {
        padding: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    editButtonContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        borderRadius: 8,
        borderWidth: 1,
        zIndex: 10,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    editButtonContainerLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(226, 232, 240, 0.5)',
    },
    editButtonContainerDark: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    editButton: {
        padding: 8,
    },
    // New styles for Modal and Header
    primaryButton: {
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
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)', // red-500/50
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    iconButton: {
        padding: 8,
        borderRadius: 9999,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconButtonPrimary: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    iconButtonSurfaceLight: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(226, 232, 240, 0.5)',
    },
    iconButtonSurfaceDark: {
        backgroundColor: '#1E293B',
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    closeButton: {
        padding: 8,
        borderRadius: 9999,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default enhance(GarageScreen)
