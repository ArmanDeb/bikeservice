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

const styles = StyleSheet.create({
    pdfButton: {
        backgroundColor: '#3B82F6', // bg-primary
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    pdfButtonText: {
        color: 'white',
        fontWeight: 'bold', // font-heading approx
        marginLeft: 8,
    }
});

const DashboardScreen = ({ vehicles, logs }: { vehicles: Vehicle[], logs: MaintenanceLog[] }) => {
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()
    const { signOut } = useAuth()
    const { isDark } = useTheme()
    const { t, language } = useLanguage()
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // 1. Identify Active Vehicle
    const activeVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null

    // 2. Filter Logs (Reactive)
    const activeLogs = selectedVehicleId
        ? logs.filter(l => l.vehicleId === selectedVehicleId)
        : logs

    const handleExportPDF = async () => {
        if (!activeVehicle) {
            Alert.alert(t('dashboard.alert.select_vehicle'), t('dashboard.alert.select_vehicle_desc'))
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
            await PDFService.generateReport(activeVehicle, activeLogs, documents, language)

            const duration = (Date.now() - startTime) / 1000
            console.log(`[Dashboard] PDF Process Completed in ${duration.toFixed(2)}s`)

        } catch (error: any) {
            console.error('[Dashboard] PDF Export Error:', error)
            Alert.alert(t('dashboard.alert.pdf_error'), error.message)
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
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView
                contentContainerStyle={{ padding: 24 }}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-4xl font-heading text-text">{t('dashboard.title')}</Text>
                    {activeVehicle && (
                        <Pressable
                            onPress={handleExportPDF}
                            disabled={isGeneratingPDF}
                            style={styles.pdfButton}
                        >
                            {isGeneratingPDF ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <FileText size={18} color="white" />
                                    <Text style={styles.pdfButtonText}>{t('dashboard.export_pdf')}</Text>
                                </>
                            )}
                        </Pressable>
                    )}
                </View>
                <Text className="text-text-secondary font-body text-lg mb-8">
                    {activeVehicle ? `${t('dashboard.overview_vehicle')}${activeVehicle.brand} ${activeVehicle.model}` : t('dashboard.overview_garage')}
                </Text>

                {/* Total Cost Card */}
                <View className="bg-surface p-6 rounded-2xl mb-6 border border-border/50 shadow-md">
                    <Text className="text-text-secondary font-heading text-sm uppercase tracking-wider mb-2">
                        {activeVehicle ? t('dashboard.total_cost_vehicle') : t('dashboard.total_cost_garage')}
                    </Text>
                    <Text className="text-5xl font-heading text-primary-dark">{totalGarageCost.toLocaleString()} <Text className="text-2xl text-text-secondary">€</Text></Text>
                </View>

                {/* Selected Vehicle specific views OR Global Summary */}
                {/* Cost Summary Table */}
                <View className="bg-surface rounded-2xl mb-6 border border-border/50 shadow-md overflow-hidden">
                    <View className="p-4 border-b border-border/50 bg-surface-highlight/50">
                        <Text className="text-text font-heading text-lg">{t('dashboard.cost_breakdown')}</Text>
                    </View>
                    <View className="p-4">
                        {[
                            { label: t('dashboard.periodic_maintenance'), value: costBreakdown['periodic'] || 0 },
                            { label: t('dashboard.repairs'), value: costBreakdown['repair'] || 0 },
                            { label: t('dashboard.modifications'), value: costBreakdown['modifications'] || 0 },
                        ].map((row, idx) => (
                            <View key={idx} className="flex-row justify-between py-2 border-b border-border/50 last:border-0">
                                <Text className="text-text-secondary font-body">{row.label}</Text>
                                <Text className="text-text font-heading">{row.value.toLocaleString()} €</Text>
                            </View>
                        ))}
                        <View className="flex-row justify-between pt-4 mt-2 border-t border-border">
                            <Text className="text-text font-heading">{t('dashboard.total')}</Text>
                            <Text className="text-primary-dark font-heading">{totalGarageCost.toLocaleString()} €</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity Timeline */}
                <Text className="text-xl font-heading text-text mb-4">{t('dashboard.latest_activity')}</Text>
                <View className="pl-4 border-l-2 border-border ml-2">
                    {recentLogs.length > 0 ? (
                        recentLogs.slice(0, 5).map((log, index) => (
                            <View key={log.id} className="mb-6 relative">
                                <View className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                <Text className="text-text-secondary text-xs mb-1">{log.date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</Text>
                                <View className="bg-surface p-4 rounded-xl border border-border">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-text font-bold text-lg flex-1 mr-2">{log.title}</Text>
                                        <View className={`px-2 py-0.5 rounded ${log.type === 'periodic' ? 'bg-blue-500/10' :
                                            log.type === 'repair' ? 'bg-red-500/10' : 'bg-purple-500/10'
                                            }`}>
                                            <Text className={`text-xs font-bold uppercase ${log.type === 'periodic' ? 'text-blue-500' :
                                                log.type === 'repair' ? 'text-red-500' : 'text-purple-500'
                                                }`}>{t(`maintenance.type.${log.type}`)}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-text-secondary text-sm">@{log.mileageAtLog.toLocaleString()} km</Text>
                                        <Text className="text-primary-dark font-bold">- {log.cost} €</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-text-secondary italic mb-4">{t('dashboard.no_activity')}</Text>
                    )}
                </View>

                {/* Quick Stats (Only show Global Vehicle count if NO vehicle is selected) */}
                {!selectedVehicleId && (
                    <View className="flex-row gap-4 mb-6">
                        <View className="bg-surface p-6 rounded-2xl flex-1 border border-border/50 shadow-md">
                            <Text className="text-text-secondary font-heading text-sm uppercase mb-1">{t('dashboard.vehicles_count')}</Text>
                            <Text className="text-3xl font-heading text-text">{vehicles.length}</Text>
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    )
}

const enhance = withObservables([], () => ({
    vehicles: VehicleService.observeVehicles(),
    logs: MaintenanceService.observeAllLogs(), // Make Logs Reactive!
}))

export default enhance(DashboardScreen)
