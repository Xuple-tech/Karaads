import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Head, Link } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/use-fetch'
import axiosInstance from '@/lib/axios'
import { computeAdBudget, inferMediaTypeFromFile, rateForMediaType } from '@/lib/ads-pricing'
import { toast } from 'sonner'
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Megaphone,
  Save,
  Target,
  Wallet,
} from 'lucide-react'

import {
  AdsFlowScaffold,
  AdsStickyActionBar,
  AdsSurfaceCard,
  type AdFlowStep,
} from './components/AdsFlowScaffold'
import { useAdFormState } from './useAdFormState'
import { AdDetailsFields } from './components/AdDetailsFields'
import { BudgetFields } from './components/BudgetFields'

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

export default function EditAdPage() {
  const { creativeId = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, refetch } = useFetch<CreativeResponse>(
    creativeId ? `/api/v2/ads/creatives/${creativeId}` : '',
    { skip: !creativeId }
  )

  const form = useAdFormState()
  const [saving, setSaving] = useState(false)
  const [funding, setFunding] = useState(false)
  const [step, setStep] = useState(1)
  const localMediaPreviewRef = useRef<string | null>(null)

  const creative = data?.creative
  const campaign = data?.campaign
  const walletBalance = data?.wallet?.balance ?? 0
  const pendingPayment = data?.latest_payment?.status === 'pending' ? data.latest_payment : null

  const steps: AdFlowStep[] = useMemo(
    () => [
      { number: 1, title: 'Creative', shortTitle: 'Creative', icon: Megaphone },
      { number: 2, title: 'Budget & Funding', shortTitle: 'Budget', icon: Target },
    ],
    []
  )

  const revokeLocalMediaPreview = () => {
    if (localMediaPreviewRef.current) {
      URL.revokeObjectURL(localMediaPreviewRef.current)
      localMediaPreviewRef.current = null
    }
  }

  const setSelectedMediaFile = (file: File | null) => {
    revokeLocalMediaPreview()
    form.setMedia(file)

    if (!file) {
      form.setMediaPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    localMediaPreviewRef.current = previewUrl
    form.setMediaPreview(previewUrl)
  }

  useEffect(() => {
    return () => revokeLocalMediaPreview()
  }, [])

  useEffect(() => {
    if (!creative || !campaign) return
    revokeLocalMediaPreview()
    form.setMedia(null)
    form.setTitle(creative.title || '')
    form.setDescription(creative.description || '')
    form.setTargetUrl(creative.target_url || '')
    form.setMediaPreview(creative.media_url || null)
    const fallbackRate = rateForMediaType(creative.media_type || campaign.pricing_media_type)
    const fallbackDailyViews = Math.max(1, Math.round((Number(campaign.budget_daily) || 0) / fallbackRate) || 1)
    form.setDailyTargetViews(Number(campaign.daily_target_views) || fallbackDailyViews)
    form.setDurationDays(
      Math.max(
        1,
        Math.round(
          (new Date(campaign.end_at).getTime() - new Date(campaign.start_at).getTime()) / 86400000
        )
      ) || 1
    )
    form.setStartDate(
      campaign.start_at ? new Date(campaign.start_at).toISOString().split('T')[0] : form.startDate
    )
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
        end_at: new Date(
          new Date(form.startDate).getTime() + form.durationDays * 86400000
        ).toISOString(),
      })

      const creativePayload: Record<string, any> = {
        title: form.title,
        description: form.description,
        target_url: form.targetUrl,
      }

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
        await axiosInstance.patch(`/api/v2/ads/creatives/${creative.id}`, creativePayload)
      }

      toast.success('Ad updated')
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
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up', {
        amount,
        campaign_id: campaign.id,
      })
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
      <div className="min-h-screen bg-[#0b0e13] p-4">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-12 rounded-2xl bg-white/10" />
          <div className="h-64 rounded-3xl bg-white/10" />
        </div>
      </div>
    )
  }

  return (
    <>
      <Head title={`Edit ${creative?.title || 'Ad'}`} />
      <AdsFlowScaffold
        title="Edit Campaign"
        subtitle={creative?.title || 'Update your creative and funding'}
        steps={steps}
        currentStep={step}
        onBack={() => navigate(-1)}
        headerActions={
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-full bg-white px-4 text-black hover:bg-white/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      >
        {step === 1 && (
          <div className="space-y-4 pb-24 sm:pb-0">
            <AdsSurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">Creative Details</p>
                <Link href={`/ads/${creativeId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    View ad
                  </Button>
                </Link>
              </div>
              <AdDetailsFields
                title={form.title}
                description={form.description}
                targetUrl={form.targetUrl}
                media={form.media}
                mediaPreview={form.mediaPreview}
                layout="mobile"
                onTitleChange={form.setTitle}
                onDescriptionChange={form.setDescription}
                onTargetUrlChange={form.setTargetUrl}
                onMediaSelect={setSelectedMediaFile}
              />
            </AdsSurfaceCard>

            <AdsStickyActionBar>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 bg-white text-black hover:bg-white/90"
                  onClick={() => setStep(2)}
                >
                  Budget & Funding
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </AdsStickyActionBar>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pb-24 sm:pb-0">
            <AdsSurfaceCard>
              <BudgetFields
                dailyTargetViews={form.dailyTargetViews}
                durationDays={form.durationDays}
                startDate={form.startDate}
                budgetCaps={budgetCaps}
                onDailyTargetViewsChange={form.setDailyTargetViews}
                onDurationChange={form.setDurationDays}
                onStartDateChange={form.setStartDate}
                pricingPerView={budgetModel.rate}
                layout="mobile"
              />
            </AdsSurfaceCard>

            <AdsSurfaceCard className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">Wallet Funding</p>
              <SummaryRow label="Wallet balance" value={`NGN ${walletBalance.toLocaleString()}`} />
              <SummaryRow label="Campaign budget" value={`NGN ${budgetModel.totalBudget.toLocaleString()}`} />
              <SummaryRow label="People reached per day" value={budgetModel.dailyTargetViews.toLocaleString()} />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {pendingPayment ? (
                  <Button
                    variant="outline"
                    className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={handleVerify}
                    disabled={funding}
                  >
                    {funding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Verify payment
                  </Button>
                ) : (
                  <Button
                    className="h-11 bg-white text-black hover:bg-white/90"
                    onClick={handleTopUp}
                    disabled={funding}
                  >
                    {funding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    {funding ? 'Redirecting to Paystack...' : 'Top up wallet'}
                  </Button>
                )}
              </div>

              {walletBalance < budgetModel.totalBudget && (
                <p className="rounded-xl border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  Wallet balance is lower than planned budget. Add funds before activation.
                </p>
              )}
            </AdsSurfaceCard>

            <AdsStickyActionBar>
              <div className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2 sm:space-y-0">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => navigate(`/ads/${creativeId}`)}
                >
                  View
                </Button>
                <Button
                  className="h-11 bg-white text-black hover:bg-white/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </AdsStickyActionBar>
          </div>
        )}
      </AdsFlowScaffold>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}
