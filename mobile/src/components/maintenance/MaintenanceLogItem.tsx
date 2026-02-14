import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { ClipboardList, Wrench, Zap } from 'lucide-react-native'
import { withObservables } from '@nozbe/watermelondb/react'
import MaintenanceLog from '../../database/models/MaintenanceLog'
import Document from '../../database/models/Document'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { SmartImage } from '../SmartImage'

interface MaintenanceLogItemProps {
    log: MaintenanceLog
    documents: Document[]
    onPress: () => void
}

const styles = StyleSheet.create({
    logItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    logItemDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
        shadowOpacity: 0.2,
    },
    // Top Row: Icon + Title + Cost
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    titleText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        lineHeight: 20,
        marginLeft: 8,
    },
    titleTextDark: {
        color: '#FDFCF8',
    },
    titleTextLight: {
        color: '#1C1C1E',
    },
    costText: {
        fontFamily: 'WorkSans_500Medium',
        fontSize: 13,
        lineHeight: 16,
    },
    costTextDark: {
        color: '#E5E5E0',
    },
    costTextLight: {
        color: '#4A4A45',
    },
    // Bottom Row: Meta (Date & Mileage)
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        fontFamily: 'WorkSans_500Medium',
        lineHeight: 16,
    },
    metaTextDark: {
        color: '#9CA3AF',
    },
    metaTextLight: {
        color: '#666660',
    },
})

const MaintenanceLogItem = ({ log, documents, onPress }: MaintenanceLogItemProps) => {
    const { isDark } = useTheme()
    const { t, language } = useLanguage()

    const getIcon = () => {
        const size = 18
        if (log.type === 'periodic') return <ClipboardList size={size} color={isDark ? '#4ADE80' : '#15803D'} />
        if (log.type === 'repair') return <Wrench size={size} color={isDark ? '#EF6B6B' : '#BA4444'} />
        if (log.type === 'modification') return <Zap size={size} color={isDark ? '#FACC15' : '#CA8A04'} />
        return <ClipboardList size={size} color={isDark ? '#9CA3AF' : '#666660'} />
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.logItem, isDark && styles.logItemDark]}
        >
            {/* Top Row: Icon + Title */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    {getIcon()}
                    <Text
                        style={[
                            styles.titleText,
                            isDark ? styles.titleTextDark : styles.titleTextLight
                        ]}
                        numberOfLines={1}
                    >
                        {log.title}
                    </Text>
                </View>
            </View>

            {/* Bottom Row: Date & Mileage & Cost */}
            <View style={[styles.footerRow, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.metaText, isDark ? styles.metaTextDark : styles.metaTextLight, { marginBottom: 2 }]}>
                        {log.date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </Text>
                    <Text style={[styles.metaText, isDark ? styles.metaTextDark : styles.metaTextLight]}>
                        {log.mileageAtLog.toLocaleString()}{'\u00A0'}km
                    </Text>
                </View>

                {log.cost > 0 && (
                    <Text style={[styles.costText, isDark ? styles.costTextDark : styles.costTextLight, { fontFamily: 'Outfit_700Bold' }]}>
                        {log.cost} €
                    </Text>
                )}
            </View>
        </Pressable>
    )
}

const enhance = withObservables(['log'], ({ log }: { log: MaintenanceLog }) => ({
    log,
    documents: log.documents,
}))

export default enhance(MaintenanceLogItem)
