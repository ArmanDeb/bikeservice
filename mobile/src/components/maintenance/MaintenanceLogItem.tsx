import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Calendar, Wrench, FlaskConical } from 'lucide-react-native'
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
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        flexDirection: 'row',
        alignItems: 'center',
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
    logIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    // Tags
    logTagContainer: {
        backgroundColor: '#F5F5F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    logTagContainerDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    logTagText: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
    },
    logTagTextDark: {
        color: '#9CA3AF',
    },
})

const MaintenanceLogItem = ({ log, documents, onPress }: MaintenanceLogItemProps) => {
    const { isDark } = useTheme()
    const { t, language } = useLanguage()

    // Assuming we only care about the first linked document (invoice)
    const document = documents.length > 0 ? documents[0] : null

    return (
        <Pressable
            onPress={onPress}
            style={[styles.logItem, isDark && styles.logItemDark]}
        >
            <View style={[styles.logIconContainer, {
                backgroundColor: isDark
                    ? (log.type === 'periodic' ? 'rgba(156, 163, 175, 0.2)' : log.type === 'repair' ? 'rgba(186, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)')
                    : (log.type === 'periodic' ? 'rgba(74, 74, 69, 0.1)' : log.type === 'repair' ? 'rgba(186, 68, 68, 0.1)' : 'rgba(133, 127, 114, 0.1)')
            }]}>
                {document ? (
                    <SmartImage
                        localUri={document.localUri}
                        remotePath={document.remotePath}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        fallbackIconSize={24}
                    />
                ) : (
                    <>
                        {log.type === 'periodic' && <Calendar size={24} color={isDark ? '#9CA3AF' : '#4A4A45'} />}
                        {log.type === 'repair' && <Wrench size={24} color={isDark ? '#EF6B6B' : '#BA4444'} />}
                        {log.type === 'modification' && <FlaskConical size={24} color={isDark ? '#9CA3AF' : '#857F72'} />}
                    </>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#FDFCF8' : '#1C1C1E', fontFamily: 'Outfit_700Bold', fontSize: 18, flex: 1, marginRight: 8 }} numberOfLines={1}>{log.title}</Text>
                    <Text style={{ color: isDark ? '#E5E5E0' : '#4A4A45', fontFamily: 'Outfit_700Bold', fontSize: 18 }}>{log.cost} €</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_400Regular', fontSize: 14 }}>{log.date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</Text>
                        <Text style={{ color: isDark ? '#9CA3AF' : '#666660', fontFamily: 'WorkSans_500Medium', fontSize: 14 }}>{log.mileageAtLog.toLocaleString()} km</Text>
                    </View>
                    <View style={[styles.logTagContainer, isDark && styles.logTagContainerDark]}>
                        <Text style={[styles.logTagText, isDark && styles.logTagTextDark]}>{t('maintenance.type.' + log.type)}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const enhance = withObservables(['log'], ({ log }: { log: MaintenanceLog }) => ({
    log,
    documents: log.documents,
}))

export default enhance(MaintenanceLogItem)
