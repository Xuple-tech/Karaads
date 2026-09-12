import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { callsService } from '@/features/calls/service';
import { SwipeCallActionBar } from '@/features/calls/swipe-call-action-bar';
import { router } from '@/lib/navigation/router';
import { reverbService } from '@/lib/realtime/reverb';
import type { RealtimeCallEvent } from '@/lib/types/domain';

const CALL_ACTION_CATEGORY = 'incoming-call-actions';

let Notifications: any = null;
const getNotifications = () => {
  if (!Notifications && Platform.OS !== 'web') {
    try {
      Notifications = require('expo-notifications');
    } catch {
      Notifications = null;
    }
  }
  return Notifications;
};

type IncomingCallState = {
  callId: string;
  conversationId?: string;
  mode: 'audio' | 'video';
  callerName: string;
  callerAvatar?: string;
};

export const IncomingCallManager = () => {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [incomingCall, setIncomingCall] = useState<IncomingCallState | null>(null);

  const headerTop = useMemo(() => insets.top + 8, [insets.top]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const notifications = getNotifications();
    notifications?.setNotificationCategoryAsync?.(CALL_ACTION_CATEGORY, [
      {
        identifier: 'ACCEPT_CALL',
        buttonTitle: 'Accept',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'REJECT_CALL',
        buttonTitle: 'Reject',
        options: { isDestructive: true, opensAppToForeground: false },
      },
    ])?.catch(() => undefined);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const notifications = getNotifications();
    const subscription = notifications?.addNotificationResponseReceivedListener?.(async (response: any) => {
      const data = response.notification.request.content.data as
        | { callId?: string; conversationId?: string; mode?: 'audio' | 'video' }
        | undefined;
      const callId = data?.callId;
      const conversationId = data?.conversationId;
      const mode = data?.mode === 'video' ? 'video' : 'audio';

      if (!callId) {
        return;
      }

      if (response.actionIdentifier === 'ACCEPT_CALL') {
        await callsService.acceptCall(callId).catch(() => undefined);
        setIncomingCall(null);
      } else if (response.actionIdentifier === 'REJECT_CALL') {
        await callsService.declineCall(callId).catch(() => undefined);
        setIncomingCall(null);
        return;
      }

      if (conversationId) {
        router.push('Conversation', { conversationId, mode });
      }
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    reverbService.connect(token);
    reverbService.subscribeUser(user.id);

    const removeCallListener = reverbService.onCallEvent((event: RealtimeCallEvent) => {
      if (event.type === 'CallAccepted' || event.type === 'CallDeclined' || event.type === 'CallEnded') {
        if (event.type !== 'CallAccepted') {
          reverbService.unsubscribeCall(event.call_id);
        }
        setIncomingCall((current) => {
          if (current?.callId === event.call_id) {
            // Dismiss the notification when call is resolved
            const notifications = getNotifications();
            notifications?.dismissAllNotificationsAsync?.().catch(() => undefined);
            return null;
          }
          return current;
        });
        return;
      }
      if (event.type !== 'IncomingCall') {
        return;
      }
      const isInitiator = event.from_user_id === user.id || event.initiator_id === user.id;
      if (isInitiator) {
        return;
      }

      const nextState: IncomingCallState = {
        callId: event.call_id,
        conversationId: event.conversation_id,
        mode: event.mode === 'video' ? 'video' : 'audio',
        callerName: event.caller?.name ?? 'Incoming caller',
        callerAvatar: event.caller?.avatar ?? undefined,
      };
      reverbService.subscribeCall(nextState.callId);
      setIncomingCall(nextState);

      const notifications = getNotifications();
      notifications?.scheduleNotificationAsync?.({
        content: {
          title: `Incoming ${nextState.mode} call`,
          body: `${nextState.callerName} is calling`,
          sound: 'default',
          data: { callId: nextState.callId, conversationId: nextState.conversationId, mode: nextState.mode },
          categoryIdentifier: CALL_ACTION_CATEGORY,
        },
        trigger: null,
      })?.catch(() => undefined);
    });

    return () => {
      removeCallListener();
    };
  }, [token, user?.id]);

  if (!incomingCall) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <LinearGradient colors={AppGradients.heroBg} style={[styles.screen, { paddingTop: headerTop }]}>
        <View style={styles.heroBlock}>
          <Text style={styles.callTypeLabel}>{incomingCall.mode === 'video' ? '📹 Video Call' : '📞 Voice Call'}</Text>
          <Text style={styles.callerName}>{incomingCall.callerName}</Text>
          <Text style={styles.callerMeta}>@{incomingCall.callerName.toLowerCase().replace(/\s+/g, '')}</Text>
          <LinearGradient colors={AppGradients.storyRing} style={styles.avatarHalo}>
            <View style={styles.avatarInner}>
              <Avatar uri={incomingCall.callerAvatar} name={incomingCall.callerName} size={186} />
            </View>
          </LinearGradient>
          <Pressable
            style={styles.messagePill}
            onPress={() => {
              const conversationId = incomingCall.conversationId;
              setIncomingCall(null);
              if (conversationId) {
                router.push('Conversation', { conversationId, mode: incomingCall.mode });
              }
            }}>
            <MessageCircle size={18} color={AppColors.accent} />
            <Text style={styles.messagePillText}>Message</Text>
          </Pressable>
        </View>

        <SwipeCallActionBar
          onDecline={async () => {
            await callsService.declineCall(incomingCall.callId).catch(() => undefined);
            setIncomingCall(null);
          }}
          onAccept={async () => {
            await callsService.acceptCall(incomingCall.callId).catch(() => undefined);
            const conversationId = incomingCall.conversationId;
            setIncomingCall(null);
            if (conversationId) {
              router.push('Conversation', { conversationId, mode: incomingCall.mode });
            }
          }}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  heroBlock: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  callTypeLabel: {
    color: AppColors.accent,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  avatarHalo: {
    width: 210,
    height: 210,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 4,
  },
  avatarInner: {
    width: 202,
    height: 202,
    borderRadius: AppRadii.pill,
    overflow: 'hidden',
    backgroundColor: AppColors.surface,
  },
  callerName: {
    color: AppColors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  callerMeta: {
    color: AppColors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  messagePill: {
    minHeight: 54,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 28,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  messagePillText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
