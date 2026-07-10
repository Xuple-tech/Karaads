import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Head, Link } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import { computeAdBudget, inferMediaTypeFromFile, rateForMediaType } from '@/lib/ads-pricing'
import { toast } from 'sonner'
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, Save, Wallet } from 'lucide-react'
import { useAdFormState } from '@/pages/app/ads/useAdFormState'
import { AdDetailsFields } from '@/pages/app/ads/components/AdDetailsFields'
import { BudgetFields } from '@/pages/app/ads/components/BudgetFields'
import { adsPortalShowPath, formatNaira } from './paths'

type CreativeResponse = {
  creative: any
  campaign: any
  metrics: {
    budget_total: number
    balance_remaining: number
  }
  wallet?: { balance?: number }
  latest_payment?: { reference: string; status: string; amount: number }
}

export default function AdsPortalEditPage() {
  const { creativeId = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, refetch } = useFetch<CreativeResponse>(creativeId ? `/api/v2/ads/creatives/${creativeId}` : '', { skip: !creativeId })
  const form = useAdFormState()
  const [saving, setSaving] = useState(false)
  const [funding, setFunding] = useState(false)

  const creative = data?.creative
  const campaign = data?.campaign
  const walletBalance = data?.wallet?.balance ?? 0
  const pendingPayment = data?.latest_payment?.status === 'pending' ? data.latest_payment : null

  useEffect(() => {
    if (!creative || !campaign) return
    form.setTitle(creative.title || '')
    form.setDescription(creative.description || '')
    form.setTargetUrl(creative.target_url || '')
    form.setMediaPreview(creative.media_url || null)
    const fallbackRate = rateForMediaType(creative.media_type || campaign.pricing_media_type)
    const fallbackDailyViews = Math.max(1, Math.round((Number(campaign.budget_daily) || 0) / fallbackRate) || 1)
    form.setDailyTargetViews(Number(campaign.daily_target_views) || fallbackDailyViews)
    form.setDurationDays(Math.max(1, Math.round((new Date(campaign.end_at).getTime() - new Date(campaign.start_at).getTime()) / 86400000)) || 1)
    form.setStartDate(campaign.start_at ? new Date(campaign.start_at).toISOString().split('T')[0] : form.startDate)
  }, [creative, campaign])

  const pricingMediaType = useMemo(() => {
    if (form.media) {
      return inferMediaTypeFromFile(form.media)
    }

    return creative?.media_type === 'video' || campaign?.pricing_media_type === 'video' ? 'video' : 'image'
  }, [campaign?.pricing_media_type, creative?.media_type, form.media])

  const budgetModel = useMemo(
    () => computeAdBudget(form.dailyTargetViews, form.durationDays, pricingMediaType),
    [form.dailyTargetViews, form.durationDays, pricingMediaType],
  )

  const budgetCaps = useMemo(() => ({ min: 500, max: 1_000_000 }), [])

  const handleSave = async () => {
    if (!creative || !campaign) return
    try {
      setSaving(true)
      await axiosInstance.patch(`/api/v2/ads/campaigns/${campaign.id}`, {
        name: campaign.name,
        pricing_media_type: pricingMediaType,
        daily_target_views: budgetModel.dailyTargetViews,
        billing_model: pricingMediaType === 'video' ? 'cpv' : 'cpm',
        start_at: new Date(form.startDate).toISOString(),
        end_at: new Date(new Date(form.startDate).getTime() + form.durationDays * 86400000).toISOString(),
      })

      if (form.media) {
        const fd = new FormData()
        fd.append('title', form.title)
        fd.append('description', form.description)
        fd.append('target_url', form.targetUrl)
        fd.append('media', form.media)
        await axiosInstance.patch(`/api/v2/ads/creatives/${creative.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await axiosInstance.patch(`/api/v2/ads/creatives/${creative.id}`, {
          title: form.title,
          description: form.description,
          target_url: form.targetUrl,
        })
      }

      toast.success('Campaign updated')
      refetch()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleTopUp = async () => {
    if (!campaign) return
    try {
      setFunding(true)
      const amountNeeded = Math.max(0, budgetModel.totalBudget - walletBalance)
      const amount = Math.max(amountNeeded, budgetCaps.min)
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up', { amount, campaign_id: campaign.id })
      const authUrl = res.data?.authorization_url
      if (authUrl) {
        toast.success('Redirecting to Paystack...')
        window.location.assign(authUrl)
      } else {
        toast.error('Payment started, but Paystack did not return a checkout link. Please try again.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to start payment')
    } finally {
      setFunding(false)
    }
  }

  const handleVerify = async () => {
    if (!pendingPayment?.reference) return
    try {
      setFunding(true)
      await axiosInstance.post('/api/v2/ads/wallet/top-up/verify', { reference: pendingPayment.reference })
      toast.success('Payment verified')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setFunding(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  return (
    <>
      <Head title={`Edit ${creative?.title || 'Campaign'}`} />

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Edit campaign</p>
                <h2 className="text-lg font-semibold">{creative?.title}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={adsPortalShowPath(creativeId)}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Creative Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AdDetailsFields
                title={form.title}
                description={form.description}
                targetUrl={form.targetUrl}
                media={form.media}
                mediaPreview={form.mediaPreview}
                onTitleChange={form.setTitle}
                onDescriptionChange={form.setDescription}
                onTargetUrlChange={form.setTargetUrl}
                onMediaSelect={(file) => {
                  form.setMedia(file)
                  if (!file) {
                    form.setMediaPreview(null)
                    return
                  }
                  const reader = new FileReader()
                  reader.onloadend = () => form.setMediaPreview(reader.result as string)
                  reader.readAsDataURL(file)
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Budget & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BudgetFields
                  dailyTargetViews={form.dailyTargetViews}
                  durationDays={form.durationDays}
                  startDate={form.startDate}
                  budgetCaps={budgetCaps}
                  onDailyTargetViewsChange={form.setDailyTargetViews}
                  onDurationChange={form.setDurationDays}
                  onStartDateChange={form.setStartDate}
                  pricingPerView={budgetModel.rate}
                />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Wallet Funding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current wallet balance</p>
                  <p className="mt-2 text-2xl font-semibold">{formatNaira(walletBalance)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campaign budget</p>
                  <p className="mt-2 text-2xl font-semibold">{formatNaira(budgetModel.totalBudget)}</p>
                  <p className="mt-1 text-muted-foreground">People reached per day: {budgetModel.dailyTargetViews.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {pendingPayment ? (
                    <Button variant="outline" className="flex-1 gap-2" onClick={handleVerify} disabled={funding}>
                      {funding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Verify payment
                    </Button>
                  ) : (
                    <Button className="flex-1 gap-2" onClick={handleTopUp} disabled={funding}>
                      {funding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                      Top up wallet
                    </Button>
                  )}
                </div>

                {walletBalance < budgetModel.totalBudget && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Wallet balance is below the campaign budget. Add funds before activation or review approval can proceed smoothly.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
