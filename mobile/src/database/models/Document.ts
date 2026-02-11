import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation, readonly, children } from '@nozbe/watermelondb/decorators'
import { TableName } from '../constants'
import Vehicle from './Vehicle'
import MaintenanceLog from './MaintenanceLog'
import { Query } from '@nozbe/watermelondb'
import DocumentPage from './DocumentPage'

export default class Document extends Model {
    static table = TableName.DOCUMENTS

    static associations = {
        [TableName.DOCUMENT_PAGES]: { type: 'has_many', foreignKey: 'document_id' },
        [TableName.VEHICLES]: { type: 'belongs_to', key: 'vehicle_id' },
        [TableName.MAINTENANCE_LOGS]: { type: 'belongs_to', key: 'log_id' },
    } as const

    @field('type') type!: 'registration' | 'insurance' | 'invoice' | 'license' | 'technical_control' | 'coc' | 'maintenance_invoice' | 'other'
    @field('reference') reference?: string
    @date('expiry_date') expiryDate?: Date
    @field('local_uri') localUri?: string
    @field('remote_path') remotePath?: string

    @relation(TableName.VEHICLES, 'vehicle_id') vehicle?: Relation<Vehicle>
    @field('vehicle_id') vehicleId?: string
    @relation(TableName.MAINTENANCE_LOGS, 'log_id') maintenanceLog?: Relation<MaintenanceLog>
    @field('log_id') logId?: string

    @children('document_pages') pages!: Query<DocumentPage>

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
    @field('user_id') userId?: string
}
