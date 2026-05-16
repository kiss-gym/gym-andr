// Thin fetch() wrapper — no Axios, KISS.
// All HTTP details live here; repositories call apiRequest(), not fetch().

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://192.168.0.164:5000';

let _authToken: string | null = null;

// Called by AuthContext via onAuthStateChange when session changes
export const setAuthToken = (token: string | null): void => {
  _authToken = token;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(_authToken ? { Authorization: `Bearer ${_authToken}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 204 No Content — return undefined
  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    // OpenAPI ProblemDetails shape: { title, detail, status }
    const message: string =
      (body as { detail?: string; title?: string }).detail ??
      (body as { title?: string }).title ??
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}
