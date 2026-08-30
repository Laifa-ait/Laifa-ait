import nodemailer from "nodemailer";
import { admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLowStockEmail = async (sellerEmail: string, message: string) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: sellerEmail, message });
      return;
    }
    await transporter.sendMail({
      from: '"Olmart" <noreply@olmart.dz>',
      to: sellerEmail,
      subject: "⚠️ Alerte Stock Critique - Olmart",
      text: message,
    });
  } catch (err) {
    safeLogger.error("Failed to send stock alert email", { err: err instanceof Error ? err.message : String(err) });
  }
};

export interface OrderEmailSubOrder {
  sellerId: string;
  subOrderId: string;
  items: Array<{ name?: string; quantity?: number; price?: number; [key: string]: unknown }>;
  total: number;
}

export const sendOrderConfirmationEmails = async (
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  grandTotal: number,
  subOrders: OrderEmailSubOrder[]
) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: buyerEmail, orderId });
      return;
    }

    if (buyerEmail) {
      await transporter.sendMail({
        from: '"Olmart" <noreply@olmart.dz>',
        to: buyerEmail,
        subject: `Confirmation de votre commande #${orderId} - Olmart`,
        html: `<h2>Merci pour votre commande, ${buyerName} !</h2>
               <p>Votre commande porte la référence <strong>#${orderId}</strong> a bien été enregistrée.</p>
               <p>Montant total : <strong>${grandTotal} DZD</strong> (Paiement à la livraison).</p>
               <p>Nos vendeurs préparent vos articles.</p>
               <br/><p>L'équipe Olmart</p>`,
      });
    }

    for (const so of subOrders) {
      const userSnap = await admin.firestore().collection("users").doc(so.sellerId).get();
      const sellerEmail = userSnap.data()?.email;
      
      if (sellerEmail) {
        const itemsHtml = so.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join("");
        await transporter.sendMail({
          from: '"Olmart" <noreply@olmart.dz>',
          to: sellerEmail,
          subject: `Nouvelle commande reçue #${so.subOrderId} - Olmart`,
          html: `<h2>Bonjour, vous avez reçu une nouvelle commande !</h2>
                 <p>La référence de la sous-commande est <strong>#${so.subOrderId}</strong>.</p>
                 <p>Produits commandés :</p>
                 <ul>${itemsHtml}</ul>
                 <p>Total à préparer : <strong>${so.total} DZD</strong>.</p>
                 <br/><p>Connectez-vous à votre espace vendeur pour la traiter.</p>`,
        });
      }
    }
  } catch (err) {
    safeLogger.error("Failed to send order confirmation emails", { err: err instanceof Error ? err.message : String(err) });
  }
};
