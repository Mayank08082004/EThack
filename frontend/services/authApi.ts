import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('et_token');
}

export function saveSession(token: string, user: { id: string; email: string; name: string }) {
  localStorage.setItem('et_token', token);
  localStorage.setItem('et_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('et_token');
  localStorage.removeItem('et_user');
  localStorage.removeItem('et_preferences');
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; name: string };
  has_preferences: boolean;
}

export async function apiSignUp(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${API}/auth/signup`, { name, email, password });
  return data;
}

export async function apiSignIn(email: string, password: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${API}/auth/signin`, { email, password });
  return data;
}

export async function apiSignOut(): Promise<void> {
  try {
    await axios.post(`${API}/auth/signout`, {}, { headers: authHeader() });
  } finally {
    clearSession();
  }
}

export async function apiGetMe() {
  const { data } = await axios.get(`${API}/auth/me`, { headers: authHeader() });
  return data;
}

// ── Preferences API ──────────────────────────────────────────────────────────

export interface PreferencesResponse {
  genres: string[];
  updated_at?: string;
}

export async function apiGetPreferences(): Promise<PreferencesResponse> {
  const { data } = await axios.get<PreferencesResponse>(`${API}/preferences`, {
    headers: authHeader(),
  });
  return data;
}

export async function apiSavePreferences(genres: string[]): Promise<PreferencesResponse> {
  const { data } = await axios.put<PreferencesResponse>(
    `${API}/preferences`,
    { genres },
    { headers: authHeader() },
  );
  return data;
}
