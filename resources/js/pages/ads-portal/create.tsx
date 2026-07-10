import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Head, Link, router } from '@/components/page-head'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import axiosInstance from '@/lib/axios'
import {
  computeAdBudget,
  inferMediaTypeFromFile,
  inferMediaTypeFromPost,
  postHasMedia,
} from '@/lib/ads-pricing'
import { toast } from 'sonner'
import { AdDetailsFields } from '@/pages/app/ads/components/AdDetailsFields'
import { BudgetFields } from '@/pages/app/ads/components/BudgetFields'
import { useAdFormState } from '@/pages/app/ads/useAdFormState'
import { Banknote, Check, CreditCard, Loader2, Megaphone, Target } from 'lucide-react'
import { adsPortalPath, formatNaira } from './paths'

const budgetCaps = {
  min: 500,
  max: 1_000_000,
}

export default function AdsPortalCreatePage() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [funding, setFunding] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [creativeCreated, setCreativeCreated] = useState(false)

  const form = useAdFormState()

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference) return

    ;(async () => {
      try {
        setFunding(true)
        const res = await axiosInstance.post('/api/v2/ads/wallet/top-up/verify', { reference })
        toast.success(res.data?.message || 'Payment verified')
        setStep(4)
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Could not verify payment')
      } finally {
        setFunding(false)
      }
    })()
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('mode') === 'boost') {
      form.setPromotionType('boosted')
    }
  }, [searchParams, form.setPromotionType])

  const displayPost = (post: any) => post?.original_post ?? post

  const resolveCampaignMediaType = () => {
    if (form.promotionType === 'boosted') {
      return inferMediaTypeFromPost(form.selectedPost)
    }

    return inferMediaTypeFromFile(form.media)
  }

  const ensureCampaignAndCreative = async (): Promise<string | null> => {
    if (campaignId && creativeCreated) return campaignId

    if (form.promotionType === 'boosted' && !form.selectedPost) {
      toast.error('Select a post to boost.')
      return null
    }

    if (form.promotionType === 'boosted' && !postHasMedia(form.selectedPost)) {
      toast.error('Boosted campaigns require a post with image or video media.')
      return null
    }

    const endDate = new Date(new Date(form.startDate).getTime() + form.durationDays * 86400000).toISOString()
    const pricingMediaType = resolveCampaignMediaType()
    const budgetModel = computeAdBudget(form.dailyTargetViews, form.durationDays, pricingMediaType)

    const campaignResponse = await axiosInstance.post('/api/v2/ads/campaigns', {
      name: `Campaign: ${form.title}`,
      objective: 'traffic',
      billing_model: pricingMediaType === 'video' ? 'cpv' : 'cpm',
      pricing_media_type: pricingMediaType,
      daily_target_views: budgetModel.dailyTargetViews,
      promotion_type: form.promotionType,
      post_id: form.promotionType === 'boosted' ? displayPost(form.selectedPost).id : null,
      pacing_type: 'standard',
      targeting: { surface: ['feed', 'moments', 'profile'] },
      start_at: new Date(form.startDate).toISOString(),
      end_at: endDate,
    })

    const newCampaignId = campaignResponse.data?.campaign?.id as string | undefined
    if (!newCampaignId) {
      toast.error('Could not create campaign.')
      return null
    }
    setCampaignId(newCampaignId)

    const fd = new FormData()
    fd.append('campaign_id', newCampaignId)
    fd.append('source_type', 'internal')
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('target_url', form.targetUrl)
    fd.append('render_mode', 'internal_asset')
    if (form.media) fd.append('media', form.media)

    await axiosInstance.post('/api/v2/ads/creatives', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setCreativeCreated(true)

    return newCampaignId
  }

  useEffect(() => {
    const fetchPosts = async () => {
      const requestedPostId = searchParams.get('post')
      const shouldPreloadForBoost = searchParams.get('mode') === 'boost' && Boolean(requestedPostId) && !form.selectedPost
      if ((!form.postDialogOpen && !shouldPreloadForBoost) || form.posts.length > 0 || form.loadingPosts) return
      try {
        form.setLoadingPosts(true)
        const profile = await axiosInstance.get('/api/users/profile')
        const userId =
          profile.data?.id ||
          profile.data?.user?.id ||
          profile.data?.data?.id ||
          profile.data?.user_id ||
          profile.data?.user?.data?.id
        if (!userId) throw new Error('Could not resolve user')

        const res = await axiosInstance.get(`/api/users/${userId}/posts?limit=20`)
        const raw = Array.isArray(res.data?.data) ? res.data.data : res.data || []
        const filtered = raw.filter((p: any) => p.type !== 'repost')
        form.setPosts(filtered)
        if (requestedPostId) {
          const matched = filtered.find((p: any) => String(p.id) === String(requestedPostId))
          if (matched) {
            form.setSelectedPost(matched)
            form.setPromotionType('boosted')
          }
        }
      } catch (error: any) {
        console.error(error)
        toast.error(error.response?.data?.message || 'Unable to load your posts')
      } finally {
        form.setLoadingPosts(false)
      }
    }
    fetchPosts()
  }, [
    form.loadingPosts,
    form.postDialogOpen,
    form.posts.length,
    form.selectedPost,
    form.setLoadingPosts,
    form.setPosts,
    form.setPromotionType,
    form.setSelectedPost,
    searchParams,
  ])

  const handleTopUp = async () => {
    try {
      setFunding(true)
      const cid = await ensureCampaignAndCreative()
      if (!cid) return
      const budgetModel = computeAdBudget(form.dailyTargetViews, form.durationDays, resolveCampaignMediaType())
      const amount = Math.max(budgetModel.totalBudget, budgetCaps.min)
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up', { amount, campaign_id: cid })
      const authUrl = res.data?.authorization_url
      if (authUrl) {
        toast.success('Redirecting to Paystack...')
        window.location.assign(authUrl)
      } else {
        toast.error('Payment started, but Paystack did not return a checkout link. Please try again.')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to start payment')
    } finally {
      setFunding(false)
    }
  }

  const handleSaveForLater = async () => {
    try {
      setSubmitting(true)
      const cid = await ensureCampaignAndCreative()
      if (!cid) return
      toast.success('Campaign saved and submitted for review. Complete payment to go live.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const renderPostPreview = (post: any) => {
    const base = displayPost(post)
    const media = base.media?.[0]
    if (media?.thumbnail || media?.path || media?.url) {
      const src = media.thumbnail || media.path || media.url
      return <img src={src} alt="Post preview" className="h-28 w-full rounded-lg object-cover" />
    }
    return (
      <div className="h-28 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {base.content || 'No caption'}
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Creative', icon: Megaphone },
    { number: 2, title: 'Budget', icon: Target },
    { number: 3, title: 'Review', icon: Check },
    { number: 4, title: 'Pay', icon: CreditCard },
  ]
  const budgetModel = computeAdBudget(form.dailyTargetViews, form.durationDays, resolveCampaignMediaType())

  return (
    <>
      <Head title="Create Campaign" />

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">New campaign</p>
              <h2 className="text-xl font-semibold">Launch a campaign in four steps</h2>
              <p className="mt-1 text-sm text-muted-foreground">Separate workflow for the Ads Manager portal. Existing `/ads` flow is unchanged.</p>
            </div>
            <Link href={adsPortalPath('/')}>
              <Button variant="outline">Back to campaigns</Button>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="rounded-xl border border-border bg-background/70 p-3">
                <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full ${step >= s.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Step {s.number}</p>
                <p className="font-medium">{s.title}</p>
              </div>
            ))}
          </div>
        </section>

        {step === 1 && (
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Creative Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Promotion Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['standard', 'boosted'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => form.setPromotionType(type)}
                        className={`rounded-xl border px-3 py-2 text-sm ${form.promotionType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background hover:bg-muted/40'}`}
                      >
                        {type === 'standard' ? 'Standard Ad' : 'Boost Post'}
                      </button>
                    ))}
                  </div>
                </div>

                {form.promotionType === 'boosted' && (
                  <div className="space-y-2">
                    <Label>Post to Boost</Label>
                    <Button type="button" variant="outline" className="w-full justify-between" onClick={() => form.setPostDialogOpen(true)}>
                      {form.selectedPost ? 'Change selected post' : 'Choose a post'}
                    </Button>
                    {form.selectedPost && (
                      <div className="rounded-xl border border-border bg-background/70 p-3">
                        {renderPostPreview(form.selectedPost)}
                        <p className="mt-2 line-clamp-2 text-sm">{displayPost(form.selectedPost).content || 'Untitled post'}</p>
                      </div>
                    )}
                  </div>
                )}

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
                    if (!file) {
                      form.setMedia(null)
                      form.setMediaPreview(null)
                      return
                    }
                    form.setMedia(file)
                    const reader = new FileReader()
                    reader.onloadend = () => form.setMediaPreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Step Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">Add a strong headline, clear description, destination URL, and media asset. You can use image or video creatives.</p>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Validation</p>
                  <p className="mt-2 font-medium">{form.isValidForNext ? 'Ready for budget setup' : 'Complete all creative fields to continue'}</p>
                </div>
                <Button className="w-full" onClick={() => setStep(2)} disabled={!form.isValidForNext}>
                  Continue to Budget
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <Card className="border-border/70 shadow-none">
              <CardHeader><CardTitle>Budget & Schedule</CardTitle></CardHeader>
              <CardContent>
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
              <CardHeader><CardTitle>Budget Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <SummaryRow label="Total budget" value={formatNaira(budgetModel.totalBudget)} />
                <SummaryRow label="Daily budget" value={formatNaira(budgetModel.dailyBudget.toFixed(2))} />
                <SummaryRow label="People reached per day" value={budgetModel.dailyTargetViews.toLocaleString()} />
                <SummaryRow label="Duration" value={`${form.durationDays} days`} />
                <SummaryRow label="Start date" value={form.startDate} />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Review</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card className="border-border/70 shadow-none">
              <CardHeader><CardTitle>Campaign Review</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-border bg-background">
                  <div className="relative aspect-video bg-muted">
                    {form.mediaPreview ? (
                      form.media?.type?.startsWith('video') ? (
                        <video src={form.mediaPreview} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={form.mediaPreview} alt="Ad preview" className="h-full w-full object-cover" />
                      )
                    ) : null}
                    <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white">Sponsored</div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{form.title}</h3>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                    <p className="truncate text-xs text-primary">{form.targetUrl}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-none">
              <CardHeader><CardTitle>Finalize</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <SummaryRow label="Budget" value={formatNaira(budgetModel.totalBudget)} />
                <SummaryRow label="Duration" value={`${form.durationDays} days`} />
                <SummaryRow label="Start" value={form.startDate} />
                <SummaryRow
                  label="End"
                  value={new Date(new Date(form.startDate).getTime() + form.durationDays * 86400000).toISOString().split('T')[0]}
                />
                <Button variant="outline" className="w-full" onClick={handleSaveForLater} disabled={submitting || funding}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Submit Review
                </Button>
                <Button className="w-full" onClick={() => setStep(4)}>
                  Continue to Payment
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>Back</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 4 && (
          <Card className="mx-auto max-w-2xl border-border/70 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                <Banknote className="h-6 w-6" />
              </div>
              <CardTitle className="mt-2 text-2xl">Fund & Launch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Campaign and creative will be saved, submitted for review, and then your wallet payment will be initialized.
              </p>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment amount</p>
                <p className="mt-2 text-2xl font-semibold">{formatNaira(budgetModel.totalBudget)}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="sm:flex-1" onClick={() => setStep(3)} disabled={submitting || funding}>Back</Button>
                <Button className="sm:flex-1" onClick={handleTopUp} disabled={funding || submitting}>
                  {(funding || submitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save & Pay
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={form.postDialogOpen} onOpenChange={form.setPostDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select a post to boost</DialogTitle>
            <DialogDescription className="sr-only">
              Choose one of your posts to promote. Reshares will boost the original post.
            </DialogDescription>
          </DialogHeader>
          {form.loadingPosts ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading your posts...
            </div>
          ) : form.posts.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">You have not posted yet.</p>
              <Button type="button" onClick={() => router.visit('/post/create')}>
                Create a post
              </Button>
            </div>
          ) : (
            <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {form.posts.map((post) => {
                const base = displayPost(post)
                const selected = form.selectedPost?.id === post.id
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      form.setSelectedPost(post)
                      form.setPostDialogOpen(false)
                    }}
                    className={`rounded-2xl border text-left transition ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'}`}
                  >
                    <div className="space-y-2 p-3">
                      {renderPostPreview(post)}
                      <p className="line-clamp-2 text-sm font-medium">{base.content || 'Untitled post'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
