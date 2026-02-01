import { database } from '../database'
import { TableName } from '../database/constants'
import MaintenanceLog from '../database/models/MaintenanceLog'
import { Q } from '@nozbe/watermelondb'

export const TCOService = {
    // Calculate total cost for a vehicle
    calculateTotalCost: async (vehicleId: string): Promise<number> => {
        const logs = await database.collections
            .get<MaintenanceLog>(TableName.MAINTENANCE_LOGS)
            .query(Q.where('vehicle_id', vehicleId))
            .fetch()

        return logs.reduce((sum, log) => sum + log.cost, 0)
    },

    // Calculate cost per kilometer
    calculateCostPerKm: async (vehicleId: string, currentMileage: number): Promise<number> => {
        if (currentMileage === 0) return 0
        const totalCost = await TCOService.calculateTotalCost(vehicleId)
        return totalCost / currentMileage
    }
}
