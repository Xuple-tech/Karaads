import { useMutation, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, User, Users, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { browseService } from '@/features/browse/service';
import { messagesService } from '@/features/messages/service';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import type { UserSummary } from '@/lib/types/domain';

const initialsFor = (value?: string | null) =>
  (value ?? 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';

export default function ComposeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const [mode, setMode] = useState<'private' | 'group'>(initialMode === 'group' ? 'group' : 'private');
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupUsers, setGroupUsers] = useState<UserSummary[]>([]);
  const canCreatePrivate = username.trim().length > 0;
  const canCreateGroup = groupName.trim().length > 0 && groupUsers.length >= 2;
  const canSubmit = mode === 'group' ? canCreateGroup : canCreatePrivate;
  const helperText = useMemo(() => {
    if (mode === 'private') return 'Start a direct chat with one username.';
    return groupUsers.length < 2 ? 'Search and select at least 2 people.' : `${groupUsers.length} people selected`;
  }, [groupUsers.length, mode]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 220);

    return () => {
      clearTimeout(timer);
    };
  }, [username]);

  const userSearch = useQuery({
    queryKey: ['messages', 'compose-user-search', debouncedUsername],
    queryFn: () => browseService.searchUsersOnly(debouncedUsername),
    enabled: mode === 'group' && debouncedUsername.length >= 1,
    staleTime: 15000,
  });
  const selectedUserIds = useMemo(() => new Set(groupUsers.map((user) => user.id)), [groupUsers]);
  const searchUsers = useMemo(
    () => (userSearch.data ?? []).filter((user) => user.id && !selectedUserIds.has(user.id)).slice(0, 8),
    [selectedUserIds, userSearch.data],
  );

  const createConversation = useMutation({
    mutationFn: async () => {
      if (mode === 'group') {
        const ids = Array.from(new Set(groupUsers.map((user) => user.id).filter(Boolean)));
        return messagesService.createConversation(ids, { type: 'group', name: groupName });
      }

      const user = await browseService.userByUsername(username.trim());
      const conversation = await messagesService.createConversation([user.id], { type: 'private' });
      return conversation;
    },
    onSuccess: (conversation) => {
      router.replace('Conversation', { conversationId: conversation.id });
    },
  });

  const addGroupUser = (user: UserSummary) => {
    if (!user.id || selectedUserIds.has(user.id)) return;
    setGroupUsers((current) => [...current, user]);
    setUsername('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={19} stroke={AppColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{mode === 'group' ? 'New Group' : 'New Chat'}</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <View style={styles.modeSwitch}>
        <Pressable style={[styles.modeBtn, mode === 'private' && styles.modeBtnActive]} onPress={() => setMode('private')}>
          <User size={16} color={mode === 'private' ? '#08111F' : AppColors.textSecondary} />
          <Text style={[styles.modeText, mode === 'private' && styles.modeTextActive]}>Chat</Text>
        </Pressable>
        <Pressable style={[styles.modeBtn, mode === 'group' && styles.modeBtnActive]} onPress={() => setMode('group')}>
          <Users size={17} color={mode === 'group' ? '#08111F' : AppColors.textSecondary} />
          <Text style={[styles.modeText, mode === 'group' && styles.modeTextActive]}>Group</Text>
        </Pressable>
      </View>

      {mode === 'group' ? (
        <View style={styles.searchCard}>
          <View style={styles.searchIcon}>
            <Users size={14} stroke={AppColors.textMuted} />
          </View>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Group name"
            placeholderTextColor={AppColors.textMuted}
            style={styles.input}
          />
        </View>
      ) : null}

      <View style={styles.searchCard}>
        <View style={styles.searchIcon}>
          <Search size={14} stroke={AppColors.textMuted} />
        </View>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder={mode === 'group' ? 'Search name or username' : 'Search username'}
          placeholderTextColor={AppColors.textMuted}
          autoCapitalize="none"
          style={styles.input}
          onSubmitEditing={undefined}
        />
      </View>

      <Text style={styles.helperText}>{helperText}</Text>

      {mode === 'group' && username.trim().length > 0 && userSearch.isFetching ? (
        <Text style={styles.noResultsText}>Searching...</Text>
      ) : null}

      {mode === 'group' && searchUsers.length > 0 ? (
        <View style={styles.resultsCard}>
          {searchUsers.map((user) => (
            <Pressable key={user.id} style={styles.resultRow} onPress={() => addGroupUser(user)}>
              <View style={styles.resultAvatar}>
                <Text style={styles.resultAvatarText}>{initialsFor(user.name || user.username)}</Text>
              </View>
              <View style={styles.resultBody}>
                <Text style={styles.resultName} numberOfLines={1}>{user.name || user.username}</Text>
                <Text style={styles.resultUsername} numberOfLines={1}>@{user.username}</Text>
              </View>
              <Text style={styles.resultAdd}>Add</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {mode === 'group' && username.trim().length >= 1 && !userSearch.isFetching && searchUsers.length === 0 ? (
        <Text style={styles.noResultsText}>No users found.</Text>
      ) : null}

      {mode === 'group' && groupUsers.length > 0 ? (
        <View style={styles.selectedUsersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {groupUsers.map((item) => (
              <View key={item.id} style={styles.userChip}>
                <Text style={styles.userChipText} numberOfLines={1}>@{item.username}</Text>
                <Pressable onPress={() => setGroupUsers((current) => current.filter((user) => user.id !== item.id))}>
                  <X size={12} color={AppColors.white} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {createConversation.error ? <Text style={styles.error}>{getErrorMessage(createConversation.error)}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={[styles.primaryAction, (!canSubmit || createConversation.isPending) && styles.primaryActionDisabled]} onPress={() => createConversation.mutate()} disabled={!canSubmit || createConversation.isPending}>
          <LinearGradient
            colors={AppGradients.primary as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.primaryActionText}>
            {createConversation.isPending ? 'Starting...' : mode === 'group' ? 'Create group' : 'Start conversation'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={() => router.back()}>
          <Text style={styles.secondaryActionText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modeSwitch: {
    minHeight: 44,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(10,18,32,0.82)',
    flexDirection: 'row',
    padding: 5,
    gap: 6,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    borderRadius: AppRadii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeBtnActive: {
    backgroundColor: AppColors.accent,
  },
  modeText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  modeTextActive: {
    color: '#08111F',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,20,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
  },
  iconBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: undefined, fontWeight: '800',
  },
  searchCard: {
    minHeight: 50,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.25)',
    backgroundColor: 'rgba(10,18,32,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  searchIcon: {
    width: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
  },
  helperText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  resultsCard: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,32,0.88)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  resultRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  resultAvatar: {
    width: 34,
    height: 34,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(90,178,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.30)',
  },
  resultAvatarText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  resultBody: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  resultUsername: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
    marginTop: 2,
  },
  resultAdd: {
    color: AppColors.accent,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  noResultsText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  selectedUsersBar: {
    height: 34,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 6,
  },
  userChip: {
    height: 30,
    maxWidth: 140,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.24)',
    backgroundColor: 'rgba(90,178,255,0.13)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userChipText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
    maxWidth: 110,
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    height: 50,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: AppColors.accentStrong,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryActionDisabled: {
    opacity: 0.55,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  secondaryAction: {
    height: 50,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(14,20,34,0.7)',
  },
  secondaryActionText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  error: {
    color: AppColors.danger,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
  },
});
