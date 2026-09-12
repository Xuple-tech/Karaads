import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import type { UserSummary } from '@/lib/types/domain';

type AnyRecord = Record<string, unknown>;

export type LiveStream = {
  id: string;
  title: string;
  status: string;
  host?: UserSummary;
  thumbnailUrl?: string;
  viewerCount: number;
  likeCount: number;
  startedAt?: string;
  createdAt?: string;
};

export type LiveStreamAnalytics = {
  viewerCount: number;
  peakViewers: number;
  likeCount: number;
  shareCount: number;
  durationSeconds: number;
};

export type LiveChatMessage = {
  id: string;
  content: string;
  user?: UserSummary;
  createdAt: string;
  pinned: boolean;
};

export type LiveKitToken = {
  token: string;
  url: string;
  roomName: string;
};

const asRecord = (value: unknown): AnyRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as AnyRecord) : null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const firstString = (record: AnyRecord | null, keys: string[], fallback = ''): string => {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
};

const firstNumber = (record: AnyRecord | null, keys: string[]): number => {
  if (!record) return 0;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^\d.-]/g, ''));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const normalizeUser = (value: unknown): UserSummary | undefined => {
  const record = asRecord(value);
  if (!record || !record.id) return undefined;
  return {
    id: String(record.id),
    name: firstString(record, ['name']),
    username: firstString(record, ['username']),
    avatar: firstString(record, ['avatar', 'avatar_url']) || undefined,
  } as UserSummary;
};

const unwrapEnvelope = (value: unknown): AnyRecord => {
  const root = asRecord(value) ?? {};
  const data = asRecord(root.data);
  return data ?? root;
};

const normalizeStream = (value: unknown): LiveStream | null => {
  const record = asRecord(value);
  if (!record) return null;
  const id = firstString(record, ['id', 'stream_id', 'streamId']);
  if (!id) return null;
  return {
    id,
    title: firstString(record, ['title', 'name'], 'Live stream'),
    status: firstString(record, ['status'], 'idle').toLowerCase(),
    host: normalizeUser(record.host ?? record.user),
    thumbnailUrl: firstString(record, ['thumbnail_url', 'thumbnailUrl', 'cover', 'cover_url']) || undefined,
    viewerCount: firstNumber(record, ['viewer_count', 'viewerCount', 'viewers']),
    likeCount: firstNumber(record, ['like_count', 'likeCount', 'likes']),
    startedAt: firstString(record, ['started_at', 'startedAt']) || undefined,
    createdAt: firstString(record, ['created_at', 'createdAt']) || undefined,
  };
};

const normalizeStreamList = (payload: unknown): LiveStream[] => {
  const envelope = unwrapEnvelope(payload);
  const candidates = [envelope.streams, envelope.items, envelope.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeStream).filter((item): item is LiveStream => Boolean(item));
    }
  }
  return [];
};

const normalizeAnalytics = (payload: unknown): LiveStreamAnalytics => {
  const record = unwrapEnvelope(payload);
  return {
    viewerCount: firstNumber(record, ['viewer_count', 'viewerCount', 'viewers']),
    peakViewers: firstNumber(record, ['peak_viewers', 'peakViewers']),
    likeCount: firstNumber(record, ['like_count', 'likeCount', 'likes']),
    shareCount: firstNumber(record, ['share_count', 'shareCount', 'shares']),
    durationSeconds: firstNumber(record, ['duration_seconds', 'durationSeconds', 'duration']),
  };
};

const normalizeChatMessage = (value: unknown): LiveChatMessage | null => {
  const record = asRecord(value);
  if (!record) return null;
  const id = firstString(record, ['id']);
  const content = firstString(record, ['content', 'message', 'text']);
  if (!id || !content) return null;
  return {
    id,
    content,
    user: normalizeUser(record.user),
    createdAt: firstString(record, ['created_at', 'createdAt']) || new Date().toISOString(),
    pinned: Boolean(record.pinned ?? record.is_pinned),
  };
};

const normalizeChatList = (payload: unknown): LiveChatMessage[] => {
  const envelope = unwrapEnvelope(payload);
  const candidates = [envelope.messages, envelope.items, envelope.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeChatMessage).filter((item): item is LiveChatMessage => Boolean(item));
    }
  }
  return [];
};

const normalizeLiveKitToken = (payload: unknown): LiveKitToken => {
  const record = unwrapEnvelope(payload);
  return {
    token: firstString(record, ['token', 'access_token', 'accessToken']),
    url: firstString(record, ['url', 'ws_url', 'wsUrl', 'server_url', 'serverUrl']),
    roomName: firstString(record, ['room_name', 'roomName', 'room']),
  };
};

export type CreateLiveStreamInput = {
  title: string;
};

export const liveStreamsService = {
  async listStreams(): Promise<LiveStream[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/live/streams', { token, version: 'v1_2' });
    return normalizeStreamList(response.data);
  },

  async getStream(streamId: string): Promise<LiveStream | null> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/live/streams/${streamId}`, { token, version: 'v1_2' });
    return normalizeStream(unwrapEnvelope(response.data));
  },

  async createStream(input: CreateLiveStreamInput): Promise<LiveStream> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/live/streams', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { title: input.title.trim() },
    });
    const stream = normalizeStream(unwrapEnvelope(response.data));
    if (!stream) throw new Error('Unable to create the stream.');
    return stream;
  },

  async startStream(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/start`, { method: 'POST', token, version: 'v1_2' });
  },

  async endStream(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/end`, { method: 'POST', token, version: 'v1_2' });
  },

  async heartbeat(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/heartbeat`, { method: 'POST', token, version: 'v1_2' });
  },

  async joinStream(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/join`, { method: 'POST', token, version: 'v1_2' });
  },

  async likeStream(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/like`, { method: 'POST', token, version: 'v1_2' });
  },

  async shareStream(streamId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/share`, { method: 'POST', token, version: 'v1_2' });
  },

  async getAnalytics(streamId: string): Promise<LiveStreamAnalytics> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/live/streams/${streamId}/analytics`, { token, version: 'v1_2' });
    return normalizeAnalytics(response.data);
  },

  async getLiveKitToken(streamId: string): Promise<LiveKitToken> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/live/streams/${streamId}/livekit/token`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
    return normalizeLiveKitToken(response.data);
  },

  async getChatMessages(streamId: string): Promise<LiveChatMessage[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/live/streams/${streamId}/chat`, { token, version: 'v1_2' });
    return normalizeChatList(response.data);
  },

  async sendChatMessage(streamId: string, content: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/chat`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { content: content.trim() },
    });
  },

  async pinChatMessage(streamId: string, messageId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/chat/${messageId}/pin`, { method: 'POST', token, version: 'v1_2' });
  },

  async deleteChatMessage(streamId: string, messageId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/live/streams/${streamId}/chat/${messageId}`, { method: 'DELETE', token, version: 'v1_2' });
  },
};
