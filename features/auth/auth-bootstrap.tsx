import { useEffect, type PropsWithChildren } from 'react';

import { sessionStorage } from '@/lib/storage/secure-store';
import { authService } from './service';
import { useAuthStore } from './store';

const parseUser = (value: string | undefined) => {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
};

export const AuthBootstrap = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await sessionStorage.read();
        if (!active) return;
        if (!session?.token) {
          useAuthStore.getState().clearSession();
          return;
        }
        useAuthStore.getState().setSession(session.token, parseUser(session.user));
        try {
          const user = await authService.me(session.token);
          if (active) useAuthStore.getState().setSession(session.token, user);
        } catch {
          // Keep the cached session when the API is temporarily unavailable.
        }
      } catch {
        if (active) useAuthStore.getState().clearSession();
      }
    })();
    return () => { active = false; };
  }, []);

  return children;
};
