import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, StatusBar, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { withObservables } from '@nozbe/watermelondb/react'
import { database } from '../../src/database'
import Vehicle from '../../src/database/models/Vehicle'
import { TCOService } from '../../src/services/TCOService'
import { VehicleService } from '../../src/services/VehicleService'

import { useVehicle } from '../../src/context/VehicleContext'
import { useAuth } from '../../src/context/AuthContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import { FileText, Activity, Wrench, Wallet, Car, AlertTriangle } from 'lucide-react-native'

import { Q } from '@nozbe/watermelondb'
import { TableName } from '../../src/database/constants'
import { MaintenanceService } from '../../src/services/MaintenanceService'
import MaintenanceLog from '../../src/database/models/MaintenanceLog'

import { AIService } from '../../src/services/AIService'
import { PDFService } from '../../src/services/PDFService'
import { DocumentService } from '../../src/services/DocumentService'
import { ActivityIndicator } from 'react-native'
import { BrandLogo } from '../../src/components/common/BrandLogo'
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF8',
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    pageTitle: {
        flex: 1,
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
    },
    pageTitleDark: {
        color: '#FDFCF8',
    },
    vehicleIndicator: {
        backgroundColor: '#F5F5F0', // Light Stone
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    pageSubtitle: {
        fontSize: 18,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
        marginBottom: 32,
    },
    pageSubtitleDark: {
        color: '#9CA3AF',
    },
    pdfButton: {
        backgroundColor: '#1C1C1E', // Dark Stone
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    pdfButtonDark: {
        backgroundColor: '#FDFCF8',
    },
    pdfButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
        marginLeft: 4,
        fontSize: 12,
    },
    pdfButtonTextDark: {
        color: '#1C1C1E',
    },
    // Card Styles
    card: {
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
        shadowColor: 'transparent',
    },
    cardDark: {
        backgroundColor: '#2C2C2E', // Lighter Gray Layer
        borderColor: '#3A3A3C',
    },
    cardPadding: {
        padding: 24,
    },
    cardHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#E6E5E0',
        backgroundColor: '#FBFBF9',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardHeaderDark: {
        borderColor: '#3A3A3C',
        backgroundColor: '#323234',
    },
    cardTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: '#1C1C1E',
    },
    cardTitleDark: {
        color: '#FDFCF8',
    },

    // Label
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sectionLabelDark: {
        color: '#9CA3AF',
    },

    // Cost Text
    costText: {
        fontSize: 48,
        fontFamily: 'Outfit_700Bold',
        color: '#1C1C1E',
    },
    costTextDark: {
        color: '#FDFCF8',
    },
    currencyText: {
        fontSize: 24,
        fontFamily: 'WorkSans_400Regular',
        color: '#666660',
    },
    currencyTextDark: {
        color: '#9CA3AF',
    },

    // Table
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#E6E5E0',
    },
    tableRowDark: {
        borderColor: '#3A3A3C',
    },
    tableLabel: {
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
        color: '#666660',
    },
    tableLabelDark: {
        color: '#9CA3AF',
    },
    tableValue: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: '#1C1C1E',
    },
    tableValueDark: {
        color: '#FDFCF8',
    },

    // Recent logs
    timelineContainer: {
        paddingLeft: 16,
        marginLeft: 8,
        borderLeftWidth: 2,
        borderColor: '#E6E5E0'
    },
    timelineContainerDark: {
        borderColor: '#3A3A3C',
    },
    logItem: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E5E0',
    },
    logItemDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    timelineDot: {
        position: 'absolute',
        left: -25,
        top: 20,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#1C1C1E', // Dark Stone
        borderWidth: 4,
        borderColor: '#FDFCF8'
    },
    timelineDotDark: {
        backgroundColor: '#FDFCF8',
        borderColor: '#1C1C1E',
    },

    // Tags
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    tagPeriodic: {
        backgroundColor: '#F5F5F0',
        borderColor: '#E6E5E0',
    },
    tagPeriodicDark: {
        backgroundColor: '#323234',
        borderColor: '#3A3A3C',
    },
    tagRepair: {
        backgroundColor: '#FFF1F2', // Very light red
        borderColor: '#FECDD3',
    },
    tagRepairDark: {
        backgroundColor: 'rgba(127, 29, 29, 0.3)',
        borderColor: 'rgba(127, 29, 29, 0.5)',
    },
    tagMod: {
        backgroundColor: '#F3E8FF', // Very light purple (minimal)
        borderColor: '#E9D5FF',
    },
    tagModDark: {
        backgroundColor: 'rgba(88, 28, 135, 0.3)',
        borderColor: 'rgba(88, 28, 135, 0.5)',
    },
    tagText: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagTextPeriodic: { color: '#666660' }, // Neutral
    tagTextPeriodicDark: { color: '#9CA3AF' },
    tagTextRepair: { color: '#BE123C' }, // Muted Red
    tagTextRepairDark: { color: '#FB7185' },
    tagTextMod: { color: '#7E22CE' }, // Muted Purple
    tagTextModDark: { color: '#C084FC' },
});

