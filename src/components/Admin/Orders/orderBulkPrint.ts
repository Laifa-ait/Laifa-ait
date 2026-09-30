import { toast } from "react-hot-toast";
import { Order } from "../../../domains/order/order.types";
import { formatPrice } from "../../../utils/format";

export const printBulkOrderLabels = (
  selectedOrders: Order[],
  t: (key: string) => string
): void => {
  if (selectedOrders.length === 0) {
    toast.error(t("Veuillez sélectionner au moins une commande à imprimer."));
    return;
  }

  // Create a hidden iframe for print isolation that avoids popup blockers
  let iframe = document.getElementById("print-iframe-stealth-bulk") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "print-iframe-stealth-bulk";
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.left = "-1000px";
    iframe.style.top = "-1000px";
    document.body.appendChild(iframe);
  }

  const docRef = iframe.contentWindow?.document || iframe.contentDocument;
  if (!docRef) {
    toast.error(t("Erreur d'accès à l'iframe d'impression"));
    return;
  }

  // Generate consecutive labels with print break separation css
  let labelsHtml = "";
  selectedOrders.forEach((o, index) => {
    const tracking = o.trackingId || o.trackingNumber || `OLM-REF-${o.id.slice(-6).toUpperCase()}`;
    const remarks = t("Notes Admin : Livraison standard rapide 69 Wilayas d'Algérie.");
    const itemsList = (o.items || [])
      .map((it) => `• ${it.productName || it.name || "Produit"} x ${it.quantity}`)
      .join("<br/>");

    labelsHtml += `
      <div class="label-ticket-wrap" style="${index > 0 ? "page-break-before: always;" : ""}">
        <div style="border: 3px solid #000; padding: 18px; font-family: 'Inter', sans-serif; border-radius: 12px; margin-bottom: 20px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <div>
              <strong style="font-size: 16px; font-weight: 900; color: #ea580c; text-transform: uppercase;">⚡ OLMART LOGISTICS</strong>
              <p style="font-size: 9px; margin: 2px 0 0 0; font-weight: bold; color: #555;">Co-partenaire Algérie 69 Wilayas</p>
            </div>
            <div style="border: 1px solid #000; padding: 4px; font-weight: bold; font-size: 10px;">
              QR SCAN
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <td style="width: 50%; padding-right: 10px; vertical-align: top; border-right: 1.5px solid #000;">
                <span style="font-size: 8px; font-weight: bold; color: #666; text-transform: uppercase; display: block;">EXPÉDITEUR</span>
                <strong style="display: block; font-size: 12px; color: #000;">OLMART DIRECT VENDORS</strong>
                <span style="color: #444;">ID Commande: ${o.id.slice(-8).toUpperCase()}</span>
              </td>
              <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                <span style="font-size: 8px; font-weight: bold; color: #666; text-transform: uppercase; display: block;">${t("DESTINATAIRE (CLIENT)") || "DESTINATAIRE (CLIENT)"}</span>
                <strong style="display: block; font-size: 12px; color: #000;">${o.shippingAddress?.fullName || o.shippingAddress?.name || t("Client Olmart") || "Client Olmart"}</strong>
                <span style="color: #444; font-weight: bold;">💬 ${o.shippingAddress?.phone}</span>
              </td>
            </tr>
          </table>

          <div style="background-color: #fafafa; border: 1.5px solid #000; border-radius: 6px; padding: 10px; margin-bottom: 15px;">
            <span style="font-size: 8px; font-weight: bold; color: #666; display: block; text-transform: uppercase; margin-bottom: 4px;">ADRESSE FINALE DE LIVRAISON</span>
            <strong style="font-size: 12px; display: block; line-height: 1.25; color: #000;">${o.shippingAddress?.street || "Adresse non spécifiée"}</strong>
            <strong style="font-size: 13px; color: #ea580c; text-transform: uppercase; display: block; margin-top: 4px;">🎯📍 ${o.shippingAddress?.commune || ""} • ${o.shippingAddress?.wilaya || ""}</strong>
          </div>

          <div style="border-bottom: 1.5px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <span style="font-size: 8px; font-weight: bold; color: #666; display: block; text-transform: uppercase; margin-bottom: 4px;">CONTENU DE COMMANDE</span>
            <div style="font-size: 11px; font-weight: bold; color: #111;">
              ${itemsList}
            </div>
          </div>

          <div style="background-color: #000; color: #fff; text-align: center; padding: 12px; border-radius: 6px;">
            <span style="font-size: 8px; font-weight: bold; color: rgba(255,255,255,0.7); display: block; text-transform: uppercase;">MONTANT TOTAL GLOBAL A ENCAISSER (COD)</span>
            <strong style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; display: block;">${formatPrice(o.total)}</strong>
            <span style="font-size: 8px; display: block; opacity: 0.8; margin-top: 2px;">Cash On Delivery (Espèces uniquement)</span>
          </div>

          <div style="margin-top: 15px; text-align: center;">
            <div style="font-size: 26px; font-weight: normal; font-family: 'Arial', sans-serif; letter-spacing: 5px; color: #000; line-height: 1;">
              ||||| | |||| ||| || | |||| ||
            </div>
            <strong style="font-size: 12px; font-weight: 900; letter-spacing: 3px; display: block; margin-top: 6px; text-transform: uppercase;">
              ${tracking}
            </strong>
          </div>

          <div style="font-size: 9px; color: #555; border-top: 1px solid #ddd; margin-top: 12px; padding-top: 6px;">
            <strong>Note:</strong> ${remarks}
          </div>
        </div>
      </div>
    `;
  });

  docRef.open();
  docRef.write(`
    <html>
      <head>
        <title>Bordereaux de Transport Olmart - Masse</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page {
            size: 105mm 148mm;
            margin: 0;
          }
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 10px;
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .label-ticket-wrap {
            width: 100%;
            max-width: 101mm;
            margin: 0 auto;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${labelsHtml}
      </body>
    </html>
  `);
  docRef.close();

  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      toast.success(`${selectedOrders.length} ${t("tickets d'expédition envoyés à l'impression !")}`);
    }
  }, 400);
};
