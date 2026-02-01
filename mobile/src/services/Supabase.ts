import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// NOTE: These should be in .env, but for now we use placeholders or expect them to be injected.
// Since we don't have them yet, we'll use empty strings to avoid crashes, but sync will fail (as expected).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
