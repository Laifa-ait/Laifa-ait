import { apiGet } from '../../lib/api';

export interface GlobalSettingsResponse {
  supportEmail?: string;
  marketplaceName?: string;
  maintenanceMode?: boolean;
}

export interface ShippingSettingsResponse {
  baseFee?: number;
  freeShippingThreshold?: number;
  supportedWilayas?: string[];
}

export const settingsApi = {
  getGlobalSettings: async (): Promise<GlobalSettingsResponse> => {
    return apiGet<GlobalSettingsResponse>('/api/v1/settings/global');
  },

  getShippingSettings: async (): Promise<ShippingSettingsResponse> => {
    return apiGet<ShippingSettingsResponse>('/api/v1/settings/shipping');
  },
};
