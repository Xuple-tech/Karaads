import { useMemo, useState } from 'react'

export type PromotionType = 'standard' | 'boosted'

export type AdFormState = {
  title: string
  description: string
  targetUrl: string
  media: File | null
  mediaPreview: string | null
  dailyTargetViews: number
  durationDays: number
  startDate: string
  promotionType: PromotionType
  selectedPost: any | null
}

type AdFormStateOptions = Partial<AdFormState> & {
  mediaUrl?: string | null
}

export function useAdFormState(initial: AdFormStateOptions = {}) {
  const [title, setTitle] = useState(initial.title ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [targetUrl, setTargetUrl] = useState(initial.targetUrl ?? '')
  const [media, setMedia] = useState<File | null>(initial.media ?? null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(initial.mediaPreview ?? initial.mediaUrl ?? null)
  const [dailyTargetViews, setDailyTargetViews] = useState(initial.dailyTargetViews ?? 100)
  const [durationDays, setDurationDays] = useState(initial.durationDays ?? 7)
  const [startDate, setStartDate] = useState(
    initial.startDate ?? new Date().toISOString().split('T')[0],
  )
  const [promotionType, setPromotionType] = useState<PromotionType>(initial.promotionType ?? 'standard')
  const [selectedPost, setSelectedPost] = useState<any | null>(initial.selectedPost ?? null)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  const isValidForNext = useMemo(() => {
    if (promotionType === 'boosted') {
      return Boolean(selectedPost)
    }
    return Boolean(title && description && (media || mediaPreview))
  }, [promotionType, selectedPost, title, description, media, mediaPreview])

  return {
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
  }
}
