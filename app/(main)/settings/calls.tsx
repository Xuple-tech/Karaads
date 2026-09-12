import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Phone, PhoneCall, Video } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { callsService } from '@/features/calls/service';
import { useConversations } from '@/features/messages/hooks';
import { router } from '@/lib/navigation/router';
import { reverbService } from '@/lib/realtime/reverb';
import type { RealtimeCallEvent } from '@/lib/types/domain';

export default function CallSettingsScreen() {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const conversations = useConversations();
  const [connected, setConnected] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeCallEvent | null>(null);
  const [busyMode, setBusyMode] = useState<'audio' | 'video' | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [subscribedCallId, setSubscribedCallId] = useState<string | null>(null);

  const firstConversationId = useMemo(() => conversations.data?.[0]?.id ?? null, [conversations.data]);

  const syncActive = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const active = await callsService.getActiveCall();
      setActiveCallId(active?.id ?? null);
    } catch {
      setSyncError('Unable to refresh call state right now.');
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncActive().catch(() => undefined);
  }, [syncActive]);

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    reverbService.connect(token);
    reverbService.subscribeUser(user.id);
    const removeConnection = reverbService.onConnectionState((isConnected) => {
      setConnected(isConnected);
    });
    const removeCallEvents = reverbService.onCallEvent((event) => {
      setLastEvent(event);
      if (event.call_id) {
        setActiveCallId(event.call_id);
      }
    });

    return () => {
      removeConnection();
      removeCallEvents();
      reverbService.unsubscribeUser(user.id);
      if (subscribedCallId) {
        reverbService.unsubscribeCall(subscribedCallId);
      }
    };
  }, [subscribedCallId, token, user?.id]);

  const startCallTest = async (mode: 'audio' | 'video') => {
    if (!firstConversationId) {
      router.push('MainTabs', { screen: 'Messages' });
      return;
    }

    setBusyMode(mode);
    setStartError(null);
    try {
      const payload = await callsService.startCall(firstConversationId, mode);
      if (payload.call_id) {
        reverbService.subscribeCall(payload.call_id);
        setSubscribedCallId((current) => {
          if (current && current !== payload.call_id) {
            reverbService.unsubscribeCall(current);
          }
          return payload.call_id;
        });
      }
      router.push('Conversation', { conversationId: firstConversationId, mode });
    } catch {
      setStartError('Unable to start call right now. Check your connection and try again.');
    } finally {
      setBusyMode(null);
    }
  };

  return (
    <SwipeStackView>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Call Webhooks</Text>
          <View style={styles.spacer} />
        </View>

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <Text style={styles.cardTitle}>Realtime gateway</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, connected ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.cardBody, connected ? styles.online : styles.offline]}>
              {connected ? 'Connected' : 'Offline'}
            </Text>
          </View>
          <Text style={styles.cardBody}>Active call: <Text style={styles.cardBodyBold}>{activeCallId ?? 'None'}</Text></Text>
          <Pressable style={styles.syncBtn} disabled={syncing} onPress={() => syncActive()}>
            <Text style={styles.syncText}>{syncing ? 'Refreshing...' : 'Refresh call state'}</Text>
          </Pressable>
          {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}
        </LinearGradient>

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <Text style={styles.cardTitle}>Test call webhooks</Text>
          <Text style={styles.cardBody}>Start call flow from your latest conversation to verify webhook events.</Text>
          <View style={styles.actions}>
            <Pressable style={styles.actionBtnWrap} onPress={() => startCallTest('audio')} disabled={busyMode !== null}>
              <LinearGradient colors={AppGradients.accentBlue} style={styles.actionBtn}>
                {busyMode === 'audio' ? <ActivityIndicator color={AppColors.white} size="small" /> : <Phone size={16} color={AppColors.white} />}
                <Text style={styles.actionText}>Audio Call</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.actionBtnWrap} onPress={() => startCallTest('video')} disabled={busyMode !== null}>
              <LinearGradient colors={AppGradients.accentPurple} style={styles.actionBtn}>
                {busyMode === 'video' ? <ActivityIndicator color={AppColors.white} size="small" /> : <Video size={16} color={AppColors.white} />}
                <Text style={styles.actionText}>Video Call</Text>
              </LinearGradient>
            </Pressable>
          </View>
          {!firstConversationId ? (
            <Pressable style={styles.secondaryBtn} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
              <PhoneCall size={15} color={AppColors.accent} />
              <Text style={styles.secondaryText}>Open messages to create a conversation first</Text>
            </Pressable>
          ) : null}
          {startError ? <Text style={styles.errorText}>{startError}</Text> : null}
        </LinearGradient>

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <Text style={styles.cardTitle}>Last webhook event</Text>
          {lastEvent ? (
            <>
              <Text style={styles.cardBody}>Type: <Text style={styles.cardBodyBold}>{lastEvent.type}</Text></Text>
              <Text style={styles.cardBody}>Call ID: <Text style={styles.cardBodyBold}>{lastEvent.call_id}</Text></Text>
              <Text style={styles.cardBody}>From: <Text style={styles.cardBodyBold}>{lastEvent.from_user_id}</Text></Text>
            </>
          ) : (
            <Text style={styles.cardBody}>No call webhook event received in this session.</Text>
          )}
        </LinearGradient>
      </View>
    </SwipeStackView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  spacer: {
    width: 42,
    height: 42,
  },
  card: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.18)',
    padding: 16,
    gap: 10,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  cardBodyBold: {
    color: AppColors.textPrimary,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: AppColors.success,
    shadowColor: AppColors.success,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  dotOffline: {
    backgroundColor: AppColors.warning,
  },
  online: {
    color: AppColors.success,
    fontWeight: '700',
  },
  offline: {
    color: AppColors.warning,
    fontWeight: '700',
  },
  syncBtn: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.25)',
    backgroundColor: AppColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtnWrap: {
    flex: 1,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
  },
  actionBtn: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.25)',
    backgroundColor: AppColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});
