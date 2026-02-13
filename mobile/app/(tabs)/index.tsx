import React, { useState } from 'react'
import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { withObservables } from '@nozbe/watermelondb/react'

import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'

import { Grid, Plus, Edit2 } from 'lucide-react-native'

import { BrandLogo } from '../../src/components/common/BrandLogo'
import { VehicleModal } from '../../src/components/vehicle/VehicleModal'

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

import { useVehicle } from '../../src/context/VehicleContext'

const GarageScreen = ({ vehicles }: { vehicles: Vehicle[] }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { isDark } = useTheme()
    const { t } = useLanguage()


    // Local state for optimistic updates
    const [localVehicles, setLocalVehicles] = useState(vehicles)

    // Sync local state when prop changes
    React.useEffect(() => {
        const newIds = vehicles.map(v => v.id).join(',')
        setLocalVehicles(prev => {
            const prevIds = prev.map(v => v.id).join(',')
            if (prevIds === newIds) return prev
            return vehicles
        })
    }, [vehicles])

    // Auto-select first vehicle
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
                            setLocalVehicles(data)
                            VehicleService.reorderVehicles(data)
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

                                <Pressable
                                    onPress={openAddModal}
                                    style={[styles.primaryButton, { marginTop: 24, paddingHorizontal: 32 }]}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {t('garage.modal.submit_add') || "Add Motorcycle"}
                                    </Text>
                                </Pressable>
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
    primaryButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        padding: 20,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
    },
});

export default enhance(GarageScreen)
