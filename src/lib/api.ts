import { auth } from './firebase';

let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string | null> {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch('/api/v1/csrf-token');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        return cachedCsrfToken;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function getAuthHeaders(includeCsrf = false, forceRefresh = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(forceRefresh);
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // ignore
    }
  }

  if (includeCsrf) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return headers;
}

export interface ApiError extends Error {
  status?: number;
}

async function handleResponseError(res: Response): Promise<never> {
  const text = await res.text();
  let errMsg = text;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      errMsg = parsed.error || parsed.message || text;
    }
  } catch {
    // Not JSON, keep raw text
  }
  const error: ApiError = new Error(errMsg || `API Error ${res.status}`);
  error.status = res.status;
  
  throw error;
}

async function parseJsonResponse<T>(res: Response, path: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`API ${path} returned non-JSON response (${res.status}): ${text.substring(0, 100)}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const forceRefresh = i > 0; // Force refresh token on retry if 401 occurred
      const headers = await getAuthHeaders(false, forceRefresh);
      const res = await fetch(path, { headers });
      if (!res.ok) {
        if (res.status === 401 && i === 0 && auth.currentUser) {
          // Refresh token transparently on first 401
          continue;
        }
        await handleResponseError(res);
      }
      return parseJsonResponse<T>(res, path);
    } catch (error: unknown) {
      const err = error as ApiError;
      if (i === retries - 1) {
        if (err?.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        throw error;
      }
      if (err?.status === 401) {
        continue;
      }
      // Only retry on network errors or 5xx server errors
      if (err?.message === 'Failed to fetch' || (err?.status && err.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch after retries");
}

export async function apiPost<T>(path: string, body: unknown, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const forceRefresh = i > 0;
      const headers = await getAuthHeaders(true, forceRefresh);
      const res = await fetch(path, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 401 && i === 0 && auth.currentUser) {
          continue;
        }
        await handleResponseError(res);
      }
      return parseJsonResponse<T>(res, path);
    } catch (error: unknown) {
      const err = error as ApiError;
      if (i === retries - 1) {
        if (err?.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        throw error;
      }
      if (err?.status === 401) {
        continue;
      }
      if (err?.message === 'Failed to fetch' || (err?.status && err.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch after retries");
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let headers = await getAuthHeaders(true, false);
  let res = await fetch(path, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 401 && auth.currentUser) {
    headers = await getAuthHeaders(true, true);
    res = await fetch(path, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
  }
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    await handleResponseError(res);
  }
  return parseJsonResponse<T>(res, path);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  let headers = await getAuthHeaders(true, false);
  let res = await fetch(path, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 401 && auth.currentUser) {
    headers = await getAuthHeaders(true, true);
    res = await fetch(path, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  }
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    await handleResponseError(res);
  }
  return parseJsonResponse<T>(res, path);
}

export async function apiDelete<T>(path: string): Promise<T> {
  let headers = await getAuthHeaders(true, false);
  let res = await fetch(path, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 401 && auth.currentUser) {
    headers = await getAuthHeaders(true, true);
    res = await fetch(path, {
      method: 'DELETE',
      headers,
    });
  }
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    await handleResponseError(res);
  }
  return parseJsonResponse<T>(res, path);
}
