import { apiRequest } from '@/lib/api/http';
import { useAuthStore } from '@/features/auth/store';

export type EarningsSummary = {
  currency: string;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  today: number;
  week: number;
  month: number;
  adsWatched: number;
  adsCompleted: number;
  avgPerAd: number;
  adsAvailable: number;
  postEarnings: number;
  postsEarned: number;
  avgPerPost: number;
};

export type RewardedAd = {
  deliveryId: string;
  signature: string;
  sessionId?: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: string;
  duration: number;
  requiredViewSeconds: number;
  adType?: string;
  reward: number;
  targetUrl?: string;
  createdAt?: string;
  completedAt?: string;
  watchedAt?: string;
};

export type EarningSourceType = 'ad' | 'post' | 'engagement' | 'referral' | 'bonus' | 'other';

export type EarningHistoryItem = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  createdAt?: string;
  type?: string;
  sourceType: EarningSourceType;
  postId?: string;
  adId?: string;
};

export type WithdrawalBank = {
  code: string;
  name: string;
};

export type WithdrawalHistoryItem = {
  id: string;
  amount: number;
  currency?: string;
  status?: string;
  bankName?: string;
  accountNumber?: string;
  createdAt?: string;
};

export type WithdrawalInput = {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  narration?: string;
};

export type ResolvedBankAccount = {
  accountNumber: string;
  bankCode: string;
  accountName: string;
};

const asNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const asString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

const normalizeSummary = (value: unknown): EarningsSummary => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return {
    currency: asString(payload.currency, 'NGN'),
    availableBalance: asNumber(payload.available_balance ?? payload.availableBalance ?? payload.balance),
    totalEarned: asNumber(payload.total_earned ?? payload.totalEarned),
    totalWithdrawn: asNumber(payload.total_withdrawn ?? payload.totalWithdrawn),
    pendingWithdrawal: asNumber(payload.pending_withdrawal ?? payload.pending ?? payload.processing),
    today: asNumber(payload.today_earnings ?? payload.today_earned ?? payload.today),
    week: asNumber(payload.week_earnings ?? payload.week_earned ?? payload.week),
    month: asNumber(payload.month_earnings ?? payload.month),
    adsWatched: asNumber(payload.ads_watched ?? payload.adsWatched),
    adsCompleted: asNumber(payload.ads_completed ?? payload.adsCompleted),
    avgPerAd: asNumber(payload.average_earning_per_ad ?? payload.avg_per_ad ?? payload.avgPerAd),
    adsAvailable: asNumber(payload.ads_available ?? payload.adsAvailable ?? payload.ads_available_today),
    postEarnings: asNumber(payload.post_earnings ?? payload.postEarnings ?? payload.total_post_earnings ?? payload.totalPostEarnings),
    postsEarned: asNumber(payload.posts_earned ?? payload.postsEarned ?? payload.earning_posts_count ?? payload.post_count),
    avgPerPost: asNumber(payload.average_earning_per_post ?? payload.avg_per_post ?? payload.avgPerPost),
  };
};

