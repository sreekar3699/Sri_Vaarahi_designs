// ─── Auth Service ───
// Handles Google OAuth2 login, fetching the current user, and logout.

const BACKEND_URL = 'http://localhost:8080';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  picture: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Redirects the browser to Google's OAuth2 consent screen via the backend.
 * Spring Security handles the redirect chain:
 *   Frontend → Backend /oauth2/authorization/google → Google → Backend callback → Frontend
 */
export function signInWithGoogle(): void {
  window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
}

/**
 * Fetches the currently authenticated user from the backend session.
 * Call this after the OAuth2 redirect returns to the frontend.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      credentials: 'include', // Include session cookie
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Logs out the current user by invalidating their backend session.
 */
export async function logout(): Promise<void> {
  await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Saves the user's phone number to the backend.
 */
export async function savePhoneNumber(phone: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/phone`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
