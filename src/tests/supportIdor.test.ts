import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi, MockInstance } from "vitest";
import { admin, db } from "../config/firebase-admin";
import { Readable } from "stream";
import router from "../routes/support";

const app = express();
app.use(express.json());
app.use(router);

describe("Support Ticket IDOR Hardening Integration Suite", () => {
  const userAUid = "test_user_a_999";
  const userBUid = "test_user_b_999";
  const adminUid = "test_admin_999";

  const ticketAId = "test_ticket_a_999";
  const ticketBId = "test_ticket_b_999";

  let verifyTokenSpy: MockInstance;

  beforeAll(async () => {
    // 1. Seed users
    await db.collection("users").doc(userAUid).set({
      role: "buyer",
      email: "usera@olmart.dz",
    });

    await db.collection("users").doc(userBUid).set({
      role: "buyer",
      email: "userb@olmart.dz",
    });

    await db.collection("users").doc(adminUid).set({
      role: "admin",
      email: "admin@olmart.dz",
    });

    // 2. Seed tickets
    await db.collection("supportTickets").doc(ticketAId).set({
      userId: userAUid,
      userName: "User A",
      subject: "Ticket A Subj",
      priority: "medium",
      status: "closed",
      lastMessage: "Initial msg A",
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    });

    await db.collection("supportTickets").doc(ticketBId).set({
      userId: userBUid,
      userName: "User B",
      subject: "Ticket B Subj",
      priority: "high",
      status: "closed",
      lastMessage: "Initial msg B",
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    });

    // 3. Seed messages
    await db.collection("supportMessages").add({
      ticketId: ticketAId,
      userId: userAUid,
      text: "Message from User A",
      sender: "client",
      createdAt: new Date().toISOString()
    });

    await db.collection("supportMessages").add({
      ticketId: ticketBId,
      userId: userBUid,
      text: "Message from User B",
      sender: "client",
      createdAt: new Date().toISOString()
    });

    // Spy on token decoding
    verifyTokenSpy = vi.spyOn(admin.auth(), "verifyIdToken");

    // Initialize mock Storage
    savedFiles = {};
    storageMock = {
      bucket: vi.fn().mockReturnValue({
        name: "test-bucket",
        file: vi.fn().mockImplementation((path: string) => {
          return {
            name: path,
            save: vi.fn().mockImplementation(async (buf: Buffer, opts: Record<string, unknown>) => {
              savedFiles[path] = { buffer: buf, options: opts };
            }),
            exists: vi.fn().mockImplementation(async () => {
              return [!!savedFiles[path]];
            }),
            delete: vi.fn().mockImplementation(async () => {
              delete savedFiles[path];
            }),
            createReadStream: vi.fn().mockImplementation(() => {
              const stream = new Readable();
              stream.push(savedFiles[path]?.buffer || Buffer.from("mock data"));
              stream.push(null);
              return stream;
            })
          };
        })
      })
    };
    vi.spyOn(admin, "storage").mockReturnValue(storageMock as unknown as admin.storage.Storage);
  });

  let storageMock: unknown;
  let savedFiles: Record<string, { buffer: Buffer; options: Record<string, unknown> }> = {};

  afterAll(async () => {
    // Clean up
    await db.collection("users").doc(userAUid).delete();
    await db.collection("users").doc(userBUid).delete();
    await db.collection("users").doc(adminUid).delete();
    await db.collection("supportTickets").doc(ticketAId).delete();
    await db.collection("supportTickets").doc(ticketBId).delete();

    const messagesSnap = await db.collection("supportMessages")
      .where("ticketId", "in", [ticketAId, ticketBId])
      .get();
    for (const doc of messagesSnap.docs) {
      await doc.ref.delete();
    }

    vi.restoreAllMocks();
  });

  it("TEST 1: User A -> ticket A -> GET messages => 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/support/tickets/${ticketAId}/messages`)
      .set("Authorization", "Bearer token-user-a");

    expect(res.status).toBe(200);
    expect(res.body.messages).toBeDefined();
    expect(res.body.messages.length).toBeGreaterThan(0);
    expect(res.body.messages[0].text).toBe("Message from User A");
  });

  it("TEST 2: User A -> ticket B -> GET messages => 403", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-user-a");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Accès non autorisé");
  });

  it("TEST 3: User A -> ticket B -> POST message => 403", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-user-a")
      .send({ text: "Attacking ticket B" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Accès non autorisé");
  });

  it("TEST 4: User A -> ticket B -> REOPEN => 403", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/support/tickets/${ticketBId}/reopen`)
      .set("Authorization", "Bearer token-user-a");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Accès non autorisé");
  });

  it("TEST 5: User A -> non-existent ticket => 404", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/support/tickets/non_existent_999/messages`)
      .set("Authorization", "Bearer token-user-a");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Ticket de support introuvable");
  });

  it("TEST 6: Unauthenticated user => 401", async () => {
    const res = await request(app)
      .get(`/api/v1/support/tickets/${ticketAId}/messages`);

    expect(res.status).toBe(401);
  });

  it("TEST 7: Authorized Admin -> ticket B -> GET messages => 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-admin");

    expect(res.status).toBe(200);
    expect(res.body.messages).toBeDefined();
    expect(res.body.messages.length).toBeGreaterThan(0);
  });

  it("TEST 8: Authorized Admin -> ticket B -> POST message => 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-admin")
      .send({ text: "Admin help message" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("TEST 9: Authorized Admin -> ticket B -> REOPEN => 200", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: adminUid,
      email: "admin@olmart.dz",
      role: "admin",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/support/tickets/${ticketBId}/reopen`)
      .set("Authorization", "Bearer token-admin");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("TEST 10: Attempt with falsified userId/ownerId in req.body => server ignores and uses req.user.uid", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post("/api/v1/support/tickets")
      .set("Authorization", "Bearer token-user-a")
      .send({
        subject: "Falsified user ID ticket",
        userName: "User A",
        userId: userBUid,
        ownerId: userBUid
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.userId).toBe(userAUid); // Server ignored body userId/ownerId and bound to userAUid!
    
    // Cleanup generated ticket
    await db.collection("supportTickets").doc(res.body.id).delete();
  });

  it("TEST 11: User A attempts to use ticket B with a request containing custom body fields => blocked", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .post(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-user-a")
      .send({
        text: "Hacked text",
        userId: userAUid,
        ownerId: userAUid
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Accès non autorisé");
  });

  it("TEST 12: Verify no data from ticket B is returned before authorization control", async () => {
    verifyTokenSpy.mockResolvedValue({
      uid: userAUid,
      email: "usera@olmart.dz",
      role: "buyer",
    } as unknown as admin.auth.DecodedIdToken);

    const res = await request(app)
      .get(`/api/v1/support/tickets/${ticketBId}/messages`)
      .set("Authorization", "Bearer token-user-a");

    expect(res.status).toBe(403);
    expect(res.body.messages).toBeUndefined();
    expect(res.body.subject).toBeUndefined();
    expect(res.body.userId).toBeUndefined();
    expect(res.body.error).toBe("Accès non autorisé");
  });

  describe("Support Ticket Secure Attachments & Transactions Extension", () => {
    const attachTicketAId = "test_ticket_attach_a";
    const attachTicketBId = "test_ticket_attach_b";
    let createdAttachmentId: string;
    let attachAId: string;
    let attachBId: string;

    const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const pngPayload = Buffer.from("PNG-MOCK-DATA");
    const pngBuffer = Buffer.concat([pngSig, pngPayload]);
    const pngBase64 = pngBuffer.toString("base64");

    beforeAll(async () => {
      // Seed tickets for attachment tests
      await db.collection("supportTickets").doc(attachTicketAId).set({
        userId: userAUid,
        userName: "User A",
        subject: "Attach Ticket A",
        status: "closed",
        createdAt: new Date().toISOString()
      });

      await db.collection("supportTickets").doc(attachTicketBId).set({
        userId: userBUid,
        userName: "User B",
        subject: "Attach Ticket B",
        status: "closed",
        createdAt: new Date().toISOString()
      });

      attachAId = "test_attach_a_999";
      await db.collection("supportAttachments").doc(attachAId).set({
        ticketId: attachTicketAId,
        filePath: `support/${attachTicketAId}/${attachAId}/receipt.png`,
        fileName: "receipt.png",
        fileType: "image/png",
        userId: userAUid,
        createdAt: new Date().toISOString()
      });
      savedFiles[`support/${attachTicketAId}/${attachAId}/receipt.png`] = {
        buffer: pngBuffer,
        options: {}
      };

      attachBId = "test_attach_b_999";
      await db.collection("supportAttachments").doc(attachBId).set({
        ticketId: attachTicketBId,
        filePath: `support/${attachTicketBId}/${attachBId}/receipt.png`,
        fileName: "receipt.png",
        fileType: "image/png",
        userId: userBUid,
        createdAt: new Date().toISOString()
      });
      savedFiles[`support/${attachTicketBId}/${attachBId}/receipt.png`] = {
        buffer: pngBuffer,
        options: {}
      };
    });

    afterAll(async () => {
      await db.collection("supportTickets").doc(attachTicketAId).delete();
      await db.collection("supportTickets").doc(attachTicketBId).delete();
      
      const attachmentsSnap = await db.collection("supportAttachments")
        .where("ticketId", "in", [attachTicketAId, attachTicketBId])
        .get();
      for (const doc of attachmentsSnap.docs) {
        await doc.ref.delete();
      }
    });

    it("TEST ATT-01: User A upload on Ticket A => 200 and private fileUrl returned", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: pngBase64
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.fileUrl).toBeDefined();
      expect(res.body.attachmentId).toBeDefined();
      
      createdAttachmentId = res.body.attachmentId;
      
      // The fileUrl must point to our secure backend gateway
      expect(res.body.fileUrl).toContain(`/api/v1/support/tickets/${attachTicketAId}/attachments/`);
    });

    it("TEST ATT-02: User B tries to access file of Ticket A => 403", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userBUid,
        email: "userb@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${createdAttachmentId}`)
        .set("Authorization", "Bearer token-user-b");

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Accès non autorisé");
    });

    it("TEST ATT-03: Unauthenticated user accesses attachment => 401", async () => {
      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${createdAttachmentId}`);

      expect(res.status).toBe(401);
    });

    it("TEST ATT-04: Admin accesses the file => 200 and streams content", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: adminUid,
        email: "admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${createdAttachmentId}`)
        .set("Authorization", "Bearer token-admin");

      expect(res.status).toBe(200);
      expect(pngBuffer.equals(res.body)).toBe(true);
    });

    it("TEST ATT-05: User B provides ticketId=A but attachmentId of another ticket => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userBUid,
        email: "userb@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketBId}/attachments/${createdAttachmentId}`)
        .set("Authorization", "Bearer token-user-b");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("La pièce jointe n'appartient pas à ce ticket");
    });

    it("TEST ATT-06: User B tries to download directly with arbitrary path traversal => blocked", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userBUid,
        email: "userb@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketBId}/attachments/../../../etc/passwd`)
        .set("Authorization", "Bearer token-user-b");

      expect(res.status).toBe(404);
    });

    it("TEST ATT-07: Verify that the storage object is not public", async () => {
      const filePaths = Object.keys(savedFiles);
      expect(filePaths.length).toBeGreaterThan(0);
      for (const filePath of filePaths) {
        const savedFile = savedFiles[filePath];
        expect(savedFile.options.public).toBeUndefined(); // Must not be public
      }
    });

    it("TEST ATT-08: Verify that the secure attachment access does not leak public URL", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${createdAttachmentId}`)
        .set("Authorization", "Bearer token-user-a");

      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toBeDefined();
      expect(res.headers["content-type"]).toBe("image/png");
      expect(pngBuffer.equals(res.body)).toBe(true);
    });

    it("REOPEN-01: Owner reopens closed ticket => 200", async () => {
      await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });

      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
        .set("Authorization", "Bearer token-user-a");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedDoc = await db.collection("supportTickets").doc(attachTicketAId).get();
      expect(updatedDoc.data()?.status).toBe("open");
    });

    it("REOPEN-02: Non-owner cannot reopen => 403", async () => {
      await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });

      verifyTokenSpy.mockResolvedValue({
        uid: userBUid,
        email: "userb@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
        .set("Authorization", "Bearer token-user-b");

      expect(res.status).toBe(403);
    });

    it("REOPEN-03: Reopen non-existent ticket => 404", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/invalid_ticket_id/reopen`)
        .set("Authorization", "Bearer token-user-a");

      expect(res.status).toBe(404);
    });

    it("REOPEN-04: Reopen already open ticket => 400", async () => {
      await db.collection("supportTickets").doc(attachTicketAId).update({ status: "open" });

      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
        .set("Authorization", "Bearer token-user-a");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Le ticket est déjà ouvert");
    });

    it("REOPEN-05: Unauthenticated reopen => 401", async () => {
      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`);

      expect(res.status).toBe(401);
    });

    it("REOPEN-06 & REOPEN-07 & REOPEN-08: Concurrency check: Two simultaneous reopen => only one succeeds, status = open, exactly 1 message", async () => {
      await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });
      const oldMsgs = await db.collection("supportMessages").where("ticketId", "==", attachTicketAId).get();
      for (const d of oldMsgs.docs) {
        await d.ref.delete();
      }

      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
          .set("Authorization", "Bearer token-user-a"),
        request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
          .set("Authorization", "Bearer token-user-a")
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(200);
      expect(statuses).toContain(400);

      const ticketDoc = await db.collection("supportTickets").doc(attachTicketAId).get();
      expect(ticketDoc.data()?.status).toBe("open");

      const msgsSnap = await db.collection("supportMessages")
        .where("ticketId", "==", attachTicketAId)
        .get();
      
      const reopenMsgs = msgsSnap.docs.filter(doc => doc.data().text.includes("ré-ouvert ce ticket"));
      expect(reopenMsgs.length).toBe(1);
    });

    it("COLLECTION-01: Full lifecycle check: create, read, send, read, reopen, check canonical collection consistency", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // 1. Create ticket
      const createRes = await request(app)
        .post("/api/v1/support/tickets")
        .set("Authorization", "Bearer token-user-a")
        .send({ subject: "Consistency Ticket", userName: "User A" });

      expect(createRes.status).toBe(200);
      const ticketId = createRes.body.id;

      // 2. Read ticket (GET all)
      const listRes = await request(app)
        .get("/api/v1/support/tickets")
        .set("Authorization", "Bearer token-user-a");
      
      expect(listRes.status).toBe(200);
      const found = listRes.body.tickets.find((t: { id: string }) => t.id === ticketId);
      expect(found).toBeDefined();

      // 3. Send message
      const sendMsgRes = await request(app)
        .post(`/api/v1/support/tickets/${ticketId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({ text: "Checking collection integrity message" });

      expect(sendMsgRes.status).toBe(200);

      // 4. Read messages
      const msgsRes = await request(app)
        .get(`/api/v1/support/tickets/${ticketId}/messages`)
        .set("Authorization", "Bearer token-user-a");

      expect(msgsRes.status).toBe(200);
      expect(msgsRes.body.messages.some((m: { text: string }) => m.text.includes("Checking collection integrity"))).toBe(true);

      // Close the ticket to test reopen
      await db.collection("supportTickets").doc(ticketId).update({ status: "closed" });

      // 5. Reopen
      const reopenRes = await request(app)
        .post(`/api/v1/support/tickets/${ticketId}/reopen`)
        .set("Authorization", "Bearer token-user-a");

      expect(reopenRes.status).toBe(200);

      // 6. Verify final status is open in canonical collection
      const finalDoc = await db.collection("supportTickets").doc(ticketId).get();
      expect(finalDoc.data()?.status).toBe("open");

      // Verify absolutely NO document was created in the deprecated "support_tickets" collection
      const badDoc = await db.collection("support_tickets").doc(ticketId).get();
      expect(badDoc.exists).toBe(false);

      // Cleanup
      await db.collection("supportTickets").doc(ticketId).delete();
      const msgs = await db.collection("supportMessages").where("ticketId", "==", ticketId).get();
      for (const m of msgs.docs) {
        await m.ref.delete();
      }
    });

    // =========================================================================
    // DETAILED HARDENED INTEGRATION TEST CASES
    // =========================================================================

    // --- ATTACHMENTS (ATT-09 to ATT-17) ---

    it("TEST ATT-09: base64Data is not a string => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: 12345 // Number instead of string
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("base64Data doit être une chaîne de caractères");
    });

    it("TEST ATT-10: base64Data is empty string => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: ""
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("base64Data ne peut pas être vide");
    });

    it("TEST ATT-11: base64Data is too long (above 1 MB threshold) => 413", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // 1.5 MB of random base64 chars
      const hugeBase64 = "A".repeat(2 * 1024 * 1024);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: hugeBase64
        });

      expect(res.status).toBe(413);
    });

    it("TEST ATT-12: base64Data has invalid characters (not base64 format) => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: "not-a-valid-base-64!!!"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Format Base64 invalide");
    });

    it("TEST ATT-13: file decoded size is 0 bytes => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: "====" // Decodes to 0 bytes or is invalid
        });

      expect(res.status).toBe(400);
    });

    it("TEST ATT-14: file decoded size is above 1 MB => 413", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // Create a 1.1 MB buffer starting with PNG magic bytes to pass signature checks, then base64 encode it
      const largeBuffer = Buffer.alloc(1100000);
      largeBuffer[0] = 0x89;
      largeBuffer[1] = 0x50;
      largeBuffer[2] = 0x4E;
      largeBuffer[3] = 0x47;
      const largeBase64 = largeBuffer.toString("base64");

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: largeBase64
        });

      expect(res.status).toBe(413);
    });

    it("TEST ATT-15: MIME type is not allowed (e.g. application/exe) => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "malicious.exe",
          mimeType: "application/x-msdownload",
          base64Data: "MZ8950"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Type de fichier non supporté");
    });

    it("TEST ATT-16: Magic bytes mismatch => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // Send arbitrary text with a png filename and image/png MIME type
      const fakePngBase64 = Buffer.from("just arbitrary text without png magic bytes").toString("base64");

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          fileName: "receipt.png",
          mimeType: "image/png",
          base64Data: fakePngBase64
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Le contenu du fichier ne correspond pas au format déclaré");
    });

    it("TEST ATT-17: Path traversal in filePath or mismatch with structure => download gets 403 or 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // Create a corrupted attachment document with an invalid / mismatched filePath
      const badAttachmentId = "bad_attach_traversal";
      await db.collection("supportAttachments").doc(badAttachmentId).set({
        ticketId: attachTicketAId,
        filePath: "support/other_ticket_id/bad_attach_traversal/somefile.png", // Mismatched ticketId in prefix!
        fileName: "somefile.png",
        fileType: "image/png",
        userId: userAUid,
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${badAttachmentId}`)
        .set("Authorization", "Bearer token-user-a");

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

      // Cleanup
      await db.collection("supportAttachments").doc(badAttachmentId).delete();
    });

    // --- MESSAGES (MSG-09 to MSG-13) ---

    it("TEST MSG-09: client attempts to send message with raw fileUrl without attachmentId => ignores or blocks", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          text: "Hack text",
          fileUrl: "https://storage.googleapis.com/hacked/file.png",
          fileName: "file.png",
          fileType: "image/png"
        });

      // The endpoint must reject or ignore fileUrl, keeping the message text but omitting any secure file URL
      expect(res.status).toBe(200);
      expect(res.body.message.fileUrl).toBeUndefined(); // fileUrl is strictly server-derived!
    });

    it("TEST MSG-10: client attempts to refer to non-existent attachmentId => 404", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          text: "Message referencing non-existent attachment",
          attachmentId: "does_not_exist_99"
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Pièce jointe introuvable");
    });

    it("TEST MSG-11: client attempts to refer to attachmentId of another ticket => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      // Create an attachment for Ticket B
      const attachIdOfB = "attach_for_b_only";
      await db.collection("supportAttachments").doc(attachIdOfB).set({
        ticketId: attachTicketBId,
        filePath: `support/${attachTicketBId}/attach_for_b_only/file.png`,
        fileName: "file.png",
        fileType: "image/png",
        userId: userBUid,
        createdAt: new Date().toISOString()
      });

      // User A attempts to send a message on Ticket A but referencing attachment of Ticket B
      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          text: "Malicious reference",
          attachmentId: attachIdOfB
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");

      // Cleanup
      await db.collection("supportAttachments").doc(attachIdOfB).delete();
    });

    it("TEST MSG-12: client attempts to send message exceeding 10000 characters => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const hugeText = "A".repeat(10001);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          text: hugeText
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Le texte du message dépasse la longueur maximale");
    });

    it("TEST MSG-13: message text is not string => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          text: { nestedObj: "not a string" }
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Le texte du message doit être une chaîne de caractères");
    });

    // --- ADMIN (ADMIN-SEC-01 to ADMIN-SEC-06) ---

    it("TEST ADMIN-SEC-01: PUT status update with unsupported status => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: adminUid,
        email: "admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/${attachTicketAId}/status`)
        .set("Authorization", "Bearer token-admin")
        .send({
          status: "HACKED_STATUS"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Statut invalide ou non supporté");
    });

    it("TEST ADMIN-SEC-02: PUT priority update with unsupported priority => 400", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: adminUid,
        email: "admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/${attachTicketAId}/priority`)
        .set("Authorization", "Bearer token-admin")
        .send({
          priority: "CRITICAL_BOOM"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Priorité invalide ou non supportée");
    });

    it("TEST ADMIN-SEC-03: PUT status update of non-existent ticket => 404", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: adminUid,
        email: "admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/non_existent_ticket_9999/status`)
        .set("Authorization", "Bearer token-admin")
        .send({
          status: "open"
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Ticket de support introuvable");
    });

    it("TEST ADMIN-SEC-04: PUT priority update of non-existent ticket => 404", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: adminUid,
        email: "admin@olmart.dz",
        role: "admin",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/non_existent_ticket_9999/priority`)
        .set("Authorization", "Bearer token-admin")
        .send({
          priority: "high"
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Ticket de support introuvable");
    });

    it("TEST ADMIN-SEC-05: Non-admin attempts status update => 403", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/${attachTicketAId}/status`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          status: "open"
        });

      expect(res.status).toBe(403);
    });

    it("TEST ADMIN-SEC-06: Non-admin attempts priority update => 403", async () => {
      verifyTokenSpy.mockResolvedValue({
        uid: userAUid,
        email: "usera@olmart.dz",
        role: "buyer",
      } as unknown as admin.auth.DecodedIdToken);

      const res = await request(app)
        .put(`/api/v1/admin/support/tickets/${attachTicketAId}/priority`)
        .set("Authorization", "Bearer token-user-a")
        .send({
          priority: "high"
        });

      expect(res.status).toBe(403);
    });

    // =========================================================================
    // STRICT LOT P0.6.6 REQUIREMENT-SPECIFIC ALIGNMENT TESTS
    // =========================================================================

    describe("Strict Lot P0.6.6 - Specific Requirements Alignment", () => {
      it("ATT-AUTH-01: Utilisateur A accède à attachment A => 200", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${attachAId}`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(200);
      });

      it("ATT-AUTH-02: Utilisateur B accède à attachment A => 403", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${attachAId}`)
          .set("Authorization", "Bearer token-user-b");

        expect(res.status).toBe(403);
      });

      it("ATT-AUTH-03: Utilisateur A utilise ticket A + attachment B => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // Attachment B belongs to Ticket B. Trying to fetch it under Ticket A must be rejected.
        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${attachBId}`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("n'appartient pas à ce ticket");
      });

      it("ATT-AUTH-04: Utilisateur B utilise ticket B + attachment A => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // Attachment A belongs to Ticket A. Trying to fetch it under Ticket B must be rejected.
        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketBId}/attachments/${attachAId}`)
          .set("Authorization", "Bearer token-user-b");

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("n'appartient pas à ce ticket");
      });

      it("ATT-AUTH-05: Non authentifié => 401", async () => {
        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${attachAId}`);

        expect(res.status).toBe(401);
      });

      it("ATT-AUTH-06: Admin => accès autorisé", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: adminUid,
          email: "admin@olmart.dz",
          role: "admin",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${attachAId}`)
          .set("Authorization", "Bearer token-admin");

        expect(res.status).toBe(200);
      });

      it("ATT-AUTH-07: Attachment inexistant => 404", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/non_existent_attachment`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(404);
      });

      it("ATT-AUTH-08: Ticket inexistant => 404", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .get(`/api/v1/support/tickets/non_existent_ticket/attachments/${attachAId}`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(404);
      });

      it("ATT-AUTH-09: filePath falsifié => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const badAttachId = "bad_filepath_att_auth_09";
        await db.collection("supportAttachments").doc(badAttachId).set({
          ticketId: attachTicketAId,
          filePath: "support/other_ticket_id/bad_filepath_att_auth_09/receipt.png",
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${badAttachId}`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

        await db.collection("supportAttachments").doc(badAttachId).delete();
      });

      it("ATT-AUTH-10: fileUrl falsifiée => refus ou valeur ignorée", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message testing falsified fileUrl",
            fileUrl: "https://arbitrary-malicious-url.com/payload.exe"
          });

        expect(res.status).toBe(200);
        expect(res.body.message.fileUrl).toBeUndefined(); // fileUrl is strictly ignored and not trusted
      });

      it("ATT-AUTH-11: userId falsifié => ignoré", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post("/api/v1/support/tickets")
          .set("Authorization", "Bearer token-user-a")
          .send({
            subject: "Fake user",
            userId: userBUid
          });

        expect(res.status).toBe(200);
        expect(res.body.userId).toBe(userAUid); // Server binds strictly to auth context

        await db.collection("supportTickets").doc(res.body.id).delete();
      });

      it("ATT-AUTH-12: sender falsifié => ignoré", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Testing sender bypass",
            sender: "admin"
          });

        expect(res.status).toBe(200);
        expect(res.body.message.sender).toBe("client"); // Strict server binding
      });

      it("ATT-AUTH-13: Storage path traversal => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const badAttachId = "bad_traversal_att_auth_13";
        await db.collection("supportAttachments").doc(badAttachId).set({
          ticketId: attachTicketAId,
          filePath: `support/${attachTicketAId}/${badAttachId}/../../../etc/passwd`,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });

        const res = await request(app)
          .get(`/api/v1/support/tickets/${attachTicketAId}/attachments/${badAttachId}`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(403); // expectedPrefix path alignment verification fails

        await db.collection("supportAttachments").doc(badAttachId).delete();
      });

      it("ATT-AUTH-14: Fichier avec MIME falsifié => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const badBase64 = Buffer.from("just arbitrary text with fake png mime").toString("base64");

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            fileName: "receipt.png",
            mimeType: "image/png",
            base64Data: badBase64
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Le contenu du fichier ne correspond pas au format déclaré");
      });

      it("ATT-AUTH-15: Fichier avec signature invalide => refus", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const badBase64 = Buffer.from("random invalid bytes").toString("base64");

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/upload`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            fileName: "photo.jpg",
            mimeType: "image/jpeg",
            base64Data: badBase64
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Le contenu du fichier ne correspond pas au format déclaré");
      });

      it("REOPEN-01: closed => open => 200", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(200);

        const snap = await db.collection("supportTickets").doc(attachTicketAId).get();
        expect(snap.data()?.status).toBe("open");
      });

      it("REOPEN-02: open => reopen => 400", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        await db.collection("supportTickets").doc(attachTicketAId).update({ status: "open" });

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
          .set("Authorization", "Bearer token-user-a");

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Le ticket est déjà ouvert");
      });

      it("REOPEN-03: deux reopen simultanés => exactement un 200", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });

        const [res1, res2] = await Promise.all([
          request(app)
            .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
            .set("Authorization", "Bearer token-user-a"),
          request(app)
            .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
            .set("Authorization", "Bearer token-user-a")
        ]);

        const statuses = [res1.status, res2.status];
        expect(statuses).toContain(200);
        expect(statuses).toContain(400);
      });

      it("REOPEN-04: deux reopen simultanés => exactement un message système", async () => {
        // Cleaning up reopen messages first
        const oldMessages = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .get();
        for (const doc of oldMessages.docs) {
          await doc.ref.delete();
        }

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        await db.collection("supportTickets").doc(attachTicketAId).update({ status: "closed" });

        await Promise.all([
          request(app)
            .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
            .set("Authorization", "Bearer token-user-a"),
          request(app)
            .post(`/api/v1/support/tickets/${attachTicketAId}/reopen`)
            .set("Authorization", "Bearer token-user-a")
        ]);

        const systemMessages = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("text", "==", "⚠️ J'ai ré-ouvert ce ticket. Mon problème n'est pas tout à fait résolu.")
          .get();

        expect(systemMessages.size).toBe(1);
      });

      it("COLLECTION-01: nouvelle écriture => supportTickets", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post("/api/v1/support/tickets")
          .set("Authorization", "Bearer token-user-a")
          .send({
            subject: "Collection alignment test"
          });

        expect(res.status).toBe(200);
        const ticketId = res.body.id;

        const canonicalDoc = await db.collection("supportTickets").doc(ticketId).get();
        expect(canonicalDoc.exists).toBe(true);

        await db.collection("supportTickets").doc(ticketId).delete();
      });

      it("COLLECTION-02: aucune nouvelle écriture => support_tickets", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post("/api/v1/support/tickets")
          .set("Authorization", "Bearer token-user-a")
          .send({
            subject: "Collection legacy check"
          });

        expect(res.status).toBe(200);
        const ticketId = res.body.id;

        const legacyDoc = await db.collection("support_tickets").doc(ticketId).get();
        expect(legacyDoc.exists).toBe(false); // Legacy collection must remain empty!

        await db.collection("supportTickets").doc(ticketId).delete();
      });

      function createMockDocSnapshot<T extends admin.firestore.DocumentData>(
        id: string,
        ref: admin.firestore.DocumentReference<T>,
        exists: boolean,
        data?: T
      ): admin.firestore.DocumentSnapshot<T> {
        return {
          id,
          ref,
          exists,
          data: () => data,
          get: (fieldPath: string | admin.firestore.FieldPath) => {
            if (!data) return undefined;
            const key = typeof fieldPath === "string" ? fieldPath : fieldPath.toString();
            return (data as Record<string, unknown>)[key];
          },
          isEqual: (other: admin.firestore.DocumentSnapshot<T>) => other.id === id,
          readTime: admin.firestore.Timestamp.now()
        } as admin.firestore.DocumentSnapshot<T>;
      }

      it("LOT-P067-1: Test 1 — attachment supprimé: attachment validé mais supprimé avant transaction => refusé et aucun message", async () => {
        const tempAttachId = "temp_deleted_attach";
        await db.collection("supportAttachments").doc(tempAttachId).set({
          ticketId: attachTicketAId,
          filePath: `support/${attachTicketAId}/${tempAttachId}/receipt.png`,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[`support/${attachTicketAId}/${tempAttachId}/receipt.png`] = {
          buffer: pngBuffer,
          options: {}
        };

        const originalRunTransaction = db.runTransaction.bind(db);
        const transactionSpy = vi.spyOn(db, "runTransaction").mockImplementation(async <T>(
          updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
        ): Promise<T> => {
          return originalRunTransaction(async (transaction: admin.firestore.Transaction) => {
            const proxyTx = new Proxy(transaction, {
              get(target, prop, receiver) {
                if (prop === "get") {
                  return async (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>) => {
                    if ("id" in ref && ref.id === tempAttachId) {
                      return createMockDocSnapshot(tempAttachId, ref, false);
                    }
                    return target.get(ref);
                  };
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            return updateFunction(proxyTx);
          });
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with deleted attachment",
            attachmentId: tempAttachId
          });

        expect(res.status).toBe(404);
        expect(res.body.error).toContain("Pièce jointe introuvable");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("text", "==", "Message with deleted attachment")
          .get();
        expect(messagesSnap.size).toBe(0);

        transactionSpy.mockRestore();
        await db.collection("supportAttachments").doc(tempAttachId).delete();
      });

      it("LOT-P067-2: Test 2 — attachment modifié: ticketId de l'attachment change avant la transaction => refusé", async () => {
        const tempAttachId = "temp_modified_attach";
        await db.collection("supportAttachments").doc(tempAttachId).set({
          ticketId: attachTicketAId,
          filePath: `support/${attachTicketAId}/${tempAttachId}/receipt.png`,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[`support/${attachTicketAId}/${tempAttachId}/receipt.png`] = {
          buffer: pngBuffer,
          options: {}
        };

        const originalRunTransaction = db.runTransaction.bind(db);
        const transactionSpy = vi.spyOn(db, "runTransaction").mockImplementation(async <T>(
          updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
        ): Promise<T> => {
          return originalRunTransaction(async (transaction: admin.firestore.Transaction) => {
            const proxyTx = new Proxy(transaction, {
              get(target, prop, receiver) {
                if (prop === "get") {
                  return async (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>) => {
                    if ("id" in ref && ref.id === tempAttachId) {
                      return createMockDocSnapshot(tempAttachId, ref, true, {
                        ticketId: "some_other_hacked_ticket",
                        filePath: `support/${attachTicketAId}/${tempAttachId}/receipt.png`,
                        fileName: "receipt.png",
                        fileType: "image/png",
                        userId: userAUid,
                      });
                    }
                    return target.get(ref);
                  };
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            return updateFunction(proxyTx);
          });
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with modified attachment",
            attachmentId: tempAttachId
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("text", "==", "Message with modified attachment")
          .get();
        expect(messagesSnap.size).toBe(0);

        transactionSpy.mockRestore();
        await db.collection("supportAttachments").doc(tempAttachId).delete();
      });

      it("LOT-P067-3: Test 3 — attachment dont filePath est invalide ou corrompu => 403 refusé", async () => {
        const tempAttachId = "temp_invalid_filepath_attach";
        await db.collection("supportAttachments").doc(tempAttachId).set({
          ticketId: attachTicketAId,
          filePath: `support/other_ticket_id/${tempAttachId}/receipt.png`,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with invalid filepath attachment",
            attachmentId: tempAttachId
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("text", "==", "Message with invalid filepath attachment")
          .get();
        expect(messagesSnap.size).toBe(0);

        await db.collection("supportAttachments").doc(tempAttachId).delete();
      });

      it("LOT-P067-4: Test 4 — attachment valide => message créé normalement avec métadonnées complètes", async () => {
        const validAttachId = "valid_lifecycle_attach";
        await db.collection("supportAttachments").doc(validAttachId).set({
          ticketId: attachTicketAId,
          filePath: `support/${attachTicketAId}/${validAttachId}/receipt.png`,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[`support/${attachTicketAId}/${validAttachId}/receipt.png`] = {
          buffer: pngBuffer,
          options: {}
        };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with valid attachment",
            attachmentId: validAttachId
          });

        expect(res.status).toBe(200);
        expect(res.body.message).toBeDefined();
        expect(res.body.message.attachmentId).toBe(validAttachId);
        expect(res.body.message.fileName).toBe("receipt.png");
        expect(res.body.message.fileType).toBe("image/png");
        expect(res.body.message.fileUrl).toBe(`/api/v1/support/tickets/${attachTicketAId}/attachments/${validAttachId}`);

        // Verify Firestore persistence
        const msgDoc = await db.collection("supportMessages").doc(res.body.message.id).get();
        expect(msgDoc.exists).toBe(true);
        expect(msgDoc.data()?.attachmentId).toBe(validAttachId);
        expect(msgDoc.data()?.fileName).toBe("receipt.png");

        // Cleanup
        await msgDoc.ref.delete();
        await db.collection("supportAttachments").doc(validAttachId).delete();
      });

      it("LOT-P067-5: Test 5 — Lecture transactionnelle des tickets et attachments dans runTransaction", async () => {
        const validAttachId = "zero_precheck_attach";
        const validFilePath = `support/${attachTicketAId}/${validAttachId}/receipt.png`;
        await db.collection("supportAttachments").doc(validAttachId).set({
          ticketId: attachTicketAId,
          filePath: validFilePath,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[validFilePath] = {
          buffer: Buffer.from("mock receipt png"),
          options: {}
        };

        const callOrder: string[] = [];

        const originalRunTransaction = db.runTransaction.bind(db);
        const transactionSpy = vi.spyOn(db, "runTransaction").mockImplementation(async <T>(
          updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
        ): Promise<T> => {
          callOrder.push("runTransaction_start");
          const result = await originalRunTransaction(async (transaction: admin.firestore.Transaction) => {
            const proxyTx = new Proxy(transaction, {
              get(target, prop, receiver) {
                if (prop === "get") {
                  return async (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>) => {
                    if ("parent" in ref && ref.parent?.id) {
                      callOrder.push(`transaction_get_${ref.parent.id}`);
                    }
                    return target.get(ref);
                  };
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            return updateFunction(proxyTx);
          });
          callOrder.push("runTransaction_end");
          return result;
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message asserting transactional integrity",
            attachmentId: validAttachId
          });

        expect(res.status).toBe(200);

        // Verify that transaction executed read operations
        expect(callOrder).toContain("runTransaction_start");
        expect(callOrder).toContain("transaction_get_supportTickets");
        expect(callOrder).toContain("transaction_get_supportAttachments");

        transactionSpy.mockRestore();
        await db.collection("supportMessages").doc(res.body.message.id).delete();
        await db.collection("supportAttachments").doc(validAttachId).delete();
        delete savedFiles[validFilePath];
      });

      it("LOT-P067-6: Test 6 — Route Admin avec attachment valide => créée dans transaction et audit tracé", async () => {
        const adminAttachId = "admin_valid_attach";
        const adminFilePath = `support/${attachTicketAId}/${adminAttachId}/report.pdf`;
        await db.collection("supportAttachments").doc(adminAttachId).set({
          ticketId: attachTicketAId,
          filePath: adminFilePath,
          fileName: "report.pdf",
          fileType: "application/pdf",
          userId: adminUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[adminFilePath] = {
          buffer: Buffer.from("mock pdf content"),
          options: {}
        };

        verifyTokenSpy.mockResolvedValue({
          uid: adminUid,
          email: "admin@olmart.dz",
          role: "admin",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/admin/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-admin")
          .send({
            text: "Admin official response with PDF",
            attachmentId: adminAttachId,
            isInternal: false
          });

        expect(res.status).toBe(200);
        expect(res.body.message.sender).toBe("admin");
        expect(res.body.message.attachmentId).toBe(adminAttachId);
        expect(res.body.message.fileName).toBe("report.pdf");

        // Verify message in Firestore
        const msgDoc = await db.collection("supportMessages").doc(res.body.message.id).get();
        expect(msgDoc.exists).toBe(true);
        expect(msgDoc.data()?.sender).toBe("admin");

        // Cleanup
        await msgDoc.ref.delete();
        await db.collection("supportAttachments").doc(adminAttachId).delete();
        delete savedFiles[adminFilePath];
      });

      it("LOT-P067-7: Test 7 — Route Admin avec attachment inexistant => 404 Pièce jointe introuvable", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: adminUid,
          email: "admin@olmart.dz",
          role: "admin",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/admin/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-admin")
          .send({
            text: "Admin response with ghost attachment",
            attachmentId: "ghost_attachment_non_existent"
          });

        expect(res.status).toBe(404);
        expect(res.body.error).toContain("Pièce jointe introuvable");
      });

      it("LOT-P067-8: Test 8 — Anti-tampering: injection de sender/userId/fileUrl dans body => écrasé par valeurs serveur", async () => {
        const forgeAttachId = "forge_attach_id";
        const forgePath = `support/${attachTicketAId}/${forgeAttachId}/safe.png`;
        await db.collection("supportAttachments").doc(forgeAttachId).set({
          ticketId: attachTicketAId,
          filePath: forgePath,
          fileName: "safe.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[forgePath] = {
          buffer: Buffer.from("mock safe png"),
          options: {}
        };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Trying to forge system fields",
            attachmentId: forgeAttachId,
            sender: "admin",
            userId: "superadmin_hacked",
            fileUrl: "https://evil.com/malware.exe",
            filePath: "/etc/passwd"
          });

        expect(res.status).toBe(200);
        expect(res.body.message.sender).toBe("client"); // Forced to client
        expect(res.body.message.userId).toBe(userAUid); // Forced to authenticated user
        expect(res.body.message.fileUrl).toBe(`/api/v1/support/tickets/${attachTicketAId}/attachments/${forgeAttachId}`);
        expect(res.body.message.filePath).toBe(`support/${attachTicketAId}/${forgeAttachId}/safe.png`);

        const msgDoc = await db.collection("supportMessages").doc(res.body.message.id).get();
        expect(msgDoc.data()?.sender).toBe("client");
        expect(msgDoc.data()?.userId).toBe(userAUid);
        expect(msgDoc.data()?.filePath).toBe(`support/${attachTicketAId}/${forgeAttachId}/safe.png`);

        // Cleanup
        await msgDoc.ref.delete();
        await db.collection("supportAttachments").doc(forgeAttachId).delete();
        delete savedFiles[forgePath];
      });
    });

    describe("LOT P0.6.8: Finalisation Sécurité des Pièces Jointes Support (STORAGE-01 à STORAGE-08)", () => {
      it("STORAGE-01: Attachment Firestore valide mais fichier Storage supprimé (inexistant) => 404 Fichier physique introuvable, aucun message créé", async () => {
        const ghostFileAttachId = "ghost_file_storage_01";
        const ghostFilePath = `support/${attachTicketAId}/${ghostFileAttachId}/receipt.png`;

        await db.collection("supportAttachments").doc(ghostFileAttachId).set({
          ticketId: attachTicketAId,
          filePath: ghostFilePath,
          fileName: "receipt.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        // Deliberately NOT populating savedFiles[ghostFilePath] to simulate missing physical file in Storage

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with missing physical file",
            attachmentId: ghostFileAttachId
          });

        expect(res.status).toBe(404);
        expect(res.body.error).toContain("Fichier physique introuvable dans Cloud Storage");

        // Verify zero messages created
        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("attachmentId", "==", ghostFileAttachId)
          .get();
        expect(messagesSnap.size).toBe(0);

        // Cleanup
        await db.collection("supportAttachments").doc(ghostFileAttachId).delete();
      });

      it("STORAGE-02: Attachment valide mais filePath modifié hors convention => 403 Chemin d'accès non autorisé, aucun message créé", async () => {
        const corruptPathAttachId = "corrupt_path_storage_02";
        // Invalid path not matching support/{ticketId}/{attachmentId}/...
        const invalidFilePath = `support/${attachTicketAId}/another_id/invoice.pdf`;

        await db.collection("supportAttachments").doc(corruptPathAttachId).set({
          ticketId: attachTicketAId,
          filePath: invalidFilePath,
          fileName: "invoice.pdf",
          fileType: "application/pdf",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[invalidFilePath] = { buffer: Buffer.from("pdf content"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message with corrupt file path attachment",
            attachmentId: corruptPathAttachId
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("attachmentId", "==", corruptPathAttachId)
          .get();
        expect(messagesSnap.size).toBe(0);

        // Cleanup
        await db.collection("supportAttachments").doc(corruptPathAttachId).delete();
        delete savedFiles[invalidFilePath];
      });

      it("STORAGE-03: Attachment dont ticketId est modifié vers un autre ticket => 400 La pièce jointe n'appartient pas à ce ticket, aucun message créé", async () => {
        const mismatchAttachId = "mismatch_ticket_storage_03";
        const mismatchFilePath = `support/${ticketBId}/${mismatchAttachId}/doc.pdf`;

        await db.collection("supportAttachments").doc(mismatchAttachId).set({
          ticketId: ticketBId, // Belongs to ticket B, not attachTicketAId
          filePath: mismatchFilePath,
          fileName: "doc.pdf",
          fileType: "application/pdf",
          userId: userBUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[mismatchFilePath] = { buffer: Buffer.from("doc content"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // User A tries to use ticket B's attachment in Ticket A
        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Trying cross-ticket attachment attack",
            attachmentId: mismatchAttachId
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("attachmentId", "==", mismatchAttachId)
          .get();
        expect(messagesSnap.size).toBe(0);

        // Cleanup
        await db.collection("supportAttachments").doc(mismatchAttachId).delete();
        delete savedFiles[mismatchFilePath];
      });

      it("STORAGE-04: Attachment valide avec fichier physique présent => 200 message créé, fileUrl serveur générée, anti-tampering vérifié", async () => {
        const validAttachId = "valid_storage_04";
        const validFilePath = `support/${attachTicketAId}/${validAttachId}/contract.pdf`;

        await db.collection("supportAttachments").doc(validAttachId).set({
          ticketId: attachTicketAId,
          filePath: validFilePath,
          fileName: "contract.pdf",
          fileType: "application/pdf",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[validFilePath] = { buffer: Buffer.from("valid pdf contract"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Valid message with contract attachment",
            attachmentId: validAttachId,
            fileUrl: "https://evil.attacker.com/fake.pdf", // Injected client URL to be ignored
            sender: "superadmin" // Injected client sender to be ignored
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message.sender).toBe("client");
        expect(res.body.message.userId).toBe(userAUid);
        expect(res.body.message.attachmentId).toBe(validAttachId);
        expect(res.body.message.fileUrl).toBe(`/api/v1/support/tickets/${attachTicketAId}/attachments/${validAttachId}`);
        expect(res.body.message.fileName).toBe("contract.pdf");
        expect(res.body.message.fileType).toBe("application/pdf");

        // Verify message saved in Firestore
        const msgDoc = await db.collection("supportMessages").doc(res.body.message.id).get();
        expect(msgDoc.exists).toBe(true);
        expect(msgDoc.data()?.fileUrl).toBe(`/api/v1/support/tickets/${attachTicketAId}/attachments/${validAttachId}`);

        // Cleanup
        await msgDoc.ref.delete();
        await db.collection("supportAttachments").doc(validAttachId).delete();
        delete savedFiles[validFilePath];
      });

      it("STORAGE-05: Utilisateur B tente d'utiliser l'attachment du ticket A dans son ticket B => 400, aucun message créé", async () => {
        const attachAId = "attach_for_ticket_a_storage_05";
        const attachAPath = `support/${attachTicketAId}/${attachAId}/secret.png`;

        await db.collection("supportAttachments").doc(attachAId).set({
          ticketId: attachTicketAId,
          filePath: attachAPath,
          fileName: "secret.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[attachAPath] = { buffer: Buffer.from("secret image"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // User B posts to ticket B using attachAId (which belongs to ticket A)
        const res = await request(app)
          .post(`/api/v1/support/tickets/${ticketBId}/messages`)
          .set("Authorization", "Bearer token-user-b")
          .send({
            text: "User B trying to link ticket A's attachment",
            attachmentId: attachAId
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", ticketBId)
          .where("attachmentId", "==", attachAId)
          .get();
        expect(messagesSnap.size).toBe(0);

        // Cleanup
        await db.collection("supportAttachments").doc(attachAId).delete();
        delete savedFiles[attachAPath];
      });

      it("STORAGE-06: Admin utilise un attachment légitime sur ticket A => 200 succès, message créé", async () => {
        const adminAttachId = "admin_attach_storage_06";
        const adminFilePath = `support/${attachTicketAId}/${adminAttachId}/admin_diag.pdf`;

        await db.collection("supportAttachments").doc(adminAttachId).set({
          ticketId: attachTicketAId,
          filePath: adminFilePath,
          fileName: "admin_diag.pdf",
          fileType: "application/pdf",
          userId: adminUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[adminFilePath] = { buffer: Buffer.from("admin diagnosis pdf"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: adminUid,
          email: "admin@olmart.dz",
          role: "admin",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/admin/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-admin")
          .send({
            text: "Admin diagnostic report attached",
            attachmentId: adminAttachId,
            isInternal: false
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message.sender).toBe("admin");
        expect(res.body.message.attachmentId).toBe(adminAttachId);
        expect(res.body.message.fileName).toBe("admin_diag.pdf");

        // Verify message in Firestore
        const msgDoc = await db.collection("supportMessages").doc(res.body.message.id).get();
        expect(msgDoc.exists).toBe(true);
        expect(msgDoc.data()?.sender).toBe("admin");

        // Cleanup
        await msgDoc.ref.delete();
        await db.collection("supportAttachments").doc(adminAttachId).delete();
        delete savedFiles[adminFilePath];
      });

      it("STORAGE-07: Tentative de path traversal (../, absolu) dans filePath => 403 Chemin d'accès non autorisé, aucun message créé", async () => {
        const traversalAttachId = "traversal_attach_storage_07";
        const traversalFilePath = `support/${attachTicketAId}/${traversalAttachId}/../../../../etc/passwd`;

        await db.collection("supportAttachments").doc(traversalAttachId).set({
          ticketId: attachTicketAId,
          filePath: traversalFilePath,
          fileName: "passwd",
          fileType: "text/plain",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Trying path traversal via attachment",
            attachmentId: traversalAttachId
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("attachmentId", "==", traversalAttachId)
          .get();
        expect(messagesSnap.size).toBe(0);

        // Cleanup
        await db.collection("supportAttachments").doc(traversalAttachId).delete();
      });

      it("STORAGE-08: Modification concurrente des métadonnées entre la validation initiale et la transaction (anti-TOCTOU) => 409 rejeté, aucun message créé", async () => {
        const toctouAttachId = "toctou_attach_storage_08";
        const initialFilePath = `support/${attachTicketAId}/${toctouAttachId}/original.png`;
        const mutatedFilePath = `support/${attachTicketAId}/${toctouAttachId}/mutated.png`;

        await db.collection("supportAttachments").doc(toctouAttachId).set({
          ticketId: attachTicketAId,
          filePath: initialFilePath,
          fileName: "original.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[initialFilePath] = { buffer: Buffer.from("original png"), options: {} };
        savedFiles[mutatedFilePath] = { buffer: Buffer.from("mutated png"), options: {} };

        // Intercept runTransaction to simulate Firestore document mutation before transaction reads it
        const originalRunTransaction = db.runTransaction.bind(db);
        const mutateSpy = vi.spyOn(db, "runTransaction").mockImplementation(async <T>(
          updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
        ): Promise<T> => {
          return originalRunTransaction(async (transaction: admin.firestore.Transaction) => {
            const proxyTx = new Proxy(transaction, {
              get(target, prop, receiver) {
                if (prop === "get") {
                  return async (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>) => {
                    const snap = await target.get(ref);
                    if (ref.id === toctouAttachId) {
                      return {
                        ...snap,
                        exists: true,
                        data: () => ({
                          ...snap.data(),
                          fileName: "mutated.png",
                          filePath: mutatedFilePath
                        })
                      } as unknown as admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
                    }
                    return snap;
                  };
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            return updateFunction(proxyTx);
          });
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${attachTicketAId}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Testing TOCTOU mutation detection",
            attachmentId: toctouAttachId
          });

        expect(res.status).toBe(409);
        expect(res.body.error).toContain("Modification concurrente des métadonnées détectée (TOCTOU)");

        // Verify that NO message was created
        const messagesSnap = await db.collection("supportMessages")
          .where("ticketId", "==", attachTicketAId)
          .where("attachmentId", "==", toctouAttachId)
          .get();
        expect(messagesSnap.size).toBe(0);

        mutateSpy.mockRestore();
        await db.collection("supportAttachments").doc(toctouAttachId).delete();
        delete savedFiles[initialFilePath];
        delete savedFiles[mutatedFilePath];
      });
    });

    describe("LOT P1: Validation de l'ordre d'accès Ticket -> Attachment (P1-AUTH-01 à P1-AUTH-10)", () => {
      const p1TicketA = "p1_test_ticket_a";
      const p1TicketB = "p1_test_ticket_b";
      const p1AttachA = "p1_attach_a";
      const p1PathA = `support/${p1TicketA}/${p1AttachA}/file_a.png`;

      beforeAll(async () => {
        await db.collection("supportTickets").doc(p1TicketA).set({
          userId: userAUid,
          userName: "User A",
          subject: "Ticket P1 A",
          priority: "medium",
          status: "open",
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString()
        });

        await db.collection("supportTickets").doc(p1TicketB).set({
          userId: userBUid,
          userName: "User B",
          subject: "Ticket P1 B",
          priority: "medium",
          status: "open",
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString()
        });

        await db.collection("supportAttachments").doc(p1AttachA).set({
          ticketId: p1TicketA,
          filePath: p1PathA,
          fileName: "file_a.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[p1PathA] = { buffer: Buffer.from("mock p1 file a"), options: {} };
      });

      afterAll(async () => {
        await db.collection("supportTickets").doc(p1TicketA).delete();
        await db.collection("supportTickets").doc(p1TicketB).delete();
        await db.collection("supportAttachments").doc(p1AttachA).delete();
        delete savedFiles[p1PathA];
      });

      it("P1-AUTH-01: Utilisateur A avec attachment appartenant à A => 200 succès", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message from User A with legitimate attachment",
            attachmentId: p1AttachA
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message.attachmentId).toBe(p1AttachA);
        expect(res.body.message.userId).toBe(userAUid);

        await db.collection("supportMessages").doc(res.body.message.id).delete();
      });

      it("P1-AUTH-02: Utilisateur B avec ticket A + attachment A => 403 accès refusé", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-b")
          .send({
            text: "User B trying to post on User A ticket",
            attachmentId: p1AttachA
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Accès non autorisé");
      });

      it("P1-AUTH-03: Utilisateur B avec son ticket B mais attachment A => 400 n'appartient pas à ce ticket", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketB}/messages`)
          .set("Authorization", "Bearer token-user-b")
          .send({
            text: "User B using User A attachment on ticket B",
            attachmentId: p1AttachA
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");
      });

      it("P1-AUTH-04: Utilisateur non authentifié => 401", async () => {
        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .send({
            text: "Unauthenticated message attempt",
            attachmentId: p1AttachA
          });

        expect(res.status).toBe(401);
      });

      it("P1-AUTH-05: Ticket inexistant => 404 Ticket de support introuvable", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/non_existent_ticket_9999/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Message to non existent ticket",
            attachmentId: p1AttachA
          });

        expect(res.status).toBe(404);
        expect(res.body.error).toContain("Ticket de support introuvable");
      });

      it("P1-AUTH-06: Ticket non autorisé => AUCUNE lecture de supportAttachments n'a lieu avant le refus d'accès 403", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // Spy on db.collection to intercept and track doc reads on supportAttachments
        let supportAttachmentsReadCount = 0;
        const originalCollection = db.collection.bind(db);
        const collectionSpy = vi.spyOn(db, "collection").mockImplementation((collectionName: string) => {
          const colRef = originalCollection(collectionName);
          if (collectionName === "supportAttachments") {
            const originalDoc = colRef.doc.bind(colRef);
            colRef.doc = ((docId?: string) => {
              const docRef = originalDoc(docId);
              const originalGet = docRef.get.bind(docRef);
              docRef.get = (async () => {
                supportAttachmentsReadCount++;
                return originalGet();
              }) as typeof docRef.get;
              return docRef;
            }) as typeof colRef.doc;
          }
          return colRef;
        });

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-b")
          .send({
            text: "Attempt to trigger attachment read on unauthorized ticket",
            attachmentId: "some_foreign_or_secret_attachment"
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Accès non autorisé");

        // Assert: Zero reads on supportAttachments occurred because ticket authorization blocked first!
        expect(supportAttachmentsReadCount).toBe(0);

        collectionSpy.mockRestore();
      });

      it("P1-AUTH-07: Mutation de l'attachment entre lecture initiale et transaction => rejet 409 TOCTOU", async () => {
        const p1ToctouAttach = "p1_toctou_attach";
        const p1ToctouPath = `support/${p1TicketA}/${p1ToctouAttach}/orig.png`;
        const p1MutatedPath = `support/${p1TicketA}/${p1ToctouAttach}/mut.png`;

        await db.collection("supportAttachments").doc(p1ToctouAttach).set({
          ticketId: p1TicketA,
          filePath: p1ToctouPath,
          fileName: "orig.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[p1ToctouPath] = { buffer: Buffer.from("orig"), options: {} };
        savedFiles[p1MutatedPath] = { buffer: Buffer.from("mut"), options: {} };

        const originalRunTransaction = db.runTransaction.bind(db);
        const txSpy = vi.spyOn(db, "runTransaction").mockImplementation(async <T>(
          updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
        ): Promise<T> => {
          return originalRunTransaction(async (transaction: admin.firestore.Transaction) => {
            const proxyTx = new Proxy(transaction, {
              get(target, prop, receiver) {
                if (prop === "get") {
                  return async (ref: admin.firestore.DocumentReference<admin.firestore.DocumentData>) => {
                    const snap = await target.get(ref);
                    if (ref.id === p1ToctouAttach) {
                      return {
                        ...snap,
                        exists: true,
                        data: () => ({
                          ...snap.data(),
                          fileName: "mut.png",
                          filePath: p1MutatedPath
                        })
                      } as unknown as admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
                    }
                    return snap;
                  };
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            return updateFunction(proxyTx);
          });
        });

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Testing TOCTOU in P1 suite",
            attachmentId: p1ToctouAttach
          });

        expect(res.status).toBe(409);
        expect(res.body.error).toContain("Modification concurrente des métadonnées détectée (TOCTOU)");

        txSpy.mockRestore();
        await db.collection("supportAttachments").doc(p1ToctouAttach).delete();
        delete savedFiles[p1ToctouPath];
        delete savedFiles[p1MutatedPath];
      });

      it("P1-AUTH-08: Attachment avec ticketId falsifié => rejet 400", async () => {
        const forgeTicketAttach = "p1_forge_ticket_attach";
        const forgePath = `support/${p1TicketB}/${forgeTicketAttach}/forge.png`;

        await db.collection("supportAttachments").doc(forgeTicketAttach).set({
          ticketId: p1TicketB, // Points to ticket B
          filePath: forgePath,
          fileName: "forge.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[forgePath] = { buffer: Buffer.from("forge"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Attachment with mismatched ticketId",
            attachmentId: forgeTicketAttach
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("La pièce jointe n'appartient pas à ce ticket");

        await db.collection("supportAttachments").doc(forgeTicketAttach).delete();
        delete savedFiles[forgePath];
      });

      it("P1-AUTH-09: filePath falsifié => rejet 403", async () => {
        const corruptPathAttach = "p1_corrupt_path_attach";
        const corruptPath = `support/${p1TicketA}/${p1AttachA}/wrong_id.png`;

        await db.collection("supportAttachments").doc(corruptPathAttach).set({
          ticketId: p1TicketA,
          filePath: corruptPath,
          fileName: "wrong_id.png",
          fileType: "image/png",
          userId: userAUid,
          createdAt: new Date().toISOString()
        });
        savedFiles[corruptPath] = { buffer: Buffer.from("corrupt"), options: {} };

        verifyTokenSpy.mockResolvedValue({
          uid: userAUid,
          email: "usera@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        const res = await request(app)
          .post(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-a")
          .send({
            text: "Attachment with invalid filePath convention",
            attachmentId: corruptPathAttach
          });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Chemin d'accès non autorisé ou corrompu");

        await db.collection("supportAttachments").doc(corruptPathAttach).delete();
        delete savedFiles[corruptPath];
      });

      it("P1-AUTH-10: Vérifier qu'aucune donnée d'attachment appartenant à un tiers n'est renvoyée", async () => {
        verifyTokenSpy.mockResolvedValue({
          uid: userBUid,
          email: "userb@olmart.dz",
          role: "buyer",
        } as unknown as admin.auth.DecodedIdToken);

        // User B tries to retrieve messages from ticket A
        const resGetMessages = await request(app)
          .get(`/api/v1/support/tickets/${p1TicketA}/messages`)
          .set("Authorization", "Bearer token-user-b");

        expect(resGetMessages.status).toBe(403);
        expect(resGetMessages.body.messages).toBeUndefined();

        // User B tries to download attachment A directly
        const resGetAttach = await request(app)
          .get(`/api/v1/support/tickets/${p1TicketA}/attachments/${p1AttachA}`)
          .set("Authorization", "Bearer token-user-b");

        expect(resGetAttach.status).toBe(403);
        expect(resGetAttach.body.error).toContain("Accès non autorisé");
      });
    });
  });
});
