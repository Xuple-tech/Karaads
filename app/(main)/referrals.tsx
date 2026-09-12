import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Copy, Gift, Share2, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useRegisterReferralCode, useReferralStats } from '@/features/referrals/hooks';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const currencySymbol = (code: string) => (code.toUpperCase() === 'NGN' ? '₦' : code.toUpperCase() === 'USD' ? '$' : `${code.toUpperCase()} `);

export default function ReferralsScreen() {
  const insets = useSafeAreaInsets();
  const stats = useReferralStats();
  const registerCode = useRegisterReferralCode();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const data = stats.data;
  const registerError = registerCode.error ? getErrorMessage(registerCode.error) : null;

  const copyLink = async () => {
    if (!data?.shareLink) return;
    await Clipboard.setStringAsync(data.shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (!data?.shareLink) return;
    try {
      await Share.share({ message: `Join me on KaraAds! ${data.shareLink}` });
    } catch {
      // user dismissed the share sheet
    }
  };

  const submitCode = async () => {
    setRegisterSuccess(false);
    try {
      await registerCode.mutateAsync(inputCode);
      setInputCode('');
      setRegisterSuccess(true);
    } catch {
      // error surfaced via registerError
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={AppColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Referrals</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={AppColors.accent} refreshing={stats.isRefetching} onRefresh={() => stats.refetch()} />}>
        <LinearGradient colors={AppGradients.accentBlue} style={styles.heroCard}>
          <Gift size={26} color={AppColors.white} />
          <Text style={styles.heroTitle}>Invite friends, earn together</Text>
          <Text style={styles.heroBody}>Share your link. When people you invite join KaraAds, you both earn.</Text>
        </LinearGradient>

        {stats.isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={AppColors.accent} />
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={18} color={AppColors.accent} />
              <Text style={styles.statValue}>{data?.referredCount ?? 0}</Text>
              <Text style={styles.statLabel}>Invited</Text>
            </View>
            <View style={styles.statCard}>
              <Check size={18} color={AppColors.success} />
              <Text style={styles.statValue}>{data?.completedCount ?? 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Gift size={18} color={AppColors.warning} />
              <Text style={styles.statValue}>
                {currencySymbol(data?.currency ?? 'NGN')}
                {(data?.totalEarned ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>
        )}

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <Text style={styles.cardTitle}>Your referral link</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>
              {data?.shareLink || 'Loading your link...'}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={copyLink} disabled={!data?.shareLink}>
              <Copy size={15} color={AppColors.accent} />
              <Text style={styles.actionText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={shareLink} disabled={!data?.shareLink}>
              <Share2 size={15} color={AppColors.white} />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Share</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <Text style={styles.cardTitle}>Have a referral code?</Text>
          <Text style={styles.cardBody}>Enter a friend&apos;s code to link your accounts.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter code"
            placeholderTextColor={AppColors.textSecondary}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="none"
          />
          <Pressable style={styles.submitBtn} onPress={submitCode} disabled={registerCode.isPending || !inputCode.trim()}>
            {registerCode.isPending ? (
              <ActivityIndicator color={AppColors.white} size="small" />
            ) : (
              <Text style={styles.submitText}>Apply code</Text>
            )}
          </Pressable>
          {registerSuccess ? <Text style={styles.successText}>Referral code applied.</Text> : null}
          {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    fontSize: 20,
    fontWeight: '800',
  },
  spacer: {
    width: 42,
    height: 42,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  heroCard: {
    borderRadius: AppRadii.lg,
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  heroBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.18)',
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  linkRow: {
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkText: {
    color: AppColors.textPrimary,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.25)',
    backgroundColor: AppColors.surfaceMuted,
  },
  actionBtnPrimary: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  actionText: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextPrimary: {
    color: AppColors.white,
  },
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
  submitBtn: {
    minHeight: 46,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  successText: {
    color: AppColors.success,
    fontSize: 12,
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});
