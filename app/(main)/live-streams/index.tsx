import { Image as ExpoImage } from 'expo-image';
import { ArrowLeft, Eye, Radio, Video } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useCreateLiveStream, useLiveStreams, useStartLiveStream } from '@/features/live-streams/hooks';
import type { LiveStream } from '@/features/live-streams/service';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
};

export default function LiveStreamsScreen() {
  const insets = useSafeAreaInsets();
  const streams = useLiveStreams();
  const createStream = useCreateLiveStream();
  const startStream = useStartLiveStream();
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [starting, setStarting] = useState(false);

  const data = streams.data ?? [];

  const goLive = async () => {
    if (!title.trim() || starting) return;
    setStarting(true);
    try {
      const stream = await createStream.mutateAsync({ title: title.trim() });
      await startStream.mutateAsync(stream.id);
      setGoLiveOpen(false);
      setTitle('');
      router.push('LiveStreamDetail', { id: stream.id, host: '1' });
    } catch (error) {
      Alert.alert('Unable to go live', getErrorMessage(error, 'Something went wrong starting your stream.'));
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={AppColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Live</Text>
        <Pressable style={styles.goLiveBtn} onPress={() => setGoLiveOpen(true)}>
          <Radio size={15} color={AppColors.white} />
          <Text style={styles.goLiveBtnText}>Go Live</Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl tintColor={AppColors.accent} refreshing={streams.isRefetching} onRefresh={() => streams.refetch()} />}
        renderItem={({ item }) => <StreamCard stream={item} />}
        ListEmptyComponent={
          streams.isLoading ? (
            <ActivityIndicator color={AppColors.accent} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <Video size={28} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>No one is live right now</Text>
              <Text style={styles.emptyBody}>Be the first — tap Go Live to start streaming.</Text>
            </View>
          )
        }
      />

      <Modal visible={goLiveOpen} transparent animationType="fade" onRequestClose={() => setGoLiveOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setGoLiveOpen(false)} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Go live</Text>
          <Text style={styles.modalBody}>Give your stream a title. Viewers will see this while you&apos;re live.</Text>
          <TextInput
            style={styles.input}
            placeholder="What's happening?"
            placeholderTextColor={AppColors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <Pressable style={styles.startBtn} onPress={goLive} disabled={!title.trim() || starting}>
            {starting ? <ActivityIndicator color={AppColors.white} size="small" /> : <Text style={styles.startBtnText}>Start streaming</Text>}
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const StreamCard = ({ stream }: { stream: LiveStream }) => (
  <Pressable
    style={styles.card}
    onPress={() => router.push('LiveStreamDetail', { id: stream.id })}>
    {stream.thumbnailUrl ? (
      <ExpoImage source={{ uri: stream.thumbnailUrl }} style={styles.cardThumb} contentFit="cover" />
    ) : (
      <View style={styles.cardThumbFallback} />
    )}
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </View>
    <View style={styles.viewerBadge}>
      <Eye size={11} color={AppColors.white} />
      <Text style={styles.viewerBadgeText}>{formatCompact(stream.viewerCount)}</Text>
    </View>
    <View style={styles.cardFooter}>
      <Avatar uri={stream.host?.avatar ?? undefined} name={stream.host?.name ?? 'Host'} size={26} />
      <View style={styles.cardFooterText}>
        <Text style={styles.cardTitle} numberOfLines={1}>{stream.title}</Text>
        <Text style={styles.cardHost} numberOfLines={1}>{stream.host?.name ?? 'KaraAds creator'}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: { flex: 1, color: AppColors.textPrimary, fontSize: 20, fontWeight: '800' },
  goLiveBtn: {
    minHeight: 40,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.danger,
  },
  goLiveBtnText: { color: AppColors.white, fontSize: 13, fontWeight: '800' },
  list: { padding: 12, gap: 12 },
  row: { gap: 12 },
  card: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: AppRadii.lg,
    overflow: 'hidden',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardThumb: { ...StyleSheet.absoluteFillObject },
  cardThumbFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: AppColors.surfaceMuted },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    minHeight: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244,63,94,0.92)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AppColors.white },
  liveBadgeText: { color: AppColors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  viewerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minHeight: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerBadgeText: { color: AppColors.white, fontSize: 10, fontWeight: '800' },
  cardFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardFooterText: { flex: 1, minWidth: 0 },
  cardTitle: { color: AppColors.white, fontSize: 12, fontWeight: '800' },
  cardHost: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginTop: 1 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { color: AppColors.textPrimary, fontSize: 15, fontWeight: '800' },
  emptyBody: { color: AppColors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: '32%',
    borderRadius: AppRadii.lg,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 20,
    gap: 12,
  },
  modalTitle: { color: AppColors.textPrimary, fontSize: 17, fontWeight: '800' },
  modalBody: { color: AppColors.textSecondary, fontSize: 13, lineHeight: 19 },
  input: {
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: AppColors.textPrimary,
    fontSize: 14,
  },
  startBtn: {
    minHeight: 48,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { color: AppColors.white, fontSize: 14, fontWeight: '800' },
});
