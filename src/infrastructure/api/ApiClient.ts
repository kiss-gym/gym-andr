// Thin fetch() wrapper — no Axios, KISS.
// All HTTP details live here; repositories call apiRequest(), not fetch().

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://192.168.0.164:5000';
const ENABLE_API_TIMING = __DEV__ || process.env['EXPO_PUBLIC_ENABLE_API_TIMING'] === 'true';

let _authToken: string | null = null;

const now = (): number => globalThis.performance?.now?.() ?? Date.now();

// Called by AuthContext via onAuthStateChange when session changes
export const setAuthToken = (token: string | null): void => {
  _authToken = token;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(_authToken ? { Authorization: `Bearer ${_authToken}` } : {}),
  };
  const method = options.method ?? 'GET';
  const startedAt = ENABLE_API_TIMING ? now() : 0;
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (ENABLE_API_TIMING) {
      const message = error instanceof Error ? error.message : String(error);
      console.debug(
        `[api] ${method} ${path} failed after ${Math.round(now() - startedAt)} ms: ${message}`,
      );
    }
    throw error;
  }

  if (ENABLE_API_TIMING) {
    console.debug(
      `[api] ${method} ${path} ${response.status}: ${Math.round(now() - startedAt)} ms`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message: string =
      (body as { detail?: string; title?: string }).detail ??
      (body as { title?: string }).title ??
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}
