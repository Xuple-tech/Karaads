export type PricingMediaType = 'video' | 'image'

export const ADS_RATE_PER_VIEW: Record<PricingMediaType, number> = {
  video: 5,
  image: 3,
}

export const ADS_VIEWER_REWARD_PER_VIEW: Record<PricingMediaType, number> = {
  video: 3,
  image: 2,
}

export function normalizePricingMediaType(type: unknown): PricingMediaType {
  return type === 'video' ? 'video' : 'image'
}

export function rateForMediaType(type: unknown): number {
  return ADS_RATE_PER_VIEW[normalizePricingMediaType(type)]
}

export function rewardForMediaType(type: unknown): number {
  return ADS_VIEWER_REWARD_PER_VIEW[normalizePricingMediaType(type)]
}

export function inferMediaTypeFromFile(file: File | null | undefined): PricingMediaType {
  if (!file) return 'image'

  return file.type.startsWith('video/') ? 'video' : 'image'
}

export function inferMediaTypeFromPost(post: any): PricingMediaType {
  const base = post?.original_post ?? post
  const media = Array.isArray(base?.media) ? base.media : []
  const firstMedia = media[0]
  const mediaType = firstMedia?.type ?? firstMedia?.file_type ?? null

  return mediaType === 'video' ? 'video' : 'image'
}

export function postHasMedia(post: any): boolean {
  const base = post?.original_post ?? post
  return Array.isArray(base?.media) && base.media.length > 0
}

export function computeAdBudget(dailyTargetViews: number, durationDays: number, mediaType: unknown) {
  const safeDailyViews = Math.max(1, Math.floor(dailyTargetViews || 0))
  const safeDurationDays = Math.max(1, Math.floor(durationDays || 0))
  const rate = rateForMediaType(mediaType)
  const dailyBudget = safeDailyViews * rate
  const totalBudget = dailyBudget * safeDurationDays

  return {
    rate,
    dailyTargetViews: safeDailyViews,
    durationDays: safeDurationDays,
    dailyBudget,
    totalBudget,
    totalViews: safeDailyViews * safeDurationDays,
  }
}
