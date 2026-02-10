import React, { useState, useEffect } from 'react'
import { Image, ImageProps, View, ActivityIndicator } from 'react-native'
import { FileText } from 'lucide-react-native'
import { StorageService } from '../services/StorageService'

interface SmartImageProps extends Omit<ImageProps, 'source'> {
    localUri?: string | null
    remotePath?: string | null
    fallbackIconSize?: number
}

export const SmartImage = ({ localUri, remotePath, fallbackIconSize = 24, style, ...props }: SmartImageProps) => {
    const [source, setSource] = useState<{ uri: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(false)

            // 1. Try local URI first
            if (localUri) {
                // Determine if file exists or is valid.
                // Image component will trigger onError if invalid.
                // But we can optimistically set it.
                setSource({ uri: localUri })
                setLoading(false)
                return
            }

            // 2. If no local URI, try remote path
            if (remotePath) {
                const signedUrl = await StorageService.downloadFile(remotePath)
                if (signedUrl) {
                    setSource({ uri: signedUrl })
                } else {
                    setError(true)
                }
            } else {
                setError(true)
            }
            setLoading(false)
        }

        load()
    }, [localUri, remotePath])

    if (loading) {
        return (
            <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator color="#9CA3AF" />
            </View>
        )
    }

    if (error || !source) {
        return (
            <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F0' }]}>
                <FileText size={fallbackIconSize} color="#9CA3AF" />
            </View>
        )
    }

    return (
        <Image
            {...props}
            style={style}
            source={source}
            onError={async () => {
                // If local URI failed, try fetching remote
                if (localUri && remotePath && source.uri === localUri) {
                    console.log('Local URI failed, trying remote fallback...')
                    const signedUrl = await StorageService.downloadFile(remotePath)
                    if (signedUrl) {
                        setSource({ uri: signedUrl })
                    } else {
                        setError(true)
                    }
                } else {
                    setError(true)
                }
            }}
        />
    )
}
