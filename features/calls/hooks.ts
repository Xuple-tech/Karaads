import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { callsService } from '@/features/calls/service';
import { createLogger } from '@/lib/logging/logger';
import type { CallState, CallTimelineNote, RealtimeCallEvent } from '@/lib/types/domain';
import type { StartCallResponse } from '@/lib/types/services';

const logger = createLogger('call');

export type ConversationCallStatus = 'idle' | 'dialing' | 'ringing' | 'accepted' | 'declined' | 'ended' | 'failed';
type ConversationCallDirection = 'incoming' | 'outgoing' | null;

type InternalCallState = {
  status: ConversationCallStatus;
  callId: string | null;
  direction: ConversationCallDirection;
  notes: CallTimelineNote[];
  noteKeys: string[];
};

type CallAction =
  | { type: 'reset' }
  | { type: 'start_requested' }
  | { type: 'start_succeeded'; payload: StartCallResponse & { modeDowngraded?: boolean }; conversationId: string }
  | { type: 'start_failed'; conversationId: string }
  | { type: 'accept_succeeded'; callId: string; conversationId: string }
  | { type: 'accept_failed'; callId: string; conversationId: string }
  | { type: 'decline_succeeded'; callId: string; conversationId: string }
  | { type: 'decline_failed'; callId: string; conversationId: string }
  | { type: 'end_succeeded'; callId: string; conversationId: string }
  | { type: 'end_failed'; callId: string; conversationId: string }
  | { type: 'incoming_event'; event: RealtimeCallEvent; conversationId: string; direction: ConversationCallDirection }
  | { type: 'accepted_event'; event: RealtimeCallEvent; conversationId: string }
  | { type: 'declined_event'; event: RealtimeCallEvent; conversationId: string }
  | { type: 'ended_event'; event: RealtimeCallEvent; conversationId: string }
  | { type: 'sync_state'; call: CallState; conversationId: string };

export const initialConversationCallState: InternalCallState = {
  status: 'idle',
  callId: null,
  direction: null,
  notes: [],
  noteKeys: [],
};

const nextNote = (
  state: InternalCallState,
  params: {
    key: string;
    conversationId: string;
    callId?: string;
    text: string;
    tone?: CallTimelineNote['tone'];
    createdAt?: string;
  },
): InternalCallState => {
  if (state.noteKeys.includes(params.key)) {
    return state;
  }

  const note: CallTimelineNote = {
    id: `call-note-${params.key}`,
    kind: 'call-note',
    conversation_id: params.conversationId,
    call_id: params.callId,
    text: params.text,
    tone: params.tone ?? 'neutral',
    created_at: params.createdAt ?? new Date().toISOString(),
  };

  return {
    ...state,
    notes: [...state.notes, note],
    noteKeys: [...state.noteKeys, params.key],
  };
};

const syncStatus = (status: CallState['status']): ConversationCallStatus => {
  if (status === 'accepted') {
    return 'accepted';
  }

  if (status === 'declined') {
    return 'declined';
  }

  if (status === 'ended') {
    return 'ended';
  }

  return 'ringing';
};

