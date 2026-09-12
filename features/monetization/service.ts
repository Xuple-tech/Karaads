import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';

export type MonetizationStatus = {
  eligible: boolean;
  reason?: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const normalizeStatus = (payload: unknown): MonetizationStatus => {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const eligible = Boolean(data?.eligible ?? data?.is_eligible ?? data?.enabled ?? data?.monetized ?? false);
  const reason = data?.reason ?? data?.message ?? data?.status_message;

  return {
    eligible,
    reason: typeof reason === 'string' ? reason : undefined,
  };
};

export const monetizationService = {
  async getStatus(): Promise<MonetizationStatus> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/users/monetization-dashboard', { token, version: 'v1_2' });
    return normalizeStatus(response.data);
  },
};
