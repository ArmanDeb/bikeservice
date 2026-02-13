import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from '../database'
import { supabase } from './Supabase'
import { TableName } from '../database/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const LAST_SYNC_KEY = '@BikeService:lastSyncTimestamp'

export async function sync() {
    await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
            // 1. Calculate timestamp for "changes since"
            const lastPulled = lastPulledAt || 0
            // Reverted: Postgres bigint column expects a number, not an ISO string
            // const lastPulledISO = new Date(lastPulled).toISOString()

            console.log(`🔄 Sync: Pulling changes since ${lastPulled} (${new Date(lastPulled).toISOString()})`)

            // 2. Fetch changes from Supabase
            const { data: vehicles, error: vehiclesError } = await supabase
                .from(TableName.VEHICLES)
                .select('*')
                .gt('updated_at', lastPulled) // Compare bigint with number

            if (vehiclesError) throw new Error('Vehicles Fetch Error: ' + vehiclesError.message)
            console.log(`📥 Sync: Fetched ${vehicles?.length || 0} vehicles`)

            const { data: logs, error: logsError } = await supabase
                .from(TableName.MAINTENANCE_LOGS)
                .select('*')
                .gt('updated_at', lastPulled)

            if (logsError) throw new Error('Logs Fetch Error: ' + logsError.message)
            console.log(`📥 Sync: Fetched ${logs?.length || 0} logs`)

            const { data: docs, error: docsError } = await supabase
                .from(TableName.DOCUMENTS)
                .select('*')
                .gt('updated_at', lastPulled)

            if (docsError) throw new Error('Docs Fetch Error: ' + docsError.message)
            console.log(`📥 Sync: Fetched ${docs?.length || 0} docs`)

            // 3. Format for WatermelonDB
            const safeTimestamp = (ts: any) => {
                if (typeof ts === 'number') return ts
                return new Date(ts).getTime()
            }

            const processChanges = (rows: any[]) => {
                const standardizedRows = rows.map(r => ({
                    ...r,
                    created_at: safeTimestamp(r.created_at),
                    updated_at: safeTimestamp(r.updated_at),
                }))

                return {
                    created: standardizedRows.filter(r => !r.deleted_at && r.created_at > lastPulled),
                    updated: standardizedRows.filter(r => !r.deleted_at && r.created_at <= lastPulled),
                    deleted: standardizedRows.filter(r => !!r.deleted_at).map(r => r.id)
                }
            }

            const changes = {
                [TableName.VEHICLES]: processChanges(vehicles || []),
                [TableName.MAINTENANCE_LOGS]: processChanges(logs || []),
                [TableName.DOCUMENTS]: processChanges(docs || []),
            }

            // 4. Return
            return { changes, timestamp: Date.now() }
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
            const { data: { user } } = await supabase.auth.getUser()

            // If no user, we might be in guest mode or error state. 
            // In strict auth mode, we should probably throw or handle this.
            // For now, if no user, we proceed (local only??) but Supabase will reject if RLS is on.
            if (!user) {
                console.warn("⚠️ Syncing without authenticated user - Supabase writes may fail if RLS is active")
            }

            const sanitize = (record: any) => {
                const { _status, _changed, ...rest } = record
                // Inject user_id if we have one and record doesn't (or overwrite to be safe)
                if (user) {
                    rest.user_id = user.id
                }
                return rest
            }


            // Extract all changes upfront
            const changesSafe = changes as any // Type assertion to bypass strict key checks with TableName constants
            const { created: createdVehicles, updated: updatedVehicles, deleted: deletedVehicles } = changesSafe[TableName.VEHICLES]
            const { created: createdLogs, updated: updatedLogs, deleted: deletedLogs } = changesSafe[TableName.MAINTENANCE_LOGS]
            const { created: createdDocs, updated: updatedDocs, deleted: deletedDocs } = changesSafe[TableName.DOCUMENTS]

            // ============================================
            // PHASE 1: DELETES (Reverse order for FK constraints)
            // ============================================

            if (deletedDocs.length > 0) {
                const { error } = await supabase.from(TableName.DOCUMENTS).delete().in('id', deletedDocs)
                if (error) throw new Error(`Doc Delete Error: ${error.message}`)
            }

            if (deletedLogs.length > 0) {
                const { error } = await supabase.from(TableName.MAINTENANCE_LOGS).delete().in('id', deletedLogs)
                if (error) throw new Error(`Log Delete Error: ${error.message}`)
            }

            if (deletedVehicles.length > 0) {
                const { error } = await supabase.from(TableName.VEHICLES).delete().in('id', deletedVehicles)
                if (error) throw new Error(`Vehicle Delete Error: ${error.message}`)
            }

            // ============================================
            // PHASE 2: CREATES/UPDATES (Normal order)
            // ============================================

            // Vehicles
            if (createdVehicles.length > 0) {
                const { error } = await supabase.from(TableName.VEHICLES).upsert(createdVehicles.map(sanitize))
                if (error) throw new Error(`Vehicle Insert Error: ${error.message}`)
            }
            if (updatedVehicles.length > 0) {
                const { error } = await supabase.from(TableName.VEHICLES).upsert(updatedVehicles.map(sanitize))
                if (error) throw new Error(`Vehicle Update Error: ${error.message}`)
            }

            // Logs
            if (createdLogs.length > 0) {
                const { error } = await supabase.from(TableName.MAINTENANCE_LOGS).upsert(createdLogs.map(sanitize))
                if (error) throw new Error(`Log Insert Error: ${error.message}`)
            }
            if (updatedLogs.length > 0) {
                const { error } = await supabase.from(TableName.MAINTENANCE_LOGS).upsert(updatedLogs.map(sanitize))
                if (error) throw new Error(`Log Update Error: ${error.message}`)
            }

            // Documents
            if (createdDocs.length > 0) {
                const { error } = await supabase.from(TableName.DOCUMENTS).upsert(createdDocs.map(sanitize))
                if (error) throw new Error(`Doc Insert Error: ${error.message}`)
            }
            if (updatedDocs.length > 0) {
                const { error } = await supabase.from(TableName.DOCUMENTS).upsert(updatedDocs.map(sanitize))
                if (error) throw new Error(`Doc Update Error: ${error.message}`)
            }
        },
    })

    // Save last sync timestamp on success
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString())
}
