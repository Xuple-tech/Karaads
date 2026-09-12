import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useConversations } from '@/features/messages/hooks';
import { formatPresenceListTime, isUserOnline } from '@/features/messages/presence';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';
import type { Conversation } from '@/lib/types/domain';

const getPeer = (conversation: Conversation, currentUserId?: string) =>
  conversation.participants?.find((participant) => participant.id !== currentUserId) ?? conversation.participants?.[0];

const formatMessageTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const conversations = useConversations();
  const sorted = useMemo(
    () => [...(conversations.data ?? [])].sort((a, b) =>
      new Date(b.last_message?.created_at ?? 0).getTime() - new Date(a.last_message?.created_at ?? 0).getTime()),
    [conversations.data],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>KARAADS</Text>
          <Text style={styles.title}>Messages</Text>
        </View>
        <Pressable style={styles.compose} onPress={() => router.push('MessagesCompose')}>
          <Ionicons name="create-outline" size={23} color={AppColors.textPrimary} />
        </Pressable>
      </View>

      {conversations.isLoading ? (
        <View style={styles.center}><ActivityIndicator color={AppColors.accent} size="large" /></View>
      ) : conversations.isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={34} color={AppColors.danger} />
          <Text style={styles.error}>{getErrorMessage(conversations.error, 'Unable to load conversations.')}</Text>
          <Pressable style={styles.retry} onPress={() => conversations.refetch()}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={sorted.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={conversations.isRefetching} onRefresh={conversations.refetch} tintColor={AppColors.accent} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={46} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>Start a conversation and your messages will appear here.</Text>
              <Pressable style={styles.retry} onPress={() => router.push('MessagesCompose')}><Text style={styles.retryText}>New message</Text></Pressable>
            </View>
          }
          renderItem={({ item }) => {
            const peer = getPeer(item, currentUserId);
            const name = item.name || peer?.name || peer?.username || 'Conversation';
            const unread = Number(item.unread_count ?? 0);
            return (
              <Pressable style={styles.row} onPress={() => router.push('Conversation', { conversationId: item.id })}>
                <Avatar uri={peer?.avatar} name={name} size={52} online={isUserOnline(peer)} />
                <View style={styles.body}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.name, unread > 0 && styles.unreadName]} numberOfLines={1}>{name}</Text>
                    <Text style={styles.time}>{formatMessageTime(item.last_message?.created_at) || formatPresenceListTime(peer)}</Text>
                  </View>
                  <View style={styles.rowBottom}>
                    <Text style={[styles.preview, unread > 0 && styles.unreadPreview]} numberOfLines={1}>
                      {item.last_message?.content || 'Start a conversation'}
                    </Text>
                    {unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text></View> : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border },
  eyebrow: { color: AppColors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  title: { color: AppColors.textPrimary, fontSize: 30, fontWeight: '800' },
  compose: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surfaceMuted },
  list: { paddingVertical: 6 },
  emptyList: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: AppColors.border },
  body: { flex: 1, gap: 5 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, color: AppColors.textPrimary, fontSize: 16, fontWeight: '600' },
  unreadName: { fontWeight: '800' },
  time: { color: AppColors.textMuted, fontSize: 11 },
  preview: { flex: 1, color: AppColors.textSecondary, fontSize: 14 },
  unreadPreview: { color: AppColors.textPrimary, fontWeight: '600' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  center: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28 },
  emptyTitle: { color: AppColors.textPrimary, fontSize: 19, fontWeight: '700' },
  emptyText: { color: AppColors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  error: { color: AppColors.textSecondary, fontSize: 14, textAlign: 'center' },
  retry: { marginTop: 5, paddingHorizontal: 20, paddingVertical: 11, borderRadius: AppRadii.pill, backgroundColor: AppColors.accent },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
