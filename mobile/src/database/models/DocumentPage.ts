import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators'
import { TableName } from '../constants'
import Document from './Document'

export default class DocumentPage extends Model {
    static table = 'document_pages'

    static associations = {
        [TableName.DOCUMENTS]: { type: 'belongs_to', key: 'document_id' },
    } as const

    @relation(TableName.DOCUMENTS, 'document_id') document!: Relation<Document>
    @field('local_uri') localUri!: string
    @field('remote_path') remotePath?: string
    @field('page_index') pageIndex!: number
    @field('width') width?: number
    @field('height') height?: number

    @readonly @date('created_at') createdAt!: Date
    @readonly @date('updated_at') updatedAt!: Date
}
