import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronDown,
  Crop,
  Globe,
  Image as ImageIcon,
  Music2,
  Lock,
  Scissors,
  Users,
  Video,
  X,
} from "lucide-react";
import { router, usePage } from "@/components/page-head";
import { EmojiStickerPicker } from "@/components/emoji-sticker-picker";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Visibility = "everyone" | "followers" | "private";
type SubmitStage =
  | "idle"
  | "preparing"
  | "uploading"
  | "finalizing";
type ImageAspect = "original" | "square" | "portrait" | "landscape";

interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  default_post_visibility?: Visibility;
}

interface MediaItem {
  id: string;
  file: File;
  type: "image" | "video";
  previewUrl: string;
}

interface BusinessPage {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  avatar?: string | null;
}

interface MusicAttachment {
  file: File;
  previewUrl: string;
  durationSeconds?: number;
}

interface CreatedPostResponse {
  data?: {
    id?: string;
    content_validation?: {
      summary?: string | null;
      flags?: {
        warnings?: string[];
      };
    };
    reward?: {
      status?: string;
      amount?: number;
      reason?: string | null;
    };
  };
}

interface ImageEditState {
  aspect: ImageAspect;
  zoom: number;
  panX: number;
  panY: number;
}

interface VideoEditState {
  duration: number;
  trimStart: number;
  trimEnd: number;
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "50GB";
const MIN_VIDEO_TRIM_GAP_SECONDS = 1;
const DEFAULT_IMAGE_EDIT: ImageEditState = {
  aspect: "original",
  zoom: 1,
  panX: 0,
  panY: 0,
};

const visibilityOptions: Array<{
  value: Visibility;
  label: string;
  description: string;
  icon: typeof Globe;
}> = [
  {
    value: "everyone",
    label: "Everyone",
    description: "Anyone can view this post.",
    icon: Globe,
  },
  {
    value: "followers",
    label: "Followers",
    description: "Only followers can view this post.",
    icon: Users,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can view this post.",
    icon: Lock,
  },
];

const imageAspectOptions: Array<{ value: ImageAspect; label: string }> = [
  { value: "original", label: "Original" },
  { value: "square", label: "1:1" },
  { value: "portrait", label: "4:5" },
  { value: "landscape", label: "16:9" },
];

function extractHashtags(value: string): string[] {
  const matches = value.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  const normalized = matches.map((tag) => tag.slice(1).toLowerCase());
  return Array.from(new Set(normalized)).slice(0, 20);
}

function formatSeconds(value: number): string {
  const totalSeconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getAspectRatio(aspect: ImageAspect): number {
  if (aspect === "square") {
    return 1;
  }
  if (aspect === "portrait") {
    return 4 / 5;
  }
  if (aspect === "landscape") {
    return 16 / 9;
  }
  return 1;
}

function hasImageEdits(edit: ImageEditState | undefined): boolean {
  if (!edit) {
    return false;
  }
  return (
    edit.aspect !== "original" ||
    Math.abs(edit.zoom - 1) > 0.01 ||
    Math.abs(edit.panX) > 0.1 ||
    Math.abs(edit.panY) > 0.1
  );
}

function hasVideoTrim(edit: VideoEditState | undefined): boolean {
  if (!edit || edit.duration <= 0) {
    return false;
  }
  return edit.trimStart > 0.05 || edit.trimEnd < edit.duration - 0.05;
}

async function applyImageEdits(
  file: File,
  edit: ImageEditState,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const edited = hasImageEdits(edit);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    const objectUrl = URL.createObjectURL(file);
    imageElement.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(imageElement);
    };
    imageElement.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to process image."));
    };
    imageElement.src = objectUrl;
  });

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return file;
  }
  const targetRatio =
    edit.aspect === "original"
      ? sourceWidth / sourceHeight
      : getAspectRatio(edit.aspect);

  let baseWidth = sourceWidth;
  let baseHeight = sourceHeight;
  if (sourceWidth / sourceHeight > targetRatio) {
    baseWidth = sourceHeight * targetRatio;
  } else {
    baseHeight = sourceWidth / targetRatio;
  }

  const zoom = edited ? Math.min(Math.max(edit.zoom, 1), 3) : 1;
  const cropWidth = baseWidth / zoom;
  const cropHeight = baseHeight / zoom;

  const maxShiftX = (sourceWidth - cropWidth) / 2;
  const maxShiftY = (sourceHeight - cropHeight) / 2;
  const centerX =
    sourceWidth / 2 +
    ((edited ? Math.max(-100, Math.min(100, edit.panX)) : 0) / 100) * maxShiftX;
  const centerY =
    sourceHeight / 2 +
    ((edited ? Math.max(-100, Math.min(100, edit.panY)) : 0) / 100) * maxShiftY;
  const sourceX = Math.max(
    0,
    Math.min(centerX - cropWidth / 2, sourceWidth - cropWidth),
  );
  const sourceY = Math.max(
    0,
    Math.min(centerY - cropHeight / 2, sourceHeight - cropHeight),
  );

  const outputWidth = Math.min(1600, Math.round(cropWidth));
  const outputHeight = Math.round(outputWidth / targetRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const outputType = "image/webp";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (!value) {
          reject(new Error("Failed to export image."));
          return;
        }
        resolve(value);
      },
      outputType,
      0.78,
    );
  });

  if (!edited && blob.size >= file.size) {
    return file;
  }

  const outputName = file.name.replace(/\.[^.]+$/, "") + ".webp";

  return new File([blob], outputName, {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function getAudioDuration(file: File): Promise<number> {
  return await new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to read audio metadata."));
    };
    audio.src = objectUrl;
  });
}

