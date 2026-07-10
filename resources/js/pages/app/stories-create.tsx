import { Button } from '@/components/ui/button';
import { ArrowLeft, ImagePlus, Music2, Video, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStories } from '@/hooks/use-stories';

interface MediaPreview {
  file: File;
  url: string;
  type: 'image' | 'video';
  durationSeconds?: number;
}

interface MusicPreview {
  file: File;
  url: string;
  durationSeconds?: number;
}

const MAX_STORY_VIDEO_SECONDS = 60;

export default function StoryCreatePage() {
  const navigate = useNavigate();
  const { createStory } = useStories();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<MediaPreview | null>(null);
  const [music, setMusic] = useState<MusicPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isVideo = preview?.type === 'video';

  const canSubmit = useMemo(() => (!!preview || caption.trim().length > 0) && !saving, [preview, caption, saving]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
      if (music?.url) {
        URL.revokeObjectURL(music.url);
      }
    };
  }, [music?.url, preview?.url]);

  const handleSelectFile = async (file: File) => {
    setError(null);

    const fileType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
    if (!fileType) {
      setError('Only image and video files are supported.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Max file size is 50MB.');
      return;
    }

    const nextPreview: MediaPreview = {
      file,
      type: fileType,
      url: URL.createObjectURL(file),
    };

    if (fileType === 'video') {
      const duration = await getVideoDuration(file);
      if (duration > MAX_STORY_VIDEO_SECONDS) {
        URL.revokeObjectURL(nextPreview.url);
        setError(`Video must be ${MAX_STORY_VIDEO_SECONDS} seconds or less.`);
        return;
      }
      nextPreview.durationSeconds = duration;
    }

    if (fileType === 'video' && music?.url) {
      URL.revokeObjectURL(music.url);
      setMusic(null);
    }

    setPreview((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return nextPreview;
    });
  };

  const handleSelectMusic = async (file: File) => {
    setError(null);

    if (!preview || preview.type !== 'image') {
      setError('Choose an image first before adding music.');
      return;
    }

    if (!file.type.startsWith('audio/')) {
      setError('Only audio files are supported for music.');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Music must be 20MB or smaller.');
      return;
    }

    const nextMusic: MusicPreview = {
      file,
      url: URL.createObjectURL(file),
      durationSeconds: await getAudioDuration(file),
    };

    setMusic((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return nextMusic;
    });
  };

  const handlePublish = async () => {
    if (!preview && !caption.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await createStory({
        media: preview ? [preview.file] : [],
        caption: caption.trim() || undefined,
        durationSeconds: preview?.durationSeconds ? [preview.durationSeconds] : undefined,
        music: preview?.type === 'image' ? music?.file : undefined,
        musicDurationSeconds: preview?.type === 'image' ? music?.durationSeconds : undefined,
      });
      navigate('/search');
    } catch (err: unknown) {
      const message = typeof err === 'object'
        && err !== null
        && 'response' in err
        && typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to publish story.';

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e13] text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <p className="text-sm font-semibold">Create Story</p>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handlePublish}
            className="rounded-full bg-white px-4 text-black hover:bg-white/90"
          >
            {saving ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative block h-[58vh] w-full overflow-hidden rounded-3xl border border-white/15 bg-[#11141a]"
        >
          {preview ? (
            preview.type === 'video' ? (
              <video src={preview.url} className="h-full w-full object-cover" controls muted playsInline />
            ) : (
              <img src={preview.url} alt="Story preview" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-white/70">
              <div className="flex items-center gap-3">
                <ImagePlus className="h-6 w-6" />
                <Video className="h-6 w-6" />
              </div>
              <p className="text-sm">Tap to choose image or video (optional, max {MAX_STORY_VIDEO_SECONDS}s video)</p>
            </div>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSelectFile(file);
            }
          }}
        />

        <input
          ref={musicInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleSelectMusic(file);
            }
          }}
        />

        <div className="mt-4">
          <label htmlFor="story-caption" className="mb-2 block text-sm text-white/70">
            Caption <span className="text-white/45">(required if no media)</span>
          </label>
          <textarea
            id="story-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={1000}
            placeholder="Say something about this story..."
            className="h-24 w-full resize-none rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/30"
          />
        </div>

        {isVideo && (
          <p className="mt-2 text-xs text-white/60">Video duration: {(preview?.durationSeconds || 0).toFixed(1)}s / {MAX_STORY_VIDEO_SECONDS}s max</p>
        )}

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Music for image status</p>
              <p className="mt-1 text-xs text-white/55">
                Add one background track to play while viewers see your picture.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
              disabled={preview?.type !== 'image'}
              onClick={() => musicInputRef.current?.click()}
            >
              <Music2 className="mr-2 h-4 w-4" />
              {music ? 'Change' : 'Add music'}
            </Button>
          </div>

          {preview?.type !== 'image' ? (
            <p className="mt-3 text-xs text-white/45">Music is available when the selected media is an image.</p>
          ) : null}

          {music ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{music.file.name}</p>
                  <p className="text-xs text-white/50">
                    {typeof music.durationSeconds === 'number' ? `${music.durationSeconds.toFixed(1)}s` : 'Audio track'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (music.url) {
                      URL.revokeObjectURL(music.url);
                    }
                    setMusic(null);
                  }}
                  className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Remove music"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <audio src={music.url} controls className="w-full" />
            </div>
          ) : null}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
      </div>
    </div>
  );
}

async function getVideoDuration(file: File): Promise<number> {
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read video duration'));
    };
  });
}

async function getAudioDuration(file: File): Promise<number> {
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');

    audio.preload = 'metadata';
    audio.src = url;

    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read audio duration'));
    };
  });
}
