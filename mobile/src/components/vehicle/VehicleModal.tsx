import React, { useState } from 'react'
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native'
import KeyboardAwareScrollView from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareScrollView'
import { X } from 'lucide-react-native'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { ConfirmationModal } from '../common/ConfirmationModal'
import { VehicleForm } from './VehicleForm'
import { VehicleService } from '../../services/VehicleService'
import Vehicle from '../../database/models/Vehicle'

interface VehicleModalProps {
    visible: boolean
    onClose: () => void
    vehicle?: Vehicle | null
}

export const VehicleModal = ({ visible, onClose, vehicle }: VehicleModalProps) => {
    const { t } = useLanguage()
    const { isDark } = useTheme()

    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)

    const handleSubmit = async (data: { brand: string, model: string, year: number, mileage: number, vin?: string }) => {
        if (vehicle) {
            await VehicleService.updateVehicle(vehicle, data.brand, data.model, data.year, data.vin, data.mileage)
        } else {
            await VehicleService.createVehicle(data.brand, data.model, data.year, data.vin, data.mileage)
        }
        onClose()
    }

    const confirmDelete = async () => {
        if (!vehicle) return
        await VehicleService.deleteVehicle(vehicle)
        setDeleteConfirmVisible(false)
        onClose()
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingTop: '15%' }}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={120}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                >
                    <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, isDark ? styles.modalTitleDark : styles.modalTitleLight]}>
                                {vehicle ? t('garage.modal.edit_title') : t('garage.modal.add_title')}
                            </Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={isDark ? "#94A3B8" : "#9CA3AF"} />
                            </Pressable>
                        </View>

                        <VehicleForm
                            initialValues={vehicle}
                            onSubmit={handleSubmit}
                            onDelete={vehicle ? () => setDeleteConfirmVisible(true) : undefined}
                            submitLabel={vehicle ? t('garage.modal.submit_edit') : t('garage.modal.submit_add')}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </View>

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
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(28, 28, 30, 0.8)',
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
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 999,
    },
})
