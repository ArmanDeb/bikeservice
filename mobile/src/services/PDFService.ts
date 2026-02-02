import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    documentDirectory,
    cacheDirectory,
    readAsStringAsync,
    EncodingType,
    getInfoAsync,
    StorageAccessFramework
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Vehicle from '../database/models/Vehicle';
import MaintenanceLog from '../database/models/MaintenanceLog';
import Document from '../database/models/Document';
import { Alert, Platform } from 'react-native';

const SAVED_DIRECTORY_KEY = '@BikeService:savedPdfDirectory';

/**
 * Builds the HTML content for the PDF report.
 */
const buildHtml = (
    vehicle: Vehicle,
    logs: MaintenanceLog[],
    invoiceDocs: { type: string; reference?: string; base64?: string }[],
    language: 'fr' | 'en' = 'fr',
    summary?: string
) => {
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const dateLocale = language === 'fr' ? 'fr-FR' : 'en-US';
    const dateStr = new Date().toLocaleDateString(dateLocale);

    // Translations for PDF Labels
    const labels = {
        title: language === 'fr' ? 'Fiche de Maintenance' : 'Maintenance Report',
        generated: language === 'fr' ? 'Généré le' : 'Generated on',
        summary: language === 'fr' ? 'Résumé Technique' : 'Technical Summary',
        vehicleInfo: language === 'fr' ? 'Informations Véhicule' : 'Vehicle Information',
        brandModel: language === 'fr' ? 'Marque / Modèle' : 'Make / Model',
        mileage: language === 'fr' ? 'Kilométrage Actuel' : 'Current Mileage',
        totalCost: language === 'fr' ? 'Coût Total d\'Entretien' : 'Total Maintenance Cost',
        interventions: language === 'fr' ? 'Nombre d\'interventions' : 'Number of Records',
        history: language === 'fr' ? 'Historique des entretiens' : 'Maintenance History',
        tableDate: language === 'fr' ? 'Date' : 'Date',
        tableDesc: language === 'fr' ? 'Description des travaux' : 'Service Description',
        tableKM: language === 'fr' ? 'KM' : 'KM',
        tableCat: language === 'fr' ? 'Catégorie' : 'Category',
        tableCost: language === 'fr' ? 'Coût' : 'Cost',
        footer: language === 'fr'
            ? 'Ce document constitue un historique officiel de maintenance pour le véhicule.'
            : 'This document constitutes an official maintenance history for the vehicle.',
        annex: language === 'fr' ? 'Annexe' : 'Annex',
        noImage: language === 'fr' ? 'Image non disponible' : 'Image not available',
        justificatif: language === 'fr' ? 'Justificatif' : 'Supporting Doc'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 20px; background-color: #fff; }
                .header { text-align: center; border-bottom: 2px solid #facc15; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { margin: 0; color: #000; font-size: 24px; text-transform: uppercase; }
                
                .section { margin-bottom: 20px; }
                .section-title { font-size: 16px; font-weight: bold; color: #000; border-left: 5px solid #facc15; padding-left: 10px; margin-bottom: 10px; text-transform: uppercase; }
                
                .info-grid { display: flex; flex-wrap: wrap; background: #f9f9f9; padding: 12px; border-radius: 8px; }
                .info-item { width: 50%; margin-bottom: 8px; font-size: 13px; }
                .info-label { color: #888; margin-bottom: 2px; }
                .info-value { font-weight: bold; color: #333; }

                .summary-box { background: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fef3c7; font-size: 12px; font-style: italic; margin-bottom: 20px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th { text-align: left; background: #333; color: #fff; padding: 10px; font-size: 11px; text-transform: uppercase; }
                td { border-bottom: 1px solid #eee; padding: 10px; font-size: 12px; }
                .type-badge { font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 5px; border-radius: 4px; background: #eee; }
                
                .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
                
                .page-break { page-break-after: always; }
                
                .annex-container { text-align: center; margin-bottom: 30px; page-break-inside: avoid; }
                .annex-image { max-width: 100%; max-height: 700px; display: block; margin: 0 auto; border-radius: 4px; object-fit: contain; }
                .annex-title { font-weight: bold; margin-bottom: 10px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${labels.title} : ${vehicle.brand} ${vehicle.model}</h1>
                <p>${labels.generated} ${dateStr}</p>
            </div>

            ${summary ? `
            <div class="section">
                <div class="section-title">${labels.summary}</div>
                <div class="summary-box">
                    ${summary.replace(/\n/g, '<br/>')}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">${labels.vehicleInfo}</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">${labels.brandModel}</div>
                        <div class="info-value">${vehicle.brand} ${vehicle.model}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">${labels.mileage}</div>
                        <div class="info-value">${vehicle.currentMileage.toLocaleString()} km</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">${labels.totalCost}</div>
                        <div class="info-value">${totalCost.toLocaleString()} €</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">${labels.interventions}</div>
                        <div class="info-value">${logs.length}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">${labels.history}</div>
                <table>
                    <thead>
                        <tr>
                            <th>${labels.tableDate}</th>
                            <th>${labels.tableDesc}</th>
                            <th>${labels.tableKM}</th>
                            <th>${labels.tableCat}</th>
                            <th>${labels.tableCost}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                        <tr>
                            <td>${log.date.toLocaleDateString(dateLocale)}</td>
                            <td><strong>${log.title}</strong></td>
                            <td>${log.mileageAtLog.toLocaleString()}</td>
                            <td><span class="type-badge">${log.type}</span></td>
                            <td style="font-weight: bold;">${log.cost} €</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                ${labels.footer}
            </div>

            ${invoiceDocs.length > 0 ? `
                <div class="page-break"></div>
                ${invoiceDocs.map((doc, idx) => `
                    <div class="annex-container">
                        <div class="section-title">${labels.annex} ${idx + 1} : ${doc.type.toUpperCase()}</div>
                        ${doc.reference ? `<p style="font-size: 11px; margin-bottom: 10px;">Réf: ${doc.reference}</p>` : ''}
                        ${doc.base64 ? `<img src="data:image/jpeg;base64,${doc.base64}" class="annex-image" />` : `<p style="color: #999;">${labels.noImage}</p>`}
                    </div>
                    ${idx < invoiceDocs.length - 1 ? '<div class="page-break"></div>' : ''}
                `).join('')}
            ` : ''}
        </body>
        </html>
    `;
}

/**
 * Try to save to previously selected directory, or ask user to choose one
 */
async function saveToDirectory(pdfUri: string, fileName: string): Promise<boolean> {
    // Try to get previously saved directory
    const savedDirectory = await AsyncStorage.getItem(SAVED_DIRECTORY_KEY);

    if (savedDirectory) {
        try {
            console.log('[PDFService] Using saved directory:', savedDirectory);

            const newFileUri = await StorageAccessFramework.createFileAsync(
                savedDirectory,
                fileName,
                'application/pdf'
            );

            const pdfBase64 = await readAsStringAsync(pdfUri, {
                encoding: EncodingType.Base64,
            });

            await StorageAccessFramework.writeAsStringAsync(newFileUri, pdfBase64, {
                encoding: EncodingType.Base64,
            });

            console.log('[PDFService] PDF saved to saved directory!');
            return true;
        } catch (e: any) {
            console.log('[PDFService] Saved directory failed, asking user again:', e.message);
            // Permission expired or directory deleted, ask user again
            await AsyncStorage.removeItem(SAVED_DIRECTORY_KEY);
        }
    }

    // Ask user to choose directory
    console.log('[PDFService] Asking user to choose download folder...');
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
        // Save the directory for future use
        await AsyncStorage.setItem(SAVED_DIRECTORY_KEY, permissions.directoryUri);
        console.log('[PDFService] Saved directory for future:', permissions.directoryUri);

        const newFileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/pdf'
        );

        const pdfBase64 = await readAsStringAsync(pdfUri, {
            encoding: EncodingType.Base64,
        });

        await StorageAccessFramework.writeAsStringAsync(newFileUri, pdfBase64, {
            encoding: EncodingType.Base64,
        });

        console.log('[PDFService] PDF saved successfully!');
        return true;
    }

    return false;
}

export const PDFService = {
    generateReport: async (
        vehicle: Vehicle,
        logs: MaintenanceLog[],
        documents: Document[],
        language: 'fr' | 'en' = 'fr',
        summary?: string
    ) => {
        try {
            console.log('[PDFService] Processing', documents.length, 'documents...');

            // Convert local images to Base64 for reliable rendering in PDF
            const invoiceDocs: { type: string; reference?: string; base64?: string }[] = [];

            for (const doc of documents) {
                if (!doc.localUri) {
                    console.log('[PDFService] Skipping doc with no localUri');
                    continue;
                }

                try {
                    let uri = doc.localUri;
                    if (!uri.startsWith('file://')) {
                        uri = 'file://' + uri;
                    }

                    console.log('[PDFService] Reading image from:', uri);

                    const fileInfo = await getInfoAsync(uri);
                    console.log('[PDFService] File exists:', fileInfo.exists);

                    const justificatifLabel = language === 'fr' ? 'Justificatif' : 'Supporting Doc';

                    if (!fileInfo.exists) {
                        console.warn('[PDFService] File does not exist:', uri);
                        invoiceDocs.push({ type: doc.type || justificatifLabel, reference: doc.reference });
                        continue;
                    }

                    const base64 = await readAsStringAsync(uri, {
                        encoding: EncodingType.Base64,
                    });

                    console.log('[PDFService] Successfully read image, base64 length:', base64.length);

                    invoiceDocs.push({
                        type: doc.type || justificatifLabel,
                        reference: doc.reference,
                        base64
                    });
                } catch (e: any) {
                    console.error('[PDFService] Could not read image:', doc.localUri, e.message);
                    invoiceDocs.push({ type: doc.type || (language === 'fr' ? 'Justificatif' : 'Supporting Doc'), reference: doc.reference });
                }
            }

            console.log('[PDFService] Building HTML with', invoiceDocs.length, 'attachments...');
            const html = buildHtml(vehicle, logs, invoiceDocs, language, summary);

            console.log('[PDFService] Generating PDF file...');
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            console.log('[PDFService] PDF generated at:', uri);

            const reportPrefix = language === 'fr' ? 'Rapport' : 'Report';
            const fileName = `${reportPrefix}_${vehicle.brand}_${vehicle.model}_${new Date().toISOString().split('T')[0]}.pdf`;

            // On Android, save to Downloads folder automatically
            if (Platform.OS === 'android') {
                console.log('[PDFService] Android detected, saving to Downloads...');

                try {
                    const saved = await saveToDirectory(uri, fileName);

                    if (saved) {
                        const alertTitle = language === 'fr' ? "Rapport Enregistré ✅" : "Report Saved ✅";
                        const alertDesc = language === 'fr'
                            ? `"${fileName}" a été enregistré dans vos Téléchargements.`
                            : `"${fileName}" has been saved to your Downloads.`;
                        const btnText = language === 'fr' ? "Super !" : "Great !";

                        Alert.alert(alertTitle, alertDesc, [{ text: btnText }]);
                        return;
                    }
                } catch (safError: any) {
                    console.error('[PDFService] Save Error:', safError.message);
                }
            }

            // Fallback: Share the PDF
            console.log('[PDFService] Opening Share Sheet...');
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `${language === 'fr' ? 'Rapport' : 'Report'}: ${vehicle.brand} ${vehicle.model}`,
                UTI: 'com.adobe.pdf',
            });

        } catch (error) {
            console.error('PDF Generation Failed:', error);
            throw error;
        }
    }
};
