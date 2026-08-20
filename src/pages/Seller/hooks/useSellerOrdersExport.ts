import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPost } from "../../../lib/api";
import { Order } from "../../../domains/order/order.types";
import { CalculatedOrder, formatOrderDate } from "../components/orders/orderTypes";
import { exportPremiumToSheets } from "../../../services/googleWorkspace";

export const useSellerOrdersExport = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [loadingSheets, setLoadingSheets] = useState(false);

  const handleExportPremium = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingSheets(true);

      const res = await apiGet<{ orders?: Order[] }>("/api/v1/seller/orders");
      const rawOrders = res?.orders || [];

      const realRows: (string | number)[][] = [];
      let totalBrut = 0;
      let totalCommission = 0;
      let totalNet = 0;

      const commissionRate = userProfile?.commissionRate || 10;
      const calcData = await apiPost<{ calculatedOrders?: CalculatedOrder[] }>(
        "/api/v1/calculate-commissions",
        { orders: rawOrders }
      );
      const calcMap: Record<string, CalculatedOrder> = {};
      calcData.calculatedOrders?.forEach((co: CalculatedOrder) => (calcMap[co.id] = co));

      rawOrders.forEach((order) => {
        const orderId = order.id;
        const sellerItems = order.items?.filter((item) => item.sellerId === currentUser.uid) || [];
        const zipCode = order.shippingAddress?.wilaya || "N/A";
        const province = order.shippingAddress?.commune || "N/A";
        const provider = order.deliveryProvider || "Non assigné";
        const tracking = order.trackingId || order.trackingNumber || "";
        const orderDate =
          formatOrderDate(order.createdAt, i18n.language.startsWith("ar") ? "ar-DZ" : "fr-DZ") ||
          new Date().toLocaleDateString();

        sellerItems.forEach((item) => {
          const lineTotal = item.price * item.quantity;
          const serverComm = calcMap[orderId]?.commissionAmount || 0;
          const orderTotal = order.total || 1;
          const commission = lineTotal * (serverComm / orderTotal);
          const net = lineTotal - commission;

          totalBrut += lineTotal;
          totalCommission += commission;
          totalNet += net;

          realRows.push([
            orderDate,
            orderId,
            item.productName || item.name || "Produit",
            item.quantity || 1,
            item.price || 0,
            lineTotal,
            "Serveur API",
            commission,
            net,
            zipCode,
            province,
            provider,
            tracking,
            order.paymentStatus || (i18n.language.startsWith("ar") ? "في الانتظار" : "En attente"),
            order.status || "NEW",
          ]);
        });
      });

      if (realRows.length === 0) {
        toast.error(t("Aucune commande trouvée pour générer le bilan."));
        setLoadingSheets(false);
        return;
      }

      const isArabic = i18n.language.startsWith("ar");
      const isEnglish = i18n.language.startsWith("en");

      const getExportHeadersInternal = (lang: string) => {
        if (lang.startsWith("ar")) {
          return [
            "التاريخ", "رقم الطلب", "المنتج", "الكمية", "سعر الوحدة (د.ج)", "المجموع الإجمالي (د.ج)",
            "نسبة العمولة", "مبلغ العمولة (د.ج)", "صافي البائع (د.ج)", "الرمز البريدي", "الولاية",
            "الموزع", "رقم التتبع", "حالة الدفع", "حالة الطرد"
          ];
        } else if (lang.startsWith("en")) {
          return [
            "Date", "Order ID", "Product", "Qty", "Unit Price (DZD)", "Total Gross (DZD)",
            "Commission %", "Commission Amount", "Net Seller (Revenue)", "Zip Code", "Province",
            "Carrier", "Tracking", "Payment Status", "Package Status"
          ];
        } else {
          return [
            "Date", "ID Commande", "Produit", "Qte", "Prix Unitaire (DZD)", "Total Brut (DZD)",
            "Commission %", "Montant Commission", "Net Vendeur (Revenu)", "Code postal", "Wilaya",
            "Livreur", "Tracking", "Statut Paiement", "Statut Colis"
          ];
        }
      };

      const headers = getExportHeadersInternal(i18n.language);
      const sellerShopName = userProfile?.role === "seller" && typeof userProfile.shopName === "string" ? userProfile.shopName : "";

      let docTitle = `RAPPORT_VENTES_${(sellerShopName || "BOUTIQUE").toUpperCase()}_${new Date().toISOString().split("T")[0]}`;
      if (isArabic) {
        docTitle = `تقرير_مبيعات_${(sellerShopName || "المتجر").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
      } else if (isEnglish) {
        docTitle = `SALES_REPORT_${(sellerShopName || "SHOP").toUpperCase()}_${new Date().toISOString().split("T")[0]}`;
      }

      const mainHeader = isArabic
        ? `تقرير المبيعات والعمولات - متجر ${sellerShopName || "الخاص بك"}`
        : isEnglish
          ? `SALES & COMMISSIONS REPORT - SHOP ${(sellerShopName || "").toUpperCase()}`
          : `RAPPORT DE VENTES ET COMMISSIONS - BOUTIQUE ${(sellerShopName || "").toUpperCase()}`;

      const metadata = [
        [mainHeader],
        [
          isArabic ? "معرّف البائع" : isEnglish ? "Seller ID" : "ID Vendeur",
          currentUser.uid,
          isArabic ? "الفترة" : isEnglish ? "Period" : "Période",
          isArabic ? "آخر 30 يوم" : isEnglish ? "Last 30 days" : "30 derniers jours",
          isArabic ? "تاريخ الإنشاء" : isEnglish ? "Generated on" : "Généré le",
          new Date().toLocaleString(),
        ],
        [
          isArabic ? "صافي الأرباح" : isEnglish ? "Net Balance" : "Solde Net Vendeur",
          `${totalNet} DZD`,
          isArabic ? "عمولة المنصة" : isEnglish ? "Avg Platform Commission" : "Commission Plateforme",
          `${commissionRate}%`, "", ""
        ],
        [""],
      ];

      const totalLabel = isArabic ? "المجموع الكلي" : isEnglish ? "GRAND TOTAL" : "TOTAL GÉNÉRAL";
      const totals = [["", "", "", "", totalLabel, totalBrut, "", totalCommission, totalNet, "", "", "", "", "", ""]];

      const payload = {
        title: docTitle,
        metadata,
        headers,
        rows: realRows,
        totals,
        theme: {
          headerColor: { red: 0.05, green: 0.5, blue: 0.3 },
          isRtl: isArabic,
        },
      };

      const confirmedMsg = isArabic
        ? `هل تريد تصدير تقرير المبيعات المتميز غوغل شيتس لمتجرك بالاعتماد على بيانات حقيقية مباشرة؟`
        : isEnglish
          ? `Generate premium personalized sales report on Google Sheets with live shop logs?`
          : `Générer le Bilan Financier Vendeur Canva-like vers Google Sheets (avec DONNÉES RÉELLES de votre boutique) ?`;

      if (!window.confirm(confirmedMsg)) {
        setLoadingSheets(false);
        return;
      }

      toast.loading(t("Génération du rapport Premium Google Sheets en cours..."), { id: "sheets_export" });
      const sheetsRes = await exportPremiumToSheets(payload);
      toast.success(t("Bilan Sheets généré avec succès !"), { id: "sheets_export" });
      window.open(sheetsRes.spreadsheetUrl, "_blank");
    } catch (err: unknown) {
      console.error(err);
      toast.error(t("Erreur de connexion Google ou d'exportation.") + ` ${err instanceof Error ? err.message : t("Erreur")}`, { id: "sheets_export" });
    } finally {
      setLoadingSheets(false);
    }
  }, [currentUser, userProfile, i18n.language, t]);

  return {
    loadingSheets,
    handleExportPremium,
  };
};
