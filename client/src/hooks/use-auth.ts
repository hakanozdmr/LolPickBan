import { create } from 'zustand';
import type { User } from '@shared/schema';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
  createUser: (username: string, role?: 'admin' | 'user') => Promise<boolean>;
}

export const useAuth = create<AuthState>()((set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string) => {
        try {
          const response = await fetch(`/api/users/username/${username}`);
          if (response.ok) {
            const user = await response.json();
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      createUser: async (username: string, role = 'user' as 'admin' | 'user') => {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, role }),
          });
          
          if (response.ok) {
            const user = await response.json();
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('User creation error:', error);
          return false;
        }
      },
    }));