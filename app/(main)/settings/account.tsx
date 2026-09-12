import { ArrowLeft, ChevronRight, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { router } from '@/lib/navigation/router';

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  return (
    <SwipeStackView>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Account</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <UserRound size={18} color={AppColors.white} />
          </View>
          <View style={styles.meta}>
            <Text style={styles.name}>{user?.name ?? 'Your profile'}</Text>
            <Text style={styles.handle}>@{user?.username ?? 'you'}</Text>
          </View>
        </View>

        <Pressable
          style={styles.actionRow}
          onPress={() => {
            if (user?.username) {
              router.push('ProfileByUsername', { username: user.username });
            }
          }}>
          <Text style={styles.actionText}>Open public profile</Text>
          <ChevronRight size={16} color={AppColors.accent} />
        </Pressable>
      </View>
    </SwipeStackView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
  },
  meta: {
    gap: 3,
  },
  name: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  handle: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 14,
    minHeight: 58,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.2)',
    backgroundColor: AppColors.surface,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
