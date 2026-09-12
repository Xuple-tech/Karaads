import { create } from 'zustand';

import { onboardingStorage } from '@/lib/storage/secure-store';

type OnboardingState = {
  seen: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  seen: false,
  hydrated: false,
  hydrate: async () => {
    const seen = await onboardingStorage.hasSeen().catch(() => false);
    set({ seen, hydrated: true });
  },
  markSeen: async () => {
    set({ seen: true });
    await onboardingStorage.markSeen().catch(() => undefined);
  },
}));
