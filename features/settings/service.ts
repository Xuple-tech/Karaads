import { apiRequest } from '@/lib/api/http';
import { useAuthStore } from '@/features/auth/store';

export type MessagePermission = 'everyone' | 'following' | 'nobody';
export type DefaultVisibility = 'everyone' | 'followers' | 'private';
export type AppearanceTheme = 'light' | 'dark' | 'system';

export type SettingsPayload = {
  message_permission: MessagePermission;
  default_post_visibility: DefaultVisibility;
  two_factor_enabled: boolean;
  appearance_theme: AppearanceTheme;
  blocked_users: { id: string; name: string; username: string }[];
};

export type TwoFactorSetup = {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
};

const normalizeMessagePermission = (value: unknown): MessagePermission => {
  if (value === 'following' || value === 'nobody') {
    return value;
  }
  return 'everyone';
};

const normalizeVisibility = (value: unknown): DefaultVisibility => {
  if (value === 'followers' || value === 'private') {
    return value;
  }
  return 'everyone';
};

const normalizeTheme = (value: unknown): AppearanceTheme => {
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return 'system';
};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const normalizeBlockedUsers = (value: unknown) => {
  return asArray(value).map((item, index) => {
    const payload = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      id: String(payload.id ?? `blocked-${index}`),
      name: String(payload.name ?? payload.username ?? 'Blocked user'),
      username: String(payload.username ?? 'unknown'),
    };
  });
};

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});

const firstString = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const normalizeTwoFactorSetup = (payload: unknown): TwoFactorSetup => {
  const root = asRecord(payload);
  const data = asRecord(root.data) ?? root;
  const merged = { ...root, ...data };
  return {
    secret: firstString(merged, ['secret', 'two_factor_secret', 'twoFactorSecret']),
    qrCodeUrl: firstString(merged, ['qr_code', 'qr_code_url', 'qrCode', 'qrCodeUrl', 'qr_svg']),
    otpauthUrl: firstString(merged, ['otpauth_url', 'otpauthUrl', 'url']),
  };
};

export const settingsService = {
  async getSettings(): Promise<SettingsPayload> {
    const token = useAuthStore.getState().token;
    // `savePrivacy` PATCHes /users/privacy, so those fields round-trip through the
    // same resource on GET. `/users/blocked` is fetched separately since it's not
    // embedded in the privacy payload; it degrades to an empty list if absent.
    const [privacyResult, blockedResult] = await Promise.allSettled([
      apiRequest<unknown>('/users/privacy', { token, version: 'v1_2' }),
      apiRequest<unknown>('/users/blocked', { token, version: 'v1_2' }),
    ]);

    const payload = asRecord(privacyResult.status === 'fulfilled' ? privacyResult.value.data : null);
    const blockedPayload = blockedResult.status === 'fulfilled' ? blockedResult.value.data : null;

    return {
      message_permission: normalizeMessagePermission(payload.message_permission ?? payload.messagePrivacy),
      default_post_visibility: normalizeVisibility(payload.default_post_visibility ?? payload.defaultVisibility),
      two_factor_enabled: Boolean(payload.two_factor_enabled ?? payload.twoFactorEnabled ?? false),
      appearance_theme: normalizeTheme(payload.appearance_theme ?? payload.appearanceTheme),
      blocked_users: normalizeBlockedUsers(blockedPayload ?? payload.blocked_users ?? payload.blockedUsers),
    };
  },

  async savePrivacy(input: { message_permission: MessagePermission; default_post_visibility: DefaultVisibility }): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/users/privacy', {
      method: 'PATCH',
      token,
      version: 'v1_2',
      body: input,
    });
  },

  async changePassword(input: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/auth/password/change', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: input,
    });
  },

  async saveAppearance(input: { appearance_theme: AppearanceTheme }): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/users/profile', {
      method: 'PATCH',
      token,
      version: 'v1_2',
      body: input,
    });
  },

  // 2FA returns a QR/secret on enable that must be confirmed with a code before
  // it takes effect — unlike everything else in this file, which is single-step.
  async beginTwoFactorSetup(): Promise<TwoFactorSetup> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/auth/2fa/enable', {
      method: 'POST',
      token,
      version: 'v1_2',
    });
    return normalizeTwoFactorSetup(response.data);
  },

  async confirmTwoFactorSetup(code: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/auth/2fa/confirm', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { code: code.trim(), otp: code.trim() },
    });
  },

  async disableTwoFactor(): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/auth/2fa/disable', {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },
};
