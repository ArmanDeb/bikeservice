import { database } from '../database'
import { TableName } from '../database/constants'
import Document from '../database/models/Document'
import { Q } from '@nozbe/watermelondb'
import { sync } from './SyncService'
import { StorageService } from './StorageService'
import { supabase } from './Supabase'

// Document types that are shared at user level (not tied to a vehicle)
const USER_LEVEL_TYPES = ['license'] as const
type UserLevelType = typeof USER_LEVEL_TYPES[number]

const isUserLevelType = (type: string): type is UserLevelType => {
    return USER_LEVEL_TYPES.includes(type as UserLevelType)
}

export const DocumentService = {
    // Observe all documents, ordered by expiry date
    observeDocuments: () => {
        return database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(Q.sortBy('expiry_date', Q.asc))
            .observe()
    },

    // Observe documents for a specific vehicle + shared user-level documents (like license)
    observeDocumentsForVehicle: (vehicleId: string) => {
        return database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(
                Q.or(
                    Q.where('vehicle_id', vehicleId),
                    Q.where('vehicle_id', null) // User-level docs (license)
                ),
                Q.sortBy('expiry_date', Q.asc)
            )
            .observe()
    },

    // Get documents for a specific vehicle (Fetch version for PDF service)
    getDocumentsForVehicle: async (vehicleId: string): Promise<Document[]> => {
        return await database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(
                Q.or(
                    Q.where('vehicle_id', vehicleId),
                    Q.where('vehicle_id', null)
                )
            )
            .fetch()
    },

    // Observe only user-level documents (not tied to any vehicle)
    observeUserLevelDocuments: () => {
        return database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(
                Q.where('vehicle_id', null),
                Q.sortBy('expiry_date', Q.asc)
            )
            .observe()
    },

    // Check if a shared license already exists
    getLicense: async (): Promise<Document | null> => {
        const licenses = await database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(
                Q.where('type', 'license'),
                Q.where('vehicle_id', null)
            )
            .fetch()
        return licenses.length > 0 ? licenses[0] : null
    },

    // Observe the shared license
    observeLicense: () => {
        return database.collections
            .get<Document>(TableName.DOCUMENTS)
            .query(
                Q.where('type', 'license'),
                Q.where('vehicle_id', null)
            )
            .observe()
    },

    // Create a new document
    // License is automatically created as user-level (no vehicle)
    createDocument: async (
        title: string,
        type: 'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other',
        expiryDate: Date | null,
        filePath: string | null,
        vehicleId?: string
    ) => {
        // License is always user-level, so don't attach to a vehicle
        const shouldAttachToVehicle = vehicleId && !isUserLevelType(type)

        // Try to upload file if exists
        let remotePath: string | null = null
        if (filePath) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                remotePath = await StorageService.uploadFile(filePath, user.id)
            }
        }

        await database.write(async () => {
            await database.collections.get<Document>(TableName.DOCUMENTS).create(doc => {
                doc.reference = title
                doc.type = type
                doc.expiryDate = expiryDate || undefined
                doc.localUri = filePath || undefined
                doc.remotePath = remotePath || undefined
                if (shouldAttachToVehicle) {
                    doc.vehicle!.id = vehicleId
                }
                // If it's a license, vehicle.id stays null (user-level document)
            })
        })
        sync()
    },

    // Delete a document (Soft Delete)
    deleteDocument: async (document: Document) => {
        // Delete file from storage if it exists
        if (document.remotePath) {
            await StorageService.deleteFile(document.remotePath)
        }

        await database.write(async () => {
            await document.markAsDeleted()
        })
        sync()
    },

    // Update an existing document
    updateDocument: async (
        document: Document,
        title: string,
        expiryDate: Date | null,
        filePath: string | null,
        type?: 'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other'
    ) => {
        // Try to upload file if new file path provided
        let remotePath: string | null = null
        if (filePath && filePath !== document.localUri) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                remotePath = await StorageService.uploadFile(filePath, user.id)
            }
        }

        await database.write(async () => {
            await document.update(doc => {
                doc.reference = title
                if (type) doc.type = type
                doc.expiryDate = expiryDate || undefined
                if (filePath !== undefined) {
                    doc.localUri = filePath || undefined
                    if (remotePath) doc.remotePath = remotePath
                }
            })
        })
        sync()
    }
}

