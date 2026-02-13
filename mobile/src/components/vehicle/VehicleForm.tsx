import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { AutocompleteInput } from '../common/AutocompleteInput'
import { ModalInput } from '../common/ModalInput'
import { MOTORCYCLE_DATA, BRANDS } from '../../data/motorcycleData'
import { Trash2 } from 'lucide-react-native'
import Vehicle from '../../database/models/Vehicle'

interface VehicleFormProps {
    initialValues?: Vehicle | null
    onSubmit: (data: { brand: string, model: string, year: number, mileage: number, vin?: string }) => Promise<void>
    onDelete?: () => void
    onCancel?: () => void
    submitLabel: string
    isSubmitting?: boolean
}

export const VehicleForm = ({ initialValues, onSubmit, onDelete, onCancel, submitLabel, isSubmitting }: VehicleFormProps) => {
    const { t } = useLanguage()
    const { isDark } = useTheme()

    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [mileage, setMileage] = useState('')
    const [vin, setVin] = useState('')

    // Alert state
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initialValues) {
            setBrand(initialValues.brand)
            setModel(initialValues.model)
            setYear(initialValues.year?.toString() || '')
            setMileage(initialValues.currentMileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))
            setVin(initialValues.vin || '')
        } else {
            setBrand('')
            setModel('')
            setYear('')
            setMileage('')
            setVin('')
        }
    }, [initialValues])

    const getModelsForBrand = () => {
        if (MOTORCYCLE_DATA[brand]) return MOTORCYCLE_DATA[brand]
        const matchingBrand = BRANDS.find(b => b.toLowerCase() === brand.toLowerCase())
        if (matchingBrand && MOTORCYCLE_DATA[matchingBrand]) return MOTORCYCLE_DATA[matchingBrand]
        return []
    }
    const availableModels = getModelsForBrand()

    const handleBrandSelect = (selectedBrand: string) => {
        setBrand(selectedBrand)
        setModel('')
    }

    const handleSubmit = async () => {
        if (!brand || !model || !mileage) {
            setError(t('garage.missing_info') || 'Please fill in all required fields.')
            return
        }
        setError(null)

        const yearInt = parseInt(year) || new Date().getFullYear()
        const mileageInt = parseInt(mileage.replace(/\./g, ''))

        await onSubmit({
            brand,
            model,
            year: yearInt,
            mileage: mileageInt,
            vin: vin || undefined
        })
    }

    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <AutocompleteInput
                label={t('garage.modal.brand')}
                value={brand}
                onChangeText={setBrand}
                options={BRANDS.filter(b => b !== 'Other')}
                onSelect={handleBrandSelect}
                placeholder={t('garage.modal.brand_placeholder')}
                filterMode="startsWith"
                containerStyle={{ marginBottom: 16 }}
                inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
                placeholderTextColor="#9CA3AF"
            />

            <AutocompleteInput
                label={t('garage.modal.model')}
                value={model}
                onChangeText={setModel}
                options={availableModels}
                onSelect={setModel}
                placeholder={brand ? t('garage.modal.model_placeholder') : t('garage.modal.model_placeholder_no_brand')}
                containerStyle={{ marginBottom: 16 }}
                inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
                placeholderTextColor="#9CA3AF"
            />

            <View style={styles.inputRow}>
                <ModalInput
                    label={t('garage.modal.year')}
                    value={year}
                    onChangeText={setYear}
                    placeholder="2024"
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                    inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
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
                    inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                    labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
                />
            </View>

            <ModalInput
                label={t('garage.modal.vin')}
                value={vin}
                onChangeText={setVin}
                placeholder={t('garage.modal.vin_placeholder')}
                inputStyle={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                labelStyle={[styles.inputLabel, isDark ? styles.inputLabelDark : styles.inputLabelLight]}
            />

            <Pressable
                onPress={handleSubmit}
                style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
                disabled={isSubmitting}
            >
                <Text style={styles.primaryButtonText}>
                    {submitLabel}
                </Text>
            </Pressable>

            {onDelete && (
                <Pressable onPress={onDelete} style={styles.deleteButton}>
                    <Trash2 size={20} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>{t('garage.modal.delete')}</Text>
                </Pressable>
            )}

            {onCancel && (
                <Pressable onPress={onCancel} style={styles.cancelButton}>
                    <Text style={[styles.cancelButtonText, isDark ? styles.textDark : styles.textLight]}>{t('common.cancel')}</Text>
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    input: {
        fontFamily: 'WorkSans_400Regular',
        padding: 18,
        borderRadius: 14,
        fontSize: 16,
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
    cancelButton: {
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: 'WorkSans_600SemiBold',
        fontSize: 16,
    },
    textLight: {
        color: '#1C1C1E',
    },
    textDark: {
        color: '#E5E5E0',
    },
    errorContainer: {
        backgroundColor: '#FED7D7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#C53030',
        fontFamily: 'WorkSans_500Medium',
        textAlign: 'center',
    },
})
