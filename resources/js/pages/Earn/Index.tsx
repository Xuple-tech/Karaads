import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Head } from "@/components/page-head";
import { useFetch } from "@/hooks/use-fetch";
import { trackAdEvent } from "@/lib/ads-delivery";
import axiosInstance from "@/lib/axios";
import { getRewardedClientId } from "@/lib/rewarded-client";
import { getSafeMediaUrl } from "@/lib/url-guard";
import { currencyCode, formatFromNgn, formatNgn } from "@/lib/currency";
import {
  Coins,
  Play,
  Clock,
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  Wallet,
  Trophy,
  CircleDollarSign,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdViewer } from "./components/ad-viewer";
import { EarningsSummary } from "./components/earnings-summary";
import { WithdrawBankItem, WithdrawSheet } from "./components/withdraw-sheet";

interface Ad {
  delivery_id: string;
  signature: string;
  session_id?: string;
  title: string;
  media_url: string;
  media_type?: string;
  description: string;
  ad_type: string;
  duration?: number;
  required_view_seconds?: number;
  reward: number;
}

interface EarningsData {
  total_earned: number;
  available_balance: number;
  total_withdrawn?: number;
  ads_watched?: number;
  ads_completed?: number;
  average_earning_per_ad?: number;
  today_earnings: number;
  week_earnings?: number;
  month_earnings?: number;
  pending?: number;
  processing?: number;
  base_currency?: string;
  currency?: string;
  display_currency?: string;
  exchange_rate?: number;
}

interface WalletData {
  id?: string;
  user_id?: string;
  balance: number;
  total_earned?: number;
  total_withdrawn?: number;
  pending_withdrawal?: number;
  base_currency?: string;
  currency?: string;
  display_currency?: string;
  exchange_rate?: number;
  wallet_currency?: string;
  is_active?: boolean;
}

interface WithdrawalTransaction {
  reference: string;
  amount: number;
  status: string;
  account_number?: string;
  bank_code?: string;
  provider_message?: string;
  provider_reference?: string;
  created_at?: string;
  updated_at?: string;
}

interface WithdrawalBreakdown {
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  currency?: string;
}

type BankItem = WithdrawBankItem;

interface CachedBanks {
  savedAt: number;
  items: BankItem[];
}

const BANK_CACHE_KEY = "karaads.rewarded.banks";
const BANK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const WITHDRAWAL_MIN_AMOUNT = 1000;
const WITHDRAWAL_DAILY_LIMIT = 5000;
const WITHDRAWAL_FLAT_FEE = 50;
const WITHDRAWAL_MAINTENANCE_MESSAGE = "Bank is under maintenance. Please try again.";

function readCachedBanks(): CachedBanks | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BANK_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedBanks;
    if (!Array.isArray(parsed.items) || typeof parsed.savedAt !== "number") {
      return null;
    }

    if (Date.now() - parsed.savedAt > BANK_CACHE_TTL_MS) {
      window.localStorage.removeItem(BANK_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCachedBanks(items: BankItem[]): void {
  if (typeof window === "undefined" || items.length === 0) {
    return;
  }

  try {
    window.localStorage.setItem(
      BANK_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        items,
      } satisfies CachedBanks),
    );
  } catch {
    // Ignore storage failures.
  }
}

function getWithdrawalErrorMessage(error: any): string {
  const apiMessage = error?.response?.data?.message;
  const apiReason = error?.response?.data?.reason;
  const status = error?.response?.status;

  if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
    if (apiReason === "bank_maintenance") {
      return WITHDRAWAL_MAINTENANCE_MESSAGE;
    }

    const normalizedMessage = apiMessage.toLowerCase();
    if (normalizedMessage === "insufficient wallet balance.") {
      return "Insufficient wallet balance.";
    }
    if (
      normalizedMessage.includes("balance") &&
      (normalizedMessage.includes("insufficient") ||
        normalizedMessage.includes("account balance"))
    ) {
      return "Service is unavailable. Please try again later.";
    }

    if (
      apiMessage === "Withdrawal amount is below the minimum payout amount."
    ) {
      return `Minimum withdrawal amount is NGN ${WITHDRAWAL_MIN_AMOUNT.toLocaleString()}.`;
    }

    if (
      apiMessage === "Withdrawal amount exceeds the daily withdrawal limit."
    ) {
      return `You have reached the daily withdrawal limit of NGN ${WITHDRAWAL_DAILY_LIMIT.toLocaleString()}. Try a smaller amount tomorrow.`;
    }

    return apiMessage;
  }

  if (apiReason === "withdrawal_in_progress" || status === 409) {
    return "Another withdrawal is already being processed for this account. Please wait and try again.";
  }

  if (status === 422) {
    return "Unable to submit this withdrawal. Check the amount and bank details, then try again.";
  }

  return "Service is unavailable. Please try again later.";
}

function buildWithdrawalIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `rewarded-withdraw-${crypto.randomUUID()}`;
  }

  return `rewarded-withdraw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatRelativeTimeLabel(value?: string): string {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "Just now";
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function EarnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rewardedClientId = getRewardedClientId();
  const [showViewer, setShowViewer] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [completedAdIds, setCompletedAdIds] = useState<Set<string>>(new Set());
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [adsRequested, setAdsRequested] = useState(false);
  const [availableAds, setAvailableAds] = useState<Ad[]>([]);
  const [liveEarnings, setLiveEarnings] = useState<EarningsData | null>(null);
  const [liveWallet, setLiveWallet] = useState<WalletData | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [narration, setNarration] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawErrorType, setWithdrawErrorType] = useState<
    "validation" | "system" | "notice" | null
  >(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});
  const [rewardedAccessMessage, setRewardedAccessMessage] = useState<
    string | null
  >(null);
  const [cachedBanks, setCachedBanks] = useState<BankItem[]>(
    () => readCachedBanks()?.items ?? [],
  );
  const [bankCacheSavedAt, setBankCacheSavedAt] = useState<number | null>(
    () => readCachedBanks()?.savedAt ?? null,
  );
  const trackedImpressionIdsRef = useRef<Set<string>>(new Set());
  const withdrawalIdempotencyKeyRef = useRef<{
    signature: string;
    key: string;
  } | null>(null);
  const shouldOpenWithdrawFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("action") === "withdraw";
  }, [location.search]);

  const getWithdrawalIdempotencyKey = (signature: string) => {
    const current = withdrawalIdempotencyKeyRef.current;
    if (current?.signature === signature) {
      return current.key;
    }

    const key = buildWithdrawalIdempotencyKey();
    withdrawalIdempotencyKeyRef.current = { signature, key };

    return key;
  };

  const {
    data: adsData,
    loading: adsLoading,
    error: adsError,
    refetch: refetchAds,
  } = useFetch<{
    ads: Ad[];
    count: number;
  }>("/api/v2/rewarded/queue?limit=100", {
    skip: !adsRequested,
    cacheMs: 30_000,
  });

  const {
    data: earningsData,
    loading: earningsLoading,
    refetch: refetchEarnings,
  } = useFetch<EarningsData>("/api/v2/rewarded/earnings");

  const { data: bankListData, loading: bankListLoading } = useFetch<
    BankItem[] | { data?: BankItem[] }
  >("/api/v2/rewarded/banks", {
    skip: !withdrawOpen,
    cacheMs: 60_000,
  });

  const { data: walletData, refetch: refetchWallet } = useFetch<WalletData>(
    "/api/wallet",
    {
      cacheMs: 0,
      dedupe: false,
    },
  );

  const { data: transactionData, refetch: refetchTransactions } = useFetch<
    { transactions?: WithdrawalTransaction[] } | WithdrawalTransaction[]
  >("/api/v2/rewarded/transactions", {
    cacheMs: 0,
    dedupe: false,
  });

  useEffect(() => {
    if (!adsData?.ads) return;
    setAvailableAds(adsData.ads);
    setRewardedAccessMessage(null);
  }, [adsData]);

  useEffect(() => {
    if (!adsError) return;
    const error = adsError as any;
    const reason = error?.response?.data?.reason;
    if (reason === "active_session_conflict") {
      setRewardedAccessMessage(
        "Rewarded ads are active in another tab or device for this account. Close the other session and try again.",
      );
      return;
    }
    setRewardedAccessMessage(
      error?.response?.data?.message ||
        "Unable to load rewarded ads right now. Please try again.",
    );
  }, [adsError]);

  const ads = useMemo(() => availableAds, [availableAds]);

  useEffect(() => {
    if (!earningsData) return;
    setLiveEarnings(earningsData);
  }, [earningsData]);

  const earnings = liveEarnings ?? earningsData;

  useEffect(() => {
    if (!walletData) return;
    setLiveWallet(walletData);
  }, [walletData]);

  useEffect(() => {
    if (!shouldOpenWithdrawFromQuery) {
      return;
    }

    setWithdrawOpen(true);

    const params = new URLSearchParams(location.search);
    params.delete("action");
    const nextSearch = params.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, shouldOpenWithdrawFromQuery]);

  useEffect(() => {
    const normalized = Array.isArray(bankListData)
      ? bankListData
      : bankListData?.data || [];
    if (normalized.length === 0) return;
    setCachedBanks(normalized);
    setBankCacheSavedAt(Date.now());
    writeCachedBanks(normalized);
  }, [bankListData]);

  const wallet = liveWallet ?? walletData;
  const bankList =
    cachedBanks.length > 0
      ? cachedBanks
      : Array.isArray(bankListData)
        ? bankListData
        : bankListData?.data || [];
  const transactions = useMemo(() => {
    const rawTransactions = Array.isArray(transactionData)
      ? transactionData
      : transactionData?.transactions || [];

    return rawTransactions
      .map((transaction) => {
        const normalizedStatus = String(transaction.status ?? "").toLowerCase();
        if (
          normalizedStatus === "failed" ||
          normalizedStatus === "returned" ||
          normalizedStatus === "cancelled"
        ) {
          return null;
        }

        return {
          ...transaction,
          status: normalizedStatus === "completed" ? "success" : transaction.status,
        };
      })
      .filter(Boolean) as WithdrawalTransaction[];
  }, [transactionData]);

  const fetchQueue = async (limit = 100): Promise<Ad[]> => {
    const response = await axiosInstance.get("/api/v2/rewarded/queue", {
      params: { limit },
      headers: {
        Accept: "application/json",
        "X-Rewarded-Client-Id": rewardedClientId,
      },
    });
    const payload = response.data?.data ?? response.data;
    const adsList = Array.isArray(payload?.ads) ? (payload.ads as Ad[]) : [];
    return adsList;
  };

  useEffect(() => {
    axiosInstance.defaults.headers.common["X-Rewarded-Client-Id"] =
      rewardedClientId;
  }, [rewardedClientId]);

  const handleWatchAd = (ad: Ad) => {
    if (
      ad.delivery_id &&
      ad.signature &&
      ad.session_id &&
      !trackedImpressionIdsRef.current.has(ad.delivery_id)
    ) {
      trackedImpressionIdsRef.current.add(ad.delivery_id);
      trackAdEvent({
        deliveryId: ad.delivery_id,
        eventType: "impression",
        sessionId: ad.session_id,
        signature: ad.signature,
        idempotencyKey: `rewarded-impression-${ad.delivery_id}`,
        meta: {
          surface: "moments",
          slot: "rewarded",
          trigger: "watch_click",
          media_type: ad.media_type || "image",
        },
      });
    }

    setSelectedAd(ad);
    setShowViewer(true);
  };

  const loadAdsOnDemand = async () => {
    if (adsLoading) return;

    if (!adsRequested) {
      setAdsRequested(true);
      return;
    }

    try {
      const refreshedAds = await fetchQueue(100);
      setAvailableAds(refreshedAds);
      setRewardedAccessMessage(null);
    } catch (error: any) {
      const reason = error?.response?.data?.reason;
      if (reason === "active_session_conflict") {
        setRewardedAccessMessage(
          "Rewarded ads are active in another tab or device for this account. Close the other session and try again.",
        );
        return;
      }
      await refetchAds();
    }
  };

  const handleAdComplete = async (
    payload?: { earnings?: unknown; wallet?: unknown },
    options?: { watchNext?: boolean },
  ) => {
    if (!selectedAd) return;
    const completedAdId = selectedAd.delivery_id;
    const shouldWatchNext = options?.watchNext === true;

    if (payload?.earnings && typeof payload.earnings === "object") {
      setLiveEarnings(payload.earnings as EarningsData);
    }
    if (payload?.wallet && typeof payload.wallet === "object") {
      setLiveWallet(payload.wallet as WalletData);
    }

    const newCompleted = new Set(completedAdIds);
    newCompleted.add(completedAdId);
    setCompletedAdIds(newCompleted);

    await Promise.all([refetchEarnings(), refetchWallet()]);

    const remainingAds = ads.filter((ad) => ad.delivery_id !== completedAdId);
    setAvailableAds(remainingAds);

    if (!shouldWatchNext) {
      setShowViewer(false);
      setSelectedAd(null);
      setIsLoadingNext(false);
      return;
    }

    setIsLoadingNext(true);
    let nextAd = remainingAds.find((ad) => !newCompleted.has(ad.delivery_id));

    if (!nextAd) {
      try {
        const refreshedAds = await fetchQueue(100);
        const filteredRefreshed = refreshedAds.filter(
          (ad) => ad.delivery_id !== completedAdId,
        );
        setAvailableAds(filteredRefreshed);
        nextAd = filteredRefreshed.find(
          (ad) => !newCompleted.has(ad.delivery_id),
        );
      } catch {
        // Keep current remaining queue if refresh fails.
      }
    }

    if (nextAd) {
      setSelectedAd(nextAd);
      setShowViewer(true);
      setIsLoadingNext(false);
    } else {
      setShowViewer(false);
      setSelectedAd(null);
      setIsLoadingNext(false);
    }
  };

  const handleResolveAccount = async () => {
    if (!accountNumber || !bankCode) return;
    if (accountNumber.length !== 10) {
      setAccountName("");
      setWithdrawErrorType("validation");
      setWithdrawError("Enter a valid 10-digit account number.");
      return;
    }
    setResolveLoading(true);
    setWithdrawError(null);
    setWithdrawErrorType(null);
    try {
      const response = await axiosInstance.post(
        "/api/v2/rewarded/banks/resolve",
        {
          account_number: accountNumber,
          bank_code: bankCode,
        },
      );
      const data = response.data?.data ?? response.data;
      const resolvedName =
        data?.account_name ||
        data?.accountName ||
        data?.AccountName ||
        data?.name ||
        "";
      if (!resolvedName) {
        throw new Error("Account name was not returned.");
      }
      setAccountName(resolvedName);
    } catch (error: any) {
      setAccountName("");
      setWithdrawErrorType("validation");
      setWithdrawError(
        error?.response?.data?.message || "Unable to resolve account name.",
      );
    } finally {
      setResolveLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);
    setWithdrawErrorType(null);
    setWithdrawSuccess(null);

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError("Enter a valid amount.");
      return;
    }
    if (amount < WITHDRAWAL_MIN_AMOUNT) {
      setWithdrawError(
        `Minimum withdrawal amount is NGN ${WITHDRAWAL_MIN_AMOUNT.toLocaleString()}.`,
      );
      return;
    }
    if (amount > WITHDRAWAL_DAILY_LIMIT) {
      setWithdrawError(
        `Daily withdrawal limit is NGN ${WITHDRAWAL_DAILY_LIMIT.toLocaleString()}.`,
      );
      return;
    }
    if (amount > (wallet?.balance ?? 0)) {
      setWithdrawError("Amount exceeds wallet balance.");
      return;
    }
    if (amount <= WITHDRAWAL_FLAT_FEE) {
      setWithdrawError(
        `Withdrawal amount must be greater than NGN ${WITHDRAWAL_FLAT_FEE.toLocaleString()}.`,
      );
      return;
    }
    if (!accountNumber || !bankCode) {
      setWithdrawError("Provide bank code and account number.");
      return;
    }
    if (!accountName) {
      setWithdrawError("Verify the account number before submitting withdrawal.");
      setWithdrawErrorType("validation");
      return;
    }
    const withdrawalSignature = JSON.stringify({
      amount: amount.toFixed(2),
      accountNumber: accountNumber.trim(),
      bankCode: bankCode.trim(),
      narration: (narration || "").trim(),
    });
    const idempotencyKey = getWithdrawalIdempotencyKey(withdrawalSignature);
    setWithdrawSubmitting(true);
    try {
      const response = await axiosInstance.post(
        "/api/v2/rewarded/withdraw",
        {
          amount,
          account_number: accountNumber,
          bank_code: bankCode,
          narration: narration || undefined,
          idempotency_key: idempotencyKey,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      );
      if (response.data?.wallet && typeof response.data.wallet === "object") {
        setLiveWallet(response.data.wallet as WalletData);
      }
      const outcome = String(response.data?.outcome ?? "").toLowerCase();
      if (outcome === "returned") {
        setWithdrawErrorType("notice");
        setWithdrawError(
          response.data?.message ||
            "Withdrawal could not be sent right now. The money has been returned to your Kara Ads balance.",
        );
        withdrawalIdempotencyKeyRef.current = null;
        await Promise.all([
          refetchEarnings(),
          refetchWallet(),
          refetchTransactions(),
        ]);
        return;
      }
      const withdrawal = response.data?.withdrawal as
        | WithdrawalBreakdown
        | undefined;
      setWithdrawSuccess(
        withdrawal
          ? `${formatWithdrawalCurrency(withdrawal.net_amount)} will be sent to your bank after a ${formatWithdrawalCurrency(withdrawal.fee_amount)} processing fee.`
          : response.data?.message || "Your withdrawal is on its way.",
      );
      await Promise.all([
        refetchEarnings(),
        refetchWallet(),
        refetchTransactions(),
      ]);
      setWithdrawAmount("");
      setBankCode("");
      setBankSearch("");
      setAccountNumber("");
      setAccountName("");
      setNarration("");
      setWithdrawOpen(false);
      withdrawalIdempotencyKeyRef.current = null;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const returned =
        String(data?.outcome ?? "").toLowerCase() === "returned" ||
        String(data?.message ?? "").toLowerCase().includes("returned to your kara ads balance");

      if (data?.wallet && typeof data.wallet === "object") {
        setLiveWallet(data.wallet as WalletData);
      }

      setWithdrawErrorType(returned ? "notice" : status === 422 ? "validation" : "system");
      setWithdrawError(getWithdrawalErrorMessage(error));
      if (returned || status === 422) {
        withdrawalIdempotencyKeyRef.current = null;
      }
      if (returned) {
        await Promise.all([
          refetchEarnings(),
          refetchWallet(),
          refetchTransactions(),
        ]);
      }
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const earningCurrencySource = wallet ?? earnings;
  const displayCurrency = currencyCode(earningCurrencySource);
  const formatCurrency = (amount: number) => formatFromNgn(amount, earningCurrencySource);
  const formatWithdrawalCurrency = (amount: number) => formatNgn(amount);

  const recentHistory = transactions.slice(0, 5);
  const availableAdsSection = (
    <div>
      <div className="mb-4">
        <h2 className="mb-1 text-xl font-bold">Available Ads</h2>
        <p className="text-sm text-gray-500">
          Watch available ads and earn money
        </p>
      </div>

      {!adsRequested ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-card p-6 text-center">
          <h3 className="mb-2 font-semibold">
            Load earning ads on demand
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Tap below to fetch your current rewarded queue.
          </p>
          <Button onClick={loadAdsOnDemand} className="rounded-full px-5">
            <Play className="mr-2 h-4 w-4" />
            Load Ads
          </Button>
        </div>
      ) : adsLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      ) : ads.length > 0 ? (
        <div className="space-y-3">
          {ads.map((ad) => {
            const safeThumbUrl = getSafeMediaUrl(ad.media_url);
            const thumbBroken = Boolean(brokenThumbs[ad.delivery_id]);
            const isVideo =
              ad.media_type === "video" ||
              ad.media_url?.toLowerCase().endsWith(".mp4");

            return (
              <Card
                key={ad.delivery_id}
                className="overflow-hidden rounded-xl border-none shadow-md transition-transform active:scale-[0.99]"
              >
                <div className="flex">
                  <div className="relative h-24 w-24 flex-shrink-0 bg-muted">
                    {safeThumbUrl && !thumbBroken ? (
                      <img
                        src={safeThumbUrl}
                        alt={ad.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setBrokenThumbs((prev) => ({
                            ...prev,
                            [ad.delivery_id]: true,
                          }));
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <ImageIcon className="h-7 w-7" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      {isVideo ? (
                        <Play
                          className="h-8 w-8 text-white"
                          fill="white"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-white" />
                      )}
                    </div>
                    {ad.duration && (
                      <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                        {ad.duration}s
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="line-clamp-2 text-sm font-semibold">
                        {ad.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {ad.ad_type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {ad.media_type || "image"}
                        </Badge>
                      </div>
                    </div>

                    <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                      {ad.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-600">
                          {formatCurrency(ad.reward)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-1 text-sm text-white"
                        onClick={() => handleWatchAd(ad)}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Watch
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-1 font-semibold">No Ads Available</h3>
          <p className="text-sm text-gray-500">
            Check back later for new earning opportunities
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={loadAdsOnDemand}
          >
            Refresh Queue
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Head title="Earn" />
      <div className="min-h-screen bg-background pb-24 text-foreground">
        <div className="px-3 pt-4">
          <div className="mx-auto max-w-[430px] overflow-hidden rounded-[38px] border border-border bg-card shadow-sm">
            <div className="px-5 pb-6 pt-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[18px] font-black tracking-tight text-foreground">
                  <span className="text-[#38bdf8]">Kara</span>Earn
                </h1>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#15f17d]" />
                  Earning Active
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[34px] border border-primary/20 bg-primary p-6 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-foreground/70">
                  Total Earned
                </p>
                <div className="mt-4 min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-foreground/60">
                    {displayCurrency}
                  </p>
                  <p className="mt-1 text-[36px] break-words font-black leading-none tracking-tight text-primary-foreground">
                    {formatCurrency(wallet?.balance ?? earnings?.available_balance ?? 0).replace(
                      ".00",
                      "",
                    )}
                  </p>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/60">
                      Pending Payout
                    </p>
                    <p className="mt-2 text-[18px] font-black text-primary-foreground">
                      {formatCurrency(
                        wallet?.pending_withdrawal ?? earnings?.pending ?? 0,
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="h-14 rounded-full bg-primary-foreground px-8 text-[18px] font-black text-primary shadow-sm hover:bg-primary-foreground/90"
                    onClick={() => {
                      setWithdrawAmount(String(wallet?.balance ?? ""));
                      setWithdrawOpen(true);
                    }}
                  >
                    Cash Out
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-[24px] border border-border bg-card px-3 py-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                    <Play className="h-5 w-5 fill-white" />
                  </div>
                  <p className="text-[29px] font-black leading-none text-foreground">
                    {earnings?.ads_completed ?? earnings?.ads_watched ?? 0}
                  </p>
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Ads Watched
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-card px-3 py-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="truncate px-1 text-[clamp(0.72rem,2.8vw,1.8125rem)] font-black leading-none text-foreground">
                    {formatCurrency(earnings?.week_earnings || 0)}
                  </p>
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    This Week
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-card px-3 py-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-[#ffcf4a]">
                    <Trophy className="h-5 w-5 fill-current" />
                  </div>
                  <p className="text-[29px] font-black leading-none text-foreground">
                    #{Math.max(1, transactions.length + 83)}
                  </p>
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Rank
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-[28px] border border-border bg-muted/30 p-4">
                {availableAdsSection}
              </div>

              <div className="mt-7">
                <h2 className="text-[18px] font-black tracking-tight text-foreground">
                  Earning History
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {recentHistory.length > 0 ? (
                  recentHistory.map((transaction, index) => {
                    const historyTitle = transaction.provider_reference
                      ? `Withdrawal ${transaction.provider_reference}`
                      : `Cashout ${index + 1}`;
                    const historyStatus = transaction.status.toLowerCase();
                    const historySubtitle =
                      historyStatus === "success" || historyStatus === "completed"
                        ? "Withdrawal completed"
                        : historyStatus === "returned"
                          ? "Withdrawal returned"
                        : historyStatus === "failed"
                          ? "Withdrawal failed"
                          : historyStatus === "processing"
                            ? "Withdrawal processing"
                            : "Withdrawal pending";

                    return (
                      <div
                        key={transaction.reference}
                        className="flex items-center gap-3 rounded-[24px] border border-border bg-card px-4 py-4"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-border bg-muted">
                          <CircleDollarSign className="h-7 w-7 text-[#7dd3fc]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[16px] font-extrabold text-foreground">
                            {historyTitle}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-muted-foreground">
                            {historySubtitle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[16px] font-black text-primary-foreground">
                            +{formatWithdrawalCurrency(transaction.amount)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {formatRelativeTimeLabel(
                              transaction.updated_at || transaction.created_at,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-border bg-muted/30 px-4 py-5 text-sm font-medium text-muted-foreground">
                    Your earning history will appear here after your first withdrawal or reward update.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-[430px] space-y-6 px-3">

          {earningsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          ) : earnings ? (
            <EarningsSummary
              earnings={earnings}
              walletBalance={wallet?.balance ?? 0}
              formatCurrency={formatCurrency}
            />
          ) : null}

          {rewardedAccessMessage && (
            <div className="rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-sm text-amber-900">
              {rewardedAccessMessage}
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Recent Transactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  View your latest withdrawal requests and status.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={() => void refetchTransactions()}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>
            </div>

            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 6).map((transaction) => {
                  const status = transaction.status.toLowerCase();
                  const statusConfig = {
                    success: {
                      label: "Success",
                      class:
                        "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                    },
                    failed: {
                      label: "Failed",
                      class: "bg-red-500/10 text-red-700 border-red-200",
                    },
                    pending: {
                      label: "Pending",
                      class: "bg-amber-500/10 text-amber-700 border-amber-200",
                    },
                    processing: {
                      label: "Processing",
                      class: "bg-blue-500/10 text-blue-700 border-blue-200",
                    },
                  };
                  const config =
                    statusConfig[status as keyof typeof statusConfig] ||
                    statusConfig.pending;

                  return (
                    <div
                      key={transaction.reference}
                      className="rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-foreground">
                              {formatWithdrawalCurrency(transaction.amount)}
                            </p>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${config.class}`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Reference
                              </p>
                              <p className="truncate font-medium text-foreground">
                                {transaction.reference}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Account
                              </p>
                              <p className="truncate font-medium text-foreground">
                                {transaction.account_number || "Not available"}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Provider Ref
                              </p>
                              <p className="truncate font-medium text-foreground">
                                {transaction.provider_reference || "Pending"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Updated
                              </p>
                              <p className="font-medium text-foreground">
                                {transaction.updated_at
                                  ? new Date(
                                      transaction.updated_at,
                                    ).toLocaleDateString()
                                  : "Just now"}
                              </p>
                            </div>
                          </div>
                          {transaction.provider_message && (
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground">
                                Provider Message
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {transaction.provider_message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground">
                  No transactions yet
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your withdrawal history will appear here once you make a
                  request.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-bold tracking-tight text-foreground">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">1</span>
                  <div className="absolute -bottom-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-border" />
                </div>
                <div className="pt-1">
                  <p className="font-medium text-foreground">Watch Available Ads</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete ad viewing to earn rewards. Each ad has a specified duration and reward amount.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="text-sm font-bold text-emerald-600">2</span>
                  <div className="absolute -bottom-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-border" />
                </div>
                <div className="pt-1">
                  <p className="font-medium text-foreground">Earn Instantly</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get paid immediately after completion. Rewards are added directly to your wallet balance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                  <span className="text-sm font-bold text-amber-600">3</span>
                </div>
                <div className="pt-1">
                  <p className="font-medium text-foreground">Withdraw Easily</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cash out to your preferred payment method. Withdrawals are processed quickly with minimal fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showViewer && selectedAd && (
          <AdViewer
            ad={selectedAd}
            onComplete={handleAdComplete}
            minDuration={selectedAd.required_view_seconds || 10}
            formatCurrency={formatCurrency}
            onClose={() => {
              setShowViewer(false);
              setSelectedAd(null);
              setCompletedAdIds(new Set());
            }}
          />
        )}

        {isLoadingNext && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50">
            <div className="rounded-xl bg-card p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-sky-500" />
              </div>
              <h3 className="font-semibold">Loading next ad...</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get ready to earn more!
              </p>
            </div>
          </div>
        )}

        <WithdrawSheet
          open={withdrawOpen}
          onOpenChange={(open) => {
            setWithdrawOpen(open);
            if (!open) {
              setWithdrawError(null);
              setWithdrawErrorType(null);
              setWithdrawSuccess(null);
              withdrawalIdempotencyKeyRef.current = null;
            }
          }}
          walletBalance={wallet?.balance ?? 0}
          withdrawAmount={withdrawAmount}
          onWithdrawAmountChange={setWithdrawAmount}
          bankCode={bankCode}
          onBankCodeChange={(value) => {
            setBankCode(value);
            setAccountName("");
          }}
          bankSearch={bankSearch}
          onBankSearchChange={setBankSearch}
          bankList={bankList}
          bankListLoading={bankListLoading}
          bankCacheSavedAt={bankCacheSavedAt}
          accountNumber={accountNumber}
          onAccountNumberChange={(value) => {
            setAccountNumber(value.replace(/\D/g, "").slice(0, 10));
            setAccountName("");
          }}
          accountName={accountName}
          narration={narration}
          onNarrationChange={setNarration}
          withdrawError={withdrawError}
          withdrawErrorType={withdrawErrorType}
          withdrawSuccess={withdrawSuccess}
          withdrawSubmitting={withdrawSubmitting}
          resolveLoading={resolveLoading}
          onResolveAccount={handleResolveAccount}
          onWithdraw={handleWithdraw}
          formatCurrency={formatWithdrawalCurrency}
        />
      </div>
    </>
  );
}
