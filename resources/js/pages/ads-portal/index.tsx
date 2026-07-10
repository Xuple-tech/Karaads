import { useEffect, useMemo, useState } from 'react'
import { Head, Link } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { AdRender } from '@/components/ads/ad-render'
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Gauge,
  Megaphone,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adStatusClasses, adStatusLabel, adsPortalEditPath, adsPortalShowPath, adsPortalPath, formatNaira } from './paths'

type Creative = {
  id: string
  title: string
  description?: string | null
  media_url?: string | null
  media_type?: string | null
  status: string
  campaign: {
    id: string
    status: string
    name: string
    spent: string
    budget_total?: number | string | null
    budget_daily?: number | string | null
    reach_estimate?: number | string | null
  }
}

type CreativeDetails = {
  creative: Creative
  campaign: Creative['campaign']
  metrics: {
    impressions: number
    reach?: number
    clicks: number
    ctr: number
    spend: number
    budget_total: number
    balance_remaining: number
  }
  latest_payment?: { reference: string; status: string }
}

type StatusFilter = 'all' | 'active' | 'in_review' | 'paused' | 'draft' | 'rejected' | 'archived'

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All ads', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'In review', value: 'in_review' },
  { label: 'Paused', value: 'paused' },
  { label: 'Draft', value: 'draft' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
]

