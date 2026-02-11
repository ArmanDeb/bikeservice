import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { tableSchema } from '@nozbe/watermelondb/Schema'

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
        },
        {
            toVersion: 5,
            steps: [
                {
                    type: 'create_table',
                    schema: tableSchema({
                        name: 'document_pages',
                        columns: [
                            { name: 'document_id', type: 'string', isIndexed: true },
                            { name: 'local_uri', type: 'string' },
                            { name: 'remote_path', type: 'string', isOptional: true },
                            { name: 'page_index', type: 'number' },
                            { name: 'width', type: 'number', isOptional: true },
                            { name: 'height', type: 'number', isOptional: true },
                            { name: 'created_at', type: 'number' },
                            { name: 'updated_at', type: 'number' },
                        ]
                    })
                }
            ]
        },
        {
            toVersion: 6,
            steps: [
                // Re-create document_pages to ensure it has all columns (fix for v5 issues)
                {
                    type: 'sql',
                    sql: 'DROP TABLE IF EXISTS document_pages;'
                },
                {
                    type: 'create_table',
                    schema: tableSchema({
                        name: 'document_pages',
                        columns: [
                            { name: 'document_id', type: 'string', isIndexed: true },
                            { name: 'local_uri', type: 'string' },
                            { name: 'remote_path', type: 'string', isOptional: true },
                            { name: 'page_index', type: 'number' },
                            { name: 'width', type: 'number', isOptional: true },
                            { name: 'height', type: 'number', isOptional: true },
                            { name: 'created_at', type: 'number' },
                            { name: 'updated_at', type: 'number' },
                        ]
                    })
                }
            ]
        }
    ],
})

