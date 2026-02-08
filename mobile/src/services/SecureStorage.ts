import * as SecureStore from 'expo-secure-store';

/**
 * Custom storage adapter for Supabase to use Expo SecureStore.
 * SecureStore is more secure than AsyncStorage as it encrypts data on disk.
 */
export const SecureStorageAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};
