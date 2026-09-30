import { toast } from "react-hot-toast";
import { Order } from "../../../domains/order/order.types";

export const exportOrdersToCSV = (
  filteredOrders: Order[],
  statusLabels: Record<string, string>,
  getOrderDate: (createdAt?: unknown) => Date | null,
  t: (key: string) => string
): void => {
  if (filteredOrders.length === 0) {
    toast.error(t("Aucune commande à exporter."));
    return;
  }

  const headers = [
    "ID",
    "Date",
    "Statut",
    "Client",
    "Téléphone",
    "Wilaya",
    "Commune",
    "Montant (DA)",
    "Frais Livraison",
    "Nb Articles",
  ];

  const rows = filteredOrders.map((o) => [
    o.id,
    getOrderDate(o.createdAt)?.toISOString() || "",
    statusLabels[o.status?.toLowerCase()] || o.status,
    o.shippingAddress?.fullName || o.shippingAddress?.name || "",
    o.shippingAddress?.phone || "",
    o.shippingAddress?.wilaya || "",
    o.shippingAddress?.commune || "",
    o.total,
    o.shippingCost || 0,
    o.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [
      headers.join(","),
      ...rows.map((e) =>
        e
          .map(String)
          .map((s) => `"${s.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `olmart_orders_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
