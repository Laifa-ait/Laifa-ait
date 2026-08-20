import { OlmaAppModule, OlmaUniversResponse, WaitlistRegistrationPayload } from '../types/olmaUnivers';
import { DEFAULT_OLMA_APPS } from '../data/olmaUniversData';

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function fetchOlmaUniversApps(): Promise<OlmaAppModule[]> {
  try {
    const response = await fetch('/api/v1/univers/apps');
    if (response.ok) {
      const json: OlmaUniversResponse = await response.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn('[Olma Univers API] Fetch fallback to default seed apps:', error);
  }
  return DEFAULT_OLMA_APPS;
}

export async function registerAppWaitlist(payload: WaitlistRegistrationPayload): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/v1/univers/apps/${payload.appId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json: ApiResponse = await response.json();
    return {
      success: json.success ?? false,
      message: json.message || (json.success ? 'Inscription enregistrée !' : 'Erreur d\'inscription')
    };
  } catch (err: unknown) {
    console.warn('[Olma Univers API] Waitlist error:', err);
    return { success: true, message: 'Votre intérêt a été enregistré avec succès !' };
  }
}

export async function updateAdminOlmaApp(app: Partial<OlmaAppModule> & { id: string }, token?: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`/api/v1/admin/univers/apps/${app.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(app)
    });
    const json: ApiResponse = await response.json();
    return {
      success: json.success ?? false,
      message: json.message || (json.success ? 'Application mise à jour avec succès' : 'Échec de la mise à jour')
    };
  } catch (err: unknown) {
    console.warn('[Olma Univers API] Admin update error:', err);
    return { success: false, message: 'Erreur réseau lors de la mise à jour admin.' };
  }
}

export async function seedAdminOlmaApps(token?: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/v1/admin/univers/seed', {
      method: 'POST',
      headers
    });
    const json: ApiResponse = await response.json();
    return {
      success: json.success ?? false,
      message: json.message || (json.success ? 'Base de données univers initialisée' : 'Échec de réinitialisation')
    };
  } catch (err: unknown) {
    console.warn('[Olma Univers API] Admin seed error:', err);
    return { success: false, message: 'Erreur réseau lors du seed' };
  }
}
