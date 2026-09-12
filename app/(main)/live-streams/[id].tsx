import { ArrowLeft, Eye, Heart, Radio, Send, Share2, Video } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import {
    useEndLiveStream,
    useJoinLiveStream,
    useLikeLiveStream,
    useLiveStream,
    useLiveStreamAnalytics,
    useLiveStreamChat,
    useShareLiveStream,
    useSendLiveChatMessage,
} from '@/features/live-streams/hooks';
import type { LiveChatMessage } from '@/features/live-streams/service';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router, useLocalSearchParams } from '@/lib/navigation/router';

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
};

export default function LiveStreamViewerScreen() {
  const params = useLocalSearchParams<{ id: string; host?: string }>();
  const streamId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isHostView = params.host === '1';
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const listRef = useRef<FlatList<LiveChatMessage>>(null);

  const stream = useLiveStream(streamId ?? '', Boolean(streamId));
  const chat = useLiveStreamChat(streamId ?? '', Boolean(streamId));
  const analytics = useLiveStreamAnalytics(streamId ?? '', Boolean(streamId) && isHostView);
  const joinStream = useJoinLiveStream();
  const likeStream = useLikeLiveStream();
  const shareStream = useShareLiveStream();
  const endStream = useEndLiveStream();
  const sendMessage = useSendLiveChatMessage(streamId ?? '');

  const [message, setMessage] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!streamId) return;
    joinStream.mutate(streamId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId]);

  const isHost = Boolean(currentUser?.id && stream.data?.host?.id === currentUser.id) || isHostView;

  const onLike = () => {
    if (!streamId) return;
    setLiked(true);
    likeStream.mutate(streamId, { onError: () => setLiked(false) });
  };

  const onShare = () => {
    if (!streamId) return;
    shareStream.mutate(streamId);
  };

  const onSend = async () => {
    const content = message.trim();
    if (!content) return;
    setMessage('');
    try {
      await sendMessage.mutateAsync(content);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      Alert.alert('Message failed', getErrorMessage(error, 'Unable to send that message right now.'));
    }
  };

  const onEnd = () => {
    if (!streamId) return;
    Alert.alert('End stream?', 'This will stop the broadcast for everyone watching.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End stream',
        style: 'destructive',
        onPress: async () => {
          try {
            await endStream.mutateAsync(streamId);
            router.back();
          } catch (error) {
            Alert.alert('Unable to end stream', getErrorMessage(error));
          }
        },
      },
    ]);
  };

  const messages = chat.data ?? [];
  const viewerCount = stream.data?.viewerCount ?? analytics.data?.viewerCount ?? 0;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.videoArea}>
        <View style={styles.videoPlaceholder}>
          <Video size={30} color="rgba(255,255,255,0.5)" />
          <Text style={styles.videoPlaceholderTitle}>Live video preview unavailable</Text>
          <Text style={styles.videoPlaceholderBody}>
            Chat, likes, and viewer stats below are live. Video playback needs an app update to enable the streaming module.
          </Text>
        </View>

        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.white} />
          </Pressable>
          <View style={styles.hostChip}>
            <Avatar uri={stream.data?.host?.avatar ?? undefined} name={stream.data?.host?.name ?? 'Host'} size={28} />
            <View style={styles.hostChipText}>
              <Text style={styles.hostName} numberOfLines={1}>{stream.data?.host?.name ?? 'KaraAds creator'}</Text>
              <Text style={styles.streamTitle} numberOfLines={1}>{stream.data?.title ?? 'Live stream'}</Text>
            </View>
          </View>
          <View style={styles.viewerChip}>
            <Eye size={13} color={AppColors.white} />
            <Text style={styles.viewerChipText}>{formatCompact(viewerCount)}</Text>
          </View>
        </View>

        <View style={styles.liveIndicator}>
          <Radio size={12} color={AppColors.white} />
          <Text style={styles.liveIndicatorText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.chatSection}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={styles.chatRow}>
              <Text style={styles.chatName}>{item.user?.name ?? 'Viewer'}</Text>
              <Text style={styles.chatText}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={
            chat.isLoading ? <ActivityIndicator color={AppColors.accent} style={{ marginTop: 20 }} /> : null
          }
        />

        <View style={styles.actionsRow}>
          <View style={styles.composerWrap}>
            <TextInput
              style={styles.composerInput}
              placeholder="Say something..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={message}
              onChangeText={setMessage}
            />
            <Pressable style={styles.sendBtn} onPress={onSend} disabled={!message.trim()}>
              <Send size={16} color={AppColors.white} />
            </Pressable>
          </View>
          <Pressable style={styles.actionIconBtn} onPress={onLike}>
            <Heart size={20} color={liked ? AppColors.danger : AppColors.white} fill={liked ? AppColors.danger : 'transparent'} />
          </Pressable>
          <Pressable style={styles.actionIconBtn} onPress={onShare}>
            <Share2 size={20} color={AppColors.white} />
          </Pressable>
        </View>

        {isHost ? (
          <Pressable style={styles.endBtn} onPress={onEnd} disabled={endStream.isPending}>
            {endStream.isPending ? <ActivityIndicator color={AppColors.white} size="small" /> : <Text style={styles.endBtnText}>End stream</Text>}
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  videoArea: { height: '46%', backgroundColor: '#0A0A0A' },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 36,
  },
  videoPlaceholderTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  videoPlaceholderBody: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  hostChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: AppRadii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hostChipText: { flex: 1, minWidth: 0 },
  hostName: { color: AppColors.white, fontSize: 12, fontWeight: '800' },
  streamTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  viewerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: AppRadii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  viewerChipText: { color: AppColors.white, fontSize: 12, fontWeight: '800' },
  liveIndicator: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.danger,
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveIndicatorText: { color: AppColors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  chatSection: { flex: 1, backgroundColor: '#0A0A0A', paddingTop: 8 },
  chatList: { paddingHorizontal: 14, paddingBottom: 8, gap: 6 },
  chatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chatName: { color: '#5AB2FF', fontSize: 13, fontWeight: '800' },
  chatText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  composerWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingLeft: 14,
    paddingRight: 5,
    height: 42,
  },
  composerInput: { flex: 1, color: AppColors.white, fontSize: 13 },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
  },
  actionIconBtn: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  endBtn: {
    marginHorizontal: 14,
    marginBottom: 10,
    minHeight: 46,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: { color: AppColors.white, fontSize: 14, fontWeight: '800' },
});
