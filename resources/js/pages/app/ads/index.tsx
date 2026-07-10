import { useEffect, useMemo, useState } from 'react'
import { Head, Link } from '@/components/page-head'
import { AdRender } from '@/components/ads/ad-render'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Megaphone,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Creative {
  id: string
  title: string
  description?: string | null
  media_url?: string | null
  media_type?: string | null
  target_url?: string | null
  status: string
  campaign: {
    id: string
    status: string
    name: string
    spent: string
    budget_total?: number | string | null
    reach_estimate?: number | string | null
  }
  created_at: string
}

type DailyReachPoint = {
  date: string
  label: string
  reach: number
  spend?: number
}

type GenderBreakdown = {
  male: number
  female: number
  unknown: number
  total: number
}

interface CreativeDetails {
  creative: Creative
  campaign: Creative['campaign']
  metrics: {
    impressions: number
    reach?: number
    reach_today?: number
    daily_reach?: DailyReachPoint[]
    gender_breakdown?: GenderBreakdown
    clicks: number
    ctr: number
    spend: number
    budget_total: number
    balance_remaining: number
    last_funded_at?: string
  }
  wallet?: { balance?: number }
  latest_payment?: { reference: string; status: string; amount?: number }
}

type CampaignRowShape = {
  ad: Creative
  details?: CreativeDetails
  campaignStatus: string
  metrics?: CreativeDetails['metrics']
  budget: number
  spend: number
  remaining: number
  reach: number
  impressions: number
  clicks: number
  ctr: number
  reachToday: number
  dailyReach: DailyReachPoint[]
  genderBreakdown?: GenderBreakdown
  paymentPending: boolean
}

type StatusFilter = 'all' | 'active' | 'in_review' | 'paused' | 'draft' | 'rejected' | 'archived'

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Review', value: 'in_review' },
  { label: 'Paused', value: 'paused' },
  { label: 'Draft', value: 'draft' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
]

const statusLabel: Record<string, string> = {
  active: 'Active',
  in_review: 'In review',
  approved: 'Approved',
  paused: 'Paused',
  completed: 'Completed',
  draft: 'Draft',
  archived: 'Archived',
  rejected: 'Rejected',
}

const statusClasses: Record<string, string> = {
  active: 'border-emerald-300/35 bg-emerald-500/16 text-emerald-100',
  in_review: 'border-amber-300/35 bg-amber-500/16 text-amber-100',
  approved: 'border-sky-300/35 bg-sky-500/16 text-sky-100',
  paused: 'border-white/25 bg-white/10 text-white/85',
  completed: 'border-sky-300/35 bg-sky-500/16 text-sky-100',
  draft: 'border-white/25 bg-white/10 text-white/85',
  archived: 'border-zinc-400/30 bg-zinc-500/16 text-zinc-100',
  rejected: 'border-red-300/35 bg-red-500/16 text-red-100',
}

const numberValue = (value: number | string | null | undefined) => {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const formatNaira = (value: number | string | null | undefined) =>
  `₦${numberValue(value).toLocaleString()}`

const formatCompact = (value: number | string | null | undefined) =>
  numberValue(value).toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 })

const percentOf = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

const mergeGenderBreakdown = (items: Array<GenderBreakdown | undefined>): GenderBreakdown => {
  return items.reduce(
    (total, item) => ({
      male: total.male + numberValue(item?.male),
      female: total.female + numberValue(item?.female),
      unknown: total.unknown + numberValue(item?.unknown),
      total: total.total + numberValue(item?.total),
    }),
    { male: 0, female: 0, unknown: 0, total: 0 },
  )
}