export const conversationCallReducer = (state: InternalCallState, action: CallAction): InternalCallState => {
  switch (action.type) {
    case 'reset':
      return initialConversationCallState;
    case 'start_requested':
      return {
        ...state,
        status: 'dialing',
        direction: 'outgoing',
      };
    case 'start_succeeded': {
      const noteText = action.payload.modeDowngraded
        ? 'You started a call (video was unavailable, fell back to audio)'
        : 'You started a call';

      const nextState = {
        ...state,
        status: action.payload.status === 'accepted' ? ('accepted' as const) : ('ringing' as const),
        callId: action.payload.call_id,
        direction: 'outgoing' as const,
      };

      return nextNote(nextState, {
        key: `${action.payload.call_id}:outgoing-start`,
        callId: action.payload.call_id,
        conversationId: action.conversationId,
        text: noteText,
        tone: action.payload.modeDowngraded ? 'warning' : 'neutral',
      });
    }
    case 'start_failed':
      return nextNote(
        {
          ...state,
          status: 'failed',
        },
        {
          key: `${action.conversationId}:start-failed`,
          conversationId: action.conversationId,
          text: 'Call failed to start',
          tone: 'danger',
        },
      );
    case 'accept_succeeded':
      return nextNote(
        {
          ...state,
          status: 'accepted',
          callId: action.callId,
          direction: state.direction ?? 'incoming',
        },
        {
          key: `${action.callId}:accepted-local`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Call accepted',
          tone: 'success',
        },
      );
    case 'accept_failed':
      return nextNote(
        {
          ...state,
          status: 'failed',
        },
        {
          key: `${action.callId}:accept-failed`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Could not accept the call',
          tone: 'danger',
        },
      );
    case 'decline_succeeded':
      return nextNote(
        {
          ...state,
          status: 'declined',
          callId: action.callId,
        },
        {
          key: `${action.callId}:declined-local`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Call declined',
          tone: 'warning',
        },
      );
    case 'decline_failed':
      return nextNote(
        {
          ...state,
          status: 'failed',
        },
        {
          key: `${action.callId}:decline-failed`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Could not decline the call',
          tone: 'danger',
        },
      );
    case 'end_succeeded':
      return nextNote(
        {
          ...state,
          status: 'ended',
          callId: action.callId,
        },
        {
          key: `${action.callId}:ended-local`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Call ended',
          tone: 'neutral',
        },
      );
    case 'end_failed':
      return nextNote(
        {
          ...state,
          status: 'failed',
        },
        {
          key: `${action.callId}:end-failed`,
          callId: action.callId,
          conversationId: action.conversationId,
          text: 'Could not end the call',
          tone: 'danger',
        },
      );
    case 'incoming_event': {
      const callerName = action.event.caller?.name ?? 'Incoming';
      const incomingDirection = action.direction ?? 'incoming';
      return nextNote(
        {
          ...state,
          status: 'ringing',
          direction: incomingDirection,
          callId: action.event.call_id,
        },
        {
          key: `${action.event.call_id}:incoming:${incomingDirection}`,
          callId: action.event.call_id,
          conversationId: action.conversationId,
          text: incomingDirection === 'incoming' ? `${callerName} is calling` : 'Call ringing',
          tone: incomingDirection === 'incoming' ? 'warning' : 'neutral',
        },
      );
    }
    case 'accepted_event':
      return nextNote(
        {
          ...state,
          status: 'accepted',
          callId: action.event.call_id,
        },
        {
          key: `${action.event.call_id}:accepted-event`,
          callId: action.event.call_id,
          conversationId: action.conversationId,
          text: 'Call connected',
          tone: 'success',
        },
      );
    case 'declined_event':
      return nextNote(
        {
          ...state,
          status: 'declined',
          callId: action.event.call_id,
        },
        {
          key: `${action.event.call_id}:declined-event`,
          callId: action.event.call_id,
          conversationId: action.conversationId,
          text: 'Call declined',
          tone: 'warning',
        },
      );
    case 'ended_event':
      return nextNote(
        {
          ...state,
          status: 'ended',
          callId: action.event.call_id,
        },
        {
          key: `${action.event.call_id}:ended-event`,
          callId: action.event.call_id,
          conversationId: action.conversationId,
          text: 'Call ended',
          tone: 'neutral',
        },
      );
    case 'sync_state': {
      const status = syncStatus(action.call.status);
      const noteText =
        status === 'accepted'
          ? 'Call connected'
          : status === 'declined'
            ? 'Call declined'
            : status === 'ended'
              ? 'Call ended'
              : 'Call ringing';
      const noteTone: CallTimelineNote['tone'] =
        status === 'accepted' ? 'success' : status === 'declined' ? 'warning' : 'neutral';

      return nextNote(
        {
          ...state,
          status,
          callId: action.call.id,
          direction: state.direction,
        },
        {
          key: `${action.call.id}:sync:${status}`,
          callId: action.call.id,
          conversationId: action.conversationId,
          text: noteText,
          tone: noteTone,
        },
      );
    }
    default:
      return state;
  }
};

type UseConversationCallParams = {
  conversationId?: string;
  websocketConnected: boolean;
  currentUserId?: string;
};

