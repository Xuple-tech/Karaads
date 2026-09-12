import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';

export type ReferralStats = {
  code: string;
  shareLink: string;
  referredCount: number;
  completedCount: number;
  totalEarned: number;
  currency: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const firstString = (record: Record<string, unknown> | null, keys: string[], fallback = ''): string => {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
};

const firstNumber = (record: Record<string, unknown> | null, keys: string[]): number => {
  if (!record) return 0;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^\d.-]/g, ''));
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  return 0;
};

const buildShareLink = (code: string) => `https://karaads.com/register?ref=${encodeURIComponent(code)}`;

const normalizeStats = (payload: unknown): ReferralStats => {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const user = useAuthStore.getState().user;
  const code = user?.referral_code?.trim() || firstString(data, ['code', 'referral_code', 'referralCode'], user?.username ?? '');

  return {
    code,
    shareLink: user?.referral_link?.trim() || firstString(data, ['share_link', 'shareLink', 'link'], code ? buildShareLink(code) : ''),
    referredCount: firstNumber(data, ['referred_count', 'referredCount', 'total_referred', 'invited_count']),
    completedCount: firstNumber(data, ['completed_count', 'completedCount', 'converted_count']),
    totalEarned: firstNumber(data, ['total_earned', 'totalEarned', 'earnings', 'amount_earned']),
    currency: firstString(data, ['currency'], 'NGN'),
  };
};

export const referralsService = {
  async getStats(): Promise<ReferralStats> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/referrals/stats', { token, version: 'v1_2' });
    return normalizeStats(response.data);
  },

  async registerCode(code: string): Promise<void> {
    const token = useAuthStore.getState().token;
    const trimmed = code.trim();
    if (!trimmed) {
      throw new Error('Enter a referral code.');
    }
    await apiRequest('/referrals/register', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { code: trimmed, referral_code: trimmed },
    });
  },

  // Called by the backend-driven flow once a referred user completes a qualifying
  // action; exposed here in case a client-triggered confirmation is ever needed.
  async completeReferral(referredUserId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/referrals/complete', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { referred_user_id: referredUserId },
    });
  },
};
