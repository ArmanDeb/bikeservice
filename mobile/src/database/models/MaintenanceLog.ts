import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation, readonly, children } from '@nozbe/watermelondb/decorators'
import { TableName } from '../constants'
import Vehicle from './Vehicle'
import Document from './Document'
import { Query, Q } from '@nozbe/watermelondb'

export default class MaintenanceLog extends Model {
    static table = TableName.MAINTENANCE_LOGS

    @field('title') title!: string
    @field('type') type!: 'periodic' | 'repair' | 'modification'
    @field('cost') cost!: number
    @field('mileage_at_log') mileageAtLog!: number
    @date('date') date!: Date
    @field('notes') notes?: string
    @field('vehicle_id') vehicleId!: string

    @relation(TableName.VEHICLES, 'vehicle_id') vehicle!: Relation<Vehicle>

    get documents() {
        return this.collections.get<Document>(TableName.DOCUMENTS).query(
            Q.where('log_id', this.id)
        )
    }

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
    @field('user_id') userId?: string
}
