import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import type { ApiVersion } from '@/lib/types/api';

type AnyRecord = Record<string, unknown>;

export type AdsCampaign = {
  id: string;
  postId?: string;
  title: string;
  status: string;
  budget: number;
  spent: number;
  reach: number;
  todayReach: number;
  clicks: number;
  impressions: number;
  thumbnailUrl?: string;
  createdAt?: string;
  raw?: AnyRecord;
};

export type AdsDashboard = {
  campaigns: AdsCampaign[];
  amountSpent: number;
  totalBudget: number;
  reach: number;
  todayReach: number;
  clicks: number;
  weekReach: { day: string; value: number }[];
  genderReach: { male: number; female: number; notSet: number };
};

export type CreatePostAdInput = {
  postId: string;
  budget: number;
  goal?: string;
  durationDays?: number;
};

export type BoostPostInput = CreatePostAdInput;

const CAMPAIGNS_ENDPOINT = '/ads/campaigns';
const WALLET_ENDPOINT = '/ads/wallet';

const asRecord = (value: unknown): AnyRecord | null => {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as AnyRecord) : null;
};

const asNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const firstNumber = (record: AnyRecord | null, keys: string[]) => {
  if (!record) return 0;
  for (const key of keys) {
    const value = asNumber(record[key]);
    if (value > 0) return value;
  }
  return 0;
};

const firstString = (record: AnyRecord | null, keys: string[], fallback = '') => {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return fallback;
};

const unwrapArrays = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];
  const nestedData = asRecord(record.data);
  const candidates = [
    record.campaigns,
    record.ads,
    record.post_ads,
    record.postAds,
    record.boosts,
    record.items,
    record.results,
    record.data,
    nestedData?.campaigns,
    nestedData?.ads,
    nestedData?.post_ads,
    nestedData?.postAds,
    nestedData?.boosts,
    nestedData?.items,
    nestedData?.results,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const nestedPost = (record: AnyRecord) => asRecord(record.post) ?? asRecord(record.target_post) ?? asRecord(record.targetPost);

const firstThumbnail = (record: AnyRecord, post: AnyRecord | null) => {
  const direct = firstString(record, ['thumbnail_url', 'thumbnailUrl', 'image_url', 'imageUrl', 'media_url', 'mediaUrl']);
  if (direct) return direct;
  const postDirect = firstString(post, ['thumbnail_url', 'thumbnailUrl', 'image_url', 'imageUrl', 'media_url', 'mediaUrl']);
  if (postDirect) return postDirect;
  const media = record.media ?? post?.media;
  const firstMedia = Array.isArray(media) ? asRecord(media[0]) : asRecord(media);
  return firstString(firstMedia, ['thumbnail_url', 'thumbnailUrl', 'url', 'path']);
};

const normalizeCampaign = (value: unknown, index: number): AdsCampaign | null => {
  const record = asRecord(value);
  if (!record) return null;
  const post = nestedPost(record);
  const postId = firstString(record, ['post_id', 'postId', 'target_post_id', 'targetPostId'], firstString(post, ['id']));
  const id = firstString(record, ['id', 'campaign_id', 'campaignId', 'ad_id', 'adId'], postId || `campaign-${index}`);
  const title = firstString(
    record,
    ['title', 'name', 'campaign_name', 'campaignName', 'ad_title', 'adTitle'],
    firstString(post, ['content', 'caption', 'title'], 'Campaign'),
  );
  const budget = firstNumber(record, ['budget', 'total_budget', 'totalBudget', 'ad_budget', 'adBudget', 'campaign_budget', 'campaignBudget', 'amount', 'daily_budget']);
  const spent = firstNumber(record, ['spent', 'amount_spent', 'amountSpent', 'ad_spend', 'adSpend', 'campaign_spent', 'campaignSpent']);
  const reach = firstNumber(record, ['reach', 'total_reach', 'totalReach', 'people_reached', 'peopleReached', 'views', 'view_count', 'viewCount']);
  const todayReach = firstNumber(record, ['today_reach', 'todayReach', 'reached_today', 'reachedToday', 'daily_reach', 'dailyReach']);
  const clicks = firstNumber(record, ['clicks', 'click_count', 'clickCount', 'link_clicks', 'linkClicks']);

  return {
    id,
    postId,
    title,
    status: firstString(record, ['status', 'campaign_status', 'campaignStatus', 'ad_status', 'adStatus'], 'ACTIVE').toUpperCase(),
    budget,
    spent,
    reach,
    todayReach,
    clicks,
    impressions: firstNumber(record, ['impressions', 'impression_count', 'impressionCount']),
    thumbnailUrl: firstThumbnail(record, post),
    createdAt: firstString(record, ['created_at', 'createdAt', 'started_at', 'startedAt']),
    raw: record,
  };
};

const normalizeWeekReach = (payload: unknown, campaigns: AdsCampaign[]) => {
  const record = asRecord(payload);
  const source = record?.week_reach ?? record?.weekReach ?? asRecord(record?.data)?.week_reach ?? asRecord(record?.data)?.weekReach;
  if (Array.isArray(source)) {
    return source.map((item, index) => {
      const entry = asRecord(item);
      return {
        day: firstString(entry, ['day', 'label', 'date'], `Day ${index + 1}`).slice(0, 3),
        value: firstNumber(entry, ['value', 'reach', 'count', 'total']),
      };
    });
  }

  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const dayKey = day.toISOString().slice(0, 10);
    const value = campaigns.reduce((sum, campaign) => {
      const campaignDay = campaign.createdAt ? new Date(campaign.createdAt).toISOString().slice(0, 10) : '';
      return campaignDay === dayKey ? sum + campaign.reach : sum;
    }, 0);
    return { day: day.toLocaleDateString(undefined, { weekday: 'short' }), value };
  });
};

