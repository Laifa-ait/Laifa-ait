import { Order } from "../../../../domains/order/order.types";
import { exportToCSVNative } from "../../../../utils/csvExport";
import { AppTimestamp, normalizeTimestamp } from "../../../../utils/date";

export interface CalculatedOrder {
  id: string;
  commissionAmount: number;
  netRevenue: number;
  platformFee: number;
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "text-sky-600 bg-sky-50 border-sky-100";
    case "PROCESSING":
      return "text-orange-600 bg-orange-50 border-orange-100";
    case "PICKED_UP":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "IN_TRANSIT":
      return "text-blue-600 bg-blue-50 border-blue-100";
    case "SHIPPED":
      return "text-blue-600 bg-blue-50 border-blue-100";
    case "DELIVERED":
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "RETURN_REQUESTED":
      return "text-purple-600 bg-purple-50 border-purple-100";
    case "RETURN_APPROVED":
      return "text-purple-600 bg-purple-50 border-purple-100";
    case "RETURNING":
      return "text-indigo-600 bg-indigo-50 border-indigo-100";
    case "RETURNED":
      return "text-indigo-600 bg-indigo-50 border-indigo-100";
    case "REFUNDED":
      return "text-zinc-600 bg-zinc-100 border-zinc-200";
    case "CANCELED":
      return "text-rose-600 bg-rose-50 border-rose-100";
    default:
      return "text-zinc-500 bg-zinc-50 border-zinc-100";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "NEW":
      return "Nouveau";
    case "PROCESSING":
      return "Préparation";
    case "PICKED_UP":
      return "Ramassé";
    case "IN_TRANSIT":
      return "En transit";
    case "SHIPPED":
      return "Expédié";
    case "DELIVERED":
      return "Livré";
    case "RETURN_REQUESTED":
      return "Retour demandé";
    case "RETURN_APPROVED":
      return "Retour accepté";
    case "RETURNING":
      return "En retour";
    case "RETURNED":
      return "Retour reçu";
    case "REFUNDED":
      return "Remboursé";
    case "CANCELED":
      return "Annulé";
    default:
      return status;
  }
};

export const formatOrderDate = (
  createdAt: AppTimestamp | null | undefined,
  locale: string = "fr-DZ"
): string => {
  if (!createdAt) return "";
  try {
    return normalizeTimestamp(createdAt).toDate().toLocaleDateString(locale);
  } catch (e) {
    console.error("Error formatting order date:", e);
  }
  return "";
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  if (orders.length === 0) return;
  const headers = [
    "N° Commande",
    "Date",
    "Client",
    "Telephone",
    "Wilaya",
    "Commune",
    "Adresse",
    "Total Client (DA)",
    "Statut",
  ];
  const rows = orders.map((o) => {
    const isConfirmed = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "IN_TRANSIT", "PICKED_UP"].includes(
      (o.status || "NEW").toUpperCase()
    );
    return [
      o.id,
      formatOrderDate(o.createdAt, "fr-DZ"),
      o.shippingAddress?.name || o.shippingAddress?.fullName || "",
      isConfirmed
        ? o.shippingAddress?.phone || ""
        : o.shippingAddress?.phone?.replace(/(\d{3})\d{4}(\d{3})/, "$1 **** $2") || "",
      o.shippingAddress?.wilaya || "",
      o.shippingAddress?.commune || "",
      isConfirmed
        ? (o.shippingAddress as { streetAddress?: string; address?: string; street?: string })?.streetAddress || (o.shippingAddress as { streetAddress?: string; address?: string; street?: string })?.address || o.shippingAddress?.street || ""
        : "*** Masquée ***",
      o.total || 0,
      getStatusLabel(o.status || "NEW"),
    ];
  });

  const filename = `olmart_orders_${new Date().toISOString().split("T")[0]}.csv`;
  exportToCSVNative(headers, rows, filename);
};
