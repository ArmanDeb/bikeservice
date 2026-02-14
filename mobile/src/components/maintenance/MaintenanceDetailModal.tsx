import React, { useEffect, useState } from 'react'
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import MaintenanceLog from '../../database/models/MaintenanceLog'
import Document from '../../database/models/Document'
import { SmartImage } from '../SmartImage'
import { Pencil, Trash2, X, ChevronLeft } from 'lucide-react-native'
import { database } from '../../database'
import { Q } from '@nozbe/watermelondb'
import { TableName } from '../../database/constants'
import { withObservables } from '@nozbe/watermelondb/react'
import ImageView from 'react-native-image-viewing'
import { StorageService } from '../../services/StorageService'

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
        overflow: 'hidden', // Ensure content respects border radius
    },
    modalContentDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E5E0',
    },
    headerDark: {
        borderBottomColor: '#3A3A3C',
    },
    bodyTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        lineHeight: 34,
        color: '#1C1C1E',
        marginBottom: 24,
    },
    bodyTitleDark: {
        color: '#FDFCF8',
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: '#1C1C1E',
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    titleDark: {
        color: '#FDFCF8',
    },
    sectionTitle: {
        fontSize: 11, // Reduced from 12 to fit longer words like KILOMÉTRAGE
        fontFamily: 'Outfit_700Bold',
        color: '#666660',
        textTransform: 'uppercase',
        letterSpacing: 0.5, // Reduced from 1
        marginBottom: 4, // Reduced from 8
        marginTop: 16, // Reduced from 24
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
    // closeButton style removed as it's no longer used at bottom
    closeButtonHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F0',
    },
    closeButtonHeaderDark: {
        backgroundColor: '#3A3A3C',
    }
})

const MaintenanceDetailModalComponent = ({ visible, onClose, log, documents, onEdit, onDelete }: MaintenanceDetailModalProps) => {
    const { t, language } = useLanguage()
    const { isDark } = useTheme()
    const [isImageViewVisible, setIsImageViewVisible] = useState(false)
    const [pages, setPages] = useState<{ localUri: string | null, remotePath: string | null }[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [galleryImages, setGalleryImages] = useState<{ uri: string }[]>([])

    const document = documents.length > 0 ? documents[0] : null

    useEffect(() => {
        let isMounted = true

        const loadImages = async () => {
            if (!document) return

            let initialPages: { localUri: string | null, remotePath: string | null }[] = [{
                localUri: document.localUri || null,
                remotePath: document.remotePath || null
            }]

            try {
                // Fetch additional pages if any
                const fetchedPages = await document.pages.fetch()
                if (fetchedPages.length > 0) {
                    const sorted = fetchedPages.sort((a, b) => a.pageIndex - b.pageIndex)
                    initialPages = sorted.map(p => ({
                        localUri: p.localUri || null,
                        remotePath: p.remotePath || null
                    }))
                }
            } catch (e) {
                console.error('Error fetching pages:', e)
            }

            if (!isMounted) return

            setPages(initialPages)

            // Resolve URIs for ImageView
            const resolved = await Promise.all(initialPages.map(async (p) => {
                // Try remote path first for reliability
                if (p.remotePath) {
                    try {
                        const signed = await StorageService.downloadFile(p.remotePath)
                        if (signed) return { uri: signed }
                    } catch (e) {
                        console.warn('Failed to resolve remote path:', e)
                    }
                }

                // Fallback to local URI if remote failed or not available
                if (p.localUri) return { uri: p.localUri }

                return null
            }))

            if (isMounted) {
                const validImages = resolved.filter((i): i is { uri: string } => i !== null)
                setGalleryImages(validImages)
            }
        }

        loadImages()

        return () => {
            isMounted = false
        }
    }, [document])

    // Use resolved images for ImageView
    const images = galleryImages

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
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={[styles.header, isDark && styles.headerDark]}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.actionButton,
                                isDark && styles.actionButtonDark,
                                { opacity: pressed ? 0.7 : 1, width: 40, height: 40 }
                            ]}
                        >
                            <ChevronLeft size={24} color={isDark ? '#FDFCF8' : '#1C1C1E'} />
                        </Pressable>

                        <View style={{ flex: 1 }} />

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

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Title Section - Moved here */}
                        <Text style={[styles.bodyTitle, isDark && styles.bodyTitleDark]}>
                            {log.title}
                        </Text>
                        {/* Info Section */}
                        <View style={{ marginBottom: 24 }}>
                            {/* Date - Full Width */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]} numberOfLines={1} adjustsFontSizeToFit>{t('maintenance.field.date')}</Text>
                                <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 22, fontFamily: 'WorkSans_500Medium', textTransform: 'capitalize' }]}>
                                    {formatDate(log.date)}
                                </Text>
                            </View>

                            {/* Type - Moved here */}
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]} numberOfLines={1} adjustsFontSizeToFit>{t('maintenance.field.type')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 18, fontFamily: 'WorkSans_500Medium' },
                                    log.type === 'periodic' && { color: isDark ? '#4ADE80' : '#15803D' },
                                    log.type === 'repair' && { color: isDark ? '#EF6B6B' : '#BA4444' },
                                    log.type === 'modification' && { color: isDark ? '#FACC15' : '#CA8A04' }
                                    ]}>
                                        {t('maintenance.type.' + log.type)}
                                    </Text>
                                </View>
                            </View>

                            {/* Cost and Mileage - Row */}
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]} numberOfLines={1} adjustsFontSizeToFit>{t('maintenance.field.cost')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 24, fontFamily: 'Outfit_700Bold', color: isDark ? '#FDFCF8' : '#1C1C1E' }]} numberOfLines={1} adjustsFontSizeToFit>
                                        {log.cost} €
                                    </Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]} numberOfLines={1} adjustsFontSizeToFit>{t('maintenance.field.mileage')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { fontSize: 20, fontFamily: 'Outfit_700Bold' }]} numberOfLines={1} adjustsFontSizeToFit>
                                        {log.mileageAtLog.toLocaleString()} km
                                    </Text>
                                </View>
                            </View>




                            {log.notes && (
                                <View style={{ backgroundColor: isDark ? '#323234' : '#FAFAF8', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#4B5563' : '#E6E5E0' }}>
                                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: 0 }]}>{t('maintenance.detail.notes')}</Text>
                                    <Text style={[styles.valueText, isDark && styles.valueTextDark, { lineHeight: 24 }]}>
                                        {log.notes}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Document Images */}
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
                    </ScrollView>

                    <ImageView
                        images={images}
                        imageIndex={currentImageIndex}
                        visible={isImageViewVisible}
                        onRequestClose={() => setIsImageViewVisible(false)}
                        swipeToCloseEnabled={true}
                        doubleTapToZoomEnabled={true}
                    />
                </View>
            </View>
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