export default function PostCreatePage() {
  const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props;
  const currentUser = auth?.user;
  const inputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const editorVideoRef = useRef<HTMLVideoElement>(null);
  const latestMediaRef = useRef<MediaItem[]>([]);

  const [content, setContent] = useState("");
  const [businessPages, setBusinessPages] = useState<BusinessPage[]>([]);
  const [selectedBusinessPageId, setSelectedBusinessPageId] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>(
    currentUser?.default_post_visibility ?? "everyone",
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [music, setMusic] = useState<MusicAttachment | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [imageEdits, setImageEdits] = useState<Record<string, ImageEditState>>(
    {},
  );
  const [videoEdits, setVideoEdits] = useState<Record<string, VideoEditState>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeKind, setNoticeKind] = useState<"success" | "warning">("success");

  useEffect(() => {
    const pageId = new URLSearchParams(window.location.search).get("page") ?? "";
    setSelectedBusinessPageId(pageId);

    axiosInstance
      .get("/api/business-pages", { params: { scope: "mine" } })
      .then((response) => {
        const pages = response.data?.data ?? response.data ?? [];
        setBusinessPages(pages);
      })
      .catch(() => {
        setBusinessPages([]);
      });
  }, []);

  const hashtags = extractHashtags(content);
  const canSubmit =
    !submitting &&
    (content.trim().length > 0 || media.length > 0) &&
    content.length <= MAX_CONTENT_LENGTH;
  const selectedMedia = useMemo(() => {
    if (media.length === 0) {
      return null;
    }
    return media.find((item) => item.id === selectedMediaId) ?? media[0];
  }, [media, selectedMediaId]);
  const selectedImageEdit =
    selectedMedia?.type === "image"
      ? (imageEdits[selectedMedia.id] ?? DEFAULT_IMAGE_EDIT)
      : null;
  const selectedVideoEdit =
    selectedMedia?.type === "video" ? videoEdits[selectedMedia.id] : null;

  const progressValue = (() => {
    if (!submitting) {
      return 0;
    }
    if (submitStage === "preparing") {
      return 12;
    }
    if (submitStage === "uploading") {
      return Math.min(Math.max(uploadProgress, 15), 95);
    }
    if (submitStage === "finalizing") {
      return 100;
    }
    return 0;
  })();

  const submitStatusLabel = (() => {
    if (submitStage === "preparing") {
      return "Preparing post...";
    }
    if (submitStage === "uploading") {
      if (uploadProgress >= 99) {
        return "Upload complete. Publishing post...";
      }
      return `Uploading media... ${Math.round(progressValue)}%`;
    }
    if (submitStage === "finalizing") {
      return "Finalizing and publishing...";
    }
    return "";
  })();

  const submitButtonLabel = (() => {
    if (submitStage === "preparing") {
      return "Preparing...";
    }
    if (submitStage === "uploading") {
      if (uploadProgress >= 99) {
        return "Publishing...";
      }
      return `Uploading ${Math.round(progressValue)}%`;
    }
    if (submitStage === "finalizing") {
      return "Finalizing...";
    }
    return "Post";
  })();

  const revokePreviews = (items: MediaItem[]) => {
    for (const item of items) {
      URL.revokeObjectURL(item.previewUrl);
    }
  };

  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      revokePreviews(latestMediaRef.current);
      if (music?.previewUrl) {
        URL.revokeObjectURL(music.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music?.previewUrl]);

  useEffect(() => {
    if (media.length === 0) {
      setSelectedMediaId(null);
      return;
    }

    if (
      !selectedMediaId ||
      !media.some((item) => item.id === selectedMediaId)
    ) {
      setSelectedMediaId(media[0].id);
    }
  }, [media, selectedMediaId]);

  useEffect(() => {
    if (!music) {
      return;
    }

    if (media.length > 0 && media[0]?.type === "image") {
      return;
    }

    if (music.previewUrl) {
      URL.revokeObjectURL(music.previewUrl);
    }
    setMusic(null);
  }, [media, music]);

  const updateImageEdit = (id: string, patch: Partial<ImageEditState>) => {
    setImageEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? DEFAULT_IMAGE_EDIT),
        ...patch,
      },
    }));
  };

  const updateVideoEdit = (id: string, patch: Partial<VideoEditState>) => {
    setVideoEdits((prev) => {
      const current = prev[id];
      if (!current) {
        return prev;
      }

      const next: VideoEditState = {
        ...current,
        ...patch,
      };

      if (next.duration > 0) {
        next.trimStart = Math.max(
          0,
          Math.min(next.trimStart, next.duration - MIN_VIDEO_TRIM_GAP_SECONDS),
        );
        next.trimEnd = Math.max(
          next.trimStart + MIN_VIDEO_TRIM_GAP_SECONDS,
          Math.min(next.trimEnd, next.duration),
        );
      }

      return {
        ...prev,
        [id]: next,
      };
    });
  };

  const handleVideoMetadata = (id: string, duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    setVideoEdits((prev) => {
      const current = prev[id];
      if (!current) {
        return {
          ...prev,
          [id]: {
            duration,
            trimStart: 0,
            trimEnd: duration,
          },
        };
      }

      const trimEnd =
        current.trimEnd > 0 ? Math.min(current.trimEnd, duration) : duration;
      const trimStart = Math.min(
        current.trimStart,
        Math.max(0, trimEnd - MIN_VIDEO_TRIM_GAP_SECONDS),
      );

      return {
        ...prev,
        [id]: {
          duration,
          trimStart,
          trimEnd,
        },
      };
    });
  };

  const previewTrim = () => {
    if (!selectedMedia || selectedMedia.type !== "video") {
      return;
    }

    const video = editorVideoRef.current;
    const edit = videoEdits[selectedMedia.id];
    if (!video || !edit) {
      return;
    }

    video.currentTime = edit.trimStart;
    void video.play();
  };

  const onSelectFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setNotice(null);
    setNoticeKind("success");
    const selected = Array.from(files);
    const hasVideo = selected.some((file) => file.type.startsWith("video/"));
    const hasImage = selected.some((file) => file.type.startsWith("image/"));

    if (hasVideo && hasImage) {
      setError("Upload either images or a single video, not both.");
      return;
    }

    const currentType = media[0]?.type;
    const nextType: "image" | "video" = hasVideo ? "video" : "image";
    if (currentType && currentType !== nextType) {
      setError("You cannot mix image and video media in one post.");
      return;
    }

    if (nextType === "video" && (media.length > 0 || selected.length > 1)) {
      setError("Only one video is allowed.");
      return;
    }

    if (nextType === "video" && music?.previewUrl) {
      URL.revokeObjectURL(music.previewUrl);
      setMusic(null);
    }

    const maxItems = nextType === "image" ? 4 : 1;
    if (media.length + selected.length > maxItems) {
      setError(
        nextType === "image"
          ? "Maximum 4 images per post."
          : "Only one video is allowed.",
      );
      return;
    }

    const nextItems: MediaItem[] = [];
    for (const file of selected) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Only image and video files are supported.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`${file.name} exceeds the ${MAX_FILE_SIZE_LABEL} size limit.`);
        return;
      }
      nextItems.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        type: file.type.startsWith("video/") ? "video" : "image",
        previewUrl: URL.createObjectURL(file),
      });
    }

    setMedia((prev) => [...prev, ...nextItems]);
    setImageEdits((prev) => {
      const next = { ...prev };
      for (const item of nextItems) {
        if (item.type === "image") {
          next[item.id] = { ...DEFAULT_IMAGE_EDIT };
        }
      }
      return next;
    });
    setVideoEdits((prev) => {
      const next = { ...prev };
      for (const item of nextItems) {
        if (item.type === "video") {
          next[item.id] = {
            duration: 0,
            trimStart: 0,
            trimEnd: 0,
          };
        }
      }
      return next;
    });
  };

  const onSelectMusic = async (file: File) => {
    setError(null);
    setNotice(null);
    setNoticeKind("success");

    if (media.length === 0 || media[0]?.type !== "image") {
      setError("Add at least one image before attaching music.");
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setError("Only audio files can be used as music.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Music must be 20MB or smaller.");
      return;
    }

    const durationSeconds = await getAudioDuration(file);
    setMusic((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
        durationSeconds,
      };
    });
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setImageEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setVideoEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedMediaId === id) {
      setSelectedMediaId(null);
    }
  };

  const submit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitStage("preparing");
    setUploadProgress(0);
    setError(null);
    setNotice(null);
    setNoticeKind("success");
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      if (selectedBusinessPageId) {
        formData.append("business_page_id", selectedBusinessPageId);
      }
      if (music && media[0]?.type === "image") {
        formData.append("music", music.file);
        if (typeof music.durationSeconds === "number") {
          formData.append(
            "music_duration_seconds",
            String(music.durationSeconds),
          );
        }
      }
      for (let index = 0; index < media.length; index += 1) {
        const item = media[index];
        let fileToUpload = item.file;

        const imageEdit = imageEdits[item.id];
        if (item.type === "image") {
          fileToUpload = await applyImageEdits(
            item.file,
            imageEdit ?? DEFAULT_IMAGE_EDIT,
          );
        }
        if (imageEdit && hasImageEdits(imageEdit)) {
          formData.append(`media_edits[${index}][type]`, "image");
          formData.append(`media_edits[${index}][aspect]`, imageEdit.aspect);
          formData.append(
            `media_edits[${index}][zoom]`,
            String(imageEdit.zoom),
          );
          formData.append(
            `media_edits[${index}][pan_x]`,
            String(imageEdit.panX),
          );
          formData.append(
            `media_edits[${index}][pan_y]`,
            String(imageEdit.panY),
          );
        }
        const videoEdit = videoEdits[item.id];
        if (videoEdit) {
          formData.append(`media_edits[${index}][type]`, "video");
          formData.append(
            `media_edits[${index}][trim_start]`,
            String(videoEdit.trimStart),
          );
          formData.append(
            `media_edits[${index}][trim_end]`,
            String(videoEdit.trimEnd),
          );
          if (videoEdit.duration > 0) {
            const effectiveDuration = hasVideoTrim(videoEdit)
              ? Math.max(
                  MIN_VIDEO_TRIM_GAP_SECONDS,
                  videoEdit.trimEnd - videoEdit.trimStart,
                )
              : videoEdit.duration;
            formData.append(
              `media_duration_seconds[${index}]`,
              String(effectiveDuration),
            );
          }
        }
        formData.append(`media[${index}]`, fileToUpload);
      }

      setSubmitStage("uploading");
      setUploadProgress(0);
      const response = await axiosInstance.post<CreatedPostResponse>("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) {
            return;
          }
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
        },
      });

      setSubmitStage("finalizing");
      setUploadProgress(100);
      const moderationSummary =
        response.data?.data?.content_validation?.summary ?? "Post published successfully.";
      const moderationWarnings =
        response.data?.data?.content_validation?.flags?.warnings ?? [];
      const copyrightWarning = moderationWarnings.find((warning) =>
        /copyright|watermark/i.test(warning),
      );
      const reward = response.data?.data?.reward;
      const rewardNotice =
        reward?.status === "credited" && typeof reward.amount === "number"
          ? ` You earned N${reward.amount.toFixed(0)}.`
          : "";
      const warningNotice =
        moderationWarnings.length > 0
          ? ` ${moderationWarnings[0]}`
          : "";
      setNoticeKind(copyrightWarning ? "warning" : "success");
      setNotice(`${moderationSummary}${rewardNotice}${warningNotice}`);
      if (copyrightWarning) {
        window.alert(copyrightWarning);
      }
      revokePreviews(media);
      if (music?.previewUrl) {
        URL.revokeObjectURL(music.previewUrl);
      }
      const createdPostId = response.data?.data?.id;
      window.setTimeout(() => {
        router.visit(
          createdPostId ? `/app?post=${encodeURIComponent(createdPostId)}` : "/app",
        );
      }, 900);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to publish post.");
      setSubmitStage("idle");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  const authorFallback = (currentUser?.name ?? currentUser?.username ?? "U")
    .slice(0, 1)
    .toUpperCase();
  const selectedBusinessPage = businessPages.find(
    (page) => page.id === selectedBusinessPageId,
  );

  return (
    <div className="min-h-screen bg-background px-3 pb-32 pt-4 text-foreground lg:pb-10">
      <div className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Create post</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            From June 1, 2026, approved original videos with captions earn N10, or N30 with a Kara Verified badge. Duplicate, copyright, or caption-free posts do not earn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.visit("/app")}
            disabled={submitting}
          >
            Cancel
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => router.visit("/live")}
            disabled={submitting}
          >
            Go Live
          </Button> */}
          <Button onClick={submit} disabled={!canSubmit} className="rounded-full bg-[#1877f2] px-6 font-bold text-white hover:bg-[#166fe5]">
            {submitButtonLabel}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mx-auto mb-4 flex max-w-5xl items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive shadow-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className={`mx-auto mb-4 max-w-5xl rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
          noticeKind === "warning"
            ? "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-100"
            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
        }`}>
          {notice}
        </div>
      ) : null}

      {submitting ? (
        <div className="mx-auto mb-4 max-w-5xl rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="mb-2 text-sm font-medium">{submitStatusLabel}</p>
          <Progress value={progressValue} />
          <p className="mt-2 text-xs text-muted-foreground">
            Keep this page open while we upload your post.
          </p>
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_2px_10px_rgba(15,23,42,0.08)] dark:shadow-black/20">
          <div className="border-b border-border px-4 py-3 text-center">
            <p className="text-base font-black">Create post</p>
          </div>
          <div className="flex items-center gap-3 px-4 pt-4">
            {selectedBusinessPage ? (
              selectedBusinessPage.avatar ? (
                <img
                  src={selectedBusinessPage.avatar}
                  alt={selectedBusinessPage.name}
                  className="h-11 w-11 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              )
            ) : (
              <Avatar className="h-11 w-11 border border-border">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{authorFallback}</AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {selectedBusinessPage?.name ?? currentUser?.name ?? "Your account"}
              </p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {selectedBusinessPage
                  ? `Posting as page${selectedBusinessPage.category ? ` · ${selectedBusinessPage.category}` : ""}`
                  : `@${currentUser?.username ?? "username"}`}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              {businessPages.length > 0 ? (
                <select
                  value={selectedBusinessPageId}
                  onChange={(event) => setSelectedBusinessPageId(event.target.value)}
                  disabled={submitting}
                  className="h-8 rounded-full border border-border bg-muted px-3 text-xs font-semibold text-foreground outline-none"
                >
                  <option value="">Post as yourself</option>
                  {businessPages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => router.visit("/pages")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary"
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Create page
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-foreground transition hover:bg-muted/80"
                    disabled={submitting}
                  >
                    {visibilityOptions.find(
                      (option) => option.value === visibility,
                    )?.label ?? "Audience"}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-border bg-popover text-popover-foreground"
                >
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = visibility === option.value;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setVisibility(option.value)}
                        className={`flex cursor-pointer items-start gap-2 ${selected ? "bg-primary/10" : ""}`}
                      >
                        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span className="flex flex-col">
                          <span className="text-sm">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-48 w-full resize-none border-0 bg-transparent px-4 py-4 text-[1.35rem] font-medium leading-8 text-foreground outline-none placeholder:text-muted-foreground"
            maxLength={MAX_CONTENT_LENGTH}
            placeholder={`What's on your mind${currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}?`}
            disabled={submitting}
          />

          <div className="mx-4 mb-4 rounded-2xl border border-border px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-foreground">Add to your post</p>
              <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={submitting}
                className="rounded-full border-0 bg-emerald-500/10 font-bold text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Photo/video
              </Button>
              <EmojiStickerPicker
                onSelect={(value) => setContent((current) => `${current}${value}`)}
              />
              </div>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={(e) => {
              onSelectFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />

          <input
            ref={musicInputRef}
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void onSelectMusic(file);
              }
              e.currentTarget.value = "";
            }}
          />

          {media.length > 0 ? (
            <div
              className={`mx-4 mb-4 grid gap-2 rounded-2xl border border-border bg-muted/50 p-2 ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {media.map((item) => {
                const isSelected = selectedMedia?.id === item.id;
                const imageEdit = imageEdits[item.id] ?? DEFAULT_IMAGE_EDIT;
                const videoEdit = videoEdits[item.id];

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedMediaId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedMediaId(item.id);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-xl border bg-black text-left ${
                      isSelected
                        ? "border-[#1877f2] ring-2 ring-[#1877f2]/30"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.previewUrl}
                        className="h-48 w-full bg-black object-cover"
                        controls
                        onLoadedMetadata={(event) => {
                          handleVideoMetadata(
                            item.id,
                            event.currentTarget.duration,
                          );
                        }}
                        onTimeUpdate={(event) => {
                          if (
                            !videoEdit ||
                            videoEdit.trimEnd <= videoEdit.trimStart
                          ) {
                            return;
                          }
                          if (
                            event.currentTarget.currentTime >= videoEdit.trimEnd
                          ) {
                            event.currentTarget.pause();
                            event.currentTarget.currentTime =
                              videoEdit.trimStart;
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="h-48 w-full overflow-hidden bg-black"
                        style={{
                          aspectRatio: getAspectRatio(imageEdit.aspect),
                        }}
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                          style={{
                            transform: `translate(${imageEdit.panX}%, ${imageEdit.panY}%) scale(${imageEdit.zoom})`,
                          }}
                        />
                      </div>
                    )}
                    {item.type === "video" &&
                    videoEdit &&
                    videoEdit.duration > 0 ? (
                      <span className="absolute left-2 bottom-2 rounded bg-black/70 px-2 py-1 text-[10px] text-zinc-100">
                        {formatSeconds(videoEdit.trimStart)} -{" "}
                        {formatSeconds(videoEdit.trimEnd)}
                      </span>
                    ) : null}

                    <span className="absolute left-2 top-2 rounded bg-black/65 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-100">
                      {item.type}
                    </span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeMedia(item.id);
                      }}
                      className="absolute right-2 top-2 rounded-full border border-white/15 bg-black/65 p-1.5 text-white transition hover:bg-black/80"
                      aria-label="Remove media"
                      disabled={submitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {hashtags.length > 0 ? (
            <div className="mx-4 mb-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-bold text-muted-foreground">Detected hashtags</p>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-bold text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {/* <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">
              Audience
            </h2>
            <div className="space-y-2">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                const selected = visibility === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVisibility(option.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-left ${
                      selected
                        ? "border-cyan-400/70 bg-cyan-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                    disabled={submitting}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-zinc-300" />
                      <p className="text-sm font-medium text-zinc-100">
                        {option.label}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div> */}

          <div className="rounded-[22px] border border-border bg-card p-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] dark:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-foreground">Picture music</p>
                <p className="text-xs font-medium text-muted-foreground">Add one track when your post uses images.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => musicInputRef.current?.click()}
                disabled={submitting || media.length === 0 || media[0]?.type !== "image"}
                className="rounded-full font-bold"
              >
                <Music2 className="mr-2 h-4 w-4" />
                {music ? "Change" : "Add music"}
              </Button>
            </div>

            {music ? (
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {music.file.name}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {typeof music.durationSeconds === "number"
                        ? `${music.durationSeconds.toFixed(1)} seconds`
                        : "Audio track"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (music.previewUrl) {
                        URL.revokeObjectURL(music.previewUrl);
                      }
                      setMusic(null);
                    }}
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <audio src={music.previewUrl} controls className="w-full" />
              </div>
            ) : null}
          </div>

          {selectedMedia ? (
          <div className="rounded-[22px] border border-border bg-card p-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)] dark:shadow-black/20">
            <div className="mb-3">
              <p className="text-sm font-black text-foreground">Media editor</p>
              <p className="text-xs font-medium text-muted-foreground">Adjust the selected media before posting.</p>
            </div>
            {selectedMedia?.type === "image" && selectedImageEdit ? (
              <div className="space-y-3">
                <div
                  className="overflow-hidden rounded-2xl border border-border bg-black"
                  style={{
                    aspectRatio: getAspectRatio(selectedImageEdit.aspect),
                  }}
                >
                  <img
                    src={selectedMedia.previewUrl}
                    alt={selectedMedia.file.name}
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${selectedImageEdit.panX}%, ${selectedImageEdit.panY}%) scale(${selectedImageEdit.zoom})`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {imageAspectOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateImageEdit(selectedMedia.id, {
                          aspect: option.value,
                        })
                      }
                      className={`rounded-md border px-2 py-1 text-xs ${
                        selectedImageEdit.aspect === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                      disabled={submitting}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div>
                    <p className="mb-1 text-xs font-bold text-muted-foreground">
                    Zoom: {selectedImageEdit.zoom.toFixed(2)}x
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={selectedImageEdit.zoom}
                    onChange={(event) =>
                      updateImageEdit(selectedMedia.id, {
                        zoom: Number(event.currentTarget.value),
                      })
                    }
                    className="h-2 w-full accent-[#1877f2]"
                    disabled={submitting}
                  />
                </div>
                <div>
                    <p className="mb-1 text-xs font-bold text-muted-foreground">
                    Horizontal: {Math.round(selectedImageEdit.panX)}%
                  </p>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={selectedImageEdit.panX}
                    onChange={(event) =>
                      updateImageEdit(selectedMedia.id, {
                        panX: Number(event.currentTarget.value),
                      })
                    }
                    className="h-2 w-full accent-[#1877f2]"
                    disabled={submitting}
                  />
                </div>
                <div>
                    <p className="mb-1 text-xs font-bold text-muted-foreground">
                    Vertical: {Math.round(selectedImageEdit.panY)}%
                  </p>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={selectedImageEdit.panY}
                    onChange={(event) =>
                      updateImageEdit(selectedMedia.id, {
                        panY: Number(event.currentTarget.value),
                      })
                    }
                    className="h-2 w-full accent-[#1877f2]"
                    disabled={submitting}
                  />
                </div>
              </div>
            ) : null}

            {selectedMedia?.type === "video" && selectedVideoEdit ? (
              <div className="space-y-3">
                <video
                  ref={editorVideoRef}
                  src={selectedMedia.previewUrl}
                  className="h-52 w-full rounded-2xl border border-border bg-black object-contain"
                  controls
                  onLoadedMetadata={(event) =>
                    handleVideoMetadata(
                      selectedMedia.id,
                      event.currentTarget.duration,
                    )
                  }
                  onTimeUpdate={(event) => {
                    if (
                      event.currentTarget.currentTime >=
                      selectedVideoEdit.trimEnd
                    ) {
                      event.currentTarget.pause();
                      event.currentTarget.currentTime =
                        selectedVideoEdit.trimStart;
                    }
                  }}
                />
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Scissors className="h-3.5 w-3.5" /> Start (
                    {formatSeconds(selectedVideoEdit.trimStart)})
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(
                      0,
                      selectedVideoEdit.duration - MIN_VIDEO_TRIM_GAP_SECONDS,
                    )}
                    step={0.1}
                    value={selectedVideoEdit.trimStart}
                    disabled={selectedVideoEdit.duration <= 0}
                    onChange={(event) => {
                      const nextStart = Number(event.currentTarget.value);
                      const maxStart = Math.max(
                        0,
                        selectedVideoEdit.trimEnd - MIN_VIDEO_TRIM_GAP_SECONDS,
                      );
                      updateVideoEdit(selectedMedia.id, {
                        trimStart: Math.min(nextStart, maxStart),
                      });
                    }}
                    className="h-2 w-full accent-[#1877f2]"
                  />
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Scissors className="h-3.5 w-3.5" /> End (
                    {formatSeconds(selectedVideoEdit.trimEnd)})
                  </p>
                  <input
                    type="range"
                    min={Math.min(
                      selectedVideoEdit.duration,
                      selectedVideoEdit.trimStart + MIN_VIDEO_TRIM_GAP_SECONDS,
                    )}
                    max={Math.max(
                      selectedVideoEdit.duration,
                      selectedVideoEdit.trimStart + MIN_VIDEO_TRIM_GAP_SECONDS,
                    )}
                    step={0.1}
                    value={Math.max(
                      selectedVideoEdit.trimEnd,
                      selectedVideoEdit.trimStart + MIN_VIDEO_TRIM_GAP_SECONDS,
                    )}
                    disabled={selectedVideoEdit.duration <= 0}
                    onChange={(event) => {
                      const nextEnd = Number(event.currentTarget.value);
                      const minEnd =
                        selectedVideoEdit.trimStart +
                        MIN_VIDEO_TRIM_GAP_SECONDS;
                      updateVideoEdit(selectedMedia.id, {
                        trimEnd: Math.max(nextEnd, minEnd),
                      });
                    }}
                    className="h-2 w-full accent-[#1877f2]"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={previewTrim}
                  disabled={selectedVideoEdit.duration <= 0}
                >
                  Preview trim
                </Button>
              </div>
            ) : null}
          </div>
          ) : null}

          {/* <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-100">
              Post checklist
            </h2>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Media: {media.length}/4 images or 1 video
              </li>
              <li className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5" />
                Image and video cannot be mixed in one post
              </li>
              <li className="flex items-center gap-2">
                <Crop className="h-3.5 w-3.5" />
                Image crop edits apply before upload
              </li>
              <li className="flex items-center gap-2">
                <Scissors className="h-3.5 w-3.5" />
                Video trim currently affects preview + metadata
              </li>
              <li className="text-xs">Detected hashtags: {hashtags.length}</li>
              <li className="text-xs">Maximum size: 50GB per file</li>
            </ul>
          </div> */}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-6px_18px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden dark:shadow-black/30">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={submitting}
            className="shrink-0 rounded-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Media
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {content.trim().length > 0
                ? `${content.length}/${MAX_CONTENT_LENGTH} characters`
                : `Write something or add media (${MAX_FILE_SIZE_LABEL} max per file)`}
            </p>
          </div>
          <Button onClick={submit} disabled={!canSubmit} className="shrink-0 rounded-full bg-[#1877f2] px-6 font-bold text-white hover:bg-[#166fe5]">
            {submitButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