const normalizeQueue = (value: unknown): { ads: RewardedAd[]; count: number } => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const adsInput = Array.isArray(payload.ads) ? payload.ads : [];
  const ads = adsInput.map((item) => {
    const ad = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      deliveryId: asString(ad.delivery_id ?? ad.deliveryId ?? ad.id),
      signature: asString(ad.signature),
      sessionId: asString(ad.session_id) || undefined,
      title: asString(ad.title, 'Rewarded Ad'),
      description: asString(ad.description) || undefined,
      mediaUrl: asString(ad.media_url) || undefined,
      mediaType: asString(ad.media_type) || undefined,
      duration: asNumber(ad.duration),
      requiredViewSeconds: asNumber(ad.required_view_seconds ?? ad.view_duration),
      adType: asString(ad.ad_type ?? ad.type) || undefined,
      reward: asNumber(ad.reward),
      targetUrl: asString(ad.target_url) || undefined,
      createdAt: asString(ad.created_at ?? ad.createdAt ?? ad.available_at ?? ad.availableAt) || undefined,
      completedAt: asString(ad.completed_at ?? ad.completedAt) || undefined,
      watchedAt: asString(ad.watched_at ?? ad.watchedAt ?? ad.viewed_at ?? ad.viewedAt) || undefined,
    };
  });
  return {
    ads,
    count: asNumber(payload.count) || ads.length,
  };
};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const classifyEarningSource = (
  row: Record<string, unknown>,
  title: string,
  description?: string,
  type?: string,
): EarningSourceType => {
  const sourceText = [
    type,
    row.source,
    row.source_type,
    row.sourceType,
    row.category,
    row.kind,
    row.reason,
    title,
    description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (row.ad_id || row.adId || row.delivery_id || row.deliveryId || sourceText.includes('ad') || sourceText.includes('sponsor') || sourceText.includes('watch')) {
    return 'ad';
  }
  if (row.post_id || row.postId || row.content_id || row.contentId || sourceText.includes('post') || sourceText.includes('moment') || sourceText.includes('content')) {
    return 'post';
  }
  if (sourceText.includes('view') || sourceText.includes('like') || sourceText.includes('comment') || sourceText.includes('share') || sourceText.includes('engage')) {
    return 'engagement';
  }
  if (sourceText.includes('refer') || sourceText.includes('invite')) {
    return 'referral';
  }
  if (sourceText.includes('bonus') || sourceText.includes('promo') || sourceText.includes('reward')) {
    return 'bonus';
  }
  return 'other';
};

const normalizeHistory = (value: unknown): EarningHistoryItem[] => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nestedData = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? (payload.data as Record<string, unknown>)
    : {};
  const nestedResult = payload.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
    ? (payload.result as Record<string, unknown>)
    : {};
  const items = [
    ...asArray(value),
    ...asArray(payload.history),
    ...asArray(payload.earnings),
    ...asArray(payload.ad_earnings),
    ...asArray(payload.adEarnings),
    ...asArray(payload.post_earnings),
    ...asArray(payload.postEarnings),
    ...asArray(payload.transactions),
    ...asArray(payload.items),
    ...asArray(payload.data),
    ...asArray(nestedData.history),
    ...asArray(nestedData.earnings),
    ...asArray(nestedData.ad_earnings),
    ...asArray(nestedData.adEarnings),
    ...asArray(nestedData.post_earnings),
    ...asArray(nestedData.postEarnings),
    ...asArray(nestedData.transactions),
    ...asArray(nestedData.items),
    ...asArray(nestedData.data),
    ...asArray(nestedResult.history),
    ...asArray(nestedResult.earnings),
    ...asArray(nestedResult.ad_earnings),
    ...asArray(nestedResult.adEarnings),
    ...asArray(nestedResult.post_earnings),
    ...asArray(nestedResult.postEarnings),
    ...asArray(nestedResult.transactions),
    ...asArray(nestedResult.items),
    ...asArray(nestedResult.data),
  ];
  const seen = new Set<string>();

  return items
    .map((item, index) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const amount = asNumber(row.amount ?? row.reward ?? row.earned_amount ?? row.earning);
      const createdAt = asString(row.created_at ?? row.createdAt ?? row.completed_at ?? row.completedAt ?? row.watched_at ?? row.watchedAt);
      const id = asString(row.id ?? row.earning_id ?? row.transaction_id ?? row.delivery_id, `${index}-${createdAt}-${amount}`);
      const rawType = asString(row.type ?? row.source ?? row.source_type ?? row.sourceType ?? row.category);
      const title = asString(row.title ?? row.ad_title ?? row.post_title ?? row.name ?? row.description, 'Earning');
      const description = asString(row.description ?? row.meta ?? rawType) || undefined;
      const sourceType = classifyEarningSource(row, title, description, rawType);
      return {
        id,
        title,
        description,
        amount,
        currency: asString(row.currency) || undefined,
        createdAt: createdAt || undefined,
        type: rawType || undefined,
        sourceType,
        postId: asString(row.post_id ?? row.postId ?? row.content_id ?? row.contentId) || undefined,
        adId: asString(row.ad_id ?? row.adId ?? row.delivery_id ?? row.deliveryId) || undefined,
      };
    })
    .filter((item) => item.amount > 0)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
};

const normalizeBanks = (value: unknown): WithdrawalBank[] => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nestedData = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? (payload.data as Record<string, unknown>)
    : {};
  const nestedResult = payload.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
    ? (payload.result as Record<string, unknown>)
    : {};
  const banksRaw = [
    ...asArray(value),
    ...asArray(payload.banks),
    ...asArray(payload.data),
    ...asArray(payload.results),
    ...asArray(payload.items),
    ...asArray(nestedData.banks),
    ...asArray(nestedData.data),
    ...asArray(nestedData.results),
    ...asArray(nestedData.items),
    ...asArray(nestedResult.banks),
    ...asArray(nestedResult.data),
    ...asArray(nestedResult.results),
  ];
  const seen = new Set<string>();
  return banksRaw
    .map((item) => {
      const bank = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const code = asString(bank.code ?? bank.bank_code ?? bank.id);
      const name = asString(bank.name ?? bank.bank_name ?? bank.label);
      if (!code || !name) return null;
      return { code, name };
    })
    .filter((item): item is WithdrawalBank => Boolean(item))
    .filter((bank) => {
      if (seen.has(bank.code)) return false;
      seen.add(bank.code);
      return true;
    });
};

