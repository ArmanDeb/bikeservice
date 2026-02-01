import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators'
import { TableName } from '../constants'
import Vehicle from './Vehicle'
import MaintenanceLog from './MaintenanceLog'

export default class Document extends Model {
    static table = TableName.DOCUMENTS

    @field('type') type!: 'registration' | 'insurance' | 'invoice' | 'license' | 'technical_control' | 'coc' | 'other'
    @field('reference') reference?: string
    @date('expiry_date') expiryDate?: Date
    @field('local_uri') localUri?: string
    @field('remote_path') remotePath?: string

    @relation(TableName.VEHICLES, 'vehicle_id') vehicle?: Relation<Vehicle>
    @relation(TableName.MAINTENANCE_LOGS, 'log_id') maintenanceLog?: Relation<MaintenanceLog>

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
