import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { isKaraApiError } from '@/lib/errors/api-error';
import type { CallState } from '@/lib/types/domain';
import type { StartCallResponse } from '@/lib/types/services';

const payloadMentionsMode = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase().includes('mode');
  }

  if (Array.isArray(value)) {
    return value.some((item) => payloadMentionsMode(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, nested]) => key.toLowerCase().includes('mode') || payloadMentionsMode(nested));
  }

  return false;
};

export const shouldRetryStartCallWithoutMode = (error: unknown, mode?: 'audio' | 'video') => {
  return (
    Boolean(mode) &&
    isKaraApiError(error) &&
    error.code === 'VALIDATION_ERROR' &&
    (payloadMentionsMode(error.message) || payloadMentionsMode(error.details))
  );
};

export const callsService = {
  async getActiveCall(): Promise<CallState | null> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<{ call: CallState | null }>('/calls/active', {
      token,
      version: 'v1_2',
    });

    return response.data.call;
  },

  async getCall(callId: string): Promise<CallState> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<CallState>(`/calls/${callId}`, {
      token,
      version: 'v1_2',
    });

    return response.data;
  },

  async startCall(conversationId: string, mode?: 'audio' | 'video'): Promise<StartCallResponse & { modeDowngraded?: boolean }> {
    const token = useAuthStore.getState().token;
    let response;
    try {
      response = await apiRequest<StartCallResponse>(`/conversations/${conversationId}/calls`, {
        method: 'POST',
        token,
        version: 'v1_2',
        body: mode ? { mode } : undefined,
      });
    } catch (error) {
      if (!shouldRetryStartCallWithoutMode(error, mode)) {
        throw error;
      }

      response = await apiRequest<StartCallResponse>(`/conversations/${conversationId}/calls`, {
        method: 'POST',
        token,
        version: 'v1_2',
      });

      return { ...response.data, modeDowngraded: true };
    }

    return response.data;
  },

  async acceptCall(callId: string): Promise<CallState['status']> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<{ status: CallState['status'] }>(`/calls/${callId}/accept`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });

    return response.data.status;
  },

  async declineCall(callId: string): Promise<CallState['status']> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<{ status: CallState['status'] }>(`/calls/${callId}/decline`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });

    return response.data.status;
  },

  async endCall(callId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/end`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async leaveCall(callId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/leave`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async heartbeat(callId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/heartbeat`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async sendOffer(callId: string, toUserId: string, sdp: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/offer`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { to_user_id: toUserId, sdp },
    });
  },

  async sendAnswer(callId: string, toUserId: string, sdp: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/answer`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { to_user_id: toUserId, sdp },
    });
  },

  async sendIceCandidate(callId: string, toUserId: string, candidate: unknown): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/calls/${callId}/ice`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { to_user_id: toUserId, candidate },
    });
  },

  async getSignal(callId: string, type: 'offer' | 'answer', signalId: string): Promise<{ sdp_b64?: string; sdp?: string }> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<{ sdp_b64?: string; sdp?: string }>(`/calls/${callId}/signals/${type}/${signalId}`, {
      token,
      version: 'v1_2',
    });
    return response.data;
  },
};
