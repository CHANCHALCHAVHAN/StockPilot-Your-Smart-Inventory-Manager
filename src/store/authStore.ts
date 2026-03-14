import { create } from 'zustand';

export type Role = 'Inventory Manager' | 'Warehouse Staff';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const API = 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server.' };
    }
  },

  signup: async (name, email, password, role) => {
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server.' };
    }
  },

  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
