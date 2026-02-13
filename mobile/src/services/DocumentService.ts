import { database } from '../database'
import { TableName } from '../database/constants'
import Document from '../database/models/Document'
import { Q } from '@nozbe/watermelondb'
import { sync } from './SyncService'
import { StorageService } from './StorageService'
import { supabase } from './Supabase'
import DocumentPage from '../database/models/DocumentPage'

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
        type: 'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other' | 'maintenance_invoice',
        expiryDate: Date | null,
        filePaths: string[],
        vehicleId?: string
    ) => {
        // License is always user-level, so don't attach to a vehicle
        const shouldAttachToVehicle = vehicleId && !isUserLevelType(type)

        // Process all files
        const processedPages: { localUri: string, remotePath: string | null }[] = []

        for (const filePath of filePaths) {
            let finalLocalUri = filePath
            let remotePath: string | null = null

            // Cache locally
            finalLocalUri = await StorageService.cacheFile(filePath)

            // Upload if user exists
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                remotePath = await StorageService.uploadFile(finalLocalUri, user.id)
            }
            processedPages.push({ localUri: finalLocalUri, remotePath })
        }

        await database.write(async () => {
            const newDoc = await database.collections.get<Document>(TableName.DOCUMENTS).create(doc => {
                doc.reference = title
                doc.type = type
                doc.expiryDate = expiryDate || undefined
                // Use first page as cover
                doc.localUri = processedPages.length > 0 ? processedPages[0].localUri : undefined
                doc.remotePath = processedPages.length > 0 ? processedPages[0].remotePath || undefined : undefined

                if (shouldAttachToVehicle) {
                    doc.vehicle!.id = vehicleId
                }
            })

            // Create pages
            const batch = processedPages.map((page, index) =>
                database.collections.get<DocumentPage>('document_pages').prepareCreate(p => {
                    p.document.set(newDoc)
                    p.localUri = page.localUri
                    p.remotePath = page.remotePath || undefined
                    p.pageIndex = index
                })
            )

            if (batch.length > 0) {
                await database.batch(...batch)
            }
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
        filePaths: string[],
        type?: 'registration' | 'insurance' | 'license' | 'technical_control' | 'coc' | 'invoice' | 'other' | 'maintenance_invoice'
    ) => {
        // Single write block: handles metadata update, page keep/create/delete
        await database.write(async () => {
            // 1. Update Document Metadata
            await document.update(doc => {
                doc.reference = title
                if (type) doc.type = type
                doc.expiryDate = expiryDate || undefined

                // Update cover to first page
                // We'll calculate the new cover URI after processing
            })

            const existingPages = await document.pages.fetch()
            const existingPageMap = new Map(existingPages.map(p => [p.localUri, p]))

            const batchOperations = []
            let newCoverUri: string | undefined = undefined
            let newCoverRemote: string | undefined = undefined

            for (let i = 0; i < filePaths.length; i++) {
                const uri = filePaths[i]

                if (i === 0) {
                    // This will be the cover
                    // We'll set it at the end or update the document again?
                    // Verify later.
                }

                if (existingPageMap.has(uri)) {
                    // Update index if changed
                    const p = existingPageMap.get(uri)!
                    if (p.pageIndex !== i) {
                        batchOperations.push(p.prepareUpdate(pg => {
                            pg.pageIndex = i
                        }))
                    }
                    existingPageMap.delete(uri) // Remove from map so we know what's left to delete

                    if (i === 0) {
                        newCoverUri = p.localUri
                        newCoverRemote = p.remotePath
                    }
                } else {
                    // New File
                    let finalLocalUri = await StorageService.cacheFile(uri)
                    let remotePath: string | null = null

                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        remotePath = await StorageService.uploadFile(finalLocalUri, user.id)
                    }

                    batchOperations.push(
                        database.collections.get<DocumentPage>('document_pages').prepareCreate(p => {
                            p.document.set(document)
                            p.localUri = finalLocalUri
                            p.remotePath = remotePath || undefined
                            p.pageIndex = i
                        })
                    )

                    if (i === 0) {
                        newCoverUri = finalLocalUri
                        newCoverRemote = remotePath || undefined
                    }
                }
            }

            // Delete remaining
            existingPageMap.forEach(p => {
                batchOperations.push(p.prepareMarkAsDeleted())
            })

            // Update document cover
            batchOperations.push(document.prepareUpdate(doc => {
                doc.localUri = newCoverUri
                doc.remotePath = newCoverRemote
            }))

            await database.batch(...batchOperations)
        })
        sync()
    }
}

