import { create } from 'zustand';

export interface User {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: string;
  password: string;
}

interface AuthState {
  user: Omit<User, 'password'> | null;
  users: User[];
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => boolean;
  signup: (loginId: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<Omit<User, 'password' | 'id'>>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  users: [
    {
      id: '1',
      loginId: 'admin',
      email: 'admin@coreinventory.com',
      name: 'System Admin',
      role: 'Administrator',
      password: 'Admin123!',
    },
    {
      id: '2',
      loginId: 'operator',
      email: 'operator@coreinventory.com',
      name: 'Warehouse Operator',
      role: 'Operator',
      password: 'Oper1234!',
    },
  ],

  login: (loginId, password) => {
    const user = get().users.find(u => u.loginId === loginId && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      set({ user: safeUser, isAuthenticated: true });
      return true;
    }
    return false;
  },

  signup: (loginId, email, password) => {
    const { users } = get();
    if (users.some(u => u.loginId === loginId)) return { success: false, error: 'Login ID already exists' };
    if (users.some(u => u.email === email)) return { success: false, error: 'Email already exists' };

    const newUser: User = {
      id: String(users.length + 1),
      loginId,
      email,
      name: loginId,
      role: 'Operator',
      password,
    };
    set({ users: [...users, newUser] });
    return { success: true };
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  updateProfile: (data) => {
    const { user } = get();
    if (user) set({ user: { ...user, ...data } });
  },

  changePassword: (oldPassword, newPassword) => {
    const { user, users } = get();
    if (!user) return false;
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1 || users[idx].password !== oldPassword) return false;
    const updated = [...users];
    updated[idx] = { ...updated[idx], password: newPassword };
    set({ users: updated });
    return true;
  },
}));
