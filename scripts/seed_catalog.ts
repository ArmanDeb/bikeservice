import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read env variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️ No Supabase credentials found in environment. Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    console.warn('⚠️ Exiting seed script.');
    process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CatalogEntry {
    brand: string;
    model: string;
    category: string | null;
    engine_cc: number | null;
}

function extractCC(model: string): number | null {
    // Extract CC looking for number between 50 and 2500
    const match = model.match(/\b([1-9]\d{2,3})\b|([1-9]\d{2,3})(?=[a-zA-Z])/);
    if (match) {
        const num = parseInt(match[1] || match[2], 10);
        if (num >= 50 && num <= 2500) return num;
    }
    
    // Heuristics for typical naming conventions
    const modelUpper = model.toUpperCase();
    if (modelUpper.match(/09$/) || modelUpper.includes('09 ')) return 900;
    if (modelUpper.match(/07$/) || modelUpper.includes('07 ')) return 700;
    if (modelUpper.match(/10$/) || modelUpper.includes('10 ')) return 1000;
    if (modelUpper.match(/12$/) || modelUpper.includes('12 ')) return 1200;
    
    return null;
}

async function seed() {
    console.log('🌱 Starting motorcycle catalog seed...');
    
    const dataPath = path.join(__dirname, '../mobile/src/data/motorcycleData.ts');
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Could not find data file at ${dataPath}`);
        process.exit(1);
    }
    
    const content = fs.readFileSync(dataPath, 'utf-8');
    const lines = content.split('\n');
    
    let currentBrand = '';
    let currentCategory: string | null = null;
    const entries: CatalogEntry[] = [];
    
    for (const line of lines) {
        // Detect brand string matching e.g. 'Yamaha': [
        const brandMatch = line.match(/^\s*'([^']+)':\s*\[/);
        if (brandMatch) {
            currentBrand = brandMatch[1];
            currentCategory = null;
            continue;
        }
        
        // Detect category from comment
        const commentMatch = line.match(/^\s*\/\/\s*(.*)/);
        if (commentMatch) {
            const comment = commentMatch[1].trim();
            // Ignore decorative comments
            if (!comment.includes('═════')) {
                currentCategory = comment;
            }
            continue;
        }
        
        // Extract models enclosed in single quotes
        const modelMatches = [...line.matchAll(/'([^']+)'/g)];
        for (const match of modelMatches) {
            const modelName = match[1];
            entries.push({
                brand: currentBrand,
                model: modelName,
                category: currentCategory,
                engine_cc: extractCC(modelName)
            });
        }
    }
    
    console.log(`🏍️ Parsed ${entries.length} motorcycle entries from static file.`);
    
    // Chunking to avoid too large payloads
    const chunkSize = 100;
    let seeded = 0;
    
    for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = entries.slice(i, i + chunkSize);
        const { error } = await supabase.from('motorcycle_catalog').upsert(chunk, { onConflict: 'brand,model' });
        if (error) {
            console.error('❌ Error upserting chunk:', error);
        } else {
            seeded += chunk.length;
            console.log(`✅ Seeded ${seeded}/${entries.length}`);
        }
    }
    
    console.log('🎉 Seed completed successfully!');
}

seed().catch(console.error);
