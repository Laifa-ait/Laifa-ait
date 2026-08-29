import { Request } from 'express';

export interface AuthenticatedWorkspaceRequest extends Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
  file?: Record<string, unknown>;
  files?: Record<string, unknown>[];
  googleToken?: string;
}

export class WorkspaceBusinessError extends Error {
  constructor(public statusCode: number, message: string, public details?: string) {
    super(message);
    this.name = "WorkspaceBusinessError";
  }
}

export interface SheetsExportThemeDTO {
  headerColor?: { red: number; green: number; blue: number };
  isRtl?: boolean;
}

export interface SheetsExportDTO {
  title?: string;
  metadata?: unknown[][];
  headers: string[];
  rows: unknown[][];
  totals?: unknown[][];
  theme?: SheetsExportThemeDTO;
}

export interface SheetsExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string | null | undefined;
}

export interface DriveUploadDTO {
  fileName?: string;
  mimeType?: string;
  base64Data: string;
}

export interface SystemUploadKycDTO {
  fileName: string;
  mimeType: string;
  base64Data: string;
  sellerId: string;
}

export interface CalendarScheduleDTO {
  sellerEmail?: string;
  sellerEmails?: string[];
  startTime: string;
  endTime: string;
  summary?: string;
  description?: string;
}

export interface CalendarScheduleResult {
  eventId: string | null | undefined;
  meetLink: string | null | undefined;
  calendarLink: string | null | undefined;
}
