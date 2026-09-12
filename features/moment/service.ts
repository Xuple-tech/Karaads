import { apiRequest } from '@/lib/api/http';
import { normalizePostList } from '@/lib/api/normalize';
import type { MomentPost, Post } from '@/lib/types/domain';
import { useAuthStore } from '@/features/auth/store';

const mapToMoments = (data: unknown): MomentPost[] => {
  return normalizePostList(data);
};

export const momentService = {
  async getMoments(page: number): Promise<{ moments: MomentPost[]; source: 'moments' | 'feed' }> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Post[]>('/posts/moments', {
      query: { page },
      token,
      version: 'v1_2',
    });

    return { moments: mapToMoments(response.data), source: 'moments' };
  },

  async recordView(momentId: string): Promise<number | null> {
    const token = useAuthStore.getState().token;
    try {
      const response = await apiRequest<Record<string, unknown>>(`/posts/${momentId}/engagement`, {
        method: 'POST',
        token,
        version: 'v1_2',
        body: { type: 'view' },
      });

      const payload = response.data ?? {};
      const value = payload.view_count ?? payload.views_count ?? payload.views;
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },
};
