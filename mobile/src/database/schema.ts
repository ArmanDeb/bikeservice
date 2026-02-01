import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
    version: 2,
    tables: [
        tableSchema({
            name: 'vehicles',
            columns: [
                { name: 'brand', type: 'string' },
                { name: 'model', type: 'string' },
                { name: 'vin', type: 'string', isOptional: true },
                { name: 'year', type: 'number', isOptional: true },
                { name: 'current_mileage', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'maintenance_logs',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'type', type: 'string' }, // 'periodic', 'repair', 'modification'
                { name: 'cost', type: 'number' },
                { name: 'mileage_at_log', type: 'number' },
                { name: 'date', type: 'number' }, // Timestamp
                { name: 'vehicle_id', type: 'string', isIndexed: true },
                { name: 'notes', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'documents',
            columns: [
                { name: 'type', type: 'string' }, // 'registration', 'insurance', 'invoice'
                { name: 'reference', type: 'string', isOptional: true }, // e.g. Invoice number
                { name: 'expiry_date', type: 'number', isOptional: true },
                { name: 'local_uri', type: 'string', isOptional: true }, // Path to cached local file
                { name: 'remote_path', type: 'string', isOptional: true }, // Supabase storage path
                { name: 'vehicle_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'log_id', type: 'string', isOptional: true, isIndexed: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
    ],
})