const mergeDailyReach = (items: DailyReachPoint[]): DailyReachPoint[] => {
  if (!items.length) {
    return []
  }

  const byDate = items.reduce<Record<string, DailyReachPoint>>((map, point) => {
    const existing = map[point.date] ?? { date: point.date, label: point.label, reach: 0, spend: 0 }
    map[point.date] = {
      ...existing,
      reach: existing.reach + numberValue(point.reach),
      spend: numberValue(existing.spend) + numberValue(point.spend),
    }
    return map
  }, {})

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

export default function AdsDashboard() {
  const { data: adsData, loading: adsLoading, refetch: refetchAds } = useFetch<Creative[]>(
    '/api/v2/ads/creatives'
  )
  const ads = adsData || []
  const { data: summary } = useFetch<{
    impressions: number
    reach?: number
    reach_today?: number
    daily_reach?: DailyReachPoint[]
    gender_breakdown?: GenderBreakdown
    clicks: number
    spend: number
    budget_total: number
    balance_remaining?: number
  }>('/api/v2/ads/analytics/summary')

  const [detailsById, setDetailsById] = useState<Record<string, CreativeDetails>>({})
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!ads.length) {
      setDetailsById({})
      return
    }
    let cancelled = false
    setDetailsLoading(true)
    ;(async () => {
      try {
        const responses = await Promise.all(
          ads.map((ad) => axiosInstance.get(`/api/v2/ads/creatives/${ad.id}`))
        )
        if (cancelled) return
        const map: Record<string, CreativeDetails> = {}
        responses.forEach((res) => {
          const payload = res.data as CreativeDetails
          const id = (payload?.creative?.id as string) || ''
          if (id) {
            map[id] = payload
          }
        })
        setDetailsById(map)
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch creative details', error)
        }
      } finally {
        if (!cancelled) setDetailsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ads.map((a) => a.id).join('|')])

  const campaignRows = useMemo(() => {
    const search = query.trim().toLowerCase()

    return ads
      .map((ad) => {
        const details = detailsById[ad.id]
        const campaignStatus = details?.campaign?.status || ad.campaign?.status || ad.status || 'unknown'
        const metrics = details?.metrics
        const budget = numberValue(metrics?.budget_total ?? ad.campaign?.budget_total)
        const spend = numberValue(metrics?.spend ?? ad.campaign?.spent)
        const remaining = numberValue(metrics?.balance_remaining ?? Math.max(0, budget - spend))
        const reach = numberValue(metrics?.reach ?? ad.campaign?.reach_estimate)
        const impressions = numberValue(metrics?.impressions)
        const clicks = numberValue(metrics?.clicks)
        const ctr = metrics?.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : 0)
        const dailyReach = metrics?.daily_reach ?? []
        const genderBreakdown = metrics?.gender_breakdown

        return {
          ad,
          details,
          campaignStatus,
          metrics,
          budget,
          spend,
          remaining,
          reach,
          impressions,
          clicks,
          ctr,
          reachToday: numberValue(metrics?.reach_today),
          dailyReach,
          genderBreakdown,
          paymentPending: details?.latest_payment?.status === 'pending',
        }
      })
      .filter((row) => statusFilter === 'all' || row.campaignStatus === statusFilter)
      .filter((row) => {
        if (!search) return true
        return `${row.ad.title} ${row.ad.description ?? ''} ${row.ad.campaign?.name ?? ''}`.toLowerCase().includes(search)
      })
  }, [ads, detailsById, query, statusFilter])

  const totals = useMemo(() => {
    const computedBudget = campaignRows.reduce((total, row) => total + row.budget, 0)
    const computedRemaining = campaignRows.reduce((total, row) => total + row.remaining, 0)
    const activeCount = ads.filter((ad) => (detailsById[ad.id]?.campaign?.status || ad.campaign?.status || ad.status) === 'active').length

    return {
      campaigns: ads.length,
      activeCount,
      impressions: numberValue(summary?.impressions) || campaignRows.reduce((total, row) => total + row.impressions, 0),
      reach: numberValue(summary?.reach) || campaignRows.reduce((total, row) => total + row.reach, 0),
      clicks: numberValue(summary?.clicks) || campaignRows.reduce((total, row) => total + row.clicks, 0),
      reachToday: numberValue(summary?.reach_today) || campaignRows.reduce((total, row) => total + row.reachToday, 0),
      dailyReach: summary?.daily_reach?.length
        ? summary.daily_reach
        : mergeDailyReach(campaignRows.flatMap((row) => row.dailyReach)),
      genderBreakdown: summary?.gender_breakdown ?? mergeGenderBreakdown(campaignRows.map((row) => row.genderBreakdown)),
      spend: numberValue(summary?.spend) || campaignRows.reduce((total, row) => total + row.spend, 0),
      budget: numberValue(summary?.budget_total) || computedBudget,
      remaining: summary?.balance_remaining !== undefined
        ? numberValue(summary.balance_remaining)
        : computedRemaining,
    }
  }, [ads, campaignRows, detailsById, summary])

  const averageCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const spendRatio = totals.budget > 0 ? Math.min(100, (totals.spend / totals.budget) * 100) : 0

  const handlePauseResume = async (ad: Creative) => {
    try {
      if (ad.campaign?.status === 'paused') {
        await axiosInstance.post(`/api/v2/ads/campaigns/${ad.campaign.id}/resume`)
        toast.success('Campaign resumed.')
      } else {
        await axiosInstance.post(`/api/v2/ads/campaigns/${ad.campaign.id}/pause`)
        toast.success('Campaign paused.')
      }
      refetchAds()
    } catch (error) {
      console.error('Failed to toggle campaign', error)
      toast.error('Failed to toggle campaign')
    }
  }

  const summaryCards = [
    { label: 'Amount spent', value: formatNaira(totals.spend), icon: CircleDollarSign },
    { label: 'People reached today', value: totals.reachToday.toLocaleString(), icon: Users },
    { label: 'Total reach', value: totals.reach.toLocaleString(), icon: Eye },
    { label: 'Clicks', value: totals.clicks.toLocaleString(), icon: MousePointer2 },
    { label: 'Balance left', value: formatNaira(totals.remaining), icon: Banknote },
  ]

  return (
    <>
      <Head title="Ads Manager" />
      <div className="min-h-screen w-full max-w-[100dvw] overflow-x-hidden bg-[#0b0e13] pb-28 text-white">
        <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0e13]/90 backdrop-blur-xl">
          <div className="mobile-safe-top mx-auto box-border flex w-full max-w-[100dvw] items-center justify-between gap-2 px-3 pb-3 pt-2 sm:max-w-6xl sm:gap-3 sm:px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7ab8ff]">Kara Ads Manager</p>
                <h1 className="truncate text-sm font-semibold leading-tight text-white lg:text-lg">Campaign dashboard</h1>
              </div>
            </div>
            <Link href="/ads/create">
              <Button className="h-9 shrink-0 rounded-full bg-[#1877f2] px-3 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(24,119,242,0.28)] hover:bg-[#166fe5] sm:px-4 sm:text-[13px]">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create
              </Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[100dvw] grid-cols-1 gap-3 px-3 pt-3 sm:max-w-6xl sm:gap-4 sm:px-4 sm:pt-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
          <main className="min-w-0 space-y-4">
            <section className="max-w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#092e63,#1877f2_52%,#42b72a)] p-4 shadow-[0_24px_60px_rgba(24,119,242,0.22)] sm:rounded-[28px] lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Performance
                  </div>
                  <h2 className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl">{formatNaira(totals.spend)} spent</h2>
                  <p className="mt-1 text-sm text-white/72">
                    {formatNaira(totals.remaining)} remaining from {formatNaira(totals.budget)} total budget.
                  </p>
                </div>
                <div className="min-w-0 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur lg:w-72">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Budget used</span>
                    <span className="font-bold">{Math.round(spendRatio)}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/18">
                    <div className="h-full rounded-full bg-white" style={{ width: `${spendRatio}%` }} />
                  </div>
                  <div className="mt-3 flex min-w-0 items-center justify-between gap-2 text-xs text-white/65">
                    <span className="min-w-0 truncate">{formatNaira(totals.spend)} spent</span>
                    <span className="min-w-0 truncate text-right">{formatNaira(totals.remaining)} left</span>
                  </div>
                </div>
              </div>
            </section>

            {(summary || ads.length > 0) && (
              <section className="grid max-w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 lg:grid-cols-5">
                {summaryCards.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.055] p-3 sm:rounded-3xl sm:p-4">
                      <Icon className="h-4 w-4 text-[#7ab8ff]" />
                      <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-white/35">{item.label}</p>
                      <p className="mt-0.5 truncate text-lg font-black text-white sm:text-xl">{item.value}</p>
                    </div>
                  )
                })}
              </section>
            )}

            <section className="grid max-w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              <DailyReachPanel points={totals.dailyReach} />
              <AudiencePanel breakdown={totals.genderBreakdown} totalReach={totals.reach} />
            </section>

            <section className="max-w-full overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.045] sm:rounded-[28px]">
              <div className="border-b border-white/8 p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-base font-black">Campaigns</h2>
                    <p className="text-xs text-white/40">Delivery, budget, reach and clicks like Ads Manager.</p>
                  </div>
                  <div className="relative min-w-0">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search ads"
                      className="h-10 w-full rounded-2xl border border-white/10 bg-white/6 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#1877f2] lg:w-72"
                    />
                  </div>
                </div>
                <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        'shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition',
                        statusFilter === filter.value
                          ? 'bg-[#1877f2] text-white'
                          : 'bg-white/7 text-white/52 hover:bg-white/12 hover:text-white/82',
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {adsLoading ? (
                <div className="space-y-2.5 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.07] bg-white/3" />
                  ))}
                </div>
              ) : ads.length === 0 ? (
                <EmptyCampaigns />
              ) : campaignRows.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-sm font-semibold text-white">No campaign found</p>
                  <p className="mt-1 text-xs text-white/45">Try another search or filter.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 p-2.5 sm:p-3 lg:hidden">
                    {campaignRows.map((row) => (
                      <CampaignCard
                        key={row.ad.id}
                        row={row}
                        detailsLoading={detailsLoading}
                        onPauseResume={handlePauseResume}
                      />
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-[920px] w-full text-left text-sm">
                      <thead className="bg-white/[0.04] text-[11px] font-bold uppercase tracking-[0.14em] text-white/38">
                        <tr>
                          <th className="px-4 py-3">Campaign</th>
                          <th className="px-4 py-3">Delivery</th>
                          <th className="px-4 py-3">Results</th>
                          <th className="px-4 py-3">Reach</th>
                          <th className="px-4 py-3">Spent</th>
                          <th className="px-4 py-3">Budget left</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {campaignRows.map((row) => (
                          <CampaignTableRow key={row.ad.id} row={row} onPauseResume={handlePauseResume} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </main>

          <aside className="min-w-0 space-y-3 sm:space-y-4">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-4 sm:rounded-[28px] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/14 text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Account health</p>
                  <h3 className="font-black">Ready to deliver</h3>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <InsightRow label="Active ads" value={totals.activeCount.toLocaleString()} />
                <InsightRow label="Reached today" value={totals.reachToday.toLocaleString()} />
                <InsightRow label="Average CTR" value={`${averageCtr.toFixed(1)}%`} />
                <InsightRow label="Amount spent" value={formatNaira(totals.spend)} />
                <InsightRow label="Remaining balance" value={formatNaira(totals.remaining)} />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(135deg,rgba(24,119,242,0.18),rgba(255,255,255,0.045))] p-4 sm:rounded-[28px] sm:p-5">
              <Sparkles className="h-6 w-6 text-[#7ab8ff]" />
              <h3 className="mt-3 text-lg font-black">Ads manager tips</h3>
              <p className="mt-2 text-sm text-white/56">
                Pause weak ads, keep high-click campaigns running, and use video creatives for better attention.
              </p>
              <Link href="/ads/create">
                <Button className="mt-4 w-full rounded-2xl bg-white text-black hover:bg-white/90">
                  Create new campaign
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function DailyReachPanel({ points }: { points: DailyReachPoint[] }) {
  const safePoints = points.length ? points : []
  const maxReach = Math.max(1, ...safePoints.map((point) => numberValue(point.reach)))
  const totalReach = safePoints.reduce((total, point) => total + numberValue(point.reach), 0)
  const totalSpend = safePoints.reduce((total, point) => total + numberValue(point.spend), 0)

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.045] p-4 sm:rounded-[28px] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7ab8ff]">Reach per day</p>
          <h3 className="mt-1 text-lg font-black">People reached this week</h3>
          <p className="mt-1 text-xs text-white/42">Daily unique people who saw your ads.</p>
        </div>
        <div className="rounded-2xl border border-[#1877f2]/25 bg-[#1877f2]/12 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">7-day reach</p>
          <p className="text-lg font-black text-white">{formatCompact(totalReach)}</p>
        </div>
      </div>

      <div className="mt-5 flex h-44 items-end gap-2 rounded-3xl border border-white/6 bg-black/18 p-3 sm:gap-3">
        {safePoints.length ? (
          safePoints.map((point) => {
            const height = Math.max(8, (numberValue(point.reach) / maxReach) * 100)
            return (
              <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-32 w-full items-end rounded-full bg-white/6 p-1">
                  <div
                    className="w-full rounded-full bg-[linear-gradient(180deg,#7ab8ff,#1877f2)] shadow-[0_8px_18px_rgba(24,119,242,0.28)]"
                    style={{ height: `${height}%` }}
                    title={`${point.reach.toLocaleString()} people reached`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-white/72">{point.label}</p>
                  <p className="text-[10px] text-white/32">{formatCompact(point.reach)}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-sm text-white/40">
            Reach will appear after people start seeing your ads.
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label="Week spend" value={formatNaira(totalSpend)} />
        <MiniMetric label="Avg/day" value={formatCompact(safePoints.length ? totalReach / safePoints.length : 0)} />
      </div>
    </div>
  )
}

function AudiencePanel({ breakdown, totalReach }: { breakdown?: GenderBreakdown; totalReach: number }) {
  const audience = breakdown && breakdown.total > 0
    ? breakdown
    : { male: 0, female: 0, unknown: totalReach, total: totalReach }
  const rows = [
    { label: 'Male', value: numberValue(audience.male), color: 'bg-[#1877f2]' },
    { label: 'Female', value: numberValue(audience.female), color: 'bg-[#e1306c]' },
    { label: 'Not set', value: numberValue(audience.unknown), color: 'bg-white/35' },
  ]

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-4 sm:rounded-[28px] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7ab8ff]">Audience</p>
          <h3 className="mt-1 text-lg font-black">Gender reach</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/7 text-white">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/6 bg-black/18 p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Total people reached</p>
        <p className="mt-1 text-3xl font-black">{formatCompact(audience.total)}</p>
        <div className="mt-4 space-y-3">
          {rows.map((row) => {
            const percent = percentOf(row.value, audience.total)
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/72">{row.label}</span>
                  <span className="text-white/42">{row.value.toLocaleString()} · {percent}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div className={cn('h-full rounded-full', row.color)} style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/38">
        If users have not selected gender, their reach is counted as Not set.
      </p>
    </div>
  )
}

function CampaignCard({
  row,
  detailsLoading,
  onPauseResume,
}: {
  row: CampaignRowShape
  detailsLoading: boolean
  onPauseResume: (ad: Creative) => void
}) {
  const { ad, campaignStatus, metrics, paymentPending } = row
  const isVideo =
    ad.media_type === 'video' ||
    ad.media_url?.toLowerCase().endsWith('.mp4') ||
    ad.media_url?.toLowerCase().endsWith('.webm')

  return (
    <article className="w-full max-w-full overflow-hidden rounded-[22px] border border-white/8 bg-white/3 p-3 transition-colors hover:bg-white/5">
      <div className="flex items-start gap-2.5">
        <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border border-white/9 bg-black/50">
          <AdRender
            renderMode={(ad as any).render_mode || 'internal_asset'}
            mediaUrl={ad.media_url}
            mediaType={isVideo ? 'video' : ad.media_type}
            title={ad.title}
            className="h-full w-full object-cover opacity-90"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="min-w-0 max-w-full truncate text-[13px] font-semibold text-white">
              {ad.title}
            </h3>
            <StatusPill status={campaignStatus} />
          </div>
          {paymentPending && (
            <span className="mt-1 inline-flex rounded-full border border-amber-400/30 bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
              Pay pending
            </span>
          )}
          <div className="mt-1.5 flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 break-words text-[11px] text-white/35">
            {metrics ? (
              <>
                <Eye className="h-3 w-3" />
                <span className="max-w-full truncate">{row.impressions.toLocaleString()}</span>
                <span className="text-white/20">·</span>
                <span className="max-w-full truncate">{row.reach.toLocaleString()} reached</span>
                <span className="text-white/20">·</span>
                <Banknote className="h-3 w-3" />
                <span className="max-w-full truncate">{formatNaira(row.spend)}</span>
              </>
            ) : detailsLoading ? (
              <span>Loading…</span>
            ) : (
              <span>No data yet</span>
            )}
          </div>
        </div>

        <Link href={`/ads/${ad.id}`} className="shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 text-center min-[380px]:gap-2">
        <MiniMetric label="Today" value={`${row.reachToday.toLocaleString()} reach`} />
        <MiniMetric label="Spent" value={formatNaira(row.spend)} />
        <MiniMetric label="Left" value={formatNaira(row.remaining)} />
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPauseResume(ad)}
          className="h-9 rounded-xl border border-white/8 bg-white/4 px-2 text-[11px] text-white/62 hover:bg-white/10 hover:text-white"
        >
          {campaignStatus === 'paused' ? (
            <><Play className="mr-1 h-3 w-3" />Resume</>
          ) : (
            <><Pause className="mr-1 h-3 w-3" />Pause</>
          )}
        </Button>
        <Link href={`/ads/${ad.id}/edit`} className="block">
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-full rounded-xl border border-[#1877f2]/35 bg-[#1877f2]/14 px-2 text-[11px] font-bold text-[#9dccff] hover:bg-[#1877f2]/22 hover:text-white"
          >
            Edit
          </Button>
        </Link>
      </div>
    </article>
  )
}

function CampaignTableRow({
  row,
  onPauseResume,
}: {
  row: CampaignRowShape
  onPauseResume: (ad: Creative) => void
}) {
  const isVideo = row.ad.media_type === 'video' || row.ad.media_url?.toLowerCase().endsWith('.mp4') || row.ad.media_url?.toLowerCase().endsWith('.webm')

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl border border-white/9 bg-black/50">
            <AdRender
              renderMode={(row.ad as any).render_mode || 'internal_asset'}
              mediaUrl={row.ad.media_url}
              mediaType={isVideo ? 'video' : row.ad.media_type}
              title={row.ad.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="max-w-[260px] truncate font-bold">{row.ad.title}</p>
            <p className="mt-0.5 max-w-[280px] truncate text-xs text-white/42">{row.ad.campaign?.name || 'Campaign'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><StatusPill status={row.campaignStatus} /></td>
      <td className="px-4 py-4">
        <p className="font-bold">{row.clicks.toLocaleString()} clicks</p>
        <p className="text-xs text-white/42">{row.ctr.toFixed(1)}% CTR</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold">{row.reach.toLocaleString()}</p>
        <p className="text-xs text-white/42">{row.reachToday.toLocaleString()} today · {row.impressions.toLocaleString()} impressions</p>
      </td>
      <td className="px-4 py-4 font-bold">{formatNaira(row.spend)}</td>
      <td className="px-4 py-4 font-bold">{formatNaira(row.remaining)}</td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1.5">
          <Link href={`/ads/${row.ad.id}`}>
            <Button size="sm" variant="outline" className="h-8 rounded-xl border-white/12 bg-white/5 text-xs text-white hover:bg-white/10">Open</Button>
          </Link>
          <Link href={`/ads/${row.ad.id}/edit`}>
            <Button size="sm" variant="outline" className="h-8 rounded-xl border-[#1877f2]/35 bg-[#1877f2]/12 text-xs text-[#9dccff] hover:bg-[#1877f2]/20 hover:text-white">Edit</Button>
          </Link>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-white/45 hover:text-white" onClick={() => onPauseResume(row.ad)}>
            {row.campaignStatus === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </td>
    </tr>
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest', statusClasses[status] || 'border-white/15 bg-white/6 text-white/50')}>
      {statusLabel[status] || status}
    </span>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">{label}</p>
      <p className="mt-0.5 truncate text-xs font-bold">{value}</p>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
      <span className="text-sm text-white/48">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  )
}

function EmptyCampaigns() {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/4">
        <Sparkles className="h-6 w-6 text-white/35" />
      </div>
      <p className="text-sm font-semibold text-white">No campaigns yet</p>
      <p className="mt-1 text-xs text-white/45">Create your first campaign to start reaching your audience.</p>
      <Link href="/ads/create">
        <Button className="mt-5 h-10 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90">
          Create campaign
        </Button>
      </Link>
    </div>
  )
}
