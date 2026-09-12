import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  DollarSign,
  Eye,
  MessageCircle,
  MousePointer2,
  Play,
  Plus,
  Search,
  Users,
  WalletCards,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';
import { AppColors } from '@/constants/app-theme';
import { useAdsDashboard } from '@/features/ads/hooks';
import type { AdsCampaign } from '@/features/ads/service';
import { useAuthStore } from '@/features/auth/store';
import { useFeed } from '@/features/feed/hooks';
import { router } from '@/lib/navigation/router';
import type { Post } from '@/lib/types/domain';
import { getDisplayPost, getPrimaryMedia } from '@/lib/utils/post';

const money = (amount: number) => `₦${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`;
const compact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};
const asNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};
const readNumber = (post: Post, keys: string[]) => {
  const record = post as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = asNumber(record[key]);
    if (value > 0) return value;
  }
  return 0;
};
const readString = (post: Post, keys: string[], fallback = '') => {
  const record = post as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
};
const isCampaignPost = (post: Post) => {
  const type = `${post.type ?? ''}`.toLowerCase();
  const record = post as unknown as Record<string, unknown>;
  return (
    type === 'ad' ||
    type === 'sponsored' ||
    Boolean(record.is_sponsored ?? record.isSponsored ?? record.campaign_id ?? record.campaignId ?? record.ad_id ?? record.adId)
  );
};
const buildWeekReach = (posts: Post[]) => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const dayKey = day.toISOString().slice(0, 10);
    const value = posts.reduce((sum, post) => {
      const postDay = post.created_at ? new Date(post.created_at).toISOString().slice(0, 10) : '';
      return postDay === dayKey ? sum + (post.view_count ?? 0) : sum;
    }, 0);
    return {
      day: day.toLocaleDateString(undefined, { weekday: 'short' }),
      value,
    };
  });
};

type CampaignDisplay = {
  id: string;
  title: string;
  status: string;
  budget: number;
  spent: number;
  reach: number;
  todayReach: number;
  clicks: number;
  thumbnailUrl?: string;
};

const campaignFromPost = (post: Post): CampaignDisplay => {
  const media = getPrimaryMedia(post);
  const spent = readNumber(post, ['amount_spent', 'spent', 'ad_spend', 'campaign_spent']);
  const budget = readNumber(post, ['total_budget', 'budget', 'ad_budget', 'campaign_budget']);
  return {
    id: post.id,
    title: readString(post, ['campaign_name', 'ad_title', 'title'], post.content?.trim() || 'Campaign'),
    status: readString(post, ['campaign_status', 'ad_status', 'status'], 'ACTIVE').toUpperCase(),
    budget,
    spent,
    reach: post.view_count ?? 0,
    todayReach: readNumber(post, ['today_reach', 'reached_today', 'daily_reach']),
    clicks: readNumber(post, ['click_count', 'clicks', 'link_clicks', 'linkClicks']) + (post.comment_count ?? 0) + (post.repost_count ?? 0),
    thumbnailUrl: media?.thumbnail_url ?? media?.url ?? media?.path ?? '',
  };
};

const campaignFromBackend = (campaign: AdsCampaign): CampaignDisplay => ({
  id: campaign.id,
  title: campaign.title,
  status: campaign.status,
  budget: campaign.budget,
  spent: campaign.spent,
  reach: campaign.reach,
  todayReach: campaign.todayReach,
  clicks: campaign.clicks,
  thumbnailUrl: campaign.thumbnailUrl,
});

