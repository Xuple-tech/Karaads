import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description: string
  targetUrl: string
  mediaPreview: string | null
  media: File | null
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTargetUrlChange: (value: string) => void
  onMediaSelect: (file: File | null) => void
  layout?: 'default' | 'mobile' | 'desktop'
}

export function AdDetailsFields({
  title,
  description,
  targetUrl,
  mediaPreview,
  media,
  onTitleChange,
  onDescriptionChange,
  onTargetUrlChange,
  onMediaSelect,
  layout = 'default',
}: Props) {
  const isMobile = layout === 'mobile'
  const inputId = React.useId()

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onMediaSelect(file)
    e.target.value = ''
  }

  return (
    <div className={cn('space-y-6', isMobile && 'space-y-5')}>
      <div className="space-y-2">
        <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>Ad Title</Label>
        <Input
          placeholder="e.g. Summer Sale 50% Off"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={cn(isMobile && 'h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/45')}
        />
      </div>

      <div className="space-y-2">
        <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>Description</Label>
        <Textarea
          placeholder="Describe what you are promoting..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(
            isMobile &&
              'min-h-[110px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/45'
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>
          Target URL <span className="text-white/45">(optional)</span>
        </Label>
        <Input
          placeholder="https://yourwebsite.com (optional)"
          value={targetUrl}
          onChange={(e) => onTargetUrlChange(e.target.value)}
          className={cn(isMobile && 'h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/45')}
        />
      </div>

      <div className="space-y-2">
        <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>Ad Creative</Label>
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed text-center transition-colors',
            isMobile
              ? 'border-white/15 bg-white/[0.03] p-5 hover:bg-white/8'
              : 'border-muted-foreground/25 p-8 hover:bg-muted/50'
          )}
        >
          <input
            id={inputId}
            type="file"
            className={cn(mediaPreview ? 'sr-only' : 'absolute inset-0 cursor-pointer opacity-0')}
            accept="image/*,video/*"
            onChange={handleMediaChange}
          />
          {mediaPreview ? (
            <div className="space-y-3">
              <div className={cn('relative mx-auto w-full overflow-hidden rounded-lg bg-black', isMobile ? 'aspect-[4/3] max-w-none' : 'aspect-video max-w-sm')}>
              {media?.type.startsWith('video') || (!media && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaPreview)) ? (
                <video
                  src={mediaPreview}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={mediaPreview} alt="Preview" className="h-full w-full object-cover" />
              )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <label
                  htmlFor={inputId}
                  className={cn(
                    'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition',
                    isMobile
                      ? 'border-white/15 bg-white/8 text-white hover:bg-white/12'
                      : 'border-muted-foreground/25 bg-background hover:bg-muted',
                  )}
                >
                  <Upload className="h-4 w-4" />
                  Change creative
                </label>
                <button
                  type="button"
                  onClick={() => onMediaSelect(null)}
                  className={cn(
                    'inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition',
                    isMobile
                      ? 'border-red-300/25 bg-red-500/12 text-red-100 hover:bg-red-500/18'
                      : 'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15',
                  )}
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              className={cn('flex cursor-pointer flex-col items-center gap-2', isMobile ? 'text-white/65' : 'text-muted-foreground')}
            >
              <ImageIcon className="w-8 h-8" />
              <p>Click to upload image or video</p>
              <p className="text-xs">Max 10GB</p>
            </label>
          )}
        </div>
        {media && (
          <p className={cn('text-xs', isMobile ? 'text-white/55' : 'text-muted-foreground')}>
            Selected file: {media.name}
          </p>
        )}
      </div>
    </div>
  )
}
