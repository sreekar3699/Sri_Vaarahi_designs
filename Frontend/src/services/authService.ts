// ─── Auth Service ───
// Handles Google OAuth2 login, token storage, user decoding, and token refresh.

const BACKEND_URL = 'http://localhost:8080';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  picture: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

// ─── Token storage ────────────────────────────────────────────────────────────

export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token',  accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function clearTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ─── JWT decode (no verification — signature is verified by the backend) ─────

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

/**
 * Redirects the browser to Google's OAuth2 consent screen via the backend.
 */
export function signInWithGoogle(): void {
  window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
}

/**
 * Reads the current user from the stored access token (no network call).
 * Returns null if no token is stored or the token is expired.
 */
export function getCurrentUser(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;

  // Check expiry
  const exp = payload['exp'] as number | undefined;
  if (exp && Date.now() / 1000 > exp) return null;

  return {
    id:      payload['userId']  as number,
    email:   payload['sub']     as string,
    name:    (payload['name']    as string) || '',
    picture: (payload['picture'] as string) || '',
    phone:   (payload['phone']   as string) || undefined,
    role:    ((payload['role']   as string) || 'USER') as 'USER' | 'ADMIN',
  };
}

/**
 * Exchanges the stored refresh token for a new access + refresh token pair.
 * Updates localStorage on success. Clears tokens if the refresh token is invalid.
 * Returns the new access token string, or null on failure.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    storeTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Calls the backend logout endpoint to revoke the refresh token in DB,
 * then clears both tokens from localStorage.
 */
export async function logout(): Promise<void> {
  const accessToken = getAccessToken();
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: accessToken
        ? { 'Authorization': `Bearer ${accessToken}` }
        : {},
    });
  } catch { /* ignore network errors on logout */ }
  clearTokens();
}

/**
 * Saves the user's phone number to the backend.
 */
export async function savePhoneNumber(phone: string): Promise<boolean> {
  const accessToken = getAccessToken();
  if (!accessToken) return false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ phone }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