const numberValue = (value: number | string | null | undefined) => {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

export default function AdsPortalDashboardPage() {
  const { data: adsData, loading: adsLoading, refetch } = useFetch<Creative[]>('/api/v2/ads/creatives')
  const { data: summary } = useFetch<{ impressions: number; reach?: number; clicks: number; spend: number; budget_total: number }>('/api/v2/ads/analytics/summary')
  const ads = adsData ?? []

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
        const responses = await Promise.all(ads.map((ad) => axiosInstance.get(`/api/v2/ads/creatives/${ad.id}`)))
        if (cancelled) return
        const next: Record<string, CreativeDetails> = {}
        responses.forEach((res) => {
          const payload = res.data as CreativeDetails
          const id = payload?.creative?.id
          if (id) next[id] = payload
        })
        setDetailsById(next)
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch creative details', error)
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
        const status = details?.campaign?.status || ad.campaign?.status || ad.status || 'draft'
        const metrics = details?.metrics
        const budget = numberValue(metrics?.budget_total ?? ad.campaign?.budget_total)
        const spend = numberValue(metrics?.spend ?? ad.campaign?.spent)
        const remaining = numberValue(metrics?.balance_remaining ?? Math.max(0, budget - spend))
        const reach = numberValue(metrics?.reach ?? ad.campaign?.reach_estimate)
        const impressions = numberValue(metrics?.impressions)
        const clicks = numberValue(metrics?.clicks)
        const ctr = metrics?.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : 0)

        return {
          ad,
          details,
          status,
          metrics,
          budget,
          spend,
          remaining,
          reach,
          impressions,
          clicks,
          ctr,
          paymentPending: details?.latest_payment?.status === 'pending',
        }
      })
      .filter((row) => statusFilter === 'all' || row.status === statusFilter)
      .filter((row) => {
        if (!search) return true
        return `${row.ad.title} ${row.ad.description ?? ''} ${row.ad.campaign?.name ?? ''}`.toLowerCase().includes(search)
      })
  }, [ads, detailsById, query, statusFilter])

  const totals = useMemo(() => {
    const fallbackBudget = ads.reduce((total, ad) => total + numberValue(ad.campaign?.budget_total), 0)
    const computedBudget = campaignRows.reduce((total, row) => total + row.budget, 0)
    const activeCount = ads.filter((ad) => (detailsById[ad.id]?.campaign?.status || ad.campaign?.status || ad.status) === 'active').length

    return {
      campaigns: ads.length,
      activeCount,
      impressions: numberValue(summary?.impressions) || campaignRows.reduce((total, row) => total + row.impressions, 0),
      reach: numberValue(summary?.reach) || campaignRows.reduce((total, row) => total + row.reach, 0),
      clicks: numberValue(summary?.clicks) || campaignRows.reduce((total, row) => total + row.clicks, 0),
      spend: numberValue(summary?.spend) || campaignRows.reduce((total, row) => total + row.spend, 0),
      budget: numberValue(summary?.budget_total) || computedBudget || fallbackBudget,
    }
  }, [ads, campaignRows, detailsById, summary])

  const averageCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const spendRatio = totals.budget > 0 ? Math.min(100, (totals.spend / totals.budget) * 100) : 0

  const metricsCards = [
    {
      label: 'Amount spent',
      value: formatNaira(totals.spend),
      detail: `${Math.round(spendRatio)}% of total budget`,
      icon: CircleDollarSign,
      tone: 'from-[#1877f2] to-[#42b72a]',
    },
    {
      label: 'Reach',
      value: totals.reach.toLocaleString(),
      detail: `${totals.impressions.toLocaleString()} impressions`,
      icon: Eye,
      tone: 'from-[#7c3aed] to-[#06b6d4]',
    },
    {
      label: 'Link clicks',
      value: totals.clicks.toLocaleString(),
      detail: `${averageCtr.toFixed(1)}% CTR`,
      icon: MousePointer2,
      tone: 'from-[#f97316] to-[#ef4444]',
    },
    {
      label: 'Campaigns',
      value: totals.campaigns.toLocaleString(),
      detail: `${totals.activeCount.toLocaleString()} active now`,
      icon: Megaphone,
      tone: 'from-[#111827] to-[#1877f2]',
    },
  ]

  const handleArchive = async (adId: string) => {
    if (!confirm('Archive this ad creative?')) return
    try {
      await axiosInstance.patch(`/api/v2/ads/creatives/${adId}`, { status: 'archived' })
      toast.success('Creative archived')
      refetch()
    } catch (error) {
      console.error(error)
      toast.error('Failed to archive creative')
    }
  }

  const handlePauseResume = async (ad: Creative) => {
    const campaignId = ad.campaign?.id
    if (!campaignId) return
    try {
      if (ad.campaign?.status === 'paused') {
        await axiosInstance.post(`/api/v2/ads/campaigns/${campaignId}/resume`)
        toast.success('Campaign resumed')
      } else {
        await axiosInstance.post(`/api/v2/ads/campaigns/${campaignId}/pause`)
        toast.success('Campaign paused')
      }
      refetch()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update campaign')
    }
  }

  return (
    <>
      <Head title="Ads Manager" />
      <div className="min-h-screen bg-[#f0f2f5] text-[#1c1e21] dark:bg-[#0f1117] dark:text-white">
        <div className="border-b border-black/5 bg-white/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#151821]/92">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#1877f2] dark:bg-[#1877f2]/15">
                <BarChart3 className="h-3.5 w-3.5" />
                Kara Ads Manager
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Campaign dashboard</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#65676b] dark:text-white/58">
                Track delivery, budget, reach, clicks, and campaign status from one control center.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2 rounded-xl border-[#d8dadf] bg-white dark:border-white/10 dark:bg-white/5">
                <Gauge className="h-4 w-4" />
                Reports
              </Button>
              <Link href={adsPortalPath('/create')}>
                <Button className="gap-2 rounded-xl bg-[#1877f2] text-white shadow-[0_12px_28px_rgba(24,119,242,0.25)] hover:bg-[#166fe5]">
                  <Plus className="h-4 w-4" />
                  Create campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_320px] lg:px-6">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#082f63,#1877f2_48%,#42b72a)] p-5 text-white shadow-[0_24px_70px_rgba(24,119,242,0.28)]">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Performance overview</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{formatNaira(totals.spend)} spent</h2>
                  <p className="mt-2 max-w-xl text-sm text-white/75">
                    Your campaigns reached {totals.reach.toLocaleString()} people with {totals.clicks.toLocaleString()} clicks.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Budget used</span>
                    <span className="font-bold">{Math.round(spendRatio)}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/18">
                    <div className="h-full rounded-full bg-white" style={{ width: `${spendRatio}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/65">
                    <span>{formatNaira(totals.spend)} spent</span>
                    <span>{formatNaira(Math.max(0, totals.budget - totals.spend))} left</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metricsCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171a23]">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', card.tone)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#65676b] dark:text-white/42">{card.label}</p>
                    <p className="mt-1 text-2xl font-black">{card.value}</p>
                    <p className="mt-1 text-xs text-[#65676b] dark:text-white/50">{card.detail}</p>
                  </div>
                )
              })}
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-[#171a23]">
              <div className="border-b border-black/5 p-4 dark:border-white/10">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-lg font-black">Campaigns</h2>
                    <p className="text-sm text-[#65676b] dark:text-white/50">Facebook-style delivery table for every active and draft campaign.</p>
                  </div>
                  <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65676b]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search campaigns"
                      className="h-11 w-full rounded-2xl border border-[#d8dadf] bg-[#f0f2f5] pl-9 pr-3 text-sm outline-none transition focus:border-[#1877f2] focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition',
                        statusFilter === filter.value
                          ? 'bg-[#1877f2] text-white shadow-[0_10px_24px_rgba(24,119,242,0.22)]'
                          : 'bg-[#f0f2f5] text-[#65676b] hover:bg-[#e4e6eb] dark:bg-white/6 dark:text-white/60 dark:hover:bg-white/10',
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {adsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f0f2f5] dark:bg-white/6" />
                  ))}
                </div>
              ) : ads.length === 0 ? (
                <EmptyState />
              ) : campaignRows.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="font-bold">No campaigns match this filter</p>
                  <p className="mt-1 text-sm text-[#65676b] dark:text-white/50">Try another status or search term.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="bg-[#f7f8fa] text-xs font-bold uppercase tracking-[0.12em] text-[#65676b] dark:bg-white/5 dark:text-white/42">
                      <tr>
                        <th className="px-5 py-3">Campaign</th>
                        <th className="px-4 py-3">Delivery</th>
                        <th className="px-4 py-3">Results</th>
                        <th className="px-4 py-3">Reach</th>
                        <th className="px-4 py-3">Amount spent</th>
                        <th className="px-4 py-3">Budget left</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                      {campaignRows.map((row) => (
                        <CampaignTableRow
                          key={row.ad.id}
                          row={row}
                          onArchive={handleArchive}
                          onPauseResume={handlePauseResume}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171a23]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#65676b] dark:text-white/42">Account health</p>
                  <h3 className="mt-1 text-xl font-black">Ready to deliver</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <InsightRow label="Active campaigns" value={totals.activeCount.toLocaleString()} />
                <InsightRow label="Total budget" value={formatNaira(totals.budget)} />
                <InsightRow label="Average CTR" value={`${averageCtr.toFixed(1)}%`} />
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-[#171a23]">
              <div className="bg-[linear-gradient(135deg,#111827,#1877f2)] p-5 text-white">
                <Sparkles className="h-6 w-6" />
                <h3 className="mt-3 text-xl font-black">Grow like Meta ads</h3>
                <p className="mt-2 text-sm text-white/72">Use video creatives, clear titles, and enough daily budget to keep delivery stable.</p>
              </div>
              <div className="space-y-3 p-5 text-sm text-[#65676b] dark:text-white/58">
                <p>Keep rejected ads updated and submit again after fixing creative issues.</p>
                <p>Pause weak campaigns and move budget to ads with better CTR.</p>
                <Link href={adsPortalPath('/create')}>
                  <Button className="mt-1 w-full rounded-xl bg-[#1877f2] text-white hover:bg-[#166fe5]">
                    Build a new campaign
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  )
}

function CampaignTableRow({
  row,
  onArchive,
  onPauseResume,
}: {
  row: {
    ad: Creative
    status: string
    impressions: number
    clicks: number
    ctr: number
    reach: number
    spend: number
    remaining: number
    paymentPending: boolean
  }
  onArchive: (adId: string) => void
  onPauseResume: (ad: Creative) => void
}) {
  const isVideo = row.ad.media_type === 'video' || row.ad.media_url?.toLowerCase().endsWith('.mp4') || row.ad.media_url?.toLowerCase().endsWith('.webm')

  return (
    <tr className="transition hover:bg-[#f7f8fa] dark:hover:bg-white/5">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl border border-black/5 bg-black/70 dark:border-white/10">
            <AdRender
              renderMode={(row.ad as any).render_mode || 'internal_asset'}
              mediaUrl={row.ad.media_url}
              mediaType={isVideo ? 'video' : row.ad.media_type}
              title={row.ad.title}
              className="h-full w-full object-cover"
            />
            {isVideo ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/28">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="max-w-[260px] truncate font-bold">{row.ad.title}</p>
            <p className="mt-0.5 max-w-[280px] truncate text-xs text-[#65676b] dark:text-white/45">{row.ad.campaign?.name || 'Campaign'}</p>
            {row.paymentPending ? (
              <Badge variant="outline" className="mt-1 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300">
                Payment pending
              </Badge>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className={cn('text-[11px] capitalize', adStatusClasses(row.status))}>
          {adStatusLabel[row.status] || row.status || 'Unknown'}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold">{row.clicks.toLocaleString()} clicks</p>
        <p className="text-xs text-[#65676b] dark:text-white/45">{row.ctr.toFixed(1)}% CTR</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold">{row.reach.toLocaleString()}</p>
        <p className="text-xs text-[#65676b] dark:text-white/45">{row.impressions.toLocaleString()} impressions</p>
      </td>
      <td className="px-4 py-4 font-bold">{formatNaira(row.spend)}</td>
      <td className="px-4 py-4">
        <p className="font-bold">{formatNaira(row.remaining)}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-1.5">
          <Link href={adsPortalShowPath(row.ad.id)}>
            <Button size="sm" variant="outline" className="h-8 gap-1 rounded-xl text-xs">
              Open
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={adsPortalEditPath(row.ad.id)}>
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs">Edit</Button>
          </Link>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-[#65676b] hover:text-[#1877f2]" onClick={() => onPauseResume(row.ad)}>
            {row.status === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-destructive/65 hover:text-destructive" onClick={() => onArchive(row.ad.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f0f2f5] px-4 py-3 dark:bg-white/6">
      <span className="text-sm text-[#65676b] dark:text-white/50">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e7f3ff] text-[#1877f2] dark:bg-[#1877f2]/12">
        <Megaphone className="h-7 w-7" />
      </div>
      <p className="text-lg font-black">No campaigns yet</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#65676b] dark:text-white/50">Create your first campaign to start reaching people across Karaads.</p>
      <Link href={adsPortalPath('/create')}>
        <Button className="mt-5 gap-2 rounded-xl bg-[#1877f2] text-white hover:bg-[#166fe5]">
          <Plus className="h-4 w-4" />
          Create campaign
        </Button>
      </Link>
    </div>
  )
}
