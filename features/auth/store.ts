import { create } from 'zustand';

import type { UserSummary } from '@/lib/types/domain';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  token: string | null;
  user: UserSummary | null;
  status: AuthStatus;
  hydrated: boolean;
  setSession: (token: string, user: UserSummary | null) => void;
  setUser: (user: UserSummary | null) => void;
  setStatus: (status: AuthStatus) => void;
  finishHydration: () => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  status: 'loading',
  hydrated: false,
  setSession: (token, user) =>
    set({ token, user, status: token ? 'authenticated' : 'unauthenticated', hydrated: true }),
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  finishHydration: () => set({ hydrated: true }),
  clearSession: () => set({ token: null, user: null, status: 'unauthenticated', hydrated: true }),
}));