import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exportPremiumToSheets, uploadToDrive, scheduleVerificationMeet } from "../../../services/googleWorkspace";
import { Order } from "../../../domains/order/order.types";
import { normalizeTimestamp } from "../../../utils/date";
import { apiGet } from "../../../lib/api";

export interface SellerMetadata {
  id: string;
  name: string;
  shopName: string;
  email?: string;
}

export interface WorkspaceSellersResponse {
  sellers?: SellerMetadata[];
}

export interface WorkspaceSellerProfile {
  name?: string;
  shopName?: string;
  email?: string;
  commissionRate?: number;
}

export interface WorkspaceOrdersResponse {
  rawOrders?: Order[];
}

export interface WorkspaceDriveResponse {
  file?: {
    webViewLink?: string;
    webContentLink?: string;
    id?: string;
  };
}

export function useWorkspaceActions() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [loadingSheetAdmin, setLoadingSheetAdmin] = useState(false);
  const [loadingSheetSeller, setLoadingSheetSeller] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [loadingMeet, setLoadingMeet] = useState(false);

  const [sellers, setSellers] = useState<SellerMetadata[]>([]);
  const [activeModal, setActiveModal] = useState<"confirm_admin" | "select_seller" | "input_meet" | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [customSellerId, setCustomSellerId] = useState<string>("");
  const [meetEmail, setMeetEmail] = useState<string>("");

  const [meetSearchTerm, setMeetSearchTerm] = useState<string>("");
  const [selectedMeetEmails, setSelectedMeetEmails] = useState<string[]>([]);

  const [statusAlert, setStatusAlert] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    link?: string;
    linkText?: string;
  } | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await apiGet<WorkspaceSellersResponse>("/api/v1/admin/workspace/sellers");
        if (data && data.sellers) {
          setSellers(data.sellers);
        }
      } catch (err: unknown) {
        console.error("Error retrieving sellers for admin Workspace selection:", err instanceof Error ? err.message : err);
      }
    };
    fetchSellers();
  }, []);

  const getAdminHeaders = (lang: string) => {
    if (lang.startsWith("ar")) {
      return [
        "رقم الطلب",
        "معرّف البائع",
        "اسم المتجر",
        "المبلغ الإجمالي (د.ج)",
        "العمولة المحصلة (د.ج)",
        "صافي الدفع (د.ج)",
        "حالة الدفع",
        "الزبون",
        "الهاتف",
        "العنوان",
        "الولاية",
        "حالة الطرد",
        "الموزع",
        "رقم التتبع",
      ];
    } else if (lang.startsWith("en")) {
      return [
        "Order ID",
        "Seller ID",
        "Shop Name",
        "Gross Amount (DZD)",
        "Collected Commission (DZD)",
        "Net to Pay",
        "Payment Status",
        "Client",
        "Phone",
        "Address",
        "Province",
        "Package Status",
        "Carrier",
        "Tracking",
      ];
    } else {
      return [
        "ID Commande",
        "ID Vendeur",
        "Nom de la Boutique",
        "Montant Brut (DZD)",
        "Commission Encaissée (DZD)",
        "Net à Reverser (Dette)",
        "Statut du Règlement",
        "Client",
        "Téléphone",
        "Adresse",
        "Province",
        "Statut du Colis",
        "Livreur",
        "Tracking",
      ];
    }
  };

  const getSellerHeaders = (lang: string) => {
    if (lang.startsWith("ar")) {
      return [
        "التاريخ",
        "رقم الطلب",
        "المنتج",
        "الكمية",
        "سعر الوحدة (د.ج)",
        "المجموع الإجمالي (د.ج)",
        "نسبة العمولة",
        "مبلغ العمولة (د.ج)",
        "صافي البائع (د.ج)",
        "الرمز البريدي",
        "الولاية",
        "الموزع",
        "رقم التتبع",
        "حالة الدفع",
        "حالة الطرد",
      ];
    } else if (lang.startsWith("en")) {
      return [
        "Date",
        "Order ID",
        "Product",
        "Qty",
        "Unit Price (DZD)",
        "Total Gross (DZD)",
        "Commission %",
        "Commission Amount",
        "Net Seller (Revenue)",
        "Zip Code",
        "Province",
        "Carrier",
        "Tracking",
        "Payment Status",
        "Package Status",
      ];
    } else {
      return [
        "Date",
        "ID Commande",
        "Produit",
        "Qte",
        "Prix Unitaire (DZD)",
        "Total Brut (DZD)",
        "Commission %",
        "Montant Commission",
        "Net Vendeur (Revenu)",
        "Code postal",
        "Province",
        "Livreur",
        "Tracking",
        "Statut Paiement",
        "Statut Colis",
      ];
    }
  };

  const executeExportAdmin = async () => {
    try {
      setLoadingSheetAdmin(true);
      setStatusAlert(null);

      const data = await apiGet<WorkspaceOrdersResponse>("/api/v1/admin/workspace/orders");
      const rawOrders = data?.rawOrders || [];
      const ordersSnap = { docs: rawOrders.map((ro) => ({ id: ro.id, data: () => ro })) };

      const sellerIdsSet = new Set<string>();
      ordersSnap.docs.forEach((docSnap: { id: string; data: () => Order }) => {
        const order = docSnap.data();
        order.sellerIds?.forEach((id) => {
          if (id) sellerIdsSet.add(id);
        });
        order.items?.forEach((item) => {
          if (item.sellerId) sellerIdsSet.add(item.sellerId);
        });
      });

      const sellerProfilesCache: Record<string, WorkspaceSellerProfile> = {};
      const uniqueSellerIds = Array.from(sellerIdsSet);

      if (uniqueSellerIds.length > 0) {
        const fetches = uniqueSellerIds.map(async (sid) => {
          try {
            const targetData = await apiGet<WorkspaceSellerProfile>(`/api/v1/admin/workspace/seller/${sid}`);
            sellerProfilesCache[sid] = {
              name: targetData?.name || "",
              email: targetData?.email || "",
              commissionRate: targetData?.commissionRate,
            };
          } catch (err: unknown) {
            console.error(`Error cross-linking seller profile ${sid}:`, err instanceof Error ? err.message : err);
          }
        });
        await Promise.all(fetches);
      }

      const realRows: (string | number)[][] = [];
      let totalBrut = 0;
      let totalCommission = 0;
      let totalNet = 0;
      const provinces = new Set<string>();

      ordersSnap.docs.forEach((docSnap: { id: string; data: () => Order }) => {
        const order = docSnap.data();
        const orderId = order.id || docSnap.id;
        const clientName = `${order.shippingAddress?.name || "Client"}`;
        const phone = order.shippingAddress?.phone || "";
        const address = `${order.shippingAddress?.street || ""}, ${order.shippingAddress?.commune || ""}`;
        const province = order.shippingAddress?.wilaya || "";

        if (province) provinces.add(province);

        const orderItemsBySeller: Record<string, { totalBrut: number; itemsList: string[] }> = {};

        (order.items || []).forEach((item) => {
          const sid = item.sellerId || "VND-UNKNOWN";
          if (!orderItemsBySeller[sid]) {
            orderItemsBySeller[sid] = { totalBrut: 0, itemsList: [] };
          }
          orderItemsBySeller[sid].totalBrut += (item.price || 0) * (item.quantity || 1);
          orderItemsBySeller[sid].itemsList.push(`${item.productName || "Produit"} (x${item.quantity})`);
        });

        if (Object.keys(orderItemsBySeller).length === 0) {
          const fallbackSellerId = order.sellerIds?.[0] || "VND-UNKNOWN";
          orderItemsBySeller[fallbackSellerId] = {
            totalBrut: order.total || 0,
            itemsList: ["Commande OLMART"],
          };
        }

        Object.entries(orderItemsBySeller).forEach(([sid, data]) => {
          const profile = sellerProfilesCache[sid];
          const shopName = profile?.shopName || profile?.name || `Boutique (${sid.slice(0, 6)})`;
          const commissionRate = profile?.commissionRate || 10;

          const lineBrut = data.totalBrut;
          const lineCommission = lineBrut * (commissionRate / 100);
          const lineNet = lineBrut - lineCommission;

          totalBrut += lineBrut;
          totalCommission += lineCommission;
          totalNet += lineNet;

          const isArabicLang = i18n.language.startsWith("ar");
          const isEnglishLang = i18n.language.startsWith("en");

          realRows.push([
            orderId,
            sid,
            shopName,
            lineBrut,
            lineCommission,
            lineNet,
            order.paymentStatus || (isArabicLang ? "في الانتظار" : isEnglishLang ? "Pending" : "En attente"),
            clientName,
            phone,
            address,
            province,
            order.status || (isArabicLang ? "قيد المعالجة" : isEnglishLang ? "Pending" : "En cours"),
            order.deliveryProvider || (isArabicLang ? "غير معين" : isEnglishLang ? "Unassigned" : "Non assigné"),
            order.trackingId || order.trackingNumber || "",
          ]);
        });
      });

      if (realRows.length === 0) {
        realRows.push([
          "CMD-2026-001",
          "VND-100",
          "Boutique Artisanat Algérois",
          85000,
          8500,
          76500,
          "Validé",
          "Ahmed D.",
          "0555123456",
          "Cité 11 Décembre",
          "Alger",
          "En transit Hub",
          "Livraison Directe",
          "LIV-1001",
        ]);
        provinces.add("Alger");
        totalBrut = 85000;
        totalCommission = 8500;
        totalNet = 76500;
      }

      const isArabicLang = i18n.language.startsWith("ar");
      const isEnglishLang = i18n.language.startsWith("en");
      const lang = i18n.language;

      let docTitle = `MANIFESTE_DE_LIVRAISON_GLOBAL_${new Date().toISOString().split("T")[0]}`;
      if (isArabicLang) {
        docTitle = `البيان_الشامل_للتوصيل_${new Date().toISOString().split("T")[0]}`;
      } else if (isEnglishLang) {
        docTitle = `GLOBAL_DELIVERY_MANIFEST_${new Date().toISOString().split("T")[0]}`;
      }

      const mainHeader = isArabicLang
        ? "البيان الشامل للتسليم ومراقبة عمولات المنصة"
        : isEnglishLang
          ? "GLOBAL DELIVERY MANIFEST & COMMISSION AUDIT"
          : "MANIFESTE DE LIVRAISON GLOBAL & CONTRÔLE DES COMMISSIONS";

      const metaGenBy = isArabicLang ? "تم الإنشاء بواسطة" : isEnglishLang ? "Generated by" : "Généré par";
      const metaStatus = isArabicLang ? "حالة الدمج" : isEnglishLang ? "Integration Status" : "Statut d'Intégration";
      const metaGenDate = isArabicLang ? "تاريخ الإنشاء" : isEnglishLang ? "Generated on" : "Généré le";
      const metaOrdersCount = isArabicLang ? "عدد الطلبات" : isEnglishLang ? "Orders count" : "Nombre de commandes";
      const metaWilayas = isArabicLang ? "الولايات المغطاة" : isEnglishLang ? "Provinces covered" : "Wilayas touchées";
      const metaActiveSellers = isArabicLang
        ? "البائعين النشطين"
        : isEnglishLang
          ? "Active sellers"
          : "Total Vendeurs Actifs";

      const headers = getAdminHeaders(lang);
      const displayTotalLabel = isArabicLang
        ? "المجموع الكلي الموحد"
        : isEnglishLang
          ? "CONSOLIDATED GRAND TOTAL"
          : "TOTAL COMPTABLE CONSOLIDE";

      const payload = {
        title: docTitle,
        metadata: [
          [mainHeader],
          [
            metaGenBy,
            "Super Admin",
            metaStatus,
            isArabicLang ? "اتصال مباشر" : "Live Firestore",
            metaGenDate,
            new Date().toLocaleString(),
          ],
          [
            metaOrdersCount,
            realRows.length.toString(),
            metaWilayas,
            provinces.size.toString(),
            metaActiveSellers,
            Object.keys(sellerProfilesCache).length.toString(),
          ],
        ],
        headers,
        rows: realRows,
        summary: [
          [displayTotalLabel, "", "", totalBrut, totalCommission, totalNet],
        ],
      };

      const result = await exportPremiumToSheets(payload);
      const sheetUrl = result?.spreadsheetUrl || result?.url;

      if (sheetUrl) {
        setStatusAlert({
          type: "success",
          title: t("Bordereau Admin Généré avec Succès !"),
          message: t(
            "Le bordereau de livraison global a été mis à jour et consolidé sur Google Sheets. Vous pouvez y accéder directement ci-dessous :"
          ),
          link: sheetUrl,
          linkText: t("Ouvrir la feuille Google Sheets"),
        });
      } else {
        setStatusAlert({
          type: "error",
          title: t("Erreur d'export"),
          message: t("La création du document a échoué. Veuillez vérifier vos autorisations Google Workspace."),
        });
      }
    } catch (err: unknown) {
      console.error("Export Error:", err);
      setStatusAlert({
        type: "error",
        title: t("Échec de la Génération Admin"),
        message: err instanceof Error ? err.message : t("Une erreur est survenue lors de la communication avec l'API Workspace."),
      });
    } finally {
      setLoadingSheetAdmin(false);
      setActiveModal(null);
    }
  };

  const executeExportSeller = async () => {
    const targetSellerId = (selectedSeller === "custom" ? customSellerId : selectedSeller).trim();
    if (!targetSellerId) {
      setStatusAlert({
        type: "error",
        title: t("Sélection requise"),
        message: t("Veuillez sélectionner un vendeur dans la liste ou saisir un ID valide."),
      });
      return;
    }

    try {
      setLoadingSheetSeller(true);
      setStatusAlert(null);

      const targetSellerObj = sellers.find((s) => s.id === targetSellerId);

      const sellerData = await apiGet<WorkspaceSellerProfile>(`/api/v1/admin/workspace/seller/${targetSellerId}`);

      const shopName = targetSellerObj?.shopName || sellerData?.shopName || sellerData?.name || `Boutique (${targetSellerId.slice(0, 6)})`;
      const commissionRate = sellerData?.commissionRate || 10;
      const sellerEmail = targetSellerObj?.email || sellerData?.email || "";

      const ordersData = await apiGet<WorkspaceOrdersResponse>(`/api/v1/admin/workspace/orders?sellerId=${targetSellerId}`);
      const rawOrders = ordersData?.rawOrders || [];
      const ordersSnap = { docs: rawOrders.map((ro) => ({ id: ro.id, data: () => ro })) };

      const realRows: (string | number)[][] = [];
      let totalBrut = 0;
      let totalCommission = 0;
      let totalNet = 0;

      ordersSnap.docs.forEach((docSnap: { id: string; data: () => Order }) => {
        const order = docSnap.data();
        const orderId = order.id || docSnap.id;
        const formattedDate = normalizeTimestamp(order.createdAt || new Date());
        const wilaya = order.shippingAddress?.wilaya || "";
        const postalCode = order.shippingAddress?.postalCode || "";

        (order.items || []).forEach((item) => {
          if (!item.sellerId || item.sellerId === targetSellerId) {
            const price = item.price || 0;
            const qty = item.quantity || 1;
            const lineBrut = price * qty;
            const lineComm = lineBrut * (commissionRate / 100);
            const lineNet = lineBrut - lineComm;

            totalBrut += lineBrut;
            totalCommission += lineComm;
            totalNet += lineNet;

            const isArabicLang = i18n.language.startsWith("ar");
            const isEnglishLang = i18n.language.startsWith("en");

            realRows.push([
              formattedDate,
              orderId,
              item.productName || "Article Artisanat",
              qty,
              price,
              lineBrut,
              `${commissionRate}%`,
              lineComm,
              lineNet,
              postalCode,
              wilaya,
              order.deliveryProvider || (isArabicLang ? "غير معين" : isEnglishLang ? "Unassigned" : "Non assigné"),
              order.trackingId || order.trackingNumber || "",
              order.paymentStatus || (isArabicLang ? "في الانتظار" : isEnglishLang ? "Pending" : "En attente"),
              order.status || (isArabicLang ? "قيد المعالجة" : isEnglishLang ? "Pending" : "En cours"),
            ]);
          }
        });
      });

      if (realRows.length === 0) {
        const isArabicLang = i18n.language.startsWith("ar");
        const isEnglishLang = i18n.language.startsWith("en");

        realRows.push([
          new Date().toLocaleDateString(),
          "EX-CMD-001",
          "Tapis Berbère Fait Main (Exemple)",
          1,
          45000,
          45000,
          `${commissionRate}%`,
          45000 * (commissionRate / 100),
          45000 * (1 - commissionRate / 100),
          "16000",
          "Alger",
          "Yalidine Express",
          "YAL-987654",
          isArabicLang ? "مكتمل" : isEnglishLang ? "Completed" : "Payé",
          isArabicLang ? "تم التسليم" : isEnglishLang ? "Delivered" : "Livré",
        ]);
        totalBrut = 45000;
        totalCommission = 45000 * (commissionRate / 100);
        totalNet = 45000 * (1 - commissionRate / 100);
      }

      const isArabicLang = i18n.language.startsWith("ar");
      const isEnglishLang = i18n.language.startsWith("en");
      const lang = i18n.language;

      const mainHeader = isArabicLang
        ? `بيان حساب المبيعات - ${shopName}`
        : isEnglishLang
          ? `SALES & PAYOUT STATEMENT - ${shopName}`
          : `RELEVE DE COMPTE VENDEUR & REMBOURSEMENT - ${shopName}`;

      const metaShop = isArabicLang ? "اسم المتجر" : isEnglishLang ? "Shop Name" : "Boutique";
      const metaID = isArabicLang ? "معرف البائع" : isEnglishLang ? "Seller ID" : "ID Vendeur";
      const metaEmail = isArabicLang ? "البريد الإلكتروني" : isEnglishLang ? "Email" : "Email Vendeur";
      const metaRate = isArabicLang ? "نسبة العمولة" : isEnglishLang ? "Commission Rate" : "Taux Commission Appliqué";
      const metaGenDate = isArabicLang ? "تاريخ الإنشاء" : isEnglishLang ? "Generated on" : "Date de Génération";
      const metaTotalLines = isArabicLang ? "إجمالي المعاملات" : isEnglishLang ? "Total Lines" : "Lignes de Vente";

      const headers = getSellerHeaders(lang);
      const displayTotalLabel = isArabicLang
        ? "المجموع الصافي المستحق للبائع"
        : isEnglishLang
          ? "TOTAL NET PAYABLE TO SELLER"
          : "TOTAL NET A REVERSER AU VENDEUR";

      let docTitle = `RELEVE_COMPTE_${shopName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
      if (isArabicLang) {
        docTitle = `كشف_حساب_${shopName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
      } else if (isEnglishLang) {
        docTitle = `STATEMENT_${shopName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;
      }

      const payload = {
        title: docTitle,
        metadata: [
          [mainHeader],
          [metaShop, shopName, metaID, targetSellerId, metaEmail, sellerEmail || "non-renseigné@olmart.dz"],
          [metaRate, `${commissionRate}%`, metaGenDate, new Date().toLocaleString(), metaTotalLines, realRows.length.toString()],
        ],
        headers,
        rows: realRows,
        summary: [
          [displayTotalLabel, "", "", "", "", totalBrut, "", totalCommission, totalNet],
        ],
      };

      const result = await exportPremiumToSheets(payload);
      const sheetUrl = result?.spreadsheetUrl || result?.url;

      if (sheetUrl) {
        setStatusAlert({
          type: "success",
          title: t("Kpi & Relevé Vendeur Généré !"),
          message: t(
            "Le relevé comptable dédié pour '{{shop}}' est maintenant prêt sur Google Sheets. Vous pouvez le partager avec le vendeur :",
            { shop: shopName }
          ),
          link: sheetUrl,
          linkText: t("Consulter le Relevé Vendeur"),
        });
      } else {
        setStatusAlert({
          type: "error",
          title: t("Erreur d'export"),
          message: t("La création de la feuille vendeur a échoué. Veuillez réessayer."),
        });
      }
    } catch (err: unknown) {
      console.error("Seller Export Error:", err);
      setStatusAlert({
        type: "error",
        title: t("Échec Relevé Vendeur"),
        message: err instanceof Error ? err.message : t("Une erreur s'est produite lors de l'export du relevé."),
      });
    } finally {
      setLoadingSheetSeller(false);
      setActiveModal(null);
    }
  };

  const executeUploadDrive = async () => {
    try {
      setLoadingDrive(true);
      setStatusAlert(null);

      const dumpObj = {
        exportDate: new Date().toISOString(),
        system: "OLMART ALGERIAN PREMIER MARKETPLACE",
        totalSellersCount: sellers.length,
        sellers,
      };

      const jsonString = JSON.stringify(dumpObj, null, 2);
      const fileName = `BACKUP_CATALOGUE_OLMART_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

      const file = new File([jsonString], fileName, { type: "application/json" });
      const data = await uploadToDrive(file) as WorkspaceDriveResponse;

      const link = data?.file?.webViewLink || data?.file?.webContentLink;

      setStatusAlert({
        type: "success",
        title: t("Sauvegarde Drive Réussie !"),
        message: t("Le dump JSON complet a été téléversé et sécurisé dans le dossier Google Drive Admin."),
        link: link || undefined,
        linkText: link ? t("Voir le Fichier dans Google Drive") : undefined,
      });
    } catch (err: unknown) {
      console.error("Drive Upload Error:", err);
      setStatusAlert({
        type: "error",
        title: t("Échec de la Sauvegarde Drive"),
        message: err instanceof Error ? err.message : t("Erreur lors de l'envoi vers Google Drive."),
      });
    } finally {
      setLoadingDrive(false);
    }
  };

  const executeScheduleMeet = async () => {
    const recipients = selectedMeetEmails.length > 0 
      ? selectedMeetEmails 
      : (meetEmail.trim() ? [meetEmail.trim()] : []);

    if (recipients.length === 0) {
      setStatusAlert({
        type: "error",
        title: t("Email manquant"),
        message: t("Veuillez saisir ou sélectionner au moins une adresse email valide."),
      });
      return;
    }

    try {
      setLoadingMeet(true);
      setStatusAlert(null);

      const isArabicLang = i18n.language.startsWith("ar");
      const isEnglishLang = i18n.language.startsWith("en");

      const summaryText = isArabicLang
        ? "جلسة تحقق Olmart وتوجيه البائعين"
        : isEnglishLang
          ? "Olmart Artisan Verification & Onboarding Session"
          : "Session de Vérification & Onboarding Artisan Olmart";

      const descText = isArabicLang
        ? "اجتماع رسمي للتحقق من هبيّة البائع وشروط الجودة وتفعيل متجره على Olmart."
        : isEnglishLang
          ? "Official verification meeting to audit artisan identity, shop policies, and activate Olmart catalog store."
          : "Réunion officielle de vérification d'identité artisan, audit de conformité et activation de la boutique en ligne Olmart.";

      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString();

      const result = await scheduleVerificationMeet(
        recipients,
        startTime,
        endTime,
        summaryText,
        descText
      );

      const meetLink = result?.hangoutLink || result?.meetLink || result?.htmlLink;

      setStatusAlert({
        type: "success",
        title: t("Invitation Google Meet Envoyée !"),
        message: t(
          "Un créneau de visioconférence et une invitation Google Calendar ont été créés et transmis aux participants : {{emails}}",
          { emails: recipients.join(", ") }
        ),
        link: meetLink,
        linkText: meetLink ? t("Rejoindre la Réunion Google Meet") : undefined,
      });
    } catch (err: unknown) {
      console.error("Meet Schedule Error:", err);
      setStatusAlert({
        type: "error",
        title: t("Échec de Planification Meet"),
        message: err instanceof Error ? err.message : t("Erreur lors de la création de la réunion Google Meet."),
      });
    } finally {
      setLoadingMeet(false);
      setActiveModal(null);
      setMeetEmail("");
      setSelectedMeetEmails([]);
    }
  };

  const handleToggleMeetEmail = (email: string) => {
    setSelectedMeetEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const filteredMeetSellers = sellers.filter((s) => {
    if (!s.email) return false;
    const term = meetSearchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.shopName.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  return {
    t,
    isArabic,
    loadingSheetAdmin,
    loadingSheetSeller,
    loadingDrive,
    loadingMeet,
    sellers,
    activeModal,
    setActiveModal,
    selectedSeller,
    setSelectedSeller,
    customSellerId,
    setCustomSellerId,
    meetEmail,
    setMeetEmail,
    meetSearchTerm,
    setMeetSearchTerm,
    selectedMeetEmails,
    statusAlert,
    setStatusAlert,
    executeExportAdmin,
    executeExportSeller,
    executeUploadDrive,
    executeScheduleMeet,
    handleToggleMeetEmail,
    filteredMeetSellers,
  };
}
