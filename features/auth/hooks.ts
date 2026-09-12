import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearSession, authService, persistSession } from './service';
import { sessionStorage } from '@/lib/storage/secure-store';
import { useAuthStore } from './store';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (payload) => {
      await persistSession(payload.token, payload.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: async (payload) => {
      await persistSession(payload.token, payload.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearSession,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
    },
  });
};

export const useVerifyActivationCode = () => {
  return useMutation({
    mutationFn: authService.verifyActivationCode,
  });
};

export const useSendActivationCode = () => {
  return useMutation({
    mutationFn: authService.sendActivationCode,
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: authService.setPassword,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useVerifyEmail = (email?: string) => {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: async (code: string) => {
      const resolvedEmail = (email ?? user?.email ?? '').trim();
      if (!resolvedEmail) {
        throw new Error('Email is required to verify account');
      }
      return authService.verifyEmailCode({ email: resolvedEmail, code });
    },
    onSuccess: async () => {
      const current = useAuthStore.getState().user;
      if (current) {
        const updatedUser = { ...current, is_verified: true };
        setUser(updatedUser);
        if (token) {
          await sessionStorage.save({ token, user: JSON.stringify(updatedUser) });
        }
      }
    },
  });
};

export const useResendVerificationCode = (email?: string) => {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async () => {
      const resolvedEmail = (email ?? user?.email ?? '').trim();
      if (!resolvedEmail) {
        throw new Error('Email is required to resend verification code');
      }
      return authService.sendVerifyEmailCode({ email: resolvedEmail });
    },
  });
};
