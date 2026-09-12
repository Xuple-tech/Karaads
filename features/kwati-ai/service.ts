import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';

export type KwatiChatRole = 'user' | 'assistant';

export type KwatiChatMessage = {
  id: string;
  role: KwatiChatRole;
  content: string;
  created_at: string;
  status?: 'pending' | 'sent' | 'failed';
};

const CHAT_ENDPOINT = '/kwati-ai/chat';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
};

const normalizeKwatiMessage = (input: unknown): KwatiChatMessage | null => {
  const payload = asRecord(input);
  if (!payload) return null;
  const roleRaw = `${payload.role ?? payload.sender ?? payload.type ?? ''}`.toLowerCase();
  const role: KwatiChatRole =
    roleRaw.includes('assistant') || roleRaw.includes('ai') || roleRaw.includes('bot') || roleRaw.includes('kwati')
      ? 'assistant'
      : 'user';
  const content = pickString(
    payload.content,
    payload.message,
    payload.text,
    payload.prompt,
    payload.reply,
    payload.response,
    payload.answer,
    payload.output,
  );
  if (!content) return null;
  return {
    id: pickString(payload.id, payload.message_id, payload.uuid) ?? `kwati-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    created_at: pickString(payload.created_at, payload.createdAt, payload.time) ?? new Date().toISOString(),
    status: 'sent',
  };
};

const normalizeKwatiMessages = (input: unknown): KwatiChatMessage[] => {
  const payload = asRecord(input);
  const data = asRecord(payload?.data);
  const result = asRecord(payload?.result);
  const directReply = pickString(data?.message, payload?.message, data?.reply, payload?.reply, data?.response, payload?.response);
  const directMessage: KwatiChatMessage[] = directReply
    ? [
        {
          id: pickString(data?.id, payload?.id) ?? `kwati-assistant-${Date.now()}`,
          role: 'assistant',
          content: directReply,
          created_at: pickString(data?.created_at, data?.createdAt, payload?.created_at, payload?.createdAt) ?? new Date().toISOString(),
          status: 'sent',
        },
      ]
    : [];
  const candidates = [
    input,
    payload?.messages,
    payload?.data,
    payload?.items,
    data?.messages,
    result?.messages,
  ];

  const arrayMessages = candidates
    .flatMap((candidate) => asArray(candidate))
    .map(normalizeKwatiMessage)
    .filter((message): message is KwatiChatMessage => Boolean(message));

  return [...arrayMessages, ...directMessage];
};

const shouldUseWebSearch = (content: string) => {
  const lower = content.trim().toLowerCase();
  if (!lower) return false;
  return [
    'latest',
    'current',
    'today',
    'news',
    'recent',
    'right now',
    'update',
    'updates',
    'internet',
    'web search',
    'search online',
    'look it up',
    'source',
    'sources',
    'link',
    'links',
  ].some((term) => lower.includes(term));
};

const createUserMessage = (content: string): KwatiChatMessage => ({
  id: `kwati-user-${Date.now()}`,
  role: 'user',
  content,
  created_at: new Date().toISOString(),
  status: 'sent',
});

const createLocalAssistantReply = (content: string): KwatiChatMessage => {
  const lower = content.toLowerCase();
  const topic = lower.includes('caption')
    ? 'caption'
    : lower.includes('idea') || lower.includes('viral')
      ? 'ideas'
      : lower.includes('campaign') || lower.includes('plan')
        ? 'campaign'
        : 'post';
  const replies: Record<string, string> = {
    caption:
      'Here is a stronger caption angle: lead with the result, add one emotional hook, then close with a simple action. Example: "Make your offer impossible to ignore. Show up, stand out, and turn attention into real customers today."',
    ideas:
      'Try these content ideas: a before/after result, a quick customer story, a behind-the-scenes clip, a limited-time offer, and a short tip that solves one clear problem for your audience.',
    campaign:
      'Plan the campaign in three steps: pick one goal, create three posts around one offer, then run the strongest post as the main ad. Track views, clicks, comments, and saves so you know what to repeat.',
    post:
      'I can help with that. Start with the audience, the offer, and the action you want people to take. Then keep the message short, useful, and easy to share.',
  };

  return {
    id: `kwati-assistant-${Date.now()}`,
    role: 'assistant',
    content: replies[topic],
    created_at: new Date().toISOString(),
    status: 'sent',
  };
};

export const kwatiAiService = {
  async getMessages(): Promise<KwatiChatMessage[]> {
    // The backend has no chat history endpoint (only POST /kwati-ai/chat exists) — the
    // conversation lives in the query cache for this session only.
    return [];
  },

  async sendMessage(content: string): Promise<KwatiChatMessage[]> {
    const token = useAuthStore.getState().token;
    const trimmed = content.trim();
    const userMessage = createUserMessage(trimmed);
    try {
      const response = await apiRequest<unknown>(CHAT_ENDPOINT, {
        method: 'POST',
        token,
        version: 'v1_2',
        body: {
          message: trimmed,
          use_web_search: shouldUseWebSearch(trimmed),
        },
      });
      const messages = normalizeKwatiMessages(response.data);
      return messages.length ? [userMessage, ...messages] : [userMessage, createLocalAssistantReply(trimmed)];
    } catch {
      return [userMessage, createLocalAssistantReply(trimmed)];
    }
  },
};
