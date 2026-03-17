import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './Supabase';
import { MOTORCYCLE_DATA, BRANDS as STATIC_BRANDS } from '../data/motorcycleData';

export interface CatalogEntry {
    id: string;
    brand: string;
    model: string;
    category?: string;
    engine_cc?: number;
}

const CACHE_KEY = '@BikeService:motorcycleCatalog';
const CACHE_TIMESTAMP_KEY = '@BikeService:motorcycleCatalogTimestamp';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let memCache: CatalogEntry[] | null = null;

export const CatalogService = {
    async refreshCache(): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('motorcycle_catalog')
                .select('id, brand, model, category, engine_cc');

            if (error) throw error;
            if (data && data.length > 0) {
                memCache = data as CatalogEntry[];
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memCache));
                await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            }
        } catch (err) {
            console.warn('Failed to refresh motorcycle catalog from Supabase:', err);
        }
    },

    async ensureCache(): Promise<CatalogEntry[]> {
        if (memCache) return memCache;

        try {
            const cachedStr = await AsyncStorage.getItem(CACHE_KEY);
            const tsStr = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
            
            if (cachedStr && tsStr) {
                const ts = parseInt(tsStr, 10);
                if (Date.now() - ts < TTL_MS) {
                    memCache = JSON.parse(cachedStr) as CatalogEntry[];
                    return memCache;
                }
            }
        } catch (e) {
            console.warn('Error reading catalog cache', e);
        }

        // Fetch and await
        await this.refreshCache();
        
        if (memCache) return memCache;
        
        // Final fallback: Memory cache remains null, return empty array.
        // We will fallback to static data in getters.
        return [];
    },

    async getBrands(): Promise<string[]> {
        const catalog = await this.ensureCache();
        if (!catalog || catalog.length === 0) {
            return STATIC_BRANDS; // Fallback
        }
        
        const brands = new Set(catalog.map(c => c.brand));
        return Array.from(brands).sort();
    },

    async getModelsForBrand(brand: string): Promise<CatalogEntry[]> {
        const catalog = await this.ensureCache();
        if (!catalog || catalog.length === 0) {
            // Fallback to static data
            const models = MOTORCYCLE_DATA[brand] || [];
            return models.map(m => ({
                id: '', // Empty ID means static fallback
                brand,
                model: m
            }));
        }
        
        return catalog
            .filter(c => c.brand === brand)
            .sort((a, b) => a.model.localeCompare(b.model));
    }
};
