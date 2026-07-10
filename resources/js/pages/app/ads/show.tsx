import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Head, Link } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { AdRender } from '@/components/ads/ad-render'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import { getSafeExternalUrl } from '@/lib/url-guard'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pause,
  Pencil,
  Play,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CreativeResponse = {
  creative: any
  campaign: any
  metrics: {
    impressions: number
    clicks: number
    ctr: number
    spend: number
    budget_total: number
    balance_remaining: number
    last_funded_at?: string
  }
  wallet?: { balance?: number }
  latest_payment?: { reference: string; status: string; amount: number }
}

export default function AdShowPage() {
  const { creativeId = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, refetch } = useFetch<CreativeResponse>(
    creativeId ? `/api/v2/ads/creatives/${creativeId}` : '',
    { skip: !creativeId }
  )
  const [verifying, setVerifying] = useState(false)

  const creative = data?.creative
  const campaign = data?.campaign
  const metrics = data?.metrics
  const latestPayment = data?.latest_payment
  const safeTargetUrl = useMemo(
    () => getSafeExternalUrl(creative?.target_url || null),
    [creative?.target_url],
  )

  const statusColor = useMemo(() => {
    const status = campaign?.status
    if (status === 'active') return 'border-emerald-300/35 bg-emerald-500/16 text-emerald-100'
    if (status === 'in_review') return 'border-amber-300/35 bg-amber-500/16 text-amber-100'
    if (status === 'approved') return 'border-sky-300/35 bg-sky-500/16 text-sky-100'
    if (status === 'paused') return 'border-white/25 bg-white/10 text-white/85'
    if (status === 'rejected') return 'border-red-300/35 bg-red-500/16 text-red-100'
    return 'border-white/20 bg-white/10 text-white/80'
  }, [campaign?.status])

  const handleArchive = async () => {
    if (!creative) return
    if (!confirm('Archive this creative?')) return
    try {
      await axiosInstance.patch(`/api/v2/ads/creatives/${creative.id}`, { status: 'archived' })
      toast.success('Creative archived')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to archive')
    }
  }

  const handleSubmitReview = async () => {
    if (!campaign) return
    try {
      await axiosInstance.post(`/api/v2/ads/campaigns/${campaign.id}/review-submit`)
      toast.success('Submitted for review')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit')
    }
  }

  const handlePauseResume = async () => {
    if (!campaign) return
    try {
      if (campaign.status === 'paused') {
        await axiosInstance.post(`/api/v2/ads/campaigns/${campaign.id}/resume`)
        toast.success('Campaign resumed')
      } else {
        await axiosInstance.post(`/api/v2/ads/campaigns/${campaign.id}/pause`)
        toast.success('Campaign paused')
      }
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  const handleVerifyPayment = async () => {
    if (!latestPayment?.reference) return
    try {
      setVerifying(true)
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up/verify', {
        reference: latestPayment.reference,
      })
      toast.success(res.data?.message || 'Payment verified')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not verify payment')
    } finally {
      setVerifying(false)
    }
  }

  if (!creativeId) {
    return <div className="p-4 text-sm text-muted-foreground">Missing creative id.</div>
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0b0e13] p-4">
        <div className="mx-auto max-w-2xl space-y-3 animate-pulse">
          <div className="h-10 rounded-2xl bg-white/10" />
          <div className="h-56 rounded-3xl bg-white/10" />
          <div className="h-32 rounded-2xl bg-white/10" />
        </div>
      </div>
    )
  }

  const creativeStatus = creative?.status
  const creativeStatusClasses: Record<string, string> = {
    active: 'border-emerald-300/35 bg-emerald-500/14 text-emerald-200',
    approved: 'border-sky-300/35 bg-sky-500/14 text-sky-200',
    in_review: 'border-amber-300/35 bg-amber-500/14 text-amber-200',
    draft: 'border-white/15 bg-white/6 text-white/55',
    rejected: 'border-red-300/35 bg-red-500/14 text-red-200',
    paused: 'border-white/15 bg-white/6 text-white/55',
  }

  return (
    <>
      <Head title={creative?.title || 'Ad Detail'} />
      <div className="min-h-screen bg-[#0b0e13] pb-24 text-white">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0e13]/90 backdrop-blur-xl">
          <div className="mobile-safe-top mobile-safe-x mx-auto flex w-full max-w-2xl items-center justify-between px-4 pb-3 pt-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Campaign</p>
                <p className="truncate text-sm font-semibold text-white">{campaign?.name}</p>
              </div>
            </div>
            <Link href={`/ads/${creative.id}/edit`}>
              <Button className="h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-black hover:bg-white/90">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="mobile-safe-x mx-auto w-full max-w-2xl space-y-3 px-4 pt-4">
          {/* Media preview */}
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-black">
            <AdRender
              renderMode={creative.render_mode}
              mediaUrl={creative.media_url}
              mediaType={creative.media_type}
              title={creative.title}
              className="h-55 w-full object-cover sm:h-70"
            />
          </div>

          {/* Title + description */}
          <div className="rounded-2xl border border-white/8 bg-white/2.5 p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-white">{creative.title}</h2>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest', statusColor)}>
                  Campaign: {campaign?.status}
                </span>
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest', creativeStatusClasses[creativeStatus] || 'border-white/15 bg-white/6 text-white/50')}>
                  Creative: {creativeStatus}
                </span>
              </div>
            </div>
            {creative.description && <p className="text-sm text-white/60">{creative.description}</p>}
            {safeTargetUrl && (
              <a href={safeTargetUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
                Target URL <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Performance */}
          <div className="rounded-2xl border border-white/8 bg-white/2.5 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/40">Performance</p>
            <div className="grid grid-cols-3 divide-x divide-white/7">
              {[
                { label: 'Impressions', value: (metrics?.impressions ?? 0).toLocaleString() },
                { label: 'Clicks', value: (metrics?.clicks ?? 0).toLocaleString() },
                { label: 'CTR', value: `${(metrics?.ctr ?? 0).toFixed(2)}%` },
              ].map((s) => (
                <div key={s.label} className="px-2 text-center first:pl-0 last:pr-0">
                  <p className="text-[10px] text-white/35">{s.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget & wallet */}
          <div className="rounded-2xl border border-white/8 bg-white/2.5 p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Budget &amp; Wallet</p>
            <Row label="Budget" value={`₦${(metrics?.budget_total ?? 0).toLocaleString()}`} />
            <Row label="Spend" value={`₦${(metrics?.spend ?? 0).toLocaleString()}`} />
            <Row label="Remaining" value={`₦${(metrics?.balance_remaining ?? 0).toLocaleString()}`} />
            <Row label="Wallet balance" value={`₦${(data?.wallet?.balance ?? 0).toLocaleString()}`} />
            {metrics?.last_funded_at && (
              <Row label="Last funded" value={new Date(metrics.last_funded_at).toLocaleDateString()} />
            )}
            {latestPayment && (
              <div className="mt-1 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    latestPayment.status === 'successful'
                      ? 'border-emerald-300/35 bg-emerald-500/14 text-emerald-200'
                      : latestPayment.status === 'pending'
                        ? 'border-amber-300/35 bg-amber-500/14 text-amber-200'
                        : 'border-red-300/35 bg-red-500/14 text-red-200'
                  )}>
                    {latestPayment.status}
                  </span>
                  <span className="truncate font-mono text-xs text-white/50">{latestPayment.reference}</span>
                </div>
                {latestPayment.amount != null && latestPayment.amount > 0 && (
                  <p className="mt-1.5 text-sm font-semibold text-white">₦{latestPayment.amount.toLocaleString()}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-white/8 bg-white/2.5 p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-10 border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={handlePauseResume}
              >
                {campaign?.status === 'paused' ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {campaign?.status === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outline"
                className="h-10 border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={handleSubmitReview}
                disabled={campaign?.status === 'in_review'}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Submit review
              </Button>
              {latestPayment?.status === 'pending' && (
                <Button
                  className="col-span-2 h-10 bg-white text-black hover:bg-white/90"
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                >
                  {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Verify payment
                </Button>
              )}
              <Button
                variant="outline"
                className="col-span-2 h-10 border-red-400/25 bg-red-500/8 text-red-200 hover:bg-red-500/15"
                onClick={handleArchive}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archive creative
              </Button>
            </div>
          </div>

          {/* Rejection reason */}
          {campaign?.status === 'rejected' && campaign?.rejection_reason && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-4">
              <div className="flex items-center gap-2 text-red-200">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Rejection reason</p>
              </div>
              <p className="mt-2 text-sm text-white/65">{campaign.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/2 px-3 py-2 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  )
}
