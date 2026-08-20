import { Request } from "express";

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

export interface AuthenticatedAdminRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };
  file?: MulterFile;
  files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
}

export interface SellerSummary {
  id: string;
  name: string;
  email: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}
