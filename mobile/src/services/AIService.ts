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
    analyzeInvoice: async (base64Image: string, language: 'fr' | 'en' = 'en'): Promise<InvoiceData> => {
        if (!API_KEY) {
            throw new Error('Missing Gemini  API Key. Check .env file.')
        }

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME })

            const langName = language === 'fr' ? 'French (Français)' : 'English';

            // Prompt Engineering
            const prompt = `
                You are an expert mechanic assistant. 
                Analyze this image of a vehicle maintenance invoice or receipt.
                Extract the following information in strict JSON format.
                IMPORTANT: The "title" and "notes" must be written in ${langName}.
                
                {
                    "title": "Short title of the service (e.g., Oil Change, Vidange, Entretien)",
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
    },

    /**
     * Generates a professional summary of the vehicle's maintenance history.
     */
    generateVehicleSummary: async (vehicleInfo: string, logs: any[], language: 'fr' | 'en' = 'fr'): Promise<string> => {
        if (!API_KEY) {
            throw new Error('Missing Gemini API Key.')
        }

        try {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME })

            const logDataStr = logs.map(l =>
                `- ${l.date.toLocaleDateString()}: ${l.title} (${l.cost}€) at ${l.mileageAtLog}km. Type: ${l.type}. Notes: ${l.notes || 'None'}`
            ).join('\n')

            const langName = language === 'fr' ? 'French (Français)' : 'English';

            const prompt = `
                You are a senior motorcycle technician and vehicle valuation expert.
                The user wants a professional summary for their vehicle's maintenance report.
                
                Vehicle: ${vehicleInfo}
                Maintenance Logs:
                ${logDataStr}

                Tasks:
                1. Provide a concise "Technical Health Status" (Excellent, Good, Needs Attention).
                2. Highlight the major services performed.
                3. Mention if the maintenance frequency seems regular.
                4. Give a one-sentence advice for the next owner or the current one.

                Output:
                A well-structured, professional block of text (markdown is OK but keep it clean for PDF usage).
                Keep it under 1500 characters.
                CRITICAL: The output must be entirely in ${langName}.
            `

            const result = await model.generateContent(prompt)
            return result.response.text()

        } catch (error: any) {
            console.error('AI Summary Generation Failed:', error)
            return language === 'fr'
                ? "Une erreur s'est produite lors de la génération du résumé IA. La maintenance semble néanmoins bien suivie."
                : "An error occurred during AI summary generation. Maintenance seems well tracked regardless.";
        }
    }
}