// Paystack-compatible fallback codes used by the Kwati bank resolver. The live
// /earnings/banks response is merged over this list so newly supported banks
// appear automatically while the selector remains useful during API outages.
const FALLBACK_NIGERIAN_BANKS: WithdrawalBank[] = [
  { code: '999992', name: 'OPay' },
  { code: '999991', name: 'PalmPay' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '51318', name: 'FairMoney Microfinance Bank' },
  { code: '565', name: 'Carbon' },
  { code: '100002', name: 'Paga' },
  { code: '51310', name: 'Sparkle Microfinance Bank' },
  { code: '566', name: 'VFD Microfinance Bank' },
  { code: '125', name: 'Rubies Microfinance Bank' },
  { code: '50304', name: 'Mint Microfinance Bank' },
  { code: '100022', name: 'GoMoney' },
  { code: '100032', name: 'NowNow' },
  { code: '120003', name: 'MTN MoMo PSB' },
  { code: '120001', name: '9 Payment Service Bank' },
  { code: '120002', name: 'Hope Payment Service Bank' },
  { code: '120004', name: 'SmartCash Payment Service Bank' },
  { code: '946', name: 'MoneyMaster Payment Service Bank' },
  { code: '00716', name: 'Pocket App' },
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '00103', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '303', name: 'Lotus Bank' },
  { code: '561', name: 'NOVA Bank' },
  { code: '107', name: 'Optimus Bank' },
  { code: '104', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '105', name: 'PremiumTrust Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'SunTrust Bank' },
  { code: '102', name: 'Titan Trust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

const mergeBanks = (live: WithdrawalBank[]): WithdrawalBank[] => {
  const byCode = new Map<string, WithdrawalBank>();
  FALLBACK_NIGERIAN_BANKS.forEach((bank) => byCode.set(bank.code, bank));
  live.forEach((bank) => byCode.set(bank.code, bank));
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const normalizeResolvedBankAccount = (value: unknown): ResolvedBankAccount => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nested = payload.data && typeof payload.data === 'object'
    ? (payload.data as Record<string, unknown>)
    : payload;
  const accountName = asString(nested.account_name ?? nested.accountName);
  if (!accountName) throw new Error('The bank could not verify this account number.');
  return {
    accountNumber: asString(nested.account_number ?? nested.accountNumber),
    bankCode: asString(nested.bank_code ?? nested.bankCode),
    accountName,
  };
};

const normalizeWithdrawals = (value: unknown): WithdrawalHistoryItem[] => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nestedData = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? (payload.data as Record<string, unknown>)
    : {};
  const nestedResult = payload.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
    ? (payload.result as Record<string, unknown>)
    : {};
  const items = [
    ...asArray(value),
    ...asArray(payload.withdrawals),
    ...asArray(payload.payouts),
    ...asArray(payload.transactions),
    ...asArray(payload.items),
    ...asArray(payload.records),
    ...asArray(payload.data),
    ...asArray(nestedData.withdrawals),
    ...asArray(nestedData.payouts),
    ...asArray(nestedData.transactions),
    ...asArray(nestedData.items),
    ...asArray(nestedData.records),
    ...asArray(nestedData.data),
    ...asArray(nestedResult.withdrawals),
    ...asArray(nestedResult.payouts),
    ...asArray(nestedResult.transactions),
    ...asArray(nestedResult.items),
    ...asArray(nestedResult.records),
    ...asArray(nestedResult.data),
  ];
  const seen = new Set<string>();

  return items
    .map((item, index) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const amount = Math.abs(
        asNumber(
          row.amount ??
            row.withdrawal_amount ??
            row.withdrawalAmount ??
            row.payout_amount ??
            row.payoutAmount ??
            row.net_amount ??
            row.netAmount ??
            row.total ??
            row.value,
        ),
      );
      const createdAt = asString(
        row.created_at ??
          row.createdAt ??
          row.requested_at ??
          row.requestedAt ??
          row.paid_at ??
          row.paidAt ??
          row.processed_at ??
          row.processedAt ??
          row.updated_at ??
          row.updatedAt,
      );
      const id = asString(row.id ?? row.withdrawal_id ?? row.withdrawalId ?? row.transaction_id ?? row.transactionId ?? row.reference, `${index}-${createdAt}-${amount}`);
      return {
        id,
        amount,
        currency: asString(row.currency) || undefined,
        status: asString(row.status ?? row.state) || undefined,
        bankName: asString(row.bank_name ?? row.bank ?? row.bankName) || undefined,
        accountNumber: asString(row.account_number ?? row.accountNumber) || undefined,
        createdAt: createdAt || undefined,
      };
    })
    .filter((item) => item.amount > 0)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
};

