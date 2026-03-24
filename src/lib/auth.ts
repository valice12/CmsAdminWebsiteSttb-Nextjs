// Authentication utilities backed by the CMS backend API

const CMS_AUTH_URL = 'http://localhost:5066/api/v1/cms';
const CURRENT_USER_KEY = 'cms_current_user';

export interface User {
  fullName: string;
  email: string;
  roles: string[];
  token: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  roleName?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function signIn(data: SignInData): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const response = await fetch(`${CMS_AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Email atau password salah';
      try {
        const err = JSON.parse(errorText);
        message = err.message || err.title || message;
      } catch {}
      return { success: false, message };
    }

    const result = await response.json();
    const user: User = {
      fullName: result.fullName,
      email: result.email,
      roles: result.roles ?? [],
      token: result.token ?? '',
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: 'Login berhasil', user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' };
  }
}

export async function signUp(data: SignUpData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${CMS_AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roleName: data.roleName ?? 'Viewer',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Registrasi gagal';
      try {
        const err = JSON.parse(errorText);
        message = err.message || err.title || message;
      } catch {}
      return { success: false, message };
    }

    return { success: true, message: 'Registrasi berhasil. Akun siap digunakan.' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' };
  }
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function signOut() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// ─── Legacy shims (kept for backwards compatibility with layout.tsx) ──────────
/** @deprecated use signIn (async) instead */
export function initializeAuth() {
  // no-op — auth is now backend-driven
}
