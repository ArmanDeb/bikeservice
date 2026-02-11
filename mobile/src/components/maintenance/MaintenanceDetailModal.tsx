import React, { useEffect, useState } from 'react'
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import MaintenanceLog from '../../database/models/MaintenanceLog'
import Document from '../../database/models/Document'
import { SmartImage } from '../SmartImage'
import { Pencil, Trash2, X } from 'lucide-react-native'
import { database } from '../../database'
import { Q } from '@nozbe/watermelondb'
import { TableName } from '../../database/constants'
import { withObservables } from '@nozbe/watermelondb/react'

interface MaintenanceDetailModalProps {
    visible: boolean
    onClose: () => void
    log: MaintenanceLog | null
    documents: Document[]
    onEdit: () => void
    onDelete: () => void
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 28, 30, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: '#D6D5D0',
        height: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    modalContentDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E5E0',
    },
    headerDark: {
        borderBottomColor: '#3A3A3C',
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: '#1C1C1E',
        flex: 1,
        marginRight: 16,
    },
    titleDark: {
        color: '#FDFCF8',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 24,
    },
    sectionTitleDark: {
        color: '#9CA3AF',
    },
    valueText: {
        fontFamily: 'WorkSans_400Regular',
        fontSize: 16,
        color: '#1C1C1E',
    },
    valueTextDark: {
        color: '#FDFCF8',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F0',
        borderWidth: 1,
        borderColor: '#E6E5E0',
    },
    actionButtonDark: {
        backgroundColor: '#3A3A3C',
        borderColor: '#4B5563',
    },
    closeButton: {
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
})

import ImageView from 'react-native-image-viewing'

// ... existing imports ...

const MaintenanceDetailModalComponent = ({ visible, onClose, log, documents, onEdit, onDelete }: MaintenanceDetailModalProps) => {
    const { t, language } = useLanguage()
    const { isDark } = useTheme()
    const [isImageViewVisible, setIsImageViewVisible] = useState(false)
    const [pages, setPages] = useState<{ localUri: string, remotePath?: string }[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const document = documents.length > 0 ? documents[0] : null

    useEffect(() => {
        if (document) {
            // Initial load
            setPages([{ localUri: document.localUri || '', remotePath: document.remotePath }])

            document.pages.fetch().then(fetchedPages => {
                if (fetchedPages.length > 0) {
                    const sorted = fetchedPages.sort((a, b) => a.pageIndex - b.pageIndex)
                    setPages(sorted.map(p => ({ localUri: p.localUri, remotePath: p.remotePath })))
                }
            })
        } else {
            setPages([])
        }
    }, [document])

    // Prepare images for ImageView
    const images = pages.map(p => ({ uri: p.localUri }))

    if (!log) return null

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={[styles.header, isDark && styles.headerDark]}>
                        <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
                            {log.title}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                                onPress={onEdit}
                                style={[styles.actionButton, isDark && styles.actionButtonDark]}
                            >
                                <Pencil size={20} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                            </Pressable>
                            <Pressable
                                onPress={onDelete}
                                style={[styles.actionButton, isDark && styles.actionButtonDark, { borderColor: '#BA4444', backgroundColor: isDark ? 'rgba(186, 68, 68, 0.1)' : 'rgba(186, 68, 68, 0.05)' }]}
                            >
                                <Trash2 size={20} color="#BA4444" />
                            </Pressable>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                        {/* Info Section - Reordered to be First */}
                        <View style={{ marginBottom: 32 }}>
                            {/* Date - Full Width */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('maintenance.field.date')}</Text>
                                <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 22, fontFamily: 'WorkSans_500Medium', textTransform: 'capitalize' }]}>
                                    {formatDate(log.date)}
                                </Text>
                            </View>

                            {/* Cost and Mileage - Row */}
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]}>{t('maintenance.field.cost')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 24, fontFamily: 'Outfit_700Bold', color: isDark ? '#FDFCF8' : '#1C1C1E' }]}>
                                        {log.cost} €
                                    </Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]}>{t('maintenance.field.mileage')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 20, fontFamily: 'Outfit_700Bold' }]}>
                                        {log.mileageAtLog.toLocaleString()} km
                                    </Text>
                                </View>
                            </View>

                            {/* Type */}
                            <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]}>{t('maintenance.field.type')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 18, fontFamily: 'WorkSans_500Medium' }]}>
                                        {t('maintenance.type.' + log.type)}
                                    </Text>
                                </View>
                            </View>

                            {log.notes && (
                                <View style={{ backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]}>{t('maintenance.detail.notes')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { lineHeight: 24 }]}>
                                        {log.notes}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Document Images - Now Second */}
                        {document && pages.length > 0 && (
                            <View>
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('maintenance.document.view')}</Text>

                                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: '100%', height: 220 }}>
                                    {pages.map((page, index) => (
                                        <View key={index} style={{ width: 340, marginRight: 10 }}>
                                            <Pressable
                                                onPress={() => {
                                                    setCurrentImageIndex(index)
                                                    setIsImageViewVisible(true)
                                                }}
                                                style={{
                                                    height: '100%',
                                                    borderRadius: 20,
                                                    overflow: 'hidden',
                                                    backgroundColor: isDark ? '#1C1C1E' : '#F5F5F0',
                                                    borderWidth: 1,
                                                    borderColor: isDark ? '#3A3A3C' : '#E6E5E0',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 12,
                                                    elevation: 4,
                                                }}
                                            >
                                                <SmartImage
                                                    localUri={page.localUri}
                                                    remotePath={page.remotePath}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />

                                            </Pressable>
                                        </View>
                                    ))}
                                </ScrollView>
                                {pages.length > 1 && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                                        {pages.map((_, i) => (
                                            <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDark ? '#666660' : '#D6D5D0', marginHorizontal: 4 }} />
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={{ fontFamily: 'WorkSans_600SemiBold', fontSize: 16, color: '#666660' }}>{t('common.close')}</Text>
                        </Pressable>
                    </ScrollView>

                    {/* Full Screen Image Viewer */}
                    <ImageView
                        images={images}
                        imageIndex={currentImageIndex}
                        visible={isImageViewVisible}
                        onRequestClose={() => setIsImageViewVisible(false)}
                        swipeToCloseEnabled={true}
                        doubleTapToZoomEnabled={true}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

// Wrapper to handle conditional rendering and observables
const MaintenanceDetailModal = ({ log, ...props }: Omit<MaintenanceDetailModalProps, 'documents'>) => {
    if (!log) return null;

    const Enhanced = withObservables(['log'], ({ log }) => ({
        log,
        documents: log.documents
    }))(MaintenanceDetailModalComponent)

    // @ts-ignore - handled by withObservables
    return <Enhanced log={log} {...props} />
}

export default MaintenanceDetailModal
