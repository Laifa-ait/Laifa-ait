import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Order } from "../../../domains/order/order.types";
import { LabelFormatOption, LabelSize } from "./shippingLabel.types";

export function useShippingLabelPrinter(order: Order) {
  const { t } = useTranslation();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [labelSize, setLabelSize] = useState<LabelSize>("a6");
  const [includeBarcodes, setIncludeBarcodes] = useState<boolean>(true);
  const [remarks, setRemarks] = useState<string>(
    "Veuillez appeler le client avant livraison. Ouverture de colis autorisée."
  );

  const actualTracking = order.trackingId || order.trackingNumber || t("Non attribué");

  const formats: LabelFormatOption[] = [
    { id: "a6", label: "Autocollant Thermique A6" },
    { id: "receipt", label: "Ticket Caisse (80mm)" },
  ];

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    let iframe = document.getElementById("print-iframe-stealth") as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-iframe-stealth";
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.style.left = "-1000px";
      iframe.style.top = "-1000px";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      toast.error("Erreur d'accès à l'iframe d'impression");
      return;
    }

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Bordereau d'Expédition - ${actualTracking}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Libre+Barcode+128&display=swap');
            
            @page {
              size: ${labelSize === "a6" ? "105mm 148mm" : "80mm 200mm"};
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
            .label-card {
              width: 100%;
              max-width: ${labelSize === "a6" ? "101mm" : "76mm"};
              margin: 0 auto;
              border: 2px solid #000;
              padding: 10px;
              box-sizing: border-box;
            }
            .header-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .header-bar h2 {
              margin: 0;
              font-size: 16px;
              font-weight: 950;
              text-transform: uppercase;
            }
            .row-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .full-width {
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .label-text {
              font-size: 8px;
              text-transform: uppercase;
              font-weight: 700;
              color: #555;
            }
            .val-text {
              font-size: 11px;
              font-weight: 700;
            }
            .big-val {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
            }
            .cash-badge {
              border: 3px solid #000;
              padding: 8px;
              text-align: center;
              background-color: #000;
              color: #fff;
              margin: 8px 0;
            }
            .cash-badge .amount {
              font-size: 20px;
              font-weight: 900;
            }
            .barcode-visual {
              text-align: center;
              padding: 10px 0;
              font-family: 'Libre Barcode 128', sans-serif;
              font-size: 40px;
              line-height: 1;
              letter-spacing: 2px;
            }
            .tracking-code {
              text-align: center;
              font-size: 11px;
              font-weight: 900;
              margin-top: 4px;
            }
            .qr-placeholder {
              width: 50px;
              height: 50px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    doc.close();

    const targetFrame = iframe;
    setTimeout(() => {
      if (targetFrame.contentWindow) {
        targetFrame.contentWindow.focus();
        targetFrame.contentWindow.print();
      }
    }, 300);
  };

  return {
    labelSize,
    setLabelSize,
    includeBarcodes,
    setIncludeBarcodes,
    remarks,
    setRemarks,
    actualTracking,
    formats,
    handlePrint,
    printAreaRef,
  };
}