export const earningsService = {
  async getSummary(): Promise<EarningsSummary> {
    const token = useAuthStore.getState().token;
    const [summaryRes, walletRes, queueRes] = await Promise.all([
      apiRequest<unknown>('/earnings/summary', { token, version: 'v1_2' }),
      apiRequest<unknown>('/earnings/wallet', { token, version: 'v1_2' }).catch(() => null),
      apiRequest<unknown>('/earnings/queue', { token, version: 'v1_2', query: { limit: 10 } }).catch(() => null),
    ]);

    const summary = normalizeSummary(summaryRes.data);
    const wallet = walletRes ? normalizeSummary(walletRes.data) : null;
    const queue = queueRes ? normalizeQueue(queueRes.data) : { ads: [], count: 0 };

    return {
      ...summary,
      // The wallet is the same ledger used by the website, so it is the
      // authoritative source for spendable balance and withdrawal totals.
      ...(wallet ? {
        currency: wallet.currency,
        availableBalance: wallet.availableBalance,
        totalEarned: wallet.totalEarned || summary.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn || summary.totalWithdrawn,
        pendingWithdrawal: wallet.pendingWithdrawal || summary.pendingWithdrawal,
      } : {}),
      adsAvailable: summary.adsAvailable > 0 ? summary.adsAvailable : queue.count,
    };
  },

  async getQueue(limit = 10): Promise<{ ads: RewardedAd[]; count: number }> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/earnings/queue', {
      token,
      version: 'v1_2',
      query: { limit },
    });
    return normalizeQueue(response.data);
  },

  // Dedicated, purpose-built endpoint for per-post reward rows, more reliable
  // than deriving "which history rows are posts" from the generic history feed.
  async getPostEarnings(limit = 20): Promise<EarningHistoryItem[]> {
    const token = useAuthStore.getState().token;
    try {
      const response = await apiRequest<unknown>('/users/post-earnings', {
        token,
        version: 'v1_2',
        query: { limit },
      });
      return normalizeHistory(response.data).map((item) => ({ ...item, sourceType: 'post' as const }));
    } catch {
      return [];
    }
  },

  async getHistory(limit = 20): Promise<EarningHistoryItem[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/earnings/transactions', {
      token,
      version: 'v1_2',
      query: { limit },
    });
    return normalizeHistory(response.data);
  },

  async getWithdrawals(limit = 20): Promise<WithdrawalHistoryItem[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/earnings/transactions', {
      token,
      version: 'v1_2',
      query: { limit, type: 'withdrawal' },
    });
    return normalizeWithdrawals(response.data);
  },

  async getWithdrawalBanks(): Promise<WithdrawalBank[]> {
    const token = useAuthStore.getState().token;
    try {
      const response = await apiRequest<unknown>('/earnings/banks', { token, version: 'v1_2' });
      return mergeBanks(normalizeBanks(response.data));
    } catch {
      return mergeBanks([]);
    }
  },

  async resolveBankAccount(input: { bankCode: string; accountNumber: string }): Promise<ResolvedBankAccount> {
    const token = useAuthStore.getState().token;
    const request = () => apiRequest<unknown>('/earnings/banks/resolve', {
      method: 'POST', token, version: 'v1_2', timeoutMs: 45 * 1000,
      body: { bank_code: input.bankCode, account_number: input.accountNumber },
    });
    let response;
    try {
      response = await request();
    } catch (firstError) {
      // One retry absorbs brief mobile-network/DNS handoffs without requiring
      // the user to re-enter their account number.
      try { response = await request(); } catch { throw firstError; }
    }
    return normalizeResolvedBankAccount(response.data);
  },

  async requestWithdrawal(input: WithdrawalInput): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/earnings/withdraw', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: {
        amount: input.amount,
        bank_code: input.bankCode,
        account_number: input.accountNumber,
        account_name: input.accountName,
        narration: input.narration,
      },
    });
  },
};
