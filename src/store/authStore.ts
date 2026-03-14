import { create } from 'zustand';

export type Role = 'Inventory Manager' | 'Warehouse Staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'email'>>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  resetPasswordByEmail: (email: string, newPassword: string) => boolean;
}

// Seed users stored in module scope so they persist across store re-creations
const seedUsers: StoredUser[] = [
  { id: '1', name: 'System Admin', email: 'admin@coreinventory.com', role: 'Inventory Manager', password: 'Admin123!' },
  { id: '2', name: 'Warehouse Operator', email: 'operator@coreinventory.com', role: 'Warehouse Staff', password: 'Oper1234!' },
];

// Runtime registry — starts with seeds, grows as users sign up
const userRegistry: StoredUser[] = [...seedUsers];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const found = userRegistry.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _, ...safeUser } = found;
    set({ user: safeUser, token: `mock-token-${safeUser.id}`, isAuthenticated: true });
    return { success: true };
  },

  signup: async (name, email, password, role) => {
    if (userRegistry.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser: StoredUser = {
      id: String(Date.now()),
      name,
      email,
      role,
      password,
    };
    userRegistry.push(newUser);
    return { success: true };
  },

  logout: () => set({ user: null, token: null, isAuthenticated: false }),

  updateProfile: (data) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...data };
    // Keep registry in sync
    const idx = userRegistry.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      userRegistry[idx] = { ...userRegistry[idx], ...data };
    }
    set({ user: updated });
  },

  changePassword: (oldPassword, newPassword) => {
    const { user } = get();
    if (!user) return false;
    const idx = userRegistry.findIndex(u => u.id === user.id);
    if (idx === -1 || userRegistry[idx].password !== oldPassword) return false;
    userRegistry[idx] = { ...userRegistry[idx], password: newPassword };
    return true;
  },

  resetPasswordByEmail: (email, newPassword) => {
    const idx = userRegistry.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return false;
    userRegistry[idx] = { ...userRegistry[idx], password: newPassword };
    return true;
  },
}));