export const useConversationCall = ({ conversationId, websocketConnected, currentUserId }: UseConversationCallParams) => {
  const [state, dispatch] = useReducer(conversationCallReducer, initialConversationCallState);

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [conversationId]);

  const syncActiveCall = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    const active = await callsService.getActiveCall();
    if (!active || active.conversation_id !== conversationId) {
      return;
    }

    dispatch({ type: 'sync_state', call: active, conversationId });
  }, [conversationId]);

  useEffect(() => {
    syncActiveCall().catch(() => {
      // silent by design
    });
  }, [syncActiveCall]);

  const syncCallById = useCallback(async () => {
    if (!conversationId || !state.callId) {
      return;
    }

    try {
      const call = await callsService.getCall(state.callId);
      if (call.conversation_id !== conversationId) {
        return;
      }

      dispatch({ type: 'sync_state', call, conversationId });
    } catch (error) {
      logger.warn('call_recovery_sync_failed', {
        call_id: state.callId,
        conversation_id: conversationId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [conversationId, state.callId]);

  // Re-sync when WebSocket reconnects mid-call
  const prevConnectedRef = useRef(websocketConnected);
  useEffect(() => {
    const wasDisconnected = !prevConnectedRef.current && websocketConnected;
    prevConnectedRef.current = websocketConnected;
    if (wasDisconnected && state.callId) {
      syncCallById().catch(() => {});
    }
  }, [websocketConnected, state.callId, syncCallById]);

  useEffect(() => {
    const shouldRecover =
      Boolean(state.callId) &&
      !websocketConnected &&
      (state.status === 'dialing' || state.status === 'ringing' || state.status === 'accepted');

    if (!shouldRecover) {
      return;
    }

    syncCallById().catch(() => {
      // silent by design
    });

    const timer = setInterval(() => {
      syncCallById().catch(() => {
        // silent by design
      });
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [state.callId, state.status, syncCallById, websocketConnected]);

  // Auto-reset to idle after terminal states so user can start a new call
  useEffect(() => {
    if (state.status !== 'declined' && state.status !== 'ended' && state.status !== 'failed') {
      return;
    }
    const timer = setTimeout(() => {
      dispatch({ type: 'reset' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.status]);

  const startCall = useCallback(async (mode?: 'audio' | 'video') => {
    if (!conversationId) {
      return;
    }

    dispatch({ type: 'start_requested' });
    try {
      const payload = await callsService.startCall(conversationId, mode);
      dispatch({ type: 'start_succeeded', payload, conversationId });
    } catch {
      dispatch({ type: 'start_failed', conversationId });
    }
  }, [conversationId]);

  const acceptCall = useCallback(async () => {
    if (!conversationId || !state.callId) {
      return;
    }

    try {
      await callsService.acceptCall(state.callId);
      dispatch({ type: 'accept_succeeded', callId: state.callId, conversationId });
    } catch {
      dispatch({ type: 'accept_failed', callId: state.callId, conversationId });
    }
  }, [conversationId, state.callId]);

  const declineCall = useCallback(async () => {
    if (!conversationId || !state.callId) {
      return;
    }

    try {
      await callsService.declineCall(state.callId);
      dispatch({ type: 'decline_succeeded', callId: state.callId, conversationId });
    } catch {
      dispatch({ type: 'decline_failed', callId: state.callId, conversationId });
    }
  }, [conversationId, state.callId]);

  const endCall = useCallback(async () => {
    if (!conversationId || !state.callId) {
      return;
    }

    try {
      await callsService.endCall(state.callId);
      dispatch({ type: 'end_succeeded', callId: state.callId, conversationId });
    } catch {
      dispatch({ type: 'end_failed', callId: state.callId, conversationId });
    }
  }, [conversationId, state.callId]);

  const applyRealtimeEvent = useCallback(
    (event: RealtimeCallEvent) => {
      if (!conversationId || event.conversation_id !== conversationId) {
        return;
      }

      if (event.type === 'IncomingCall') {
        const isInitiator =
          (typeof currentUserId === 'string' && event.from_user_id === currentUserId) ||
          (typeof currentUserId === 'string' && event.initiator_id === currentUserId);
        dispatch({ type: 'incoming_event', event, conversationId, direction: isInitiator ? 'outgoing' : 'incoming' });
        return;
      }

      if (event.type === 'CallAccepted') {
        dispatch({ type: 'accepted_event', event, conversationId });
        return;
      }

      if (event.type === 'CallDeclined') {
        dispatch({ type: 'declined_event', event, conversationId });
        return;
      }

      if (event.type === 'CallEnded') {
        dispatch({ type: 'ended_event', event, conversationId });
      }
    },
    [conversationId, currentUserId],
  );

  const controls = useMemo(() => {
    return {
      canStart: state.status === 'idle' || state.status === 'declined' || state.status === 'ended' || state.status === 'failed',
      canAccept: state.status === 'ringing' && state.direction === 'incoming' && Boolean(state.callId),
      canDecline: state.status === 'ringing' && Boolean(state.callId),
      canEnd:
        (state.status === 'dialing' || state.status === 'ringing' || state.status === 'accepted') &&
        Boolean(state.callId),
    };
  }, [state.callId, state.direction, state.status]);

  return {
    callId: state.callId,
    status: state.status,
    direction: state.direction,
    notes: state.notes,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    syncActiveCall,
    applyRealtimeEvent,
    ...controls,
  };
};