export default function AdsManagementScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const feed = useFeed();
  const adsDashboard = useAdsDashboard();

  const myPosts = (feed.data?.pages.flatMap((page) => page.posts) ?? [])
    .map(getDisplayPost)
    .filter((post) => post.user?.id && user?.id && post.user.id === user.id);
  const campaignPosts = myPosts.filter(isCampaignPost);
  const sourcePosts = campaignPosts.length > 0 ? campaignPosts : myPosts;
  const backendCampaigns = adsDashboard.data?.campaigns ?? [];
  const campaignRows = backendCampaigns.length > 0 ? backendCampaigns.map(campaignFromBackend) : campaignPosts.map(campaignFromPost);
  const fallbackWeekReach = buildWeekReach(sourcePosts);
  const backendWeekReach = adsDashboard.data?.weekReach ?? [];
  const weekReach = backendWeekReach.some((item) => item.value > 0) || backendCampaigns.length > 0 ? backendWeekReach : fallbackWeekReach;
  const totalReach = adsDashboard.data?.reach ?? sourcePosts.reduce((sum, post) => sum + (post.view_count ?? 0), 0);
  const clicks = adsDashboard.data?.clicks ?? sourcePosts.reduce(
    (sum, post) => sum + readNumber(post, ['click_count', 'clicks', 'link_clicks', 'linkClicks']) + (post.comment_count ?? 0) + (post.repost_count ?? 0),
    0,
  );
  const reachedToday = adsDashboard.data?.todayReach ?? weekReach[weekReach.length - 1]?.value ?? 0;
  const spent = adsDashboard.data?.amountSpent ?? sourcePosts.reduce((sum, post) => sum + readNumber(post, ['amount_spent', 'spent', 'ad_spend', 'campaign_spent']), 0);
  const totalBudget = adsDashboard.data?.totalBudget ?? sourcePosts.reduce((sum, post) => sum + readNumber(post, ['total_budget', 'budget', 'ad_budget', 'campaign_budget']), 0);
  const budgetLeft = Math.max(totalBudget - spent, 0);
  const budgetUsed = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const avgPerDay = weekReach.reduce((sum, item) => sum + item.value, 0) / weekReach.length;
  const gender = adsDashboard.data?.genderReach;
  const genderTotal = (gender?.male ?? 0) + (gender?.female ?? 0) + (gender?.notSet ?? 0);
  const genderBase = genderTotal > 0 ? genderTotal : totalReach;
  const genderNotSet = genderTotal > 0 ? gender?.notSet ?? 0 : totalReach;
  const percent = (value: number) => (genderBase > 0 ? Math.round((value / genderBase) * 100) : 0);

  const openCreateAds = () => router.push('AdsCreate');

  return (
    <SwipeTabsView>
      <View style={styles.container}>
        <View style={[styles.appHeader, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.roundIcon} onPress={() => router.push('Notifications')}>
            <Bell size={18} color={AppColors.textPrimary} />
            <View style={styles.noticeDot}>
              <Text style={styles.noticeText}>1</Text>
            </View>
          </Pressable>
          <Text style={styles.brand}>Karaads</Text>
          <Pressable style={styles.roundIcon} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
            <MessageCircle size={18} color={AppColors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.titleBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} stroke={AppColors.textPrimary} />
          </Pressable>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>KARA ADS MANAGER</Text>
          </View>
          <Pressable style={styles.createTopBtn} onPress={openCreateAds}>
            <Plus size={18} color={AppColors.white} />
            <Text style={styles.createTopText}>Create</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}>
          <LinearGradient colors={['#1151C8', '#2495F2', '#45CF50']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.performanceCard}>
            <View style={styles.performancePill}>
              <BarChart3 size={15} color="rgba(255,255,255,0.92)" />
              <Text style={styles.performancePillText}>PERFORMANCE</Text>
            </View>
            <Text style={styles.spentTitle}>{money(spent)} spent</Text>
            <Text style={styles.budgetMeta}>{money(budgetLeft)} remaining from {money(totalBudget)} total budget.</Text>
            <View style={styles.budgetGlass}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget used</Text>
                <Text style={styles.budgetPercent}>{budgetUsed}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${budgetUsed}%` }]} />
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetSmall}>{money(spent)} spent</Text>
                <Text style={styles.budgetSmall}>{money(budgetLeft)} left</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.metricGrid}>
            <Metric icon={<DollarSign size={17} color="#7CB7FF" />} label="AMOUNT SPENT" value={money(spent)} />
            <Metric icon={<Users size={17} color="#7CB7FF" />} label="PEOPLE REACHED TODAY" value={compact(reachedToday)} />
            <Metric icon={<Eye size={17} color="#7CB7FF" />} label="TOTAL REACH" value={compact(totalReach)} />
            <Metric icon={<MousePointer2 size={17} color="#7CB7FF" />} label="CLICKS" value={compact(clicks)} />
            <Metric icon={<WalletCards size={17} color="#7CB7FF" />} label="TOTAL BUDGET" value={money(totalBudget)} />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>REACH PER DAY</Text>
            <Text style={styles.panelTitle}>People reached this week</Text>
            <Text style={styles.panelText}>Daily unique people who saw your ads.</Text>
            <View style={styles.reachPill}>
              <Text style={styles.reachPillLabel}>7-DAY REACH</Text>
              <Text style={styles.reachPillValue}>{weekReach.reduce((sum, item) => sum + item.value, 0)}</Text>
            </View>
            <View style={styles.chartCard}>
              {weekReach.map((item) => (
                <View key={item.day} style={styles.barSlot}>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={['#227DFF', '#80C2FF']}
                      style={[styles.barFill, { height: `${Math.max(8, item.value * 40)}%` }]}
                    />
                  </View>
                  <Text style={styles.dayText}>{item.day}</Text>
                  <Text style={styles.dayValue}>{item.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniLabel}>WEEK SPEND</Text>
                <Text style={styles.miniValue}>{money(spent)}</Text>
              </View>
              <View style={styles.miniStat}>
                <Text style={styles.miniLabel}>AVG/DAY</Text>
                <Text style={styles.miniValue}>{avgPerDay.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <View>
                <Text style={styles.panelEyebrow}>AUDIENCE</Text>
                <Text style={styles.panelTitle}>Gender reach</Text>
              </View>
              <View style={styles.panelIcon}>
                <Users size={25} color={AppColors.white} />
              </View>
            </View>
            <View style={styles.genderCard}>
              <Text style={styles.genderLabel}>TOTAL PEOPLE REACHED</Text>
              <Text style={styles.genderTotal}>{compact(totalReach)}</Text>
              <GenderRow label="Male" value={`${compact(gender?.male ?? 0)} · ${percent(gender?.male ?? 0)}%`} width={`${percent(gender?.male ?? 0)}` as `${number}%`} />
              <GenderRow label="Female" value={`${compact(gender?.female ?? 0)} · ${percent(gender?.female ?? 0)}%`} width={`${percent(gender?.female ?? 0)}` as `${number}%`} />
              <GenderRow label="Not set" value={`${compact(genderNotSet)} · ${percent(genderNotSet)}%`} width={`${percent(genderNotSet)}` as `${number}%`} />
            </View>
            <Text style={styles.panelText}>If users have not selected gender, their reach is counted as Not set.</Text>
          </View>

          <View style={styles.campaignPanel}>
            <Text style={styles.campaignTitle}>Campaigns</Text>
            <Text style={styles.campaignSub}>Delivery, budget, reach and clicks like Ads Manager.</Text>
            <View style={styles.searchBox}>
              <Search size={20} color="rgba(255,255,255,0.45)" />
              <Text style={styles.searchPlaceholder}>Search ads</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {['All', 'Active', 'Review', 'Paused', 'Draft'].map((item, index) => (
                <View key={item} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
                  <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{item}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.campaignList}>
              {adsDashboard.isLoading ? (
                <Text style={styles.emptyCampaignText}>Loading campaign data...</Text>
              ) : campaignRows.length > 0 ? (
                campaignRows.map((campaign) => <CampaignRow key={campaign.id} campaign={campaign} />)
              ) : (
                <Text style={styles.emptyCampaignText}>No campaign data returned by the backend yet.</Text>
              )}
            </View>
          </View>
        </ScrollView>

      </View>
    </SwipeTabsView>
  );
}

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={styles.metricCard}>
    {icon}
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const GenderRow = ({ label, value, width }: { label: string; value: string; width: `${number}%` }) => (
  <View style={styles.genderRow}>
    <View style={styles.genderTop}>
      <Text style={styles.genderName}>{label}</Text>
      <Text style={styles.genderValue}>{value}</Text>
    </View>
    <View style={styles.genderTrack}>
      <View style={[styles.genderFill, { width }]} />
    </View>
  </View>
);

const CampaignRow = ({ campaign }: { campaign: CampaignDisplay }) => {
  const title = campaign.title;
  const reach = campaign.reach;
  const spent = campaign.spent;
  const budget = campaign.budget;
  const left = Math.max(budget - spent, 0);
  const todayReach = campaign.todayReach;
  const status = campaign.status;

  return (
    <View style={styles.campaignRow}>
      <View style={styles.campaignTopRow}>
        <View style={styles.thumb}>
          {campaign.thumbnailUrl ? <Image source={{ uri: campaign.thumbnailUrl }} style={styles.thumbImage} contentFit="cover" /> : <Text style={styles.thumbText}>Sponsored media unavailable</Text>}
        </View>
        <View style={styles.campaignMain}>
          <View style={styles.campaignNameRow}>
            <Text style={styles.campaignName} numberOfLines={1}>{title}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
          <Text style={styles.campaignMeta}>◎ {campaign.clicks} · {reach} reached · ▫ {money(spent)}</Text>
        </View>
        <Pressable style={styles.arrowBtn}>
          <ArrowRight size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <View style={styles.campaignStats}>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatLabel}>TODAY</Text>
          <Text style={styles.campaignStatValue}>{compact(todayReach)} reach</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatLabel}>SPENT</Text>
          <Text style={styles.campaignStatValue}>{money(spent)}</Text>
        </View>
        <View style={styles.campaignStat}>
          <Text style={styles.campaignStatLabel}>LEFT</Text>
          <Text style={styles.campaignStatValue}>{money(left)}</Text>
        </View>
      </View>
      <View style={styles.campaignActions}>
        <Pressable style={styles.resumeBtn}>
          <Play size={18} color="rgba(255,255,255,0.72)" />
          <Text style={styles.resumeText}>Resume</Text>
        </Pressable>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D15',
  },
  appHeader: {
    minHeight: 88,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#080E17',
  },
  roundIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: { color: '#07111F', fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  brand: {
    color: AppColors.white,
    fontSize: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  titleBar: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#090F18',
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCopy: { flex: 1, gap: 2 },
  eyebrow: {
    color: '#7CA7F7',
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: undefined, fontWeight: '800',
  },
  title: {
    color: AppColors.white,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: undefined, fontWeight: '800',
  },
  createTopBtn: {
    minWidth: 132,
    height: 54,
    borderRadius: 28,
    backgroundColor: '#1784FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createTopText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  performanceCard: {
    borderRadius: 30,
    padding: 24,
    gap: 16,
    overflow: 'hidden',
  },
  performancePill: {
    alignSelf: 'flex-start',
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  performancePillText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    letterSpacing: 4,
    fontFamily: undefined, fontWeight: '800',
  },
  spentTitle: {
    color: AppColors.white,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: undefined, fontWeight: '800',
  },
  budgetMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: undefined, fontWeight: '400',
  },
  budgetGlass: {
    borderRadius: 28,
    padding: 22,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  budgetLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 19, fontFamily: undefined, fontWeight: '400' },
  budgetPercent: { color: AppColors.white, fontSize: 21, fontFamily: undefined, fontWeight: '800' },
  progressTrack: {
    height: 17,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9,
    backgroundColor: AppColors.white,
  },
  budgetSmall: { color: 'rgba(255,255,255,0.62)', fontSize: 15, fontFamily: undefined, fontWeight: '400' },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '31.8%',
    minHeight: 118,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#151A20',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.1,
    fontFamily: undefined, fontWeight: '700',
  },
  metricValue: {
    color: AppColors.white,
    fontSize: 22,
    lineHeight: 27,
    fontFamily: undefined, fontWeight: '800',
  },
  panel: {
    borderRadius: 28,
    padding: 24,
    gap: 12,
    backgroundColor: '#151A1C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  panelEyebrow: {
    color: '#80B7FF',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: undefined, fontWeight: '800',
  },
  panelTitle: {
    color: AppColors.white,
    fontSize: 25,
    lineHeight: 31,
    fontFamily: undefined, fontWeight: '800',
  },
  panelText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: undefined, fontWeight: '400',
  },
  reachPill: {
    width: 150,
    minHeight: 86,
    borderRadius: 18,
    backgroundColor: 'rgba(31,103,210,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(48,132,255,0.45)',
    padding: 14,
    justifyContent: 'space-between',
  },
  reachPillLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: undefined, fontWeight: '700',
  },
  reachPillValue: {
    color: AppColors.white,
    fontSize: 26,
    textAlign: 'right',
    fontFamily: undefined, fontWeight: '800',
  },
  chartCard: {
    minHeight: 268,
    borderRadius: 26,
    backgroundColor: '#101215',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  barSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  barTrack: {
    width: '100%',
    maxWidth: 54,
    height: 176,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    minHeight: 16,
    borderRadius: 28,
  },
  dayText: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  dayValue: { color: 'rgba(255,255,255,0.32)', fontSize: 12, fontFamily: undefined, fontWeight: '400' },
  miniStats: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flex: 1,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    justifyContent: 'space-between',
  },
  miniLabel: { color: 'rgba(255,255,255,0.32)', fontSize: 12, letterSpacing: 1.2, fontFamily: undefined, fontWeight: '700' },
  miniValue: { color: AppColors.white, fontSize: 16, fontFamily: undefined, fontWeight: '800' },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  panelIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCard: {
    borderRadius: 22,
    backgroundColor: '#101215',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 24,
    gap: 16,
  },
  genderLabel: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: undefined, fontWeight: '700',
  },
  genderTotal: {
    color: AppColors.white,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: undefined, fontWeight: '800',
  },
  genderRow: { gap: 8 },
  genderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  genderName: { color: 'rgba(255,255,255,0.78)', fontSize: 15, fontFamily: undefined, fontWeight: '400' },
  genderValue: { color: 'rgba(255,255,255,0.42)', fontSize: 15, fontFamily: undefined, fontWeight: '400' },
  genderTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  genderFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  campaignPanel: {
    borderRadius: 28,
    backgroundColor: '#151A1C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    paddingTop: 22,
  },
  campaignTitle: {
    color: AppColors.white,
    fontSize: 25,
    fontFamily: undefined, fontWeight: '800',
    paddingHorizontal: 18,
  },
  campaignSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '400',
    paddingHorizontal: 18,
    marginTop: 4,
  },
  searchBox: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 18,
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchPlaceholder: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 18,
    fontFamily: undefined, fontWeight: '400',
  },
  filterRow: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
  },
  filterChip: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#1686FF',
  },
  filterText: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
  filterTextActive: {
    color: AppColors.white,
  },
  campaignList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 16,
  },
  emptyCampaignText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '400',
    paddingVertical: 14,
    textAlign: 'center',
  },
  campaignRow: {
    borderRadius: 22,
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  campaignTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#101215',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    lineHeight: 14,
    paddingHorizontal: 8,
    fontFamily: undefined, fontWeight: '700',
  },
  campaignMain: { flex: 1, gap: 5 },
  campaignNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  campaignName: {
    flex: 1,
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  statusPill: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
  },
  statusText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  campaignMeta: {
    color: 'rgba(255,255,255,0.34)',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '400',
  },
  arrowBtn: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignStats: {
    flexDirection: 'row',
    gap: 10,
  },
  campaignStat: {
    flex: 1,
    minHeight: 76,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  campaignStatLabel: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
    letterSpacing: 1.5,
    fontFamily: undefined, fontWeight: '700',
  },
  campaignStatValue: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resumeText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
  editBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(48,132,255,0.55)',
    backgroundColor: 'rgba(31,103,210,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: '#9FCBFF',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
});
