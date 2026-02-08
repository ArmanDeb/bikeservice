import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export const migrations = schemaMigrations({
    migrations: [
        {
            // Make vehicle_id optional on documents table to support user-level documents
            // Also converts existing license documents to user-level (shared across all vehicles)
            toVersion: 2,
            steps: [
                // WatermelonDB executes raw SQL for unsupported migrations
                // This sets vehicle_id to NULL for all existing license documents
                {
                    type: 'sql',
                    sql: `UPDATE documents SET vehicle_id = NULL WHERE type = 'license'`
                }
            ],
        },
        {
            toVersion: 3,
            steps: [
                {
                    type: 'add_columns',
                    table: 'vehicles',
                    columns: [
                        { name: 'user_id', type: 'string', isOptional: true, isIndexed: true }
                    ]
                },
                {
                    type: 'add_columns',
                    table: 'maintenance_logs',
                    columns: [
                        { name: 'user_id', type: 'string', isOptional: true, isIndexed: true }
                    ]
                },
                {
                    type: 'add_columns',
                    table: 'documents',
                    columns: [
                        { name: 'user_id', type: 'string', isOptional: true, isIndexed: true }
                    ]
                }
            ]
        },
        {
            toVersion: 4,
            steps: [
                {
                    type: 'add_columns',
                    table: 'vehicles',
                    columns: [
                        { name: 'display_order', type: 'number' }
                    ]
                }
            ]
        }
    ],
})