const normalizeDashboard = (payload: unknown): AdsDashboard => {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const campaigns = unwrapArrays(payload).map(normalizeCampaign).filter((item): item is AdsCampaign => Boolean(item));
  const metrics = data ?? root;
  const totalReachFromCampaigns = campaigns.reduce((sum, campaign) => sum + campaign.reach, 0);
  const todayReachFromCampaigns = campaigns.reduce((sum, campaign) => sum + campaign.todayReach, 0);
  const spentFromCampaigns = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const budgetFromCampaigns = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const clicksFromCampaigns = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);

  const gender = asRecord(metrics?.gender_reach) ?? asRecord(metrics?.genderReach) ?? asRecord(data?.audience) ?? asRecord(root?.audience);
  return {
    campaigns,
    amountSpent: firstNumber(metrics, ['amount_spent', 'amountSpent', 'spent', 'total_spent']) || spentFromCampaigns,
    totalBudget: firstNumber(metrics, ['total_budget', 'totalBudget', 'budget']) || budgetFromCampaigns,
    reach: firstNumber(metrics, ['reach', 'total_reach', 'totalReach', 'people_reached']) || totalReachFromCampaigns,
    todayReach: firstNumber(metrics, ['today_reach', 'todayReach', 'reached_today']) || todayReachFromCampaigns,
    clicks: firstNumber(metrics, ['clicks', 'total_clicks', 'totalClicks']) || clicksFromCampaigns,
    weekReach: normalizeWeekReach(payload, campaigns),
    genderReach: {
      male: firstNumber(gender, ['male', 'men']),
      female: firstNumber(gender, ['female', 'women']),
      notSet: firstNumber(gender, ['not_set', 'notSet', 'unknown', 'unspecified']),
    },
  };
};

const request = async <T>(endpoint: string, options: { method?: 'GET' | 'POST'; body?: AnyRecord } = {}) => {
  const token = useAuthStore.getState().token;
  const response = await apiRequest<T>(endpoint, {
    method: options.method,
    body: options.body,
    token,
    version: 'v1_2' as ApiVersion,
  });
  return response.data;
};

const buildAdBody = (input: CreatePostAdInput) => ({
  post_id: input.postId,
  postId: input.postId,
  budget: input.budget,
  amount: input.budget,
  daily_budget: input.budget,
  goal: input.goal ?? 'views',
  objective: input.goal ?? 'views',
  duration_days: input.durationDays ?? 7,
  duration: input.durationDays ?? 7,
});

export const adsService = {
  async getDashboard(): Promise<AdsDashboard> {
    const [campaignsPayload, walletPayload] = await Promise.all([
      request<unknown>(CAMPAIGNS_ENDPOINT),
      request<unknown>(WALLET_ENDPOINT).catch(() => null),
    ]);
    const merged = {
      ...(asRecord(walletPayload) ?? {}),
      ...(asRecord(campaignsPayload) ?? {}),
      campaigns: unwrapArrays(campaignsPayload),
    };
    return normalizeDashboard(merged);
  },

  async createPostAd(input: CreatePostAdInput): Promise<AdsCampaign | null> {
    const payload = await request<unknown>(CAMPAIGNS_ENDPOINT, {
      method: 'POST',
      body: buildAdBody(input),
    });
    return normalizeCampaign(payload, 0);
  },

  async boostPost(input: BoostPostInput): Promise<AdsCampaign | null> {
    const payload = await request<unknown>(CAMPAIGNS_ENDPOINT, {
      method: 'POST',
      body: buildAdBody(input),
    });
    return normalizeCampaign(payload, 0);
  },
};
