import { useState, useEffect } from "react";
import { Order } from "../../../../domains/order/order.types";
import { useAuth } from "../../../../context/AuthContext";

export interface CalculatedOrder {
  id: string;
  commissionAmount: number;
  netRevenue: number;
  platformFee: number;
  sellerPayout: number;
}

export const useOrdersCommissions = (filteredOrders: Order[]) => {
  const { currentUser } = useAuth();
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [sellersNetPayout, setSellersNetPayout] = useState(0);
  const [calculatedOrdersMap, setCalculatedOrdersMap] = useState<Record<string, CalculatedOrder>>({});

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setTotalVolume(0);
      setTotalCommission(0);
      setSellersNetPayout(0);
      setCalculatedOrdersMap({});
      return;
    }

    const calculateCommissions = async () => {
      try {
        const token = await currentUser?.getIdToken();
        const response = await fetch("/api/v1/calculate-commissions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orders: filteredOrders }),
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();

        setTotalVolume(data.totalVolume);
        setTotalCommission(data.totalCommission);
        setSellersNetPayout(data.sellersNetPayout);

        const map: Record<string, CalculatedOrder> = {};
        data.calculatedOrders.forEach((co: CalculatedOrder) => {
          map[co.id] = co;
        });
        setCalculatedOrdersMap(map);
      } catch (err: unknown) {
        console.error("Failed to calculate server commissions", err instanceof Error ? err.message : err);
      }
    };

    const timeout = setTimeout(() => {
      void calculateCommissions();
    }, 500);
    return () => clearTimeout(timeout);
  }, [filteredOrders, currentUser]);

  return {
    totalVolume,
    totalCommission,
    sellersNetPayout,
    calculatedOrdersMap,
  };
};
