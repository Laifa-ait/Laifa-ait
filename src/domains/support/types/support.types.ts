export const SUPPORT_TICKETS_COLLECTION = "supportTickets";

export class BusinessError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "BusinessError";
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

export interface SupportAttachment {
  ticketId: string;
  filePath: string;
  fileName?: string;
  fileType?: string;
  userId?: string;
  createdAt?: string;
}

export interface SupportTicket {
  id?: string;
  userId: string;
  name?: string;
  userName?: string;
  email?: string;
  requestType?: string;
  message?: string;
  subject?: string;
  priority: "low" | "medium" | "high";
  status: "open" | "closed" | "pending";
  lastMessage?: string;
  lastMessageAt?: string | FirebaseFirestore.FieldValue;
  createdAt: string | FirebaseFirestore.FieldValue;
  updatedAt?: string | FirebaseFirestore.FieldValue;
}

export interface SupportMessage {
  id?: string;
  ticketId: string;
  userId: string;
  text: string;
  sender: "client" | "admin" | "system";
  isInternal?: boolean;
  createdAt: string | FirebaseFirestore.FieldValue;
  attachmentId?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  filePath?: string;
}

export interface CreateLegacyTicketDTO {
  name: string;
  email: string;
  requestType: string;
  message: string;
}

export interface CreateTicketDTO {
  subject: string;
  priority?: "low" | "medium" | "high";
  userName?: string;
}

export interface PostMessageDTO {
  text?: string;
  attachmentId?: string;
  isInternal?: boolean;
}

export interface UploadAttachmentDTO {
  fileName: string;
  mimeType: string;
  base64Data: string;
}
