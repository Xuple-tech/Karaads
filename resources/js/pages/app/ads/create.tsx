import { Head, router } from '@/components/page-head'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import axiosInstance from '@/lib/axios'
import {
  computeAdBudget,
  inferMediaTypeFromFile,
  inferMediaTypeFromPost,
  postHasMedia,
} from '@/lib/ads-pricing'
import {
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  Megaphone,
  Plus,
  Rocket,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdsFlowScaffold,
  AdsStickyActionBar,
  AdsSurfaceCard,
  type AdFlowStep,
} from './components/AdsFlowScaffold'
import { AdDetailsFields } from './components/AdDetailsFields'
import { BudgetFields } from './components/BudgetFields'
import { useAdFormState } from './useAdFormState'

const budgetCaps = {
  min: 500,
  max: 1_000_000,
}

export default function CreateAdPage() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [funding, setFunding] = useState(false)
  const [hasChosenPath, setHasChosenPath] = useState(false)
  const localMediaPreviewRef = useRef<string | null>(null)

  const {
    title,
    setTitle,
    description,
    setDescription,
    targetUrl,
    setTargetUrl,
    media,
    setMedia,
    mediaPreview,
    setMediaPreview,
    dailyTargetViews,
    setDailyTargetViews,
    durationDays,
    setDurationDays,
    startDate,
    setStartDate,
    promotionType,
    setPromotionType,
    selectedPost,
    setSelectedPost,
    postDialogOpen,
    setPostDialogOpen,
    posts,
    setPosts,
    loadingPosts,
    setLoadingPosts,
    isValidForNext,
  } = useAdFormState()

  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [creativeCreated, setCreativeCreated] = useState(false)

  const revokeLocalMediaPreview = () => {
    if (localMediaPreviewRef.current) {
      URL.revokeObjectURL(localMediaPreviewRef.current)
      localMediaPreviewRef.current = null
    }
  }

  const setSelectedMediaFile = (file: File | null) => {
    revokeLocalMediaPreview()
    setMedia(file)

    if (!file) {
      setMediaPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    localMediaPreviewRef.current = previewUrl
    setMediaPreview(previewUrl)
  }

  useEffect(() => {
    return () => revokeLocalMediaPreview()
  }, [])

  const steps: AdFlowStep[] = useMemo(
    () => [
      { number: 1, title: 'Creative', shortTitle: 'Creative', icon: Megaphone },
      { number: 2, title: 'Budget', shortTitle: 'Budget', icon: Target },
      { number: 3, title: 'Review', shortTitle: 'Review', icon: Check },
      { number: 4, title: 'Payment', shortTitle: 'Pay', icon: CreditCard },
    ],
    []
  )

  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference) return

    const verifyPayment = async () => {
      try {
        setFunding(true)
        const res = await axiosInstance.post('/api/v2/ads/wallet/top-up/verify', { reference })
        toast.success(res.data?.message || 'Payment verified')
        setStep(4)
      } catch (error: any) {
        console.error(error)
        toast.error(error.response?.data?.message || 'Could not verify payment')
      } finally {
        setFunding(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get('mode') === 'boost') {
      setPromotionType('boosted')
      setHasChosenPath(true)
    }
  }, [searchParams, setPromotionType])

  const displayPost = (post: any) => post?.original_post ?? post

  const getBoostedCreativeDefaults = (post: any) => {
    const content = typeof post?.content === 'string' ? post.content.trim() : ''
    return {
      title: content ? content.slice(0, 80) : 'Boosted post',
      description: content || 'Promoted from your existing post.',
      targetUrl: post?.id ? `${window.location.origin}/posts/${post.id}` : window.location.href,
    }
  }

  const resolveCampaignMediaType = () => {
    if (promotionType === 'boosted') {
      return inferMediaTypeFromPost(selectedPost)
    }

    return inferMediaTypeFromFile(media)
  }

  const ensureCampaignAndCreative = async (): Promise<string | null> => {
    if (campaignId && creativeCreated) {
      return campaignId
    }

    const endDate = new Date(new Date(startDate).getTime() + durationDays * 86400000).toISOString()

    if (promotionType === 'boosted' && !selectedPost) {
      toast.error('Select a post to boost.')
      return null
    }

    if (promotionType === 'boosted' && !postHasMedia(selectedPost)) {
      toast.error('Boosted campaigns require a post with image or video media.')
      return null
    }

    const boostedPost = promotionType === 'boosted' ? displayPost(selectedPost) : null
    const boostedDefaults = boostedPost ? getBoostedCreativeDefaults(boostedPost) : null
    const creativeTitle = promotionType === 'boosted' ? boostedDefaults?.title ?? title : title
    const creativeDescription =
      promotionType === 'boosted' ? boostedDefaults?.description ?? description : description
    const creativeTargetUrl =
      promotionType === 'boosted' ? boostedDefaults?.targetUrl ?? targetUrl : targetUrl
    const pricingMediaType = resolveCampaignMediaType()
    const budgetModel = computeAdBudget(dailyTargetViews, durationDays, pricingMediaType)

    const campaignResponse = await axiosInstance.post('/api/v2/ads/campaigns', {
      name: `Campaign: ${creativeTitle || 'Ad Campaign'}`,
      objective: 'traffic',
      billing_model: pricingMediaType === 'video' ? 'cpv' : 'cpm',
      pricing_media_type: pricingMediaType,
      daily_target_views: budgetModel.dailyTargetViews,
      promotion_type: promotionType,
      post_id: promotionType === 'boosted' ? displayPost(selectedPost).id : null,
      pacing_type: 'standard',
      targeting: { surface: ['feed', 'moments', 'profile'] },
      start_at: new Date(startDate).toISOString(),
      end_at: endDate,
    })

    const newCampaignId = campaignResponse.data?.campaign?.id as string | undefined
    if (!newCampaignId) {
      toast.error('Could not create campaign.')
      return null
    }
    setCampaignId(newCampaignId)

    const formData = new FormData()
    formData.append('campaign_id', newCampaignId)
    formData.append('source_type', 'internal')
    formData.append('title', creativeTitle)
    formData.append('description', creativeDescription)
    if (creativeTargetUrl.trim()) {
      formData.append('target_url', creativeTargetUrl.trim())
    }
    formData.append('render_mode', 'internal_asset')
    if (promotionType === 'standard' && media) {
      formData.append('media', media)
    }

    await axiosInstance.post('/api/v2/ads/creatives', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    setCreativeCreated(true)

    return newCampaignId
  }

  useEffect(() => {
    const fetchPosts = async () => {
      const requestedPostId = searchParams.get('post')
      const shouldPreloadForBoost =
        searchParams.get('mode') === 'boost' && Boolean(requestedPostId) && !selectedPost
      if ((!postDialogOpen && !shouldPreloadForBoost) || posts.length > 0 || loadingPosts) return

      try {
        setLoadingPosts(true)
        const profile = await axiosInstance.get('/api/users/profile')
        const userId =
          profile.data?.id ||
          profile.data?.user?.id ||
          profile.data?.data?.id ||
          profile.data?.user_id ||
          profile.data?.user?.data?.id
        if (!userId) {
          throw new Error('Could not resolve user')
        }

        const res = await axiosInstance.get(`/api/users/${userId}/posts?limit=20`)
        const raw = Array.isArray(res.data?.data) ? res.data.data : res.data || []
        const filtered = raw.filter((p: any) => p.type !== 'repost')
        setPosts(filtered)
        if (requestedPostId) {
          const matched = filtered.find((p: any) => String(p.id) === String(requestedPostId))
          if (matched) {
            setSelectedPost(matched)
            setPromotionType('boosted')
          }
        }
      } catch (error: any) {
        console.error(error)
        toast.error(error.response?.data?.message || 'Unable to load your posts')
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchPosts()
  }, [
    postDialogOpen,
    posts.length,
    loadingPosts,
    searchParams,
    selectedPost,
    setLoadingPosts,
    setPosts,
    setPromotionType,
    setSelectedPost,
  ])

  const renderPostPreview = (post: any) => {
    const base = displayPost(post)
    const postMedia = base.media?.[0]
    if (postMedia?.thumbnail || postMedia?.path || postMedia?.url) {
      const src = postMedia.thumbnail || postMedia.path || postMedia.url
      return (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/35">
          <img src={src} alt="Post media" className="h-full w-full object-cover" />
          {postMedia.type === 'video' && (
            <div className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
              Video
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="aspect-video rounded-xl border border-white/10 bg-white/4 p-4 text-sm text-white/75 line-clamp-3">
        {base.content || 'No caption'}
      </div>
    )
  }

  const handleTopUp = async () => {
    try {
      setFunding(true)
      const cid = await ensureCampaignAndCreative()
      if (!cid) return
      const budgetModel = computeAdBudget(dailyTargetViews, durationDays, resolveCampaignMediaType())
      const amount = Math.max(budgetModel.totalBudget, budgetCaps.min)
      const res = await axiosInstance.post('/api/v2/ads/wallet/top-up', {
        amount,
        campaign_id: cid,
      })
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const cid = await ensureCampaignAndCreative()
      if (!cid) return
      toast.success('Ad saved and submitted. Continue to payment to go live.')
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save ad')
    } finally {
      setSubmitting(false)
    }
  }

  const budgetModel = computeAdBudget(dailyTargetViews, durationDays, resolveCampaignMediaType())
  const endDate = new Date(new Date(startDate).getTime() + durationDays * 86400000)
    .toISOString()
    .split('T')[0]
  const boostedDefaults =
    promotionType === 'boosted' && selectedPost
      ? getBoostedCreativeDefaults(displayPost(selectedPost))
      : null

  return (
    <>
      <Head title="Create Ad" />

      <AdsFlowScaffold
        title={step === 1 && !hasChosenPath ? 'STEP 1 OF 4' : 'Create Campaign'}
        subtitle={step === 1 && !hasChosenPath ? undefined : 'Launch in four guided steps'}
        steps={step === 1 && !hasChosenPath ? undefined : steps}
        currentStep={step}
        onBack={
          step === 1 && hasChosenPath
            ? () => setHasChosenPath(false)
            : () => router.visit('/ads')
        }
      >
        {step === 1 && (
          <div className="space-y-4 pb-24 sm:pb-0">
            {!hasChosenPath ? (
              <div className="mx-auto flex min-h-[70vh] w-full max-w-[430px] flex-col">
                <div className="px-2 pt-12 text-center">
                  <h1 className="karads-heading text-[2.05rem] font-extrabold tracking-tight text-white">
                    Choose Your Path
                  </h1>
                </div>

                <div className="mt-10 space-y-6 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPromotionType('boosted')
                      setSelectedMediaFile(null)
                      setHasChosenPath(true)
                    }}
                    className="group flex w-full items-center gap-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-6 py-6 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 text-white">
                      <Rocket className="h-8 w-8 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[1.45rem] font-bold tracking-tight text-white">Boost Existing Post</p>
                      <p className="mt-1 text-sm text-white/42">
                        Promote content already on your profile
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromotionType('standard')
                      setHasChosenPath(true)
                    }}
                    className="group flex w-full items-center gap-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-6 py-6 text-left shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 text-white">
                      <Plus className="h-9 w-9 text-white/88" strokeWidth={2.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[1.45rem] font-bold tracking-tight text-white">Create New Ad</p>
                      <p className="mt-1 text-sm text-white/42">
                        Upload a fresh video for your campaign
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
            <AdsSurfaceCard className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">Selected path</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {promotionType === 'boosted' ? 'Boost Existing Post' : 'Create New Ad'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-white/15 bg-white/5 px-4 text-white hover:bg-white/10"
                  onClick={() => setHasChosenPath(false)}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.14em] text-white/65">
                  Promotion Type
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(['standard', 'boosted'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setPromotionType(type)
                        if (type === 'boosted') {
                          setSelectedMediaFile(null)
                        }
                      }}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        promotionType === type
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/12 bg-white/4 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        {type === 'standard' ? 'Standard Ad' : 'Boost Existing Post'}
                      </p>
                      <p className="mt-1 text-xs text-white/55">
                        {type === 'standard'
                          ? 'Create a standalone ad creative.'
                          : 'Promote one of your published posts.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {promotionType === 'boosted' && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.14em] text-white/65">
                    Post to Boost
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => setPostDialogOpen(true)}
                  >
                    {selectedPost
                      ? `Selected: ${displayPost(selectedPost).content?.slice(0, 44) || 'Post'}`
                      : 'Choose a post'}
                  </Button>
                  {selectedPost && (
                    <div className="rounded-2xl border border-white/12 bg-white/4 p-3">
                      {renderPostPreview(selectedPost)}
                      <p className="mt-2 line-clamp-2 text-sm text-white">
                        {displayPost(selectedPost).content || 'Untitled post'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {promotionType === 'standard' ? (
                <AdDetailsFields
                  title={title}
                  description={description}
                  targetUrl={targetUrl}
                  media={media}
                  mediaPreview={mediaPreview}
                  layout="mobile"
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onTargetUrlChange={setTargetUrl}
                  onMediaSelect={setSelectedMediaFile}
                />
              ) : (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/3 p-3 text-sm">
                  <p className="text-white/75">
                    Boosted ads use your existing post content and media automatically.
                  </p>
                  {boostedDefaults ? (
                    <>
                      <SummaryRow label="Auto title" value={boostedDefaults.title} />
                      <SummaryRow label="Destination" value={boostedDefaults.targetUrl} />
                    </>
                  ) : (
                    <p className="text-white/60">Select a post to auto-fill ad details.</p>
                  )}
                </div>
              )}
            </AdsSurfaceCard>

            <AdsSurfaceCard className="space-y-3">
              <div className="flex items-start gap-2">
                {/* <Sparkles className="mt-0.5 h-4 w-4 text-cyan-200" /> */}
                <div>
                  <p className="text-sm font-semibold text-white">Creative checklist</p>
                  <p className="text-xs text-white/60">
                    {promotionType === 'boosted'
                      ? 'Choose the post to promote. We will reuse its text and media automatically.'
                      : 'Include a clear title, concise copy, and eye-catching media. Destination URL is optional.'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/3 p-3 text-sm">
                {isValidForNext ? (
                  <p className="text-emerald-200">Ready for budget setup.</p>
                ) : (
                  <p className="text-white/70">Add a title, description, and media to continue.</p>
                )}
              </div>
            </AdsSurfaceCard>

            <AdsStickyActionBar withBottomNavOffset={true}>
              <Button
                className="h-11 w-full bg-white text-black hover:bg-white/90"
                onClick={() => setStep(2)}
                disabled={!isValidForNext}
              >
                Next: Budget
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </AdsStickyActionBar>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pb-24 sm:pb-0">
            <AdsSurfaceCard>
              <BudgetFields
                dailyTargetViews={dailyTargetViews}
                durationDays={durationDays}
                startDate={startDate}
                budgetCaps={budgetCaps}
                onDailyTargetViewsChange={setDailyTargetViews}
                onDurationChange={setDurationDays}
                onStartDateChange={setStartDate}
                pricingPerView={budgetModel.rate}
                layout="mobile"
              />
            </AdsSurfaceCard>

            <AdsSurfaceCard className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Live Summary</p>
              <SummaryRow label="Total budget" value={`NGN ${budgetModel.totalBudget.toLocaleString()}`} />
              <SummaryRow
                label="Daily budget"
                value={`NGN ${budgetModel.dailyBudget.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
              <SummaryRow label="People reached per day" value={budgetModel.dailyTargetViews.toLocaleString()} />
              <SummaryRow label="Pricing type" value={resolveCampaignMediaType() === 'video' ? 'Video ad' : 'Picture ad'} />
              <SummaryRow label="Duration" value={`${durationDays} day(s)`} />
              <SummaryRow label="Run dates" value={`${startDate} - ${endDate}`} />
            </AdsSurfaceCard>

            <AdsStickyActionBar>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="h-11 bg-white text-black hover:bg-white/90"
                  onClick={() => setStep(3)}
                >
                  Next: Review
                </Button>
              </div>
            </AdsStickyActionBar>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 pb-24 sm:pb-0">
            <AdsSurfaceCard className="space-y-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Ad Preview</p>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-black">
                <div className="relative aspect-video bg-white/5">
                  {promotionType === 'boosted' && selectedPost ? (
                    <div className="p-3">{renderPostPreview(selectedPost)}</div>
                  ) : mediaPreview ? (
                    media?.type.startsWith('video') ? (
                      <video src={mediaPreview} className="h-full w-full object-cover" controls playsInline preload="metadata" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-55 items-center justify-center text-sm text-white/45">
                      Media preview not available
                    </div>
                  )}
                  <div className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    Sponsored
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-semibold text-white">
                      {promotionType === 'boosted'
                        ? boostedDefaults?.title || displayPost(selectedPost)?.content?.slice(0, 80) || 'Boosted post'
                        : title}
                    </h3>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 border-white/15 bg-white/10 text-white hover:bg-white/15"
                    >
                      Learn More
                    </Button>
                  </div>
                  <p className="line-clamp-3 text-sm text-white/70">
                    {promotionType === 'boosted'
                      ? boostedDefaults?.description || 'Promoted from your existing post.'
                      : description}
                  </p>
                  <p className="truncate text-xs text-cyan-300">
                    {promotionType === 'boosted'
                      ? boostedDefaults?.targetUrl || ''
                      : targetUrl || 'No destination URL'}
                  </p>
                </div>
              </div>
            </AdsSurfaceCard>

            <AdsSurfaceCard className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-white/60">Final Check</p>
              <SummaryRow label="Promotion type" value={promotionType === 'boosted' ? 'Boosted post' : 'Standard ad'} />
              <SummaryRow label="Budget" value={`NGN ${budgetModel.totalBudget.toLocaleString()}`} />
              <SummaryRow label="Duration" value={`${durationDays} day(s)`} />
              <SummaryRow label="Start date" value={startDate} />
            </AdsSurfaceCard>

            <AdsStickyActionBar>
              <div className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2 sm:space-y-0">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setStep(2)}
                  disabled={submitting || funding}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={handleSubmit}
                  disabled={submitting || funding}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  className="h-11 bg-white text-black hover:bg-white/90"
                  onClick={() => setStep(4)}
                  disabled={submitting || funding}
                >
                  Continue to Pay
                </Button>
              </div>
            </AdsStickyActionBar>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 pb-24 text-center sm:pb-0">
            <AdsSurfaceCard className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-500/12 text-emerald-100">
                <Banknote className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">Total to fund</p>
                <h2 className="mt-1 text-3xl font-bold text-white">NGN {budgetModel.totalBudget.toLocaleString()}</h2>
              </div>
              <p className="mx-auto max-w-md text-sm text-white/65">
                We will save your campaign and creative, redirect you to Paystack to fund your wallet. Once payment
                is confirmed your campaign is automatically submitted for admin review.
              </p>
            </AdsSurfaceCard>

            <AdsStickyActionBar>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setStep(3)}
                  disabled={submitting || funding}
                >
                  Back
                </Button>
                <Button
                  className="h-11 bg-white text-black hover:bg-white/90"
                  onClick={handleTopUp}
                  disabled={funding || submitting}
                >
                  {(funding || submitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {funding ? 'Redirecting to Paystack...' : 'Save & Pay'}
                </Button>
              </div>
            </AdsStickyActionBar>
          </div>
        )}
      </AdsFlowScaffold>

      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="max-w-3xl overflow-hidden border-white/10 bg-[#0b0e13] p-0 text-white">
          <DialogHeader className="border-b border-white/10 px-4 pb-3 pt-4 sm:px-6">
            <DialogTitle>Select a post to boost</DialogTitle>
            <DialogDescription className="sr-only">
              Choose one of your posts to promote; reshares will boost the original post.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[78vh] overflow-y-auto px-4 py-4 sm:px-6">
            {loadingPosts ? (
              <div className="flex items-center justify-center py-10 text-sm text-white/60">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading your posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="space-y-3 py-8 text-center">
                <p className="text-sm text-white/65">You have not posted yet.</p>
                <Button type="button" onClick={() => router.visit('/post/create')}>
                  Create a post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {posts.map((post) => {
                  const base = displayPost(post)
                  const selected = selectedPost?.id === post.id
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => {
                        setSelectedPost(post)
                        setPostDialogOpen(false)
                      }}
                      className={`rounded-2xl border bg-white/3 text-left transition ${
                        selected
                          ? 'border-white/40 ring-2 ring-white/20'
                          : 'border-white/12 hover:border-white/30 hover:bg-white/6'
                      }`}
                    >
                      <div className="space-y-2 p-3">
                        {renderPostPreview(post)}
                        <div className="space-y-1">
                          <p className="line-clamp-2 font-medium text-white">
                            {base.content || 'Untitled post'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-white/55">
                            <span>Likes {base.like_count ?? 0}</span>
                            <span>Comments {base.comment_count ?? 0}</span>
                            <span>Reposts {base.repost_count ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
