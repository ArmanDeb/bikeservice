import { Model } from '@nozbe/watermelondb'
import { field, date, children, writer, readonly } from '@nozbe/watermelondb/decorators'
import { TableName } from '../constants'
import MaintenanceLog from './MaintenanceLog'
import Document from './Document'

export default class Vehicle extends Model {
    static table = TableName.VEHICLES

    @field('brand') brand!: string
    @field('model') model!: string
    @field('vin') vin?: string
    @field('year') year?: number
    @field('current_mileage') currentMileage!: number

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
    @field('user_id') userId?: string

    @children(TableName.MAINTENANCE_LOGS) maintenanceLogs!: MaintenanceLog[]
    @children(TableName.DOCUMENTS) documents!: Document[]

    // Action to update mileage (Critical Logic)
    @writer async updateMileage(newMileage: number) {
        if (newMileage < this.currentMileage) {
            // This is a failsafe, but controller layer should handle the UI error
            console.warn('Warning: Reducing mileage. Ensure this is intentional.')
        }
        await this.update(vehicle => {
            vehicle.currentMileage = newMileage
        })
    }
}
