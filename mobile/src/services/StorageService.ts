import { supabase } from './Supabase'
import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'

export const StorageService = {
    uploadFile: async (localUri: string, userId: string): Promise<string | null> => {
        try {
            // Extract filename and extension
            const filename = localUri.split('/').pop() || `doc_${Date.now()}.jpg`
            const extension = filename.split('.').pop()?.toLowerCase() || 'jpg'

            // Generate path: user_id/timestamp_filename
            const filePath = `${userId}/${Date.now()}_${filename}`

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(localUri, {
                encoding: 'base64',
            })

            // Determine content type
            let contentType = 'application/octet-stream'
            if (['jpg', 'jpeg'].includes(extension)) contentType = 'image/jpeg'
            if (['png'].includes(extension)) contentType = 'image/png'
            if (['pdf'].includes(extension)) contentType = 'application/pdf'

            const { data, error } = await supabase.storage
                .from('documents')
                .upload(filePath, decode(base64), {
                    contentType,
                    upsert: true,
                })

            if (error) {
                console.error('Storage Upload Error:', error)
                return null
            }

            return data?.path || null
        } catch (error) {
            console.error('File Read/Upload Error:', error)
            return null
        }
    },

    downloadFile: async (remotePath: string): Promise<string | null> => {
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(remotePath, 60 * 60) // 1 hour expiry

            if (error) {
                console.error('Storage Signed URL Error:', error)
                return null
            }

            return data?.signedUrl || null
        } catch (error) {
            console.error('Download Error:', error)
            return null
        }
    },

    deleteFile: async (remotePath: string): Promise<boolean> => {
        try {
            const { error } = await supabase.storage
                .from('documents')
                .remove([remotePath])

            if (error) {
                console.error('Storage Delete Error:', error)
                return false
            }
            return true
        } catch (error) {
            console.error('Delete File Error:', error)
            return false
        }
    },

    cacheFile: async (sourceUri: string): Promise<string> => {
        try {
            const filename = sourceUri.split('/').pop() || `doc_${Date.now()}.jpg`
            // Ensure filename is safe
            const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destination = `${FileSystem.documentDirectory}documents/${Date.now()}_${safeFilename}`

            // Ensure dir exists
            const dir = `${FileSystem.documentDirectory}documents/`
            const dirInfo = await FileSystem.getInfoAsync(dir)
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
            }

            await FileSystem.copyAsync({ from: sourceUri, to: destination })
            return destination
        } catch (error) {
            console.error('Cache File Error:', error)
            return sourceUri // Fallback to original if copy fails
        }
    }
}
