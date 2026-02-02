import { supabase } from './Supabase'
import * as FileSystem from 'expo-file-system'
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
                encoding: FileSystem.EncodingType.Base64,
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
    }
}
