import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'karaads_auth_token';
const USER_KEY = 'karaads_auth_user';
const ONBOARDING_SEEN_KEY = 'karaads_onboarding_seen';
const WEB_PREFIX = 'karaads_web_';

const memoryStore = new Map<string, string>();
let secureStoreAvailable: boolean | null = null;
let onboardingSeenInSession = false;
const SECURE_STORE_TIMEOUT_MS = 1500;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = SECURE_STORE_TIMEOUT_MS): Promise<T> => {
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('SecureStore timeout')), timeoutMs);
    }),
  ]);
};

const canUseLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const readFallback = (key: string): string | null => {
  if (canUseLocalStorage()) {
    return window.localStorage.getItem(`${WEB_PREFIX}${key}`);
  }

  return memoryStore.get(key) ?? null;
};

const writeFallback = (key: string, value: string): void => {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(`${WEB_PREFIX}${key}`, value);
    return;
  }

  memoryStore.set(key, value);
};

const deleteFallback = (key: string): void => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(`${WEB_PREFIX}${key}`);
    return;
  }

  memoryStore.delete(key);
};

const ensureSecureStoreAvailability = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    secureStoreAvailable = false;
    return false;
  }

  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await withTimeout(SecureStore.isAvailableAsync());
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
};

const setItem = async (key: string, value: string): Promise<void> => {
  const secure = await ensureSecureStoreAvailability();
  if (!secure) {
    writeFallback(key, value);
    return;
  }

  try {
    await withTimeout(SecureStore.setItemAsync(key, value));
  } catch {
    secureStoreAvailable = false;
    writeFallback(key, value);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  const secure = await ensureSecureStoreAvailability();
  if (!secure) {
    return readFallback(key);
  }

  try {
    return await withTimeout(SecureStore.getItemAsync(key));
  } catch {
    secureStoreAvailable = false;
    return readFallback(key);
  }
};

const deleteItem = async (key: string): Promise<void> => {
  const secure = await ensureSecureStoreAvailability();
  if (!secure) {
    deleteFallback(key);
    return;
  }

  try {
    await withTimeout(SecureStore.deleteItemAsync(key));
  } catch {
    secureStoreAvailable = false;
    deleteFallback(key);
  }
};

export const appKeyValueStorage = {
  async setItem(key: string, value: string): Promise<void> {
    // Non-sensitive app data (caches, theme prefs, etc.) — use fallback store
    // to avoid SecureStore's 2048-byte limit. Only auth tokens use SecureStore.
    writeFallback(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    return readFallback(key);
  },
  async removeItem(key: string): Promise<void> {
    deleteFallback(key);
  },
};

type PersistedSession = {
  token: string;
  user?: string;
};

export const sessionStorage = {
  async save(session: PersistedSession): Promise<void> {
    await setItem(TOKEN_KEY, session.token);
    if (session.user) {
      // User JSON can exceed SecureStore's 2048-byte limit, so store it
      // outside SecureStore. The token (security-sensitive) stays in SecureStore.
      writeFallback(USER_KEY, session.user);
    }
  },

  async read(): Promise<PersistedSession | null> {
    const token = await getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const user = readFallback(USER_KEY);
    return { token, user: user ?? undefined };
  },

  async clear(): Promise<void> {
    await deleteItem(TOKEN_KEY);
    deleteFallback(USER_KEY);
    // Also clean up any legacy SecureStore entry for the user key.
    try { await withTimeout(SecureStore.deleteItemAsync(USER_KEY)); } catch { /* ignore */ }
  },
};

export const onboardingStorage = {
  hasSeenInSession(): boolean {
    return onboardingSeenInSession;
  },

  async hasSeen(): Promise<boolean> {
    if (onboardingSeenInSession) {
      return true;
    }
    const value = await getItem(ONBOARDING_SEEN_KEY);
    return value === '1';
  },

  async markSeen(): Promise<void> {
    onboardingSeenInSession = true;
    await setItem(ONBOARDING_SEEN_KEY, '1');
  },
};
