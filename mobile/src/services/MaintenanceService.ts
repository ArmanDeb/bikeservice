import { database } from '../database'
import { TableName } from '../database/constants'
import MaintenanceLog from '../database/models/MaintenanceLog'
import Vehicle from '../database/models/Vehicle'
import { Q } from '@nozbe/watermelondb'
import { sync } from './SyncService'
import Document from '../database/models/Document'
import { StorageService } from './StorageService'
import { supabase } from './Supabase'

export const MaintenanceService = {
    // Observe logs for a specific vehicle, sorted by date desc
    observeLogsForVehicle: (vehicleId: string) => {
        return database.collections
            .get<MaintenanceLog>(TableName.MAINTENANCE_LOGS)
            .query(
                Q.where('vehicle_id', vehicleId),
                Q.sortBy('date', Q.desc)
            )
            .observe()
    },

    // Observe all logs, sorted by date desc
    observeAllLogs: () => {
        return database.collections
            .get<MaintenanceLog>(TableName.MAINTENANCE_LOGS)
            .query(
                Q.sortBy('date', Q.desc)
            )
            .observe()
    },

    // Create a new maintenance log with STRICT validation
    createLog: async (
        vehicle: Vehicle,
        title: string,
        type: 'periodic' | 'repair' | 'modification',
        cost: number,
        mileageAtLog: number,
        date: Date,
        notes?: string,
        documentUri?: string // New Argument
    ) => {
        // 1. Validation Logic
        // We REMOVED the strict check to allow backfilling old logs (Historical Data).
        // if (mileageAtLog < vehicle.currentMileage) ... 

        // Try to upload file if exists
        let remotePath: string | null = null
        if (documentUri) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                remotePath = await StorageService.uploadFile(documentUri, user.id)
            }
        }

        // 2. Atomic Transaction (Create Log + Update Vehicle + Create Document)
        await database.write(async () => {
            // Re-fetch vehicle to ensure we have the latest state (fix for stale mileage check)
            const freshVehicle = await database.collections.get<Vehicle>(TableName.VEHICLES).find(vehicle.id)

            // Create the log
            const newLog = await database.collections.get<MaintenanceLog>(TableName.MAINTENANCE_LOGS).create(log => {
                log.vehicle.set(freshVehicle) // Set relation
                log.title = title
                log.type = type
                log.cost = cost
                log.mileageAtLog = mileageAtLog
                log.date = date
                log.notes = notes
            })

            // Update the vehicle's mileage ONLY if the new log represents an increase.
            if (mileageAtLog > freshVehicle.currentMileage) {
                await freshVehicle.update(v => {
                    v.currentMileage = mileageAtLog
                })
            }

            // 3. Create Document if URI provided (Auto-save to Wallet)
            if (documentUri) {
                const docCollection = database.collections.get(TableName.DOCUMENTS)
                await docCollection.create(doc => {
                    // @ts-ignore
                    doc.vehicle.set(freshVehicle)
                    // @ts-ignore
                    doc._raw.log_id = newLog.id
                    // @ts-ignore
                    doc.type = 'invoice'
                    // @ts-ignore
                    doc.reference = `Invoice - ${title}`
                    // @ts-ignore
                    doc.localUri = documentUri
                    // @ts-ignore
                    doc.remotePath = remotePath || undefined
                })
            }
        })
        sync()
    },
    // Delete a maintenance log (with cascade delete of linked documents)
    deleteLog: async (log: MaintenanceLog) => {
        await database.write(async () => {
            // 1. First, delete all documents linked to this log (Foreign Key Cascade)
            const linkedDocuments = await database.collections
                .get<Document>(TableName.DOCUMENTS)
                .query(Q.where('log_id', log.id))
                .fetch()

            for (const doc of linkedDocuments) {
                // Delete remote file if exists
                if (doc.remotePath) {
                    await StorageService.deleteFile(doc.remotePath)
                }
                await doc.markAsDeleted()
            }

            // 2. Now safe to delete the log itself
            await log.markAsDeleted() // WatermelonDB soft delete
            // Note: We are strictly NOT rolling back vehicle mileage as it's complex to determine "what was previous".
            // User can manually update mileage if needed.
        })
        sync()
    },

    // Update a maintenance log
    updateLog: async (
        log: MaintenanceLog,
        title: string,
        type: 'periodic' | 'repair' | 'modification',
        cost: number,
        date: Date,
        notes?: string,
        // We generally don't allow changing mileageAtLog easily as it affects history, 
        // but if user fixes a typo, we won't auto-update vehicle mileage unless it's higher than current max.
        mileageAtLog?: number
    ) => {
        await database.write(async () => {
            await log.update(l => {
                l.title = title
                l.type = type
                l.cost = cost
                l.date = date
                l.notes = notes
                if (mileageAtLog !== undefined) l.mileageAtLog = mileageAtLog
            })

            // Check if this new mileage is the new highest for the vehicle
            if (mileageAtLog) {
                const currentVehicle = await log.vehicle
                const freshVehicle = await database.collections.get<Vehicle>(TableName.VEHICLES).find(currentVehicle.id)

                if (mileageAtLog > freshVehicle.currentMileage) {
                    await freshVehicle.update(v => {
                        v.currentMileage = mileageAtLog
                    })
                }
            }
        })
        sync()
    },
}
