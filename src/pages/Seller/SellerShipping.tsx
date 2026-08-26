/* eslint-disable max-lines */
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Truck,
  Printer,
  Search,
  PackageCheck,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Barcode,
  Info
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { ShippingLabelPrinter } from "../../components/Seller/ShippingLabelPrinter";
import { Order } from "../../domains/order/order.types";
import { ShippingRatesResponse } from "../../services/shippingClient";
import toast from "react-hot-toast";

interface TrackResult {
  id: string;
  trackingNumber: string;
  status: string;
  wilaya: string;
  recipient: string;
  lastUpdate: string;
  notFound?: boolean;
}

export const SellerShipping: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Track search modal/card
  const [trackInput, setTrackInput] = useState("");
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [searchingTrack, setSearchingTrack] = useState(false);

  // Rate calculator state
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>("16"); // Default Algiers (16)
  const [, setShippingRates] = useState<ShippingRatesResponse | null>(null);

  const fetchSellerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ orders: Order[] }>("/api/v1/seller/orders");
      if (res && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Error loading seller orders for shipping page:", err);
      toast.error(t("shipping_loading_error") || "Erreur de chargement des expéditions");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchRates = useCallback(async (wilayaId: string) => {
    try {
      const res = await apiGet<ShippingRatesResponse>(`/api/v1/shipping/rates/${wilayaId}`);
      if (res) {
        setShippingRates(res);
      } else {
        setShippingRates(null);
      }
    } catch (err) {
      console.warn("Could not fetch rates dynamically, using standard matrix:", err);
      setShippingRates(null);
    }
  }, []);

  useEffect(() => {
    fetchSellerOrders();
    fetchRates("16");
  }, [fetchSellerOrders, fetchRates]);

  const handleWilayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedWilayaId(val);
    fetchRates(val);
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;

    setSearchingTrack(true);
    const query = trackInput.trim().toLowerCase();
    
    // Find in local orders first or simulate lookup
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.trackingNumber?.toLowerCase() === query ||
        o.trackingId?.toLowerCase() === query
    );

    setTimeout(() => {
      if (found) {
        setTrackResult({
          id: found.id,
          trackingNumber: found.trackingNumber || found.trackingId || "OLM-SHP-" + found.id.substring(0, 8).toUpperCase(),
          status: found.status || "CONFIRMED",
          wilaya: found.shippingAddress?.wilaya || "Alger",
          recipient: found.shippingAddress?.fullName || found.shippingAddress?.name || "Client Olmart",
          lastUpdate: new Date().toLocaleString(),
          notFound: false
        });
      } else {
        setTrackResult({
          id: "",
          trackingNumber: "",
          status: "",
          wilaya: "",
          recipient: "",
          lastUpdate: "",
          notFound: true
        });
      }
      setSearchingTrack(false);
    }, 400);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.shippingAddress?.wilaya && order.shippingAddress.wilaya.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "READY") {
      return ["CONFIRMED", "PROCESSING", "NEW"].includes((order.status || "").toUpperCase());
    }
    if (statusFilter === "SHIPPED") {
      return ["SHIPPED", "IN_TRANSIT", "PICKED_UP"].includes((order.status || "").toUpperCase());
    }
    if (statusFilter === "DELIVERED") {
      return (order.status || "").toUpperCase() === "DELIVERED";
    }
    return true;
  });

  const readyToShipCount = orders.filter((o) => ["CONFIRMED", "PROCESSING", "NEW"].includes((o.status || "").toUpperCase())).length;
  const inTransitCount = orders.filter((o) => ["SHIPPED", "IN_TRANSIT", "PICKED_UP"].includes((o.status || "").toUpperCase())).length;
  const deliveredCount = orders.filter((o) => (o.status || "").toUpperCase() === "DELIVERED").length;

  const algeriaWilayas = [
    { code: "01", name: "Adrar", desk: 600, home: 900 },
    { code: "02", name: "Chlef", desk: 400, home: 650 },
    { code: "03", name: "Laghouat", desk: 500, home: 750 },
    { code: "04", name: "Oum El Bouaghi", desk: 450, home: 700 },
    { code: "05", name: "Batna", desk: 450, home: 700 },
    { code: "06", name: "Béjaïa", desk: 400, home: 650 },
    { code: "07", name: "Biskra", desk: 500, home: 750 },
    { code: "08", name: "Béchar", desk: 600, home: 900 },
    { code: "09", name: "Blida", desk: 350, home: 550 },
    { code: "10", name: "Bouira", desk: 350, home: 550 },
    { code: "11", name: "Tamanrasset", desk: 800, home: 1200 },
    { code: "12", name: "Tébessa", desk: 500, home: 750 },
    { code: "13", name: "Tlemcen", desk: 450, home: 700 },
    { code: "14", name: "Tiaret", desk: 450, home: 700 },
    { code: "15", name: "Tizi Ouzou", desk: 350, home: 550 },
    { code: "16", name: "Alger", desk: 300, home: 500 },
    { code: "17", name: "Djelfa", desk: 500, home: 750 },
    { code: "18", name: "Jijel", desk: 400, home: 650 },
    { code: "19", name: "Sétif", desk: 400, home: 650 },
    { code: "20", name: "Saïda", desk: 500, home: 750 },
    { code: "21", name: "Skikda", desk: 450, home: 700 },
    { code: "22", name: "Sidi Bel Abbès", desk: 450, home: 700 },
    { code: "23", name: "Annaba", desk: 450, home: 700 },
    { code: "24", name: "Guelma", desk: 450, home: 700 },
    { code: "25", name: "Constantine", desk: 400, home: 650 },
    { code: "26", name: "Médéa", desk: 350, home: 550 },
    { code: "27", name: "Mostaganem", desk: 450, home: 700 },
    { code: "28", name: "M'Sila", desk: 450, home: 700 },
    { code: "29", name: "Mascara", desk: 450, home: 700 },
    { code: "30", name: "Ouargla", desk: 600, home: 900 },
    { code: "31", name: "Oran", desk: 400, home: 650 },
    { code: "32", name: "El Bayadh", desk: 600, home: 900 },
    { code: "33", name: "Illizi", desk: 800, home: 1200 },
    { code: "34", name: "Bordj Bou Arréridj", desk: 400, home: 650 },
    { code: "35", name: "Boumerdès", desk: 300, home: 500 },
    { code: "36", name: "El Tarf", desk: 500, home: 750 },
    { code: "37", name: "Tindouf", desk: 900, home: 1300 },
    { code: "38", name: "Tissemsilt", desk: 450, home: 700 },
    { code: "39", name: "El Oued", desk: 600, home: 900 },
    { code: "40", name: "Khenchela", desk: 500, home: 750 },
    { code: "41", name: "Souk Ahras", desk: 500, home: 750 },
    { code: "42", name: "Tipaza", desk: 350, home: 550 },
    { code: "43", name: "Mila", desk: 400, home: 650 },
    { code: "44", name: "Aïn Defla", desk: 350, home: 550 },
    { code: "45", name: "Naâma", desk: 600, home: 900 },
    { code: "46", name: "Aïn Témouchent", desk: 450, home: 700 },
    { code: "47", name: "Ghardaïa", desk: 600, home: 900 },
    { code: "48", name: "Relizane", desk: 450, home: 700 },
    { code: "49", name: "Timimoun", desk: 700, home: 1000 },
    { code: "50", name: "Bordj Badji Mokhtar", desk: 1000, home: 1500 },
    { code: "51", name: "Ouled Djellal", desk: 550, home: 800 },
    { code: "52", name: "Béni Abbès", desk: 700, home: 1000 },
    { code: "53", name: "In Salah", desk: 800, home: 1200 },
    { code: "54", name: "In Guezzam", desk: 1000, home: 1500 },
    { code: "55", name: "Touggourt", desk: 600, home: 900 },
    { code: "56", name: "Djanet", desk: 900, home: 1300 },
    { code: "57", name: "El M'Ghair", desk: 600, home: 900 },
    { code: "58", name: "El Meniaa", desk: 650, home: 950 }
  ];

  const currentWilaya = algeriaWilayas.find((w) => w.code === selectedWilayaId) || algeriaWilayas[15];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Label Printer Modal */}
      {selectedOrderForPrint && (
        <ShippingLabelPrinter
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute -end-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase">
              <Truck className="w-4 h-4 text-red-400" />
              <span>Logistique Directe • Partenaires Olmart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
              {t("shipping_hub_title")}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              {t("shipping_hub_subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={fetchSellerOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{t("shipping_refresh")}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{t("shipping_ready_to_ship")}</span>
            </div>
            <p className="text-2xl font-sans font-bold text-white">{readyToShipCount}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-1">
              <Truck className="w-3.5 h-3.5" />
              <span>{t("shipping_in_transit")}</span>
            </div>
            <p className="text-2xl font-sans font-bold text-white">{inTransitCount}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("shipping_delivered")}</span>
            </div>
            <p className="text-2xl font-sans font-bold text-white">{deliveredCount}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("shipping_coverage")}</span>
            </div>
            <p className="text-2xl font-sans font-bold text-white">58 Wilayas</p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipment Management & Printing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-sans font-bold text-zinc-950">
                  {t("shipping_list_title")}
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("shipping_list_subtitle")}
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "ALL" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t("shipping_filter_all")}
                </button>
                <button
                  onClick={() => setStatusFilter("READY")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "READY" ? "bg-white text-amber-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t("shipping_ready_to_ship")} ({readyToShipCount})
                </button>
                <button
                  onClick={() => setStatusFilter("SHIPPED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "SHIPPED" ? "bg-white text-blue-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t("shipping_in_transit")}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("shipping_search_placeholder")}
                className="w-full ps-11 pe-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-zinc-900 transition-all"
              />
            </div>

            {/* Orders Table / Cards */}
            {loading ? (
              <div className="space-y-3 py-8 text-center">
                <div className="w-8 h-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">{t("shipping_loading")}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <PackageCheck className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-800">{t("shipping_no_orders")}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {t("shipping_no_orders_sub")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const trackingNum = order.trackingNumber || order.trackingId || `OLM-SHP-${order.id.substring(0, 8).toUpperCase()}`;
                  const isShipped = ["SHIPPED", "IN_TRANSIT", "PICKED_UP"].includes((order.status || "").toUpperCase());
                  const isDelivered = (order.status || "").toUpperCase() === "DELIVERED";

                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans font-bold text-sm text-zinc-900">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs font-mono font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {trackingNum}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isDelivered
                                ? "bg-emerald-100 text-emerald-800"
                                : isShipped
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 font-medium">
                          👤 {order.shippingAddress?.fullName || order.shippingAddress?.name || "Client"} • 📍{" "}
                          <span className="font-bold text-zinc-800">{order.shippingAddress?.wilaya}</span> ({order.shippingAddress?.commune || "Wilaya"})
                        </p>

                        <p className="text-[11px] text-zinc-400">
                          {t("shipping_amount_cod")} <span className="font-bold text-zinc-900">{formatPrice(order.total)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t("shipping_print_label")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Tracking Search & Tariff Explorer */}
        <div className="space-y-6">
          {/* Tracking Search Widget */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-sans font-bold text-zinc-950">
                  {t("shipping_track_title")}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("shipping_track_subtitle")}
                </p>
              </div>
            </div>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="Ex: LIV-8F39210A"
                className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-zinc-900"
              />
              <button
                type="submit"
                disabled={searchingTrack}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
              >
                {searchingTrack ? "..." : t("shipping_track_btn")}
              </button>
            </form>

            {trackResult && (
              trackResult.notFound ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-100 text-zinc-600 rounded-2xl border border-zinc-200 text-center text-xs font-semibold"
                >
                  ⚠️ {t("Aucun colis trouvé avec ce numéro")}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-900 text-white rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{trackResult.trackingNumber}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">
                      {trackResult.status}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-zinc-300">
                    <p>📍 Destination: <span className="text-white font-bold">{trackResult.wilaya}</span></p>
                    <p>👤 Destinataire: <span className="text-white font-bold">{trackResult.recipient}</span></p>
                    <p className="text-[10px] text-zinc-400 mt-2">Scan: {trackResult.lastUpdate}</p>
                  </div>
                </motion.div>
              )
            )}
          </div>

          {/* Tariff Simulator (58 Wilayas) */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-sans font-bold text-zinc-950">
                  {t("shipping_rates_title")}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("shipping_rates_subtitle")}
                </p>
              </div>
            </div>

            <select
              value={selectedWilayaId}
              onChange={handleWilayaChange}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none"
            >
              {algeriaWilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 text-center space-y-1">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">{t("shipping_stop_desk")}</p>
                <p className="text-lg font-sans font-bold text-zinc-900">{formatPrice(currentWilaya.desk)}</p>
                <p className="text-[10px] text-emerald-600 font-medium">{t("shipping_desk_sub")}</p>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 text-center space-y-1">
                <p className="text-[11px] font-bold text-amber-800 uppercase">{t("shipping_home_delivery")}</p>
                <p className="text-lg font-sans font-bold text-amber-950">{formatPrice(currentWilaya.home)}</p>
                <p className="text-[10px] text-amber-700 font-medium">{t("shipping_home_sub")}</p>
              </div>
            </div>
          </div>

          {/* Seller Protocol Notice */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80 rounded-[2rem] p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase">
              <Info className="w-4 h-4 text-amber-600" />
              <span>{t("shipping_protocol_title")}</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-2 leading-relaxed font-medium list-disc ps-4">
              <li>{t("shipping_protocol_rule1")}</li>
              <li>{t("shipping_protocol_rule2")}</li>
              <li>{t("shipping_protocol_rule3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
