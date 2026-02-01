import { database } from '../database'
import { TableName } from '../database/constants'
import Vehicle from '../database/models/Vehicle'
import { sync } from './SyncService'

import { Q } from '@nozbe/watermelondb'

export const VehicleService = {
    // Observe all vehicles (Reactive)
    observeVehicles: () => {
        return database.collections.get<Vehicle>(TableName.VEHICLES).query().observe()
    },


    // Create a new vehicle
    createVehicle: async (brand: string, model: string, year: number | undefined, vin: string | undefined, initialMileage: number) => {
        await database.write(async () => {
            await database.collections.get<Vehicle>(TableName.VEHICLES).create(vehicle => {
                vehicle.brand = brand
                vehicle.model = model
                vehicle.year = year
                vehicle.vin = vin
                vehicle.currentMileage = initialMileage
            })
        })
        sync()
    },

    // Update vehicle details
    updateVehicle: async (vehicle: Vehicle, brand: string, model: string, year?: number, vin?: string, mileage?: number) => {
        await database.write(async () => {
            await vehicle.update(v => {
                v.brand = brand
                v.model = model
                v.year = year
                v.vin = vin
                if (mileage !== undefined) {
                    v.currentMileage = mileage
                }
            })
        })
        sync()
    },

    // Delete vehicle (Cascade delete to avoid Foreign Key constraints)
    deleteVehicle: async (vehicle: Vehicle) => {
        await database.write(async () => {
            // 1. Delete associated Maintenance Logs
            const logs = await database.collections.get(TableName.MAINTENANCE_LOGS)
                .query(Q.where('vehicle_id', vehicle.id)).fetch()
            for (const log of logs) {
                await log.markAsDeleted()
            }

            // 2. Delete associated Documents
            const docs = await database.collections.get(TableName.DOCUMENTS)
                .query(Q.where('vehicle_id', vehicle.id)).fetch()
            for (const doc of docs) {
                await doc.markAsDeleted()
            }

            // 3. Delete the Vehicle itself
            await vehicle.markAsDeleted()
        })
        sync()
    },
}
