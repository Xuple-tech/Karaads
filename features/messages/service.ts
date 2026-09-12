import { apiRequest } from '@/lib/api/http';
import { normalizeConversation, normalizeMessage } from '@/lib/api/normalize';
import type { Conversation, Message } from '@/lib/types/domain';
import { useAuthStore } from '@/features/auth/store';

type MediaPayload = {
  uri: string;
  name: string;
  mimeType: string;
  caption?: string;
  kind: 'image' | 'video' | 'audio';
};

const toUploadBlob = (payload: Pick<MediaPayload, 'uri' | 'name' | 'mimeType'>) =>
  ({
    uri: payload.uri,
    name: payload.name,
    type: payload.mimeType,
  } as unknown as Blob);

export const messagesService = {
  async getConversations(): Promise<Conversation[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Conversation[]>('/conversations', {
      token,
      version: 'v1_2',
    });

    return Array.isArray(response.data) ? response.data.map((conversation) => normalizeConversation(conversation)) : [];
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Message[]>(`/conversations/${conversationId}/messages`, {
      token,
      version: 'v1_2',
    });

    return Array.isArray(response.data) ? response.data.map((message) => normalizeMessage(message)) : [];
  },

  async sendMessage(conversationId: string, content: string, replyToId?: string): Promise<Message> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { content, ...(replyToId ? { reply_to_id: replyToId, reply_to_message_id: replyToId } : {}) },
    });

    return normalizeMessage(response.data);
  },

  async sendMediaMessage(
    conversationId: string,
    payload: MediaPayload,
  ): Promise<Message> {
    const token = useAuthStore.getState().token;
    const trimmedCaption = payload.caption?.trim();

    const uploadForm = new FormData();
    uploadForm.append('file', toUploadBlob(payload));

    const uploadResponse = await apiRequest<Record<string, unknown>>(`/conversations/${conversationId}/attachments`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: uploadForm,
      timeoutMs: 2 * 60 * 1000,
    });

    const uploaded = uploadResponse.data;
    const attachment = uploaded.attachment && typeof uploaded.attachment === 'object'
      ? uploaded.attachment
      : uploaded.data && typeof uploaded.data === 'object'
        ? uploaded.data
        : uploaded;

    const response = await apiRequest<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: {
        content: trimmedCaption ?? '',
        message_type: payload.kind,
        attachments: [attachment],
      },
    });

    return normalizeMessage(response.data);
  },

  async createConversation(participantIds: string[], options: { type?: 'private' | 'group'; name?: string } = {}): Promise<Conversation> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Conversation>('/conversations', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: {
        participant_ids: participantIds,
        type: options.type ?? 'private',
        ...(options.name?.trim() ? { name: options.name.trim() } : null),
      },
    });

    return normalizeConversation(response.data);
  },

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
      token,
      version: 'v1_2',
    });
  },
};
