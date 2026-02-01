import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import { migrations } from './migrations'
import Vehicle from './models/Vehicle'
import MaintenanceLog from './models/MaintenanceLog'
import Document from './models/Document'

const adapter = new SQLiteAdapter({
    schema,
    migrations,
    onSetUpError: error => {
        // Database failed to load -- often because of an error with the Schema
        console.error('Database setup error:', error)
    }
})

export const database = new Database({
    adapter,
    modelClasses: [
        Vehicle,
        MaintenanceLog,
        Document,
    ],
})
