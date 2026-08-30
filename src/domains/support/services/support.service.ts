import { SupportTicketService } from "./supportTicket.service";
import { SupportMessageService } from "./supportMessage.service";
import { SupportAttachmentService } from "./supportAttachment.service";
import type {
  CreateLegacyTicketDTO,
  CreateTicketDTO,
  PostMessageDTO,
  UploadAttachmentDTO
} from "../types/support.types";

export class SupportService {
  static createLegacyTicket(uid: string, body: CreateLegacyTicketDTO): Promise<string> {
    return SupportTicketService.createLegacyTicket(uid, body);
  }

  static getUserTickets(uid: string): Promise<Array<Record<string, unknown>>> {
    return SupportTicketService.getUserTickets(uid);
  }

  static createTicket(uid: string, body: CreateTicketDTO): Promise<Record<string, unknown>> {
    return SupportTicketService.createTicket(uid, body);
  }

  static getTicketMessages(ticketId: string, uid: string, role?: string): Promise<Array<Record<string, unknown>>> {
    return SupportMessageService.getTicketMessages(ticketId, uid, role);
  }

  static postClientMessage(ticketId: string, uid: string, role: string | undefined, body: PostMessageDTO): Promise<Record<string, unknown>> {
    return SupportMessageService.postClientMessage(ticketId, uid, role, body);
  }

  static reopenTicket(ticketId: string, uid: string, role?: string): Promise<void> {
    return SupportTicketService.reopenTicket(ticketId, uid, role);
  }

  static uploadAttachment(
    ticketId: string,
    uid: string,
    role: string | undefined,
    userEmail: string,
    body: UploadAttachmentDTO
  ) {
    return SupportAttachmentService.uploadAttachment(ticketId, uid, role, userEmail, body);
  }

  static getAttachmentStream(ticketId: string, attachmentId: string, uid: string, role?: string) {
    return SupportAttachmentService.getAttachmentStream(ticketId, attachmentId, uid, role);
  }

  static getAdminTickets(): Promise<Array<Record<string, unknown>>> {
    return SupportTicketService.getAdminTickets();
  }

  static getAdminTicketMessages(ticketId: string): Promise<Array<Record<string, unknown>>> {
    return SupportMessageService.getAdminTicketMessages(ticketId);
  }

  static postAdminTicketMessage(ticketId: string, adminUid: string, adminEmail: string, body: PostMessageDTO): Promise<Record<string, unknown>> {
    return SupportMessageService.postAdminTicketMessage(ticketId, adminUid, adminEmail, body);
  }

  static updateTicketStatus(ticketId: string, adminUid: string, adminEmail: string, status: string): Promise<void> {
    return SupportTicketService.updateTicketStatus(ticketId, adminUid, adminEmail, status);
  }

  static updateTicketPriority(ticketId: string, adminUid: string, adminEmail: string, priority: string): Promise<void> {
    return SupportTicketService.updateTicketPriority(ticketId, adminUid, adminEmail, priority);
  }
}
