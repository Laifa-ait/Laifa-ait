import { sheets as googleSheets, sheets_v4, auth } from "@googleapis/sheets";
import { drive as googleDrive } from "@googleapis/drive";
import { calendar as googleCalendar } from "@googleapis/calendar";
import { Readable } from "stream";
import { safeLogger } from "../../../utils/logger";
import {
  WorkspaceBusinessError,
  type SheetsExportDTO,
  type SheetsExportResult,
  type DriveUploadDTO,
  type SystemUploadKycDTO,
  type CalendarScheduleDTO,
  type CalendarScheduleResult
} from "../types/workspace.types";
import { maskSensitiveCell, validateKycFileSignature } from "../utils/workspaceValidation";

export class WorkspaceService {
  /**
   * 1. GOOGLE SHEETS (Export Premium "Canva-like")
   */
  static async exportPremiumSheets(googleToken: string, payload: SheetsExportDTO): Promise<SheetsExportResult> {
    const { title, metadata, headers, rows, totals, theme } = payload;

    const headerBgColor = theme?.headerColor || { red: 0.1, green: 0.6, blue: 0.4 };
    const isRtl = theme?.isRtl || false;

    const authClient = new auth.OAuth2();
    authClient.setCredentials({ access_token: googleToken });
    const sheets = googleSheets({ version: "v4", auth: authClient });

    // 1. Création du document
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: title || "Export OLMART" },
        sheets: [
          {
            properties: {
              title: "Rapport",
              rightToLeft: isRtl
            }
          }
        ]
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const sheetId = spreadsheet.data.sheets?.[0].properties?.sheetId || 0;

    if (!spreadsheetId) {
      throw new WorkspaceBusinessError(500, "Impossible de créer le document");
    }

    // 2. Assemblage des données (Metadata + Espace + Headers + Rows + Totals)
    const emptyRow = Array(headers.length).fill("");
    let allValues: unknown[][] = [];

    const rawMetadata = metadata || [];
    const metaDatas = rawMetadata.map((row: unknown[]) => row.map(cell => maskSensitiveCell(cell)));
    allValues = allValues.concat(metaDatas);

    allValues.push(emptyRow); // Space before table

    const headerIndex = allValues.length;
    allValues.push(headers);

    const rowsStartIndex = allValues.length;
    const maskedRows = (rows || []).map((row: unknown[]) => row.map(cell => maskSensitiveCell(cell)));
    allValues = allValues.concat(maskedRows);

    const totalsStartIndex = allValues.length;
    const maskedTotals = (totals || []).map((row: unknown[]) => row.map(cell => maskSensitiveCell(cell)));
    allValues = allValues.concat(maskedTotals);

