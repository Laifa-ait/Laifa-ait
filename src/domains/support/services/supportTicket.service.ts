import { db, admin } from "../../../config/firebase-admin";
import {
  SUPPORT_TICKETS_COLLECTION,
  BusinessError,
  type CreateLegacyTicketDTO,
  type CreateTicketDTO
} from "../types/support.types";

export class SupportTicketService {
  /**
   * Crée un ticket de support via le format legacy / compatibility
   */
  static async createLegacyTicket(uid: string, body: CreateLegacyTicketDTO): Promise<string> {
    const { name, email, requestType, message } = body;
    if (!name || !email || !requestType || !message) {
      throw new BusinessError(400, "Missing required fields");
    }

    const ticketData = {
      userId: uid,
      name,
      email,
      requestType,
      message,
      status: "open",
      priority: requestType === "order_issue" ? "high" : "medium",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(SUPPORT_TICKETS_COLLECTION).add(ticketData);
    return docRef.id;
  }

  /**
   * Récupère tous les tickets appartenant à l'utilisateur connecté
   */
  static async getUserTickets(uid: string): Promise<Array<Record<string, unknown>>> {
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Crée un nouveau ticket de support
   */
  static async createTicket(uid: string, body: CreateTicketDTO): Promise<Record<string, unknown>> {
    const { subject, priority, userName } = body;
    if (!subject) {
      throw new BusinessError(400, "Sujet requis");
    }

    const ticketData = {
      userId: uid,
      userName: userName || "Client",
      subject,
      priority: priority || "medium",
      status: "open",
      lastMessage: "Ticket créé",
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };

    const docRef = await db.collection(SUPPORT_TICKETS_COLLECTION).add(ticketData);
    return { id: docRef.id, ...ticketData };
  }

  /**
   * Ré-ouvre un ticket fermé (Transaction ACID)
   */
  static async reopenTicket(ticketId: string, uid: string, role?: string): Promise<void> {
    const isAdmin = role === "admin" || role === "superadmin";

    await db.runTransaction(async (transaction) => {
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);

      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable");
      }

      const ticket = ticketSnap.data() as { userId?: string; status?: string };

      if (!isAdmin && ticket.userId !== uid) {
        throw new BusinessError(403, "Accès non autorisé");
      }

      if (ticket.status === "open") {
        throw new BusinessError(400, "Le ticket est déjà ouvert");
      }

      transaction.update(ticketRef, {
        status: "open",
        lastMessage: "Ticket ré-ouvert par l'utilisateur",
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        userId: uid,
        text: "⚠️ J'ai ré-ouvert ce ticket. Mon problème n'est pas tout à fait résolu.",
        sender: "client",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  /**
   * Récupère la liste des tickets pour le dashboard administrateur
   */
  static async getAdminTickets(): Promise<Array<Record<string, unknown>>> {
    const snap = await db.collection(SUPPORT_TICKETS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Met à jour le statut d'un ticket de support (Admin)
   */
  static async updateTicketStatus(ticketId: string, adminUid: string, adminEmail: string, status: string): Promise<void> {
    const allowedStatuses = ["open", "closed", "pending"];
    if (!status || typeof status !== "string" || !allowedStatuses.includes(status)) {
      throw new BusinessError(400, "Statut invalide ou non supporté.");
    }

    await db.runTransaction(async (transaction) => {
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

      transaction.update(ticketRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        text: `Le statut du ticket a été changé à "${status}" par l'administrateur.`,
        sender: "system",
        isInternal: true,
        createdAt: new Date().toISOString()
      });
    });

    await db.collection("adminActions").add({
      action: "support-status-updated",
      uid: adminUid,
      email: adminEmail || "inconnu",
      ticketId,
      newStatus: status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Met à jour la priorité d'un ticket de support (Admin)
   */
  static async updateTicketPriority(ticketId: string, adminUid: string, adminEmail: string, priority: string): Promise<void> {
    const allowedPriorities = ["low", "medium", "high"];
    if (!priority || typeof priority !== "string" || !allowedPriorities.includes(priority)) {
      throw new BusinessError(400, "Priorité invalide ou non supportée.");
    }

    await db.runTransaction(async (transaction) => {
      const ticketRef = db.collection(SUPPORT_TICKETS_COLLECTION).doc(ticketId);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new BusinessError(404, "Ticket de support introuvable.");
      }

      transaction.update(ticketRef, {
        priority,
        updatedAt: new Date().toISOString()
      });

      const messageRef = db.collection("supportMessages").doc();
      transaction.create(messageRef, {
        ticketId,
        text: `La priorité du ticket a été changée à "${priority}" par l'administrateur.`,
        sender: "system",
        isInternal: true,
        createdAt: new Date().toISOString()
      });
    });

    await db.collection("adminActions").add({
      action: "support-priority-updated",
      uid: adminUid,
      email: adminEmail || "inconnu",
      ticketId,
      newPriority: priority,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
