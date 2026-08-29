import { Request } from "express";

export interface SettingDocumentDTO {
  [key: string]: unknown;
}

export interface NewsletterSubscribeDTO {
  email: string;
}

export interface AuthenticatedSettingsRequest extends Request {
  user?: {
    uid?: string;
    role?: string;
    email?: string;
    [key: string]: unknown;
  };
}
