import React, { useState, useMemo } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Modal, TextInput, Image, Alert, FlatList, ScrollView } from 'react-native'
import { withObservables } from '@nozbe/watermelondb/react'
import { switchMap, of } from 'rxjs'
import * as ImagePicker from 'expo-image-picker'
import { DocumentService } from '../../src/services/DocumentService'
import Document from '../../src/database/models/Document'
import { VehicleService } from '../../src/services/VehicleService'
import Vehicle from '../../src/database/models/Vehicle'
import { useVehicle } from '../../src/context/VehicleContext'
import VehicleItem from '../../src/components/vehicle/VehicleItem'

// User-level document types (shared across all vehicles)
const USER_LEVEL_TYPES = ['license'] as const

// --- Document Item Component ---
const DocumentItem = ({ doc, onPress }: { doc: Document, onPress: (doc: Document) => void }) => (
    <TouchableOpacity onPress={() => onPress(doc)} className="bg-neutral-800 p-4 rounded-xl mb-3 flex-row items-center border border-neutral-700">
        <View className="h-12 w-12 bg-neutral-700 rounded-lg mr-4 items-center justify-center overflow-hidden">
            {doc.localUri ? (
                <Image source={{ uri: doc.localUri }} className="h-full w-full" />
            ) : (
                <Text className="text-2xl">
                    {doc.type === 'invoice' ? '🧾' :
                        doc.type === 'insurance' ? '🛡️' :
                            doc.type === 'license' ? '🪪' :
                                doc.type === 'registration' ? '📝' :
                                    doc.type === 'technical_control' ? '🔧' :
                                        doc.type === 'coc' ? '📋' : '📄'}
                </Text>
            )}
        </View>
        <View className="flex-1">
            <Text className="text-white font-bold text-lg">{doc.reference || 'Untitled'}</Text>
            <Text className="text-neutral-400 text-sm uppercase">{doc.type.replace('_', ' ')}</Text>
        </View>
        <View>
            {doc.expiryDate && (
                <Text className={`text-sm ${doc.expiryDate < new Date() ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                    {doc.expiryDate.toLocaleDateString('fr-FR')}
                </Text>
            )}
        </View>
    </TouchableOpacity>
)

// --- Document Viewer Level ---
const DocumentViewer = ({
    visible,
    onClose,
    document,
    onEdit
}: {
    visible: boolean,
    onClose: () => void,
    document: Document | null,
    onEdit: (doc: Document) => void
}) => {
    if (!document) return null

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View className="flex-1 bg-black">
                {/* Header */}
                <SafeAreaView className="z-10 absolute top-0 left-0 right-0">
                    <View className="flex-row justify-between items-center p-4">
                        <TouchableOpacity onPress={onClose} className="bg-neutral-800/80 p-3 rounded-full">
                            <Text className="text-white font-bold">✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { onClose(); onEdit(document) }} className="bg-neutral-800/80 p-3 rounded-full">
                            <Text className="text-yellow-500 font-bold">Edit</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Content */}
                <View className="flex-1 items-center justify-center p-4">
                    {document.localUri ? (
                        <Image
                            source={{ uri: document.localUri }}
                            className="w-full h-[70%] rounded-lg"
                            resizeMode="contain"
                        />
                    ) : (
                        <View className="items-center justify-center py-20">
                            <Text className="text-8xl mb-4">
                                {document.type === 'invoice' ? '🧾' :
                                    document.type === 'insurance' ? '🛡️' :
                                        document.type === 'license' ? '🪪' :
                                            document.type === 'registration' ? '📝' :
                                                document.type === 'technical_control' ? '🔧' :
                                                    document.type === 'coc' ? '📋' : '📄'}
                            </Text>
                            <Text className="text-neutral-500">No image attached</Text>
                        </View>
                    )}

                    {/* Metadata Footer */}
                    <View className="mt-8 bg-neutral-900 w-full p-6 rounded-2xl border border-neutral-800">
                        <Text className="text-2xl font-bold text-white mb-2">{document.reference || 'Untitled'}</Text>

                        <View className="flex-row justify-between items-center border-t border-neutral-800 pt-4 mt-2">
                            <View>
                                <Text className="text-neutral-500 text-xs uppercase font-bold">Type</Text>
                                <Text className="text-neutral-300 capitalize">{document.type.replace('_', ' ')}</Text>
                            </View>
                            {document.expiryDate && (
                                <View>
                                    <Text className="text-neutral-500 text-xs uppercase font-bold text-right">Expires</Text>
                                    <Text className={`text-right ${document.expiryDate < new Date() ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                                        {document.expiryDate.toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

// --- Document Modal (Add / Edit) ---
const DocumentModal = ({
    visible,
    onClose,
    vehicleId,
    document,
    existingTypes
}: {
    visible: boolean,
    onClose: () => void,
    vehicleId: string | null,
    document?: Document | null,
    existingTypes: string[]
}) => {
    const [title, setTitle] = useState('')
    const [type, setType] = useState<'registration' | 'insurance' | 'license' | 'invoice' | 'technical_control' | 'coc' | 'other'>('other')
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [expiryText, setExpiryText] = useState('')

    // Reset / Populate
    React.useEffect(() => {
        if (visible) {
            if (document) {
                setTitle(document.reference || '')
                setType(document.type)
                setImageUri(document.localUri || null)

                if (document.expiryDate) {
                    const d = document.expiryDate
                    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                    setExpiryText(isoDate)
                } else {
                    setExpiryText('')
                }
            } else {
                setTitle('')

                // Determine a safe default if strict types are hidden
                // Filter legal types against existing ones
                const availableLegal = ['registration', 'license', 'insurance', 'technical_control', 'coc'].filter(t => !existingTypes.includes(t))
                if (availableLegal.length > 0) {
                    // @ts-ignore
                    setType(availableLegal[0])
                } else {
                    setType('other')
                }

                setImageUri(null)
                setExpiryText('')
            }
        }
    }, [visible, document, existingTypes])

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
        }
    }

    const handleDelete = () => {
        if (!document) return
        Alert.alert(
            "Delete Document",
            "Are you sure you want to delete this document?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await DocumentService.deleteDocument(document)
                        onClose()
                    }
                }
            ]
        )
    }

    const handleSubmit = async () => {
        try {
            if (!title) return

            // Simple date parsing for MVP
            let expiryDate = null
            if (expiryText) {
                expiryDate = new Date(expiryText)
                if (isNaN(expiryDate.getTime())) throw new Error("Invalid Date Format (use YYYY-MM-DD)")
            }

            if (document) {
                // Update
                await DocumentService.updateDocument(
                    document,
                    title,
                    expiryDate,
                    imageUri,
                    type
                )
            } else {
                // Create - vehicleId is passed but license will ignore it (user-level)
                await DocumentService.createDocument(
                    title,
                    type,
                    expiryDate,
                    imageUri,
                    vehicleId || undefined
                )
            }
            onClose()
        } catch (e: any) {
            Alert.alert("Error", e.message)
        }
    }

    const legalTypes = ['registration', 'license', 'insurance', 'technical_control', 'coc'] as const
    const visibleLegalTypes = legalTypes.filter(t => {
        // If we are editing, current type must be visible even if it 'exists' (it is this one)
        if (document && document.type === t) return true
        // If adding new, hide if already exists
        if (existingTypes.includes(t)) return false
        return true
    })

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-neutral-900 p-6 rounded-t-3xl border-t border-neutral-800">
                    <Text className="text-2xl font-bold text-white mb-6">
                        {document ? 'Edit Document' : 'Add Document'}
                    </Text>

                    {/* Type Selector */}
                    <Text className="text-neutral-400 mb-2 text-xs uppercase">Document Type</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {visibleLegalTypes.map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                className={`px-3 py-2 rounded-lg border ${type === t ? 'bg-yellow-500 border-yellow-500' : 'bg-neutral-800 border-neutral-700'}`}
                            >
                                <Text className={`text-xs font-bold uppercase ${type === t ? 'text-black' : 'text-neutral-400'}`}>{t.replace('_', ' ')}</Text>
                            </TouchableOpacity>
                        ))}

                        {/* Only show Invoice if we are editing an Invoice, otherwise hide it from manual selection */}
                        {type === 'invoice' && (
                            <TouchableOpacity
                                onPress={() => setType('invoice')}
                                className="px-3 py-2 rounded-lg border bg-purple-500 border-purple-500"
                            >
                                <Text className="text-xs font-bold uppercase text-white">Invoice</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => setType('other')}
                            className={`px-3 py-2 rounded-lg border ${type === 'other' ? 'bg-neutral-600 border-neutral-600' : 'bg-neutral-800 border-neutral-700'}`}
                        >
                            <Text className={`text-xs font-bold uppercase ${type === 'other' ? 'text-white' : 'text-neutral-400'}`}>Other</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="Title (e.g. Insurance)"
                        placeholderTextColor="#666"
                        className="bg-neutral-800 text-white p-4 rounded-xl mb-3 text-lg"
                        value={title} onChangeText={setTitle}
                    />
                    <TextInput
                        placeholder="Expiry (YYYY-MM-DD) - Optional"
                        placeholderTextColor="#666"
                        className="bg-neutral-800 text-white p-4 rounded-xl mb-3 text-lg"
                        value={expiryText} onChangeText={setExpiryText}
                    />

                    <TouchableOpacity onPress={pickImage} className="bg-neutral-800 p-4 rounded-xl mb-6 flex-row items-center justify-center border border-neutral-700 border-dashed">
                        {imageUri ? (
                            <View className="flex-row items-center">
                                <Image source={{ uri: imageUri }} className="w-10 h-10 rounded-md mr-3" />
                                <Text className="text-green-500 font-bold">Change Image</Text>
                            </View>
                        ) : (
                            <Text className="text-neutral-400">📷 Attach Photo</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        {document && (
                            <TouchableOpacity onPress={handleDelete} className="bg-red-500/10 p-4 rounded-xl items-center flex-1 border border-red-500/20">
                                <Text className="text-red-500 font-bold text-lg">Delete</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleSubmit} className="bg-yellow-500 p-4 rounded-xl items-center flex-[2]">
                            <Text className="text-black font-bold text-lg">Save</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={onClose} className="p-4 items-center mt-2">
                        <Text className="text-neutral-500 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

// --- Collapsible Section Component ---
const CollapsibleSection = ({
    title,
    data,
    isExpanded,
    onToggle,
    onPressItem
}: {
    title: string,
    data: Document[],
    isExpanded: boolean,
    onToggle: () => void,
    onPressItem: (doc: Document) => void
}) => {
    if (data.length === 0) return null

    return (
        <View className="mb-4">
            {/* Collapsible Header */}
            <TouchableOpacity
                onPress={onToggle}
                className="flex-row justify-between items-center bg-neutral-800/50 p-4 rounded-xl border border-neutral-700"
            >
                <View className="flex-row items-center">
                    <Text className="text-yellow-500 font-bold uppercase tracking-wider text-sm">
                        {title}
                    </Text>
                    <View className="bg-yellow-500/20 px-2 py-1 rounded-full ml-3">
                        <Text className="text-yellow-500 text-xs font-bold">{data.length}</Text>
                    </View>
                </View>
                <Text className="text-neutral-400 text-xl">
                    {isExpanded ? '▼' : '▶'}
                </Text>
            </TouchableOpacity>

            {/* Content */}
            {isExpanded && (
                <View className="mt-3">
                    {data.map(doc => (
                        <DocumentItem key={doc.id} doc={doc} onPress={onPressItem} />
                    ))}
                </View>
            )}
        </View>
    )
}

// --- Wallet Screen ---
const WalletScreen = ({
    vehicleDocuments,
    allDocuments,
    vehicles
}: {
    vehicleDocuments: Document[],
    allDocuments: Document[],
    vehicles: Vehicle[]
}) => {
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [viewerVisible, setViewerVisible] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
    const { selectedVehicleId, setSelectedVehicleId } = useVehicle()

    // Collapsible section states
    const [legalExpanded, setLegalExpanded] = useState(true)
    const [invoicesExpanded, setInvoicesExpanded] = useState(true)

    // Documents to display = vehicle docs + shared license (handled by observeDocumentsForVehicle)
    const displayDocs = selectedVehicleId ? vehicleDocuments : []

    // Existing types for this view - includes license if it exists globally
    // (License check is global, not per-vehicle)
    const existingTypes = useMemo(() => {
        const vehicleTypes = displayDocs.map(d => d.type)
        // Also check if license exists globally (in allDocuments with null vehicle_id)
        const hasGlobalLicense = allDocuments.some(d => d.type === 'license')
        if (hasGlobalLicense && !vehicleTypes.includes('license')) {
            return [...vehicleTypes, 'license']
        }
        return vehicleTypes
    }, [displayDocs, allDocuments])

    // Group documents for sections
    // Section 1: Legal (ID, Permit, Insurance, Tech Control)
    // Section 2: Invoices (Invoice, Other)
    const legalTypes = ['registration', 'license', 'insurance', 'technical_control', 'coc']
    const legalDocs = displayDocs.filter(d => legalTypes.includes(d.type))
    const otherDocs = displayDocs.filter(d => !legalTypes.includes(d.type))

    const selectedVehicle = selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) : null

    const openAdd = () => {
        setSelectedDoc(null)
        setEditModalVisible(true)
    }

    const openViewer = (doc: Document) => {
        setSelectedDoc(doc)
        setViewerVisible(true)
    }

    // When editing from Viewer
    const handleEditFromViewer = (doc: Document) => {
        setViewerVisible(false)
        setTimeout(() => { // Small delay to allow modal transition
            setSelectedDoc(doc)
            setEditModalVisible(true)
        }, 300)
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="p-6 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-bold text-white">Wallet</Text>
                        {selectedVehicle ? (
                            <TouchableOpacity onPress={() => setSelectedVehicleId(null)}>
                                <Text className="text-neutral-400 text-sm font-bold uppercase tracking-wider flex-row items-center">
                                    <Text className="text-yellow-500">← </Text>
                                    {selectedVehicle.brand} {selectedVehicle.model}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-neutral-500 text-sm">Select a bike to view documents</Text>
                        )}
                    </View>
                    {selectedVehicle && (
                        <TouchableOpacity onPress={openAdd} className="bg-neutral-800 p-2 rounded-full w-10 h-10 items-center justify-center">
                            <Text className="text-white font-bold text-2xl">+</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!selectedVehicleId ? (
                    /* Vehicle List Selection */
                    <FlatList
                        data={vehicles}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <VehicleItem
                                vehicle={item}
                                onPress={(v: Vehicle) => setSelectedVehicleId(v.id)}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-neutral-500 text-lg">No bikes in garage.</Text>
                            </View>
                        }
                    />
                ) : (
                    /* Document Sections - Collapsible */
                    legalDocs.length === 0 && otherDocs.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-6xl mb-4">📂</Text>
                            <Text className="text-neutral-500 text-lg">No documents.</Text>
                            <Text className="text-neutral-700 text-sm mt-2">
                                Add papers for this bike.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Legal & Papers Section */}
                            <CollapsibleSection
                                title="Legal & Papers"
                                data={legalDocs}
                                isExpanded={legalExpanded}
                                onToggle={() => setLegalExpanded(!legalExpanded)}
                                onPressItem={openViewer}
                            />

                            {/* Invoices & History Section */}
                            <CollapsibleSection
                                title="Invoices & History"
                                data={otherDocs}
                                isExpanded={invoicesExpanded}
                                onToggle={() => setInvoicesExpanded(!invoicesExpanded)}
                                onPressItem={openViewer}
                            />
                        </ScrollView>
                    )
                )}
            </View>

            {/* Edit/Add Modal */}
            <DocumentModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                vehicleId={selectedVehicleId}
                document={selectedDoc}
                existingTypes={existingTypes}
            />

            {/* Viewer Modal */}
            <DocumentViewer
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
                document={selectedDoc}
                onEdit={handleEditFromViewer}
            />
        </SafeAreaView>
    )
}

// Enhanced observable: provides both vehicle-specific docs and all docs for license check
const enhance = withObservables(['selectedVehicleId'], ({ selectedVehicleId }: { selectedVehicleId: string | null }) => ({
    vehicleDocuments: selectedVehicleId
        ? DocumentService.observeDocumentsForVehicle(selectedVehicleId)
        : of([]),
    allDocuments: DocumentService.observeDocuments(),
    vehicles: VehicleService.observeVehicles(),
}))

// Wrapper to pass selectedVehicleId from context to the enhanced component
const WalletScreenWrapper = () => {
    const { selectedVehicleId } = useVehicle()
    const EnhancedWallet = enhance(WalletScreen)
    return <EnhancedWallet selectedVehicleId={selectedVehicleId} />
}

export default WalletScreenWrapper

