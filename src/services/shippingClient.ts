import { apiGet, apiPost } from "../lib/api";

export interface ShippingLocation {
  id: number;
  name: string;
  zone?: number;
}

export interface ShippingLocationsResponse {
  success: boolean;
  data: {
    wilayas: ShippingLocation[];
    communes: Array<{ id: number; wilaya_id: number; name: string }>;
    centers: Array<{ id: number; wilaya_id: number; name: string }>;
  };
}

export interface ShippingRateDetail {
  home_fee: number;
  desk_fee: number;
  delay: string;
  home_delivery_fee?: number;
}

export interface ShippingRatesResponse {
  success?: boolean;
  data?: ShippingRateDetail | ShippingRateDetail[];
  rates?: Array<{
    carrierId?: string;
    carrierName?: string;
    homePrice?: number;
    deskPrice?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const getShippingLocations = async (): Promise<ShippingLocationsResponse> => {
    const res = await apiGet<ShippingLocationsResponse>('/api/v1/shipping/locations');
    return res;
};

export const calculateShippingRates = async (wilaya_id: number): Promise<ShippingRatesResponse> => {
    const res = await apiPost<ShippingRatesResponse>('/api/v1/shipping/rates', { wilaya_id });
    return res;
};