    // 3. Injection simple des valeurs d'abord
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Rapport!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: allValues }
    });

    // 4. Application du Design Premium via batchUpdate
    const requests: sheets_v4.Schema$Request[] = [];

    // A. Formater le Titre Principal (Ligne 1)
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: headers.length },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14, foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
            horizontalAlignment: isRtl ? "RIGHT" : "LEFT",
          }
        },
        fields: "userEnteredFormat(textFormat,horizontalAlignment)"
      }
    });

    // B. Formater les Metadata (Lignes 2 à 4)
    if (metaDatas.length > 1) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: metaDatas.length, startColumnIndex: 0, endColumnIndex: headers.length },
          cell: {
            userEnteredFormat: {
              textFormat: { fontSize: 10, italic: true, foregroundColor: { red: 0.3, green: 0.3, blue: 0.3 } },
            }
          },
          fields: "userEnteredFormat(textFormat)"
        }
      });
    }

    // C. Formater les Headers du tableau "Design Canva"
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: headerIndex, endRowIndex: headerIndex + 1, startColumnIndex: 0, endColumnIndex: headers.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: headerBgColor,
            textFormat: { bold: true, fontSize: 11, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE"
          }
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
      }
    });

    // D. Formater les Lignes avec padding et bordures discrètes
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowsStartIndex, endRowIndex: totalsStartIndex, startColumnIndex: 0, endColumnIndex: headers.length },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 10, foregroundColor: { red: 0.2, green: 0.2, blue: 0.2 } },
            borders: {
              bottom: { style: "SOLID", width: 1, color: { red: 0.9, green: 0.9, blue: 0.9 } }
            }
          }
        },
        fields: "userEnteredFormat(textFormat,borders)"
      }
    });

    // E. Formater la Ligne de Totalisation (Gris clair, Gras)
    if (totals && totals.length > 0) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: totalsStartIndex, endRowIndex: totalsStartIndex + totals.length, startColumnIndex: 0, endColumnIndex: headers.length },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
              textFormat: { bold: true, fontSize: 11, foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
              borders: { top: { style: "SOLID_MEDIUM", width: 2, color: { red: 0.7, green: 0.7, blue: 0.7 } } }
            }
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,borders)"
        }
      });
    }

    // F. Ajustement de la largeur des colonnes
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: headers.length
        }
      }
    });

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });
    }

    return {
      spreadsheetId,
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl
    };
  }

  /**
   * 2. GOOGLE DRIVE (User Upload - Admin Backup / Admin Docs)
   */
  static async uploadUserDrive(googleToken: string, payload: DriveUploadDTO): Promise<Record<string, unknown>> {
    const { fileName, mimeType, base64Data } = payload;

    if (!base64Data) {
      throw new WorkspaceBusinessError(400, "Aucune donnée de fichier reçue.");
    }

    const authClient = new auth.OAuth2();
    authClient.setCredentials({ access_token: googleToken });
    const drive = googleDrive({ version: "v3", auth: authClient });

    const buffer = Buffer.from(base64Data, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = { name: fileName || `Upload-Olmart-${Date.now()}` };
    const media = {
      mimeType: mimeType || 'application/octet-stream',
      body: stream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    return (file.data as unknown as Record<string, unknown>) || {};
  }

  /**
   * 2b. GOOGLE DRIVE (System Upload - Vendeur KYC)
   */
  static async uploadSystemKyc(
    callerUid: string | undefined,
    callerRole: string | undefined,
    payload: SystemUploadKycDTO
  ): Promise<{ file: Record<string, unknown>; demoMode?: boolean }> {
    const { fileName, mimeType, base64Data, sellerId } = payload;

    if (!base64Data || !sellerId) {
      throw new WorkspaceBusinessError(400, "Données de fichier ou ID vendeur manquant.");
    }

    // Contrôle BOLA / IDOR : Seul le propriétaire du compte vendeur ou un administrateur peut uploader un KYC
    if (callerUid !== sellerId && callerRole !== 'admin') {
      throw new WorkspaceBusinessError(403, "Accès refusé. Vous ne pouvez uploader un document KYC que pour votre propre compte.");
    }

    // 1. Décodage du Buffer pour vérifications réelles de taille et d'intégrité binaire
    const buffer = Buffer.from(base64Data, 'base64');
    const fileSizeInBytes = buffer.length;

    // Protection contre les uploads trop volumineux (limite ferme de 10 Mo)
    const maxBytes = 10 * 1024 * 1024; // 10 Mo
    if (fileSizeInBytes > maxBytes) {
      throw new WorkspaceBusinessError(400, "Fichier trop volumineux. La taille maximale autorisée est de 10 Mo.");
    }

    // 2. Validation stricte du type MIME pour les KYC (uniquement PDF, PNG, JPEG)
    const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!mimeType || !allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new WorkspaceBusinessError(400, "Format de fichier non autorisé. Seuls les fichiers PDF et les images (PNG, JPEG) sont acceptés.");
    }

    // 3. Validation de signature binaire (Magic Numbers) contre l'usurpation d'extension
    if (!validateKycFileSignature(buffer, mimeType)) {
      throw new WorkspaceBusinessError(400, "Contenu de fichier non conforme ou corrompu (Signature binaire invalide).");
    }

    // Stratégie Service Account
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    let authClient;
    if (serviceAccountKey) {
      const credentials = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('ascii'));
      authClient = new auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });
    } else {
      safeLogger.warn("Pas de GOOGLE_SERVICE_ACCOUNT_KEY. Le fichier n'est pas envoyé sur Drive (Mode Démo).");
      return {
        file: {
          webViewLink: `https://drive.google.com/demo-link-kyc/${encodeURIComponent(sellerId)}`,
          id: `mock-id-${Date.now()}`
        },
        demoMode: true
      };
    }

    const drive = googleDrive({ version: "v3", auth: authClient });

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: `KYC_${sellerId}_${fileName}`,
      description: `Document KYC pour le vendeur: ${sellerId}`
    };
    const media = {
      mimeType: mimeType || 'application/octet-stream',
      body: stream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    return { file: (file.data as unknown as Record<string, unknown>) || {} };
  }

  /**
   * 3. GOOGLE MEET & CALENDAR
   */
  static async scheduleCalendarMeet(googleToken: string, payload: CalendarScheduleDTO): Promise<CalendarScheduleResult> {
    const { sellerEmail, sellerEmails, startTime, endTime, summary, description } = payload;

    if (!sellerEmail && (!sellerEmails || sellerEmails.length === 0) || !startTime || !endTime) {
      throw new WorkspaceBusinessError(400, "Informations incomplètes (email, startTime, endTime requis).");
    }

    const authClient = new auth.OAuth2();
    authClient.setCredentials({ access_token: googleToken });
    const calendar = googleCalendar({ version: "v3", auth: authClient });

    // Compile all attendee emails dynamically
    const googleEmailsSet = new Set<string>();

    if (sellerEmail && typeof sellerEmail === 'string') {
      sellerEmail.split(',').forEach(e => {
        const trimmed = e.trim();
        if (trimmed && trimmed.includes('@')) {
          googleEmailsSet.add(trimmed);
        }
      });
    }

    if (sellerEmails && Array.isArray(sellerEmails)) {
      sellerEmails.forEach(e => {
        if (typeof e === 'string') {
          const trimmed = e.trim();
          if (trimmed && trimmed.includes('@')) {
            googleEmailsSet.add(trimmed);
          }
        }
      });
    }

    if (googleEmailsSet.size === 0) {
      throw new WorkspaceBusinessError(400, "Aucune adresse email valide trouvée pour l'invitation.");
    }

    const attendees = Array.from(googleEmailsSet).map(email => ({ email }));

    const event = {
      summary: summary || '📞 OLMART - Session KYC / Vérification de Boutique',
      description: description || 'Session d’approbation de votre boutique sur OLMART. Merci de vous munir de vos documents d’identité et registre de commerce.',
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      attendees: attendees,
      conferenceData: {
        createRequest: {
          requestId: `verify-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      calendarLink: response.data.htmlLink
    };
  }
}
