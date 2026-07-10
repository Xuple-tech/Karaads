import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Head, Link } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdRender } from '@/components/ads/ad-render'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import { getSafeExternalUrl } from '@/lib/url-guard'
import { toast } from 'sonner'
import { ArrowLeft, ExternalLink, Loader2, Pause, Pencil, Play, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adStatusClasses, adStatusLabel, adsPortalEditPath, adsPortalPath, formatNaira } from './paths'

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

export default function AdsPortalShowPage() {
  const { creativeId = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, refetch } = useFetch<CreativeResponse>(creativeId ? `/api/v2/ads/creatives/${creativeId}` : '', { skip: !creativeId })
  const [verifying, setVerifying] = useState(false)

  const creative = data?.creative
  const campaign = data?.campaign
  const metrics = data?.metrics
  const latestPayment = data?.latest_payment
  const safeTargetUrl = useMemo(
    () => getSafeExternalUrl(creative?.target_url || null),
    [creative?.target_url],
  )

  const badgeClass = useMemo(() => adStatusClasses(campaign?.status), [campaign?.status])

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
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up/verify', { reference: latestPayment.reference })
      toast.success(res.data?.message || 'Payment verified')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not verify payment')
    } finally {
      setVerifying(false)
    }
  }

  if (!creativeId) return <div className="p-4 text-sm text-muted-foreground">Missing creative id.</div>

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  return (
    <>
      <Head title={creative?.title || 'Campaign'} />

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campaign details</p>
                <h2 className="text-lg font-semibold">{campaign?.name || 'Campaign'}</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={adsPortalEditPath(creative.id)}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handlePauseResume} className="gap-1">
                {campaign?.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {campaign?.status === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleArchive} className="text-destructive hover:text-destructive">
                Archive
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
              <div className="relative">
                <AdRender
                  renderMode={creative.render_mode}
                  mediaUrl={creative.media_url}
                  mediaType={creative.media_type}
                  title={creative.title}
                  className="h-65 w-full object-cover md:h-105"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn('border', badgeClass)}>
                    Campaign: {adStatusLabel[campaign?.status] || campaign?.status || 'unknown'}
                  </Badge>
                  <Badge variant="outline" className={cn('border', adStatusClasses(creative?.status))}>
                    Creative: {adStatusLabel[creative?.status] || creative?.status || 'unknown'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 border-t border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{creative.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{creative.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleSubmitReview} disabled={campaign?.status === 'in_review'} className="gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      Submit review
                    </Button>
                    {latestPayment?.status === 'pending' && (
                      <Button size="sm" onClick={handleVerifyPayment} disabled={verifying} className="gap-1">
                        {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                        Verify payment
                      </Button>
                    )}
                  </div>
                </div>

                {safeTargetUrl && (
                  <a href={safeTargetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline">
                    Visit target URL <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </section>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Performance Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <KpiTile label="Impressions" value={(metrics?.impressions ?? 0).toLocaleString()} />
                <KpiTile label="Clicks" value={(metrics?.clicks ?? 0).toLocaleString()} />
                <KpiTile label="CTR" value={`${(metrics?.ctr ?? 0).toFixed(2)}%`} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Budget & Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Budget total" value={formatNaira(metrics?.budget_total ?? 0)} />
                <Row label="Spend" value={formatNaira(metrics?.spend ?? 0)} />
                <Row label="Remaining" value={formatNaira(metrics?.balance_remaining ?? 0)} />
                <Row label="Wallet balance" value={formatNaira(data?.wallet?.balance ?? 0)} />
                {metrics?.last_funded_at && <Row label="Last funded" value={new Date(metrics.last_funded_at).toLocaleString()} />}
                {latestPayment && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest payment</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn('border', adStatusClasses(latestPayment.status))}>{latestPayment.status}</Badge>
                      <span className="font-mono text-xs">{latestPayment.reference}</span>
                    </div>
                    {latestPayment.amount != null && latestPayment.amount > 0 && (
                      <p className="mt-1.5 text-sm font-semibold">{formatNaira(latestPayment.amount)}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {campaign?.status === 'rejected' && campaign?.rejection_reason && (
              <Card className="border-rose-500/20 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    Rejection Reason
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{campaign.rejection_reason}</CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}
