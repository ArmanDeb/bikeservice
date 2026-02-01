import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the API
// Note: In production, we should proxy this through a backend to protect the Key,
// but for this "MVP / Independent Context", client-side is acceptable.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

const MODEL_NAME = 'gemini-flash-latest'

export interface InvoiceData {
    title?: string
    cost?: number
    date?: Date
    type?: 'periodic' | 'repair' | 'modification'
    notes?: string
    mileage?: number
}

export const AIService = {
    /**
     * Analyzes an image (Base64) and extracts invoice details.
     */
    analyzeInvoice: async (base64Image: string): Promise<InvoiceData> => {
        if (!API_KEY) {
            throw new Error('Missing Gemini  API Key. Check .env file.')
        }

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME })

            // Prompt Engineering
            const prompt = `
                You are an expert mechanic assistant. 
                Analyze this image of a vehicle maintenance invoice or receipt.
                Extract the following information in strict JSON format:
                
                {
                    "title": "Short title of the service (e.g., Oil Change, Brake Pad Replacement)",
                    "cost": Number (Total amount found),
                    "date": "ISO 8601 Date String (YYYY-MM-DD)",
                    "type": "One of ['periodic', 'repair', 'modification']",
                    "notes": "Summary of works performed",
                    "mileage": Number (Odometer reading if present, otherwise null)
                }

                Rules:
                - If the document is NOT an invoice, return { "error": "Not an invoice" }.
                - Prefer "periodic" for regular maintenance (oil, filters).
                - Prefer "repair" for fixing broken parts.
                - Prefer "modification" for upgrades.
                - Return ONLY the JSON string, no markdown code blocks.
            `

            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg', // Assuming JPEG from Expo Image Picker
                },
            }

            const result = await model.generateContent([prompt, imagePart])
            const response = result.response
            const text = response.text()

            // Cleanups (Gemini sometimes wraps in ```json ... ```)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

            const data = JSON.parse(cleanText)

            if (data.error) {
                throw new Error(data.error)
            }

            return {
                title: data.title,
                cost: typeof data.cost === 'number' ? data.cost : parseFloat(data.cost),
                date: data.date ? new Date(data.date) : undefined,
                type: data.type,
                notes: data.notes,
                mileage: data.mileage
            }

        } catch (error: any) {
            console.error('AI Analysis Failed:', error)
            throw new Error(`Failed to analyze invoice: ${error.message}`)
        }
    }
}
