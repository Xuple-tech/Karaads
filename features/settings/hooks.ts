import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { profileService } from '@/features/profile/service';
import { settingsService } from './service';

export const SETTINGS_QUERY_KEY = ['settings', 'profile'] as const;

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: settingsService.getSettings,
  });
};

export const useSavePrivacySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.savePrivacy,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: settingsService.changePassword,
  });
};

export const useSaveAppearanceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.saveAppearance,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

export const useBeginTwoFactorSetup = () => {
  return useMutation({
    mutationFn: settingsService.beginTwoFactorSetup,
  });
};

export const useConfirmTwoFactorSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.confirmTwoFactorSetup,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.disableTwoFactor,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: profileService.updateMyProfile,
    onSuccess: (user) => {
      setUser(user);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
