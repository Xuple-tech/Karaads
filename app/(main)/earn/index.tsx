import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BarChart3, FileText, Play, Trophy, Users, Wallet } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/app-theme';
import { useEarningsHistory, useEarningsQueue, useEarningsSummary, usePostEarningsHistory, useWithdrawalHistory } from '@/features/earnings/hooks';
import type { EarningHistoryItem, EarningSourceType, RewardedAd, WithdrawalHistoryItem } from '@/features/earnings/service';
import { useMonetizationStatus } from '@/features/monetization/hooks';
import { router } from '@/lib/navigation/router';

const currencySymbol = (code: string) => {
  if (code.toUpperCase() === 'NGN') return '₦';
  if (code.toUpperCase() === 'USD') return '$';
  return `${code.toUpperCase()} `;
};

const money = (value: number, currency = 'NGN') =>
  `${currencySymbol(currency)}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)}`;

const formatHistoryDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function EarnScreen() {
  const insets = useSafeAreaInsets();
  const summary = useEarningsSummary();
  const monetization = useMonetizationStatus();
  const historyQuery = useEarningsHistory();
  const postEarningsQuery = usePostEarningsHistory();
  const withdrawalsQuery = useWithdrawalHistory();
  const queue = useEarningsQueue(true);
  const data = summary.data ?? {
    currency: 'NGN',
    availableBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingWithdrawal: 0,
    today: 0,
    week: 0,
    month: 0,
    adsWatched: 0,
    adsCompleted: 0,
    avgPerAd: 0,
    adsAvailable: 0,
    postEarnings: 0,
    postsEarned: 0,
    avgPerPost: 0,
  };

  const combinedHistoryItems = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const displayData = data;

  const history = useMemo(() => {
    const rows = combinedHistoryItems;
    return rows.slice(0, 8).map((item) => ({
      id: item.id,
      title: item.sourceType === 'ad' && item.title === 'Earning' ? 'Ad watch reward' : item.sourceType === 'post' && item.title === 'Earning' ? 'Post earning' : item.title,
      meta: describeEarning(item),
      amount: item.amount,
      currency: item.currency,
      icon: iconForHistory(item),
      date: formatHistoryDate(item.createdAt),
    }));
  }, [combinedHistoryItems]);

  const earningBreakdown = useMemo(() => buildEarningBreakdown(combinedHistoryItems), [combinedHistoryItems]);
  const postEarningItems = useMemo(() => {
    // Prefer the dedicated per-post endpoint; fall back to post-tagged rows from
    // the generic history feed if it's unavailable.
    const dedicated = postEarningsQuery.data ?? [];
    if (dedicated.length) return dedicated;
    return combinedHistoryItems.filter((item) => item.sourceType === 'post');
  }, [combinedHistoryItems, postEarningsQuery.data]);
  const postEarnings = useMemo(
    () => buildPostEarningRows(postEarningItems, displayData.postEarnings, displayData.postsEarned, displayData.currency),
    [postEarningItems, displayData.currency, displayData.postEarnings, displayData.postsEarned],
  );
  const postEarningsTotal = useMemo(
    () => Math.max(displayData.postEarnings, postEarnings.reduce((sum, item) => sum + item.amount, 0)),
    [displayData.postEarnings, postEarnings],
  );

  const watched = displayData.adsWatched || displayData.adsCompleted;
  const queuedAds = queue.data?.ads ?? [];
  const withdrawals = useMemo(() => withdrawalsQuery.data ?? [], [withdrawalsQuery.data]);
  const totalWithdrawnFromRecords = useMemo(
    () => withdrawals.reduce((sum, item) => sum + item.amount, 0),
    [withdrawals],
  );
  const displayTotalWithdrawn = Math.max(displayData.pendingWithdrawal, displayData.totalWithdrawn, totalWithdrawnFromRecords);
  const isLoading = summary.isLoading || historyQuery.isLoading || queue.isLoading || withdrawalsQuery.isLoading;
  const isRefreshing = summary.isRefetching || historyQuery.isRefetching || queue.isRefetching || withdrawalsQuery.isRefetching;
  const summaryRefetch = summary.refetch;
  const historyRefetch = historyQuery.refetch;
  const postEarningsRefetch = postEarningsQuery.refetch;
  const withdrawalsRefetch = withdrawalsQuery.refetch;
  const queueRefetch = queue.refetch;
  const refreshLiveData = useCallback(() => {
    Promise.all([
      summaryRefetch(),
      historyRefetch(),
      postEarningsRefetch(),
      withdrawalsRefetch(),
      queueRefetch(),
    ]).catch(() => undefined);
  }, [historyRefetch, postEarningsRefetch, queueRefetch, summaryRefetch, withdrawalsRefetch]);
  useFocusEffect(
    useCallback(() => {
      refreshLiveData();
    }, [refreshLiveData]),
  );
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={AppColors.accent} refreshing={isRefreshing} onRefresh={refreshLiveData} />}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 116 }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backBtn} onPress={goBack}>
              <ArrowLeft size={20} color={AppColors.white} />
            </Pressable>
            <View style={styles.brandRow}>
              <Text style={styles.brandBlue}>Kara</Text>
              <Text style={styles.brandWhite}>Earn</Text>
            </View>
          </View>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{summary.isFetching ? 'Syncing Live' : 'Earning Active'}</Text>
          </View>
        </View>

        {monetization.data ? (
          <View style={[styles.activePill, styles.monetizationPill, !monetization.data.eligible && styles.monetizationPillMuted]}>
            <Text style={styles.activeText}>
              {monetization.data.eligible ? 'Monetization: Eligible' : monetization.data.reason ?? 'Monetization: Not yet eligible'}
            </Text>
          </View>
        ) : null}

        <LinearGradient colors={['#0C526E', '#17306C', '#431B76']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroLabel}>AVAILABLE BALANCE</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{money(displayData.availableBalance, displayData.currency)}</Text>
            <Text style={styles.currency}>{displayData.currency.toUpperCase()}</Text>
          </View>
          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.pendingLabel}>TOTAL WITHDRAWN</Text>
              <Text style={styles.pendingValue}>{money(displayTotalWithdrawn, displayData.currency)}</Text>
            </View>
            <Pressable style={styles.cashOutBtn} onPress={() => router.push('EarningsWithdraw')}>
              <Text style={styles.cashOutText}>Cash Out</Text>
              <Wallet size={15} color="#07111F" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard icon={<Play size={24} fill={AppColors.white} color={AppColors.white} />} value={String(watched)} label="ADS WATCHED" />
          <StatCard icon={<BarChart3 size={25} color="#F97316" />} value={money(displayData.week, displayData.currency)} label="THIS WEEK" />
          <StatCard icon={<Trophy size={25} color="#FFC928" fill="#FFC928" />} value={money(displayData.totalEarned, displayData.currency)} label="TOTAL EARNED" />
        </View>

        <View style={styles.watchSection}>
          <View style={styles.watchHeader}>
            <View>
              <Text style={styles.sectionTitleNoMargin}>Watch Ads to Earn</Text>
              <Text style={styles.watchMeta}>{queue.isFetching ? 'Loading live ads...' : `${queue.data?.count ?? queuedAds.length} ads available`}</Text>
            </View>
            <Pressable style={styles.refreshBtn} onPress={() => queue.refetch().catch(() => undefined)}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>

          {queuedAds.length > 0 ? (
            <View style={styles.adList}>
              {queuedAds.slice(0, 5).map((ad) => (
                <AdRow key={ad.deliveryId || ad.signature || ad.title} ad={ad} currency={displayData.currency} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyTitle}>{queue.isLoading ? 'Loading available ads...' : 'No ads available right now'}</Text>
              <Text style={styles.emptyMeta}>
                {queue.isLoading ? 'Fetching rewarded ads from the database.' : 'When the backend returns rewarded ads, they will show here for users to watch and earn.'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.earningTypes}>
          <Text style={styles.sectionTitleNoMargin}>Earning Types</Text>
          <View style={styles.typeGrid}>
            {earningBreakdown.map((item) => (
              <EarningTypeCard key={item.sourceType} item={item} currency={displayData.currency} />
            ))}
          </View>
        </View>

        <View style={styles.postEarningsSection}>
          <View style={styles.watchHeader}>
            <View>
              <Text style={styles.sectionTitleNoMargin}>Post Earnings</Text>
              <Text style={styles.watchMeta}>{money(postEarningsTotal, displayData.currency)} earned from posts</Text>
            </View>
            <View style={styles.postEarningsBadge}>
              <Text style={styles.postEarningsBadgeText}>{displayData.postsEarned || postEarnings.length} posts</Text>
            </View>
          </View>
          {postEarnings.length > 0 ? (
            <View style={styles.historyList}>
              {postEarnings.slice(0, 5).map((item) => (
                <PostEarningRow key={item.id} item={item} currency={item.currency ?? displayData.currency} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyTitle}>{historyQuery.isLoading ? 'Loading post earnings...' : 'No post earnings yet'}</Text>
              <Text style={styles.emptyMeta}>
                {historyQuery.isLoading ? 'Checking your post reward records.' : 'When the website/backend credits a post reward, it will show here.'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Earning History</Text>
        <View style={styles.historyList}>
          {history.length > 0 ? (
            history.map((item) => (
              <HistoryRow key={item.id} item={item} currency={item.currency ?? displayData.currency} />
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyTitle}>{isLoading ? 'Loading live earnings...' : 'No earning history yet'}</Text>
              <Text style={styles.emptyMeta}>
                {isLoading ? 'Fetching your wallet and earning records from the database.' : 'When the database returns earning transactions, they will show here.'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Withdrawn Money</Text>
        <View style={styles.historyList}>
          {withdrawals.length > 0 ? (
            withdrawals.map((item) => (
              <WithdrawalRow key={item.id} item={item} currency={item.currency ?? displayData.currency} />
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyTitle}>{withdrawalsQuery.isLoading ? 'Loading withdrawals...' : 'No withdrawals yet'}</Text>
              <Text style={styles.emptyMeta}>
                {withdrawalsQuery.isLoading ? 'Fetching withdrawal records from the database.' : 'All money the user withdraws will show here.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const iconForHistory = (item: EarningHistoryItem) => {
  if (item.sourceType === 'ad') return '▶';
  if (item.sourceType === 'post') return '▣';
  if (item.sourceType === 'engagement') return '↗';
  if (item.sourceType === 'referral') return '+';
  if (item.sourceType === 'bonus') return '★';
  const text = `${item.title} ${item.description ?? ''} ${item.type ?? ''}`.toLowerCase();
  if (text.includes('shoe') || text.includes('nike')) return '👟';
  if (text.includes('phone') || text.includes('apple')) return '🍎';
  if (text.includes('video') || text.includes('movie')) return '🎬';
  return '🎯';
};

const sourceLabels: Record<EarningSourceType, string> = {
  ad: 'Ad watch',
  post: 'Post earning',
  engagement: 'Engagement',
  referral: 'Referral',
  bonus: 'Bonus',
  other: 'Other earning',
};

const sourceDescriptions: Record<EarningSourceType, string> = {
  ad: 'Earned when the user watches a rewarded ad.',
  post: 'Earned from a post or content reward.',
  engagement: 'Earned from views, likes, comments, shares, or saves.',
  referral: 'Earned from inviting another user.',
  bonus: 'Extra reward from a campaign or promo.',
  other: 'Earned from wallet activity returned by the database.',
};

const describeEarning = (item: EarningHistoryItem) => {
  const label = sourceLabels[item.sourceType];
  const detail = item.description && item.description !== item.type ? item.description : sourceDescriptions[item.sourceType];
  return `${label} • ${detail}`;
};

const buildEarningBreakdown = (items: EarningHistoryItem[]) => {
  const totals = items.reduce<Record<EarningSourceType, { amount: number; count: number }>>(
    (acc, item) => {
      acc[item.sourceType].amount += item.amount;
      acc[item.sourceType].count += 1;
      return acc;
    },
    {
      ad: { amount: 0, count: 0 },
      post: { amount: 0, count: 0 },
      engagement: { amount: 0, count: 0 },
      referral: { amount: 0, count: 0 },
      bonus: { amount: 0, count: 0 },
      other: { amount: 0, count: 0 },
    },
  );

  const primaryTypes: EarningSourceType[] = ['ad', 'post', 'engagement'];
  const activeExtraTypes = (Object.keys(totals) as EarningSourceType[])
    .filter((sourceType) => !primaryTypes.includes(sourceType) && totals[sourceType].count > 0);

  return [...primaryTypes, ...activeExtraTypes].map((sourceType) => ({
    sourceType,
    title: sourceLabels[sourceType],
    description: sourceDescriptions[sourceType],
    amount: totals[sourceType].amount,
    count: totals[sourceType].count,
  }));
};

type PostEarningGroup = {
  id: string;
  title: string;
  amount: number;
  currency?: string;
  count: number;
  lastEarnedAt?: string;
};

const buildPostEarningRows = (
  items: EarningHistoryItem[],
  summaryAmount = 0,
  summaryCount = 0,
  summaryCurrency = 'NGN',
): PostEarningGroup[] => {
  const groups = new Map<string, PostEarningGroup>();

  items
    .filter((item) => item.sourceType === 'post')
    .forEach((item) => {
      const key = item.postId ?? item.title ?? 'post-total';
      const existing = groups.get(key);
      const title = item.title === 'Earning' ? 'Post earning' : item.title;
      const lastEarnedAt = existing?.lastEarnedAt && item.createdAt
        ? new Date(existing.lastEarnedAt).getTime() > new Date(item.createdAt).getTime()
          ? existing.lastEarnedAt
          : item.createdAt
        : existing?.lastEarnedAt ?? item.createdAt;

      groups.set(key, {
        id: key,
        title: existing?.title ?? title,
        amount: (existing?.amount ?? 0) + item.amount,
        currency: existing?.currency ?? item.currency,
        count: (existing?.count ?? 0) + 1,
        lastEarnedAt,
      });
    });

  const rows = [...groups.values()].sort((a, b) => b.amount - a.amount);

  if (rows.length === 0 && summaryAmount > 0) {
    return [{
      id: 'post-total',
      title: 'Post earnings',
      amount: summaryAmount,
      currency: summaryCurrency,
      count: summaryCount || 1,
    }];
  }

  return rows;
};

const iconForSource = (sourceType: EarningSourceType) => {
  if (sourceType === 'ad') return <Play size={18} color={AppColors.white} fill={AppColors.white} />;
  if (sourceType === 'post') return <FileText size={18} color="#17CFFF" />;
  if (sourceType === 'engagement') return <Users size={18} color="#FFC928" />;
  return <Trophy size={18} color="#FFC928" />;
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <View style={styles.statCard}>
    {icon}
    <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const EarningTypeCard = ({
  item,
  currency,
}: {
  item: { sourceType: EarningSourceType; title: string; description: string; amount: number; count: number };
  currency: string;
}) => (
  <View style={styles.typeCard}>
    <View style={styles.typeIcon}>{iconForSource(item.sourceType)}</View>
    <View style={styles.typeBody}>
      <Text style={styles.typeTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.typeDescription} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.typeCount}>{item.count > 0 ? `${item.count} records` : 'Waiting for database records'}</Text>
    </View>
    <Text style={styles.typeAmount}>{money(item.amount, currency)}</Text>
  </View>
);

const AdRow = ({ ad, currency }: { ad: RewardedAd; currency: string }) => {
  const openAd = () => {
    const url = ad.targetUrl || ad.mediaUrl;
    if (url) Linking.openURL(url).catch(() => undefined);
  };
  return (
    <View style={styles.adRow}>
      <View style={styles.adPlay}>
        <Play size={18} color={AppColors.white} fill={AppColors.white} />
      </View>
      <View style={styles.adBody}>
        <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
        <Text style={styles.adMeta} numberOfLines={1}>
          {ad.adType ? `${titleCase(ad.adType)} ad • ` : ''}{ad.requiredViewSeconds || ad.duration || 0}s required {ad.mediaType ? `• ${ad.mediaType}` : ''}
        </Text>
      </View>
      <View style={styles.adActionWrap}>
        <Text style={styles.adReward}>+{money(ad.reward, currency)}</Text>
        <Pressable style={[styles.watchBtn, !ad.targetUrl && !ad.mediaUrl ? styles.watchBtnDisabled : null]} onPress={openAd} disabled={!ad.targetUrl && !ad.mediaUrl}>
          <Text style={styles.watchBtnText}>Watch</Text>
        </Pressable>
      </View>
    </View>
  );
};

const HistoryRow = ({
  item,
  currency,
}: {
  item: { title: string; meta: string; amount: number; icon: string; date: string };
  currency: string;
}) => (
  <View style={styles.historyRow}>
    <View style={styles.historyIcon}>
      <Text style={styles.historyEmoji}>{item.icon}</Text>
    </View>
    <View style={styles.historyBody}>
      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.historyMeta} numberOfLines={1}>{item.meta}</Text>
    </View>
    <View style={styles.historyAmountWrap}>
      <Text style={styles.historyAmount}>+{money(item.amount, currency)}</Text>
      <Text style={styles.historyTime}>{item.date}</Text>
    </View>
  </View>
);

const PostEarningRow = ({ item, currency }: { item: PostEarningGroup; currency: string }) => (
  <View style={styles.historyRow}>
    <View style={styles.postEarningIcon}>
      <FileText size={20} color="#17CFFF" />
    </View>
    <View style={styles.historyBody}>
      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.historyMeta} numberOfLines={1}>
        {item.count} reward {item.count === 1 ? 'record' : 'records'}{item.lastEarnedAt ? ` • ${formatHistoryDate(item.lastEarnedAt)}` : ''}
      </Text>
    </View>
    <View style={styles.historyAmountWrap}>
      <Text style={styles.historyAmount}>+{money(item.amount, currency)}</Text>
      <Text style={styles.historyTime}>Post</Text>
    </View>
  </View>
);

const WithdrawalRow = ({ item, currency }: { item: WithdrawalHistoryItem; currency: string }) => {
  const meta = [item.bankName, item.accountNumber ? `••${item.accountNumber.slice(-4)}` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <View style={styles.historyRow}>
      <View style={styles.withdrawIcon}>
        <Wallet size={20} color="#17CFFF" />
      </View>
      <View style={styles.historyBody}>
        <Text style={styles.historyTitle} numberOfLines={1}>{item.status ? `${titleCase(item.status)} withdrawal` : 'Withdrawal'}</Text>
        <Text style={styles.historyMeta} numberOfLines={1}>{meta || 'Cash out request'}</Text>
      </View>
      <View style={styles.historyAmountWrap}>
        <Text style={styles.withdrawAmount}>-{money(item.amount, currency)}</Text>
        <Text style={styles.historyTime}>{formatHistoryDate(item.createdAt)}</Text>
      </View>
    </View>
  );
};

const titleCase = (value: string) =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    paddingHorizontal: 32,
    gap: 22,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandBlue: {
    color: '#36A5FF',
    fontSize: 25,
    lineHeight: 30,
    fontFamily: undefined, fontWeight: '800',
  },
  brandWhite: {
    color: AppColors.white,
    fontSize: 25,
    lineHeight: 30,
    fontFamily: undefined, fontWeight: '800',
  },
  activePill: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#18E68E',
  },
  activeText: {
    color: '#18E68E',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  monetizationPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  monetizationPillMuted: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroCard: {
    minHeight: 186,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(98,176,255,0.26)',
    paddingHorizontal: 26,
    paddingVertical: 26,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    letterSpacing: 1.2,
    fontFamily: undefined, fontWeight: '800',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    color: AppColors.white,
    fontSize: 43,
    lineHeight: 49,
    fontFamily: undefined, fontWeight: '800',
  },
  currency: {
    color: '#17E7FF',
    fontSize: 12,
    lineHeight: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  pendingLabel: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 10,
    letterSpacing: 1.1,
    fontFamily: undefined, fontWeight: '800',
  },
  pendingValue: {
    marginTop: 6,
    color: '#13E8FF',
    fontSize: 17,
    fontFamily: undefined, fontWeight: '800',
  },
  cashOutBtn: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#17CFFF',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cashOutText: {
    color: '#06101E',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 11,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    marginTop: 9,
    color: AppColors.white,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '800',
  },
  statLabel: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    fontFamily: undefined, fontWeight: '800',
  },
  earningTypes: {
    gap: 12,
  },
  postEarningsSection: {
    gap: 12,
  },
  postEarningsBadge: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.28)',
    backgroundColor: 'rgba(23,207,255,0.10)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postEarningsBadgeText: {
    color: '#17CFFF',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  typeGrid: {
    gap: 10,
  },
  typeCard: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.24)',
    backgroundColor: 'rgba(23,207,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBody: {
    flex: 1,
    minWidth: 0,
  },
  typeTitle: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  typeDescription: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.54)',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: undefined, fontWeight: '600',
  },
  typeCount: {
    marginTop: 4,
    color: 'rgba(23,207,255,0.82)',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  typeAmount: {
    color: '#13E8FF',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 10,
    color: AppColors.white,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  sectionTitleNoMargin: {
    color: AppColors.white,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  watchSection: {
    gap: 12,
  },
  watchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  watchMeta: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  refreshBtn: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.28)',
    backgroundColor: 'rgba(23,207,255,0.10)',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#17CFFF',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  adList: {
    gap: 11,
  },
  adRow: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.075)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adPlay: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(23,207,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBody: {
    flex: 1,
    minWidth: 0,
  },
  adTitle: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  adMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  adActionWrap: {
    alignItems: 'flex-end',
    gap: 6,
  },
  adReward: {
    color: '#13E8FF',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  watchBtn: {
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: '#17CFFF',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchBtnDisabled: {
    opacity: 0.45,
  },
  watchBtnText: {
    color: '#06101E',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  historyList: {
    gap: 11,
  },
  historyRow: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.075)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(109,89,180,0.48)',
    backgroundColor: 'rgba(111,84,179,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmoji: {
    fontSize: 23,
  },
  withdrawIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.34)',
    backgroundColor: 'rgba(23,207,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postEarningIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.34)',
    backgroundColor: 'rgba(23,207,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBody: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  historyMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  historyAmountWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyAmount: {
    color: '#13E8FF',
    fontSize: 15,
    lineHeight: 19,
    fontFamily: undefined, fontWeight: '800',
  },
  withdrawAmount: {
    color: '#FCA5A5',
    fontSize: 15,
    lineHeight: 19,
    fontFamily: undefined, fontWeight: '800',
  },
  historyTime: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    fontFamily: undefined, fontWeight: '700',
  },
  emptyHistory: {
    minHeight: 116,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
  emptyMeta: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: undefined, fontWeight: '600',
  },
});
