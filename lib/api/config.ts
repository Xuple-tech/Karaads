import type { ApiVersion } from '@/lib/types/api';

const DEFAULT_V12 = 'https://karaads.com/api/open-labs/oyibo/v1.2';
const DEFAULT_V11 = 'https://karaads.com/api/open-labs/oyibo/v1.1';
const DEFAULT_V3 = 'https://karaads.com/api/v3';

const fromEnv = (value: string | undefined, fallback: string) => {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value.replace(/\/+$/, '');
};

export const API_BASE_URLS: Record<ApiVersion, string> = {
  v1_2: fromEnv(process.env.EXPO_PUBLIC_API_V12_BASE_URL, DEFAULT_V12),
  v1_1: fromEnv(process.env.EXPO_PUBLIC_API_V11_BASE_URL, DEFAULT_V11),
  v3: fromEnv(process.env.EXPO_PUBLIC_API_V3_BASE_URL, DEFAULT_V3),
};

export const REVERB_WS_URL = fromEnv(process.env.EXPO_PUBLIC_REVERB_WS_URL, 'wss://karaads.com/reverb');
