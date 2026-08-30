import { SupportClientMessageService } from "./supportClientMessage.service";
import { SupportAdminMessageService } from "./supportAdminMessage.service";
import type { PostMessageDTO } from "../types/support.types";

export class SupportMessageService {
  static getTicketMessages(ticketId: string, uid: string, role?: string): Promise<Array<Record<string, unknown>>> {
    return SupportClientMessageService.getTicketMessages(ticketId, uid, role);
  }

  static postClientMessage(ticketId: string, uid: string, role: string | undefined, body: PostMessageDTO): Promise<Record<string, unknown>> {
    return SupportClientMessageService.postClientMessage(ticketId, uid, role, body);
  }

  static getAdminTicketMessages(ticketId: string): Promise<Array<Record<string, unknown>>> {
    return SupportAdminMessageService.getAdminTicketMessages(ticketId);
  }

  static postAdminTicketMessage(
    ticketId: string,
    adminUid: string,
    adminEmail: string,
    body: PostMessageDTO
  ): Promise<Record<string, unknown>> {
    return SupportAdminMessageService.postAdminTicketMessage(ticketId, adminUid, adminEmail, body);
  }
}
