type MediaWithProcessingStatus = {
  path?: string | null;
  url?: string | null;
  thumbnail?: string | null;
  processing_status?: "queued" | "processing" | "ready" | "failed" | "skipped" | string | null;
};

type PostWithMediaStatus<TPost> = {
  media?: MediaWithProcessingStatus[] | null;
  original_post?: TPost | null;
};

export function isPostMediaReadyForDisplay<TPost extends PostWithMediaStatus<TPost>>(
  post?: TPost | null,
  depth = 0,
): boolean {
  if (!post || depth > 8) return true;

  if (post.original_post) {
    return isPostMediaReadyForDisplay(post.original_post, depth + 1);
  }

  const mediaItems = post.media ?? [];
  if (mediaItems.length === 0) return true;

  return mediaItems.every((media) => {
    const status = String(media.processing_status ?? "").toLowerCase();
    if (status === "queued" || status === "processing") {
      return false;
    }

    return Boolean(media.path || media.url || media.thumbnail);
  });
}