const DashboardScreen = ({ vehicles, logs }: { vehicles: Vehicle[], logs: MaintenanceLog[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { signOut } = useAuth()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>()
    const [alertConfirmText, setAlertConfirmText] = useState<string | undefined>()

    const showAlert = (
        title: string,
        message: string,
        options?: {
            onConfirm?: () => void;
            confirmText?: string;
        }
    ) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOnConfirm(() => options?.onConfirm || (() => setAlertVisible(false)))
        setAlertConfirmText(options?.confirmText)
        setAlertVisible(true)
    }

    // 1. Identify Active Vehicle
    const activeVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null

    // 2. Filter Logs (Reactive)
    const activeLogs = selectedVehicleId
        ? logs.filter(l => l.vehicleId === selectedVehicleId)
        : logs

    const handleExportPDF = async () => {
        if (!activeVehicle) {
            showAlert(t('dashboard.alert.select_vehicle'), t('dashboard.alert.select_vehicle_desc'))
            return
        }

        setIsGeneratingPDF(true)
        console.log('[Dashboard] Starting PDF Export Process...')
        const startTime = Date.now()

        try {
            // 1. Fetch related documents (invoices)
            const documents = await DocumentService.getDocumentsForVehicle(activeVehicle.id)

            // 2. Generate and Share PDF
            console.log('[Dashboard] 2. Building PDF Report...')
            const result = await PDFService.generateReport(activeVehicle, activeLogs, documents, language)

            if (result?.success) {
                showAlert(result.title!, result.message!, { confirmText: result.buttonText })
            }

            const duration = (Date.now() - startTime) / 1000
            console.log(`[Dashboard] PDF Process Completed in ${duration.toFixed(2)}s`)

        } catch (error: any) {
            console.error('[Dashboard] PDF Export Error:', error)
            showAlert(t('dashboard.alert.pdf_error'), error.message)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    // 3. Compute Stats (Reactive)
    const totalGarageCost = activeLogs.reduce((sum, log) => sum + log.cost, 0)

    // ... breakdown logic remains same ...
    const recentLogs = activeLogs
    const costBreakdown = activeLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.cost
        return acc
    }, {} as Record<string, number>)

    return (
        <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.headerRow}>
                    <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>{t('dashboard.title')}</Text>
                </View>
                {activeVehicle ? (
                    <View style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={[styles.vehicleIndicator, isDark && { backgroundColor: '#FDFCF8' }, { gap: 8, flexDirection: 'row', alignItems: 'center' }]}>
                            <BrandLogo
                                brand={activeVehicle.brand}
                                variant="icon"
                                size={20}
                                color={isDark ? '#1C1C1E' : '#1C1C1E'}
                            />
                            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 16, color: isDark ? '#1C1C1E' : '#1C1C1E' }}>
                                {activeVehicle.brand} {activeVehicle.model}
                            </Text>
                        </View>

                        <Pressable
                            onPress={handleExportPDF}
                            disabled={isGeneratingPDF}
                            style={[styles.pdfButton, isDark && styles.pdfButtonDark]}
                        >
                            {isGeneratingPDF ? (
                                <ActivityIndicator size="small" color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                            ) : (
                                <>
                                    <FileText size={16} color={isDark ? "#1C1C1E" : "#FFFFFF"} />
                                    <Text style={[styles.pdfButtonText, isDark && styles.pdfButtonTextDark]}>{t('dashboard.export_pdf')}</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <Text style={[styles.pageSubtitle, isDark && styles.pageSubtitleDark]}>
                        {t('dashboard.overview_garage')}
                    </Text>
                )}

                {/* Total Cost Card */}
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { overflow: 'hidden', position: 'relative' }]}>
                    {activeVehicle && (
                        <View pointerEvents="none" style={{ position: 'absolute', right: -20, bottom: -40, opacity: 0.15, transform: [{ rotate: '-20deg' }] }}>
                            <BrandLogo
                                brand={activeVehicle.brand}
                                variant="icon"
                                size={180}
                                color={undefined}
                            />
                        </View>
                    )}
                    <View style={styles.cardPadding}>
                        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>
                            {activeVehicle ? t('dashboard.total_cost_vehicle') : t('dashboard.total_cost_garage')}
                        </Text>
                        <Text style={[styles.costText, isDark && styles.costTextDark]}>
                            {totalGarageCost.toLocaleString()} <Text style={[styles.currencyText, isDark && styles.currencyTextDark]}>€</Text>
                        </Text>
                    </View>
                </View>

                {/* Cost Summary Table */}
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { overflow: 'hidden' }]}>
                    <View style={[styles.cardHeader, isDark && styles.cardHeaderDark]}>
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>{t('dashboard.cost_breakdown')}</Text>
                    </View>
                    <View style={styles.cardPadding}>
                        {[
                            { label: t('dashboard.periodic_maintenance'), value: costBreakdown['periodic'] || 0 },
                            { label: t('dashboard.repairs'), value: costBreakdown['repair'] || 0 },
                            { label: t('dashboard.modifications'), value: costBreakdown['modifications'] || 0 },
                        ].map((row, idx) => (
                            <View key={idx} style={[styles.tableRow, isDark && styles.tableRowDark, idx === 2 && { borderBottomWidth: 0 }]}>
                                <Text style={[styles.tableLabel, isDark && styles.tableLabelDark]}>{row.label}</Text>
                                <Text style={[styles.tableValue, isDark && styles.tableValueDark]}>{row.value.toLocaleString()} €</Text>
                            </View>
                        ))}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, marginTop: 8, borderTopWidth: 1, borderColor: isDark ? '#3A3A3C' : '#E6E5E0' }}>
                            <Text style={[styles.tableValue, isDark && styles.tableValueDark]}>{t('dashboard.total')}</Text>
                            <Text style={[styles.tableValue, isDark && styles.tableValueDark]}>{totalGarageCost.toLocaleString()} €</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity Timeline */}
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark, { fontSize: 24, marginBottom: 16 }]}>{t('dashboard.latest_activity')}</Text>

                <View style={[styles.timelineContainer, isDark && styles.timelineContainerDark]}>
                    {recentLogs.length > 0 ? (
                        recentLogs.slice(0, 5).map((log, index) => {
                            // Find vehicle if we are in global view
                            const logVehicle = !selectedVehicleId ? vehicles.find(v => v.id === log.vehicleId) : null

                            return (
                                <View key={log.id} style={{ marginBottom: 24, position: 'relative' }}>
                                    {/* Timeline Dot */}
                                    <View style={[styles.timelineDot, isDark && styles.timelineDotDark]} />

                                    <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark, { marginBottom: 4, marginLeft: 8 }]}>
                                        {log.date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                    </Text>

                                    <View style={[styles.logItem, isDark ? styles.logItemDark : styles.cardLight]}>

                                        {/* OPTION A: Vehicle Header (Global View Only) */}
                                        {logVehicle && (
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 12,
                                                paddingBottom: 12,
                                                borderBottomWidth: 1,
                                                borderColor: isDark ? '#3A3A3C' : '#F5F5F0'
                                            }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    backgroundColor: isDark ? '#3A3A3C' : '#F5F5F0',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 8
                                                }}>
                                                    <BrandLogo
                                                        brand={logVehicle.brand}
                                                        variant="icon"
                                                        size={14}
                                                        color={isDark ? '#FDFCF8' : '#1C1C1E'}
                                                    />
                                                </View>
                                                <Text style={{
                                                    fontFamily: 'Outfit_700Bold',
                                                    fontSize: 14,
                                                    color: isDark ? '#FDFCF8' : '#1C1C1E',
                                                    letterSpacing: 0.5
                                                }}>
                                                    {logVehicle.brand} {logVehicle.model}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark, { flex: 1, marginRight: 8 }]}>{log.title}</Text>
                                            <View
                                                style={[
                                                    styles.tag,
                                                    log.type === 'periodic' ? (isDark ? styles.tagPeriodicDark : styles.tagPeriodic) :
                                                        log.type === 'repair' ? (isDark ? styles.tagRepairDark : styles.tagRepair) :
                                                            (isDark ? styles.tagModDark : styles.tagMod)
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.tagText,
                                                        log.type === 'periodic' ? (isDark ? styles.tagTextPeriodicDark : styles.tagTextPeriodic) :
                                                            log.type === 'repair' ? (isDark ? styles.tagTextRepairDark : styles.tagTextRepair) :
                                                                (isDark ? styles.tagTextModDark : styles.tagTextMod)
                                                    ]}
                                                >
                                                    {t(`maintenance.type.${log.type}`)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={[styles.tableLabel, isDark && styles.tableLabelDark, { fontSize: 14 }]}>@{log.mileageAtLog.toLocaleString()} km</Text>
                                            <Text style={[styles.tableValue, isDark && styles.tableValueDark]}>- {log.cost} €</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    ) : (
                        <Text style={[styles.tableLabel, isDark && styles.tableLabelDark, { fontStyle: 'italic', marginBottom: 16 }]}>{t('dashboard.no_activity')}</Text>
                    )}
                </View>

                {/* Quick Stats (Only show Global Vehicle count if NO vehicle is selected) */}
                {!selectedVehicleId && (
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { flex: 1, padding: 24, marginBottom: 0 }]}>
                            <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>{t('dashboard.vehicles_count')}</Text>
                            <Text style={[styles.costText, isDark && styles.costTextDark, { fontSize: 32 }]}>{vehicles.length}</Text>
                        </View>
                    </View>
                )}

            </ScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onCancel={() => setAlertVisible(false)}
                confirmText={alertConfirmText || t('common.ok')}
            />
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
    logs: MaintenanceService.observeAllLogs(), // Make Logs Reactive!
}))

export default enhance(DashboardScreen)
