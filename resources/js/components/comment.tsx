import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { EmojiStickerPicker } from "./emoji-sticker-picker";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { ChevronDown, ChevronUp, Heart, Image, MessageCircle, Send, X } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface Media {
  id: string;
  path: string;
  type: string;
  mime_type?: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  like_count: number;
  comment_count?: number;
  repost_count?: number;
  media?: Media[];
  user: User;
  user_liked?: boolean;
  user_reshared?: boolean;
  user_saved?: boolean;
}

interface Comment {
  id: string;
  content: string;
  user: User;
  created_at: string;
  parent_id?: string | null;
  like_count?: number;
  reply_count?: number;
  user_liked?: boolean;
  media?: CommentMedia[];
}

interface CommentMedia {
  id: string;
  path: string;
  type: string;
  mime_type?: string;
  url?: string;
}

interface ImageDraft {
  id: string;
  file: File;
  previewUrl: string;
}

interface CommentsResponse {
  data: Comment[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.max(1, Math.floor((now.getTime() - past.getTime()) / 1000));

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(days / 365)}y ago`;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || "")
    .join("");
  return initials || "U";
}

interface ReplyState {
  items: Comment[];
  page: number;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  expanded: boolean;
}

interface ReplyComposerState {
  open: boolean;
  content: string;
  submitting: boolean;
  images: ImageDraft[];
}

const INDENT_STEP = 16;
const INDENT_MAX = 48;
const COMMENT_INPUT_CLASS =
  "min-h-[40px] max-h-[112px] min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[16px] leading-6 text-foreground placeholder:text-muted-foreground [user-select:text] [-webkit-user-select:text] focus-visible:ring-0 md:text-sm";

const MAX_COMMENT_IMAGES = 4;

function resolveMediaUrl(media: CommentMedia): string {
  if (media.url) return media.url;
  if (/^https?:\/\//.test(media.path) || media.path.startsWith("/")) return media.path;
  return `/storage/${media.path.replace(/^\/+/, "")}`;
}

function createImageDrafts(files: FileList | File[], existingCount = 0): ImageDraft[] {
  return Array.from(files)
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, Math.max(0, MAX_COMMENT_IMAGES - existingCount))
    .map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
}

function revokeImageDrafts(images: ImageDraft[]) {
  images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
}

function buildCommentFormData(content: string, images: ImageDraft[], parentId?: string) {
  const formData = new FormData();
  formData.append("content", content);
  images.forEach((image, index) => formData.append(`images[${index}]`, image.file));
  if (parentId) formData.append("parent_id", parentId);
  return formData;
}

function stopTextInputGesture(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function pasteIntoTextarea({
  event,
  value,
  setValue,
  textarea,
}: {
  event: React.ClipboardEvent<HTMLTextAreaElement>;
  value: string;
  setValue: (nextValue: string) => void;
  textarea: HTMLTextAreaElement | null;
}) {
  event.stopPropagation();

  const pastedText = event.clipboardData.getData("text");
  if (!pastedText) return;

  event.preventDefault();

  const selectionStart = textarea?.selectionStart ?? value.length;
  const selectionEnd = textarea?.selectionEnd ?? selectionStart;
  const nextValue =
    value.slice(0, selectionStart) + pastedText + value.slice(selectionEnd);
  const nextCursor = selectionStart + pastedText.length;

  setValue(nextValue);

  window.requestAnimationFrame(() => {
    textarea?.focus();
    textarea?.setSelectionRange(nextCursor, nextCursor);
  });
}

function useVisualViewportSize(active: boolean) {
  const [viewportSize, setViewportSize] = useState<{
    height: number | null;
  }>({
    height: null,
  });

  useEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      setViewportSize({ height: null });
      return;
    }

    const viewport = window.visualViewport;

    const updateViewportSize = () => {
      setViewportSize({
        height: Math.round(viewport.height),
      });
    };

    updateViewportSize();
    viewport.addEventListener("resize", updateViewportSize);
    viewport.addEventListener("scroll", updateViewportSize);
    window.addEventListener("orientationchange", updateViewportSize);

    return () => {
      viewport.removeEventListener("resize", updateViewportSize);
      viewport.removeEventListener("scroll", updateViewportSize);
      window.removeEventListener("orientationchange", updateViewportSize);
    };
  }, [active]);

  return viewportSize;
}

function getKeyboardAwarePanelStyle(
  viewportHeight: number | null,
): React.CSSProperties | undefined {
  if (!viewportHeight) return undefined;

  return {
    height: viewportHeight,
  };
}

const CommentCard = memo(function CommentCard({
  comment,
  depth,
  replyCount,
  replyState,
  replyComposer,
  onToggleReplyComposer,
  onReplyComposerChange,
  onSubmitReply,
  onToggleCommentLike,
  onToggleReplies,
  onLoadMoreReplies,
  onReplyImagesAdd,
  onReplyImageRemove,
  renderReplies,
}: {
  comment: Comment;
  depth: number;
  replyCount: number;
  replyState?: ReplyState;
  replyComposer?: ReplyComposerState;
  onToggleReplyComposer: (comment: Comment) => void;
  onReplyComposerChange: (commentId: string, value: string) => void;
  onSubmitReply: (comment: Comment) => Promise<void>;
  onToggleCommentLike: (comment: Comment) => void;
  onToggleReplies: (comment: Comment) => void;
  onLoadMoreReplies: (comment: Comment) => void;
  onReplyImagesAdd: (commentId: string, files: FileList | File[]) => void;
  onReplyImageRemove: (commentId: string, imageId: string) => void;
  renderReplies: (parentId: string, depth: number) => React.ReactNode;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!replyComposer?.open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [replyComposer?.open]);

  const keepReplyInputVisible = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    });
  };

  const visibleIndent = Math.min(depth * INDENT_STEP, INDENT_MAX);
  const hasReplies = replyCount > 0;
  const isRepliesExpanded = Boolean(replyState?.expanded);
  const avatarSrc = comment.user.avatar || comment.user.avatar_url;

  return (
    <div style={{ marginLeft: visibleIndent }} className="space-y-2">
      <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
        <Avatar className="h-10 w-10 shrink-0 border border-border">
          <AvatarImage src={avatarSrc} alt={comment.user.name} />
          <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
            {getInitials(comment.user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold text-foreground">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
          </div>
          {comment.content && (
            <p className="mt-1.5 break-words text-sm leading-relaxed text-foreground">{comment.content}</p>
          )}

          {comment.media && comment.media.length > 0 && (
            <div className="mt-2 grid max-w-sm grid-cols-2 gap-2">
              {comment.media.map((media) => (
                <img
                  key={media.id}
                  src={resolveMediaUrl(media)}
                  alt="Comment attachment"
                  className="max-h-44 w-full rounded-xl border border-white/10 object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleCommentLike(comment)}
              className={`h-7 rounded-full px-2.5 text-xs hover:bg-muted ${
                comment.user_liked ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`mr-1 h-3.5 w-3.5 ${comment.user_liked ? "fill-current" : ""}`} />
              {formatCount(comment.like_count ?? 0)}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleReplyComposer(comment)}
              className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Reply
            </Button>

            {hasReplies && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onToggleReplies(comment)}
                className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {isRepliesExpanded ? (
                  <ChevronUp className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="mr-1 h-3.5 w-3.5" />
                )}
                {isRepliesExpanded ? "Hide replies" : `View replies (${formatCount(replyCount)})`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {replyComposer?.open && (
        <div style={{ marginLeft: Math.min((depth + 1) * INDENT_STEP, INDENT_MAX) }} className="rounded-2xl border border-border bg-muted/30 p-2.5">
          <div className="mb-2 text-xs text-muted-foreground">Replying to @{comment.user.username}</div>
          <div
            data-no-reel-nav="true"
            data-no-swipe="true"
            data-vaul-no-drag="true"
            className="rounded-xl border border-border bg-background/60 p-2"
          >
            {replyComposer.images.length > 0 && (
              <div className="mb-2 grid grid-cols-4 gap-2">
                {replyComposer.images.map((image) => (
                  <div key={image.id} className="relative overflow-hidden rounded-lg border border-white/10">
                    <img src={image.previewUrl} alt="" className="h-16 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onReplyImageRemove(comment.id, image.id)}
                      className="absolute right-1 top-1 rounded-full bg-foreground/70 p-1 text-background"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <EmojiStickerPicker
                onSelect={(value) =>
                  onReplyComposerChange(comment.id, `${replyComposer.content}${value}`)
                }
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) onReplyImagesAdd(comment.id, event.target.files);
                  event.currentTarget.value = "";
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => imageInputRef.current?.click()}
                disabled={replyComposer.images.length >= MAX_COMMENT_IMAGES}
                className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Textarea
                ref={inputRef}
                value={replyComposer.content}
                onChange={(e) => onReplyComposerChange(comment.id, e.target.value)}
                onPaste={(event) =>
                  pasteIntoTextarea({
                    event,
                    value: replyComposer.content,
                    setValue: (nextValue) => onReplyComposerChange(comment.id, nextValue),
                    textarea: inputRef.current,
                  })
                }
                onCopy={stopTextInputGesture}
                onCut={stopTextInputGesture}
                onContextMenu={stopTextInputGesture}
                onFocus={keepReplyInputVisible}
                onMouseDown={stopTextInputGesture}
                onPointerDown={stopTextInputGesture}
                onTouchStart={stopTextInputGesture}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void onSubmitReply(comment);
                  }
                }}
                placeholder={`Reply to @${comment.user.username}`}
                rows={1}
                data-no-reel-nav="true"
                data-no-swipe="true"
                data-vaul-no-drag="true"
                className={COMMENT_INPUT_CLASS}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => {
                  void onSubmitReply(comment);
                }}
                disabled={replyComposer.submitting || (!replyComposer.content.trim() && replyComposer.images.length === 0)}
                className="h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {replyState?.expanded && (
        <div
          style={{ marginLeft: Math.min((depth + 1) * INDENT_STEP, INDENT_MAX) }}
          className="relative space-y-2 border-l border-border pl-3"
        >
          {replyState.loading && replyState.items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32 bg-muted" />
                  <Skeleton className="h-8 w-full bg-muted" />
                </div>
              </div>
            </div>
          ) : (
            renderReplies(comment.id, depth + 1)
          )}

          {replyState.hasMore && (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onLoadMoreReplies(comment)}
                disabled={replyState.loading}
                className="h-8 rounded-full px-3 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              >
                {replyState.loading ? "Loading..." : "View more replies"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

interface CommentsPanelProps {
  open: boolean;
  onClose: () => void;
  count: number;
  initialLoading: boolean;
  comments: Comment[];
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreRef: (node?: Element | null | undefined) => void;
  content: string;
  setContent: (value: string) => void;
  images: ImageDraft[];
  onImagesAdd: (files: FileList | File[]) => void;
  onImageRemove: (imageId: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  replyStates: Record<string, ReplyState>;
  replyComposers: Record<string, ReplyComposerState>;
  replyCountOverrides: Record<string, number>;
  onToggleReplyComposer: (comment: Comment) => void;
  onReplyComposerChange: (commentId: string, value: string) => void;
  onSubmitReply: (comment: Comment) => Promise<void>;
  onToggleCommentLike: (comment: Comment) => void;
  onToggleReplies: (comment: Comment) => void;
  onLoadMoreReplies: (comment: Comment) => void;
  onReplyImagesAdd: (commentId: string, files: FileList | File[]) => void;
  onReplyImageRemove: (commentId: string, imageId: string) => void;
  renderReplies: (parentId: string, depth: number) => React.ReactNode;
}

const CommentsPanel = memo(function CommentsPanel({
  open,
  onClose,
  count,
  initialLoading,
  comments,
  hasMore,
  loadingMore,
  loadMoreRef,
  content,
  setContent,
  images,
  onImagesAdd,
  onImageRemove,
  onSubmit,
  isSubmitting,
  replyStates,
  replyComposers,
  replyCountOverrides,
  onToggleReplyComposer,
  onReplyComposerChange,
  onSubmitReply,
  onToggleCommentLike,
  onToggleReplies,
  onLoadMoreReplies,
  onReplyImagesAdd,
  onReplyImageRemove,
  renderReplies,
}: CommentsPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { height: viewportHeight } = useVisualViewportSize(open);
  const panelStyle = getKeyboardAwarePanelStyle(viewportHeight);

  const keepInputVisible = () => {
    window.requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void onSubmit();
    }
  };

  return (
    <div
      data-no-reel-nav="true"
      data-no-swipe="true"
      data-vaul-no-drag="true"
      className="mobile-page-bg flex h-full min-h-0 flex-col text-foreground"
      style={panelStyle}
    >
      <div className="mobile-safe-top sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="karads-heading text-base font-semibold">Comments</h2>
            <p className="text-xs text-muted-foreground">{count} {count === 1 ? "comment" : "comments"}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-11 w-11 rounded-full border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {initialLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`comment-skeleton-${idx}`} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32 bg-muted" />
                    <Skeleton className="h-8 w-full bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex min-h-[38vh] flex-col items-center justify-center text-center">
            <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground">No comments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start the conversation by commenting on this post.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                replyCount={replyCountOverrides[comment.id] ?? comment.reply_count ?? 0}
                replyState={replyStates[comment.id]}
                replyComposer={replyComposers[comment.id]}
                onToggleReplyComposer={onToggleReplyComposer}
                onReplyComposerChange={onReplyComposerChange}
                onSubmitReply={onSubmitReply}
                onToggleCommentLike={onToggleCommentLike}
                onToggleReplies={onToggleReplies}
                onLoadMoreReplies={onLoadMoreReplies}
                onReplyImagesAdd={onReplyImagesAdd}
                onReplyImageRemove={onReplyImageRemove}
                renderReplies={renderReplies}
              />
            ))}

            {hasMore && (
              <div ref={loadMoreRef} className="py-2">
                {loadingMore && (
                  <div className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32 bg-muted" />
                        <Skeleton className="h-8 w-full bg-muted" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="mobile-safe-bottom shrink-0 border-t border-border bg-background/90 px-3 py-3 backdrop-blur-xl"
      >
        <div
          data-no-reel-nav="true"
          data-no-swipe="true"
          data-vaul-no-drag="true"
          className="rounded-2xl border border-border bg-muted/30 p-2"
        >
          {images.length > 0 && (
            <div className="mb-2 grid grid-cols-4 gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative overflow-hidden rounded-xl border border-white/10">
                  <img src={image.previewUrl} alt="" className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onImageRemove(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-foreground/70 p-1 text-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3">
            <EmojiStickerPicker onSelect={(value) => setContent(`${content}${value}`)} />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) onImagesAdd(event.target.files);
                event.currentTarget.value = "";
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => imageInputRef.current?.click()}
              disabled={images.length >= MAX_COMMENT_IMAGES}
              className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={(event) =>
                pasteIntoTextarea({
                  event,
                  value: content,
                  setValue: setContent,
                  textarea: inputRef.current,
                })
              }
              onCopy={stopTextInputGesture}
              onCut={stopTextInputGesture}
              onContextMenu={stopTextInputGesture}
              onFocus={keepInputVisible}
              onMouseDown={stopTextInputGesture}
              onPointerDown={stopTextInputGesture}
              onTouchStart={stopTextInputGesture}
              onKeyDown={onKeyDown}
              placeholder="Add a comment"
              rows={1}
              data-no-reel-nav="true"
              data-no-swipe="true"
              data-vaul-no-drag="true"
              className={COMMENT_INPUT_CLASS}
            />

            <Button
              type="button"
              size="icon"
              onClick={() => {
                void onSubmit();
              }}
              disabled={isSubmitting || (!content.trim() && images.length === 0)}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

function CommentSection({
  post,
  trigger,
  initialOpen = false,
}: {
  post: Post;
  trigger?: React.ReactNode;
  initialOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  const { auth } = useAuth();

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(post.comment_count || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [commentImages, setCommentImages] = useState<ImageDraft[]>([]);
  const [replyStates, setReplyStates] = useState<Record<string, ReplyState>>({});
  const [replyComposers, setReplyComposers] = useState<Record<string, ReplyComposerState>>({});
  const [replyCountOverrides, setReplyCountOverrides] = useState<Record<string, number>>({});

  const loadedForPostIdRef = useRef<string | null>(null);
  const requestTokenRef = useRef(0);
  const replyRequestTokensRef = useRef<Record<string, number>>({});

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    setCount(post.comment_count || 0);
  }, [post.id, post.comment_count]);

  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
    }
  }, [initialOpen, post.id]);

  useEffect(() => {
    loadedForPostIdRef.current = null;
    setComments([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(false);
    setLoadingMore(false);
    setContent("");
    setCommentImages((prev) => {
      revokeImageDrafts(prev);
      return [];
    });
    setReplyComposers((prev) => {
      Object.values(prev).forEach((composer) => revokeImageDrafts(composer.images ?? []));
      return {};
    });
    setReplyStates({});
    setReplyCountOverrides({});
    replyRequestTokensRef.current = {};
  }, [post.id]);

  const fetchComments = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      if (mode === "replace") {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      const requestToken = ++requestTokenRef.current;

      try {
        const response = await axiosInstance.get<CommentsResponse>(`/api/posts/${post.id}/comments`, {
          params: { page: targetPage },
        });

        if (requestToken !== requestTokenRef.current) return;

        const payload = response.data;
        const incoming = payload.data || [];

        setComments((prev) => (mode === "replace" ? incoming : [...prev, ...incoming]));
        setCount((prev) => {
          if (typeof post.comment_count === "number") return post.comment_count;
          return prev || payload.meta?.total || 0;
        });
        setPage(payload.meta?.current_page ?? targetPage);
        setHasMore(Boolean(payload.links?.next));
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        if (requestToken === requestTokenRef.current) {
          setInitialLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [post.id, post.comment_count],
  );

  const fetchReplies = useCallback(
    async (parentId: string, targetPage: number, mode: "replace" | "append") => {
      setReplyStates((prev) => ({
        ...prev,
        [parentId]: {
          items: prev[parentId]?.items ?? [],
          page: prev[parentId]?.page ?? 0,
          hasMore: prev[parentId]?.hasMore ?? true,
          loaded: prev[parentId]?.loaded ?? false,
          expanded: prev[parentId]?.expanded ?? true,
          loading: true,
        },
      }));

      const nextToken = (replyRequestTokensRef.current[parentId] ?? 0) + 1;
      replyRequestTokensRef.current[parentId] = nextToken;

      try {
        const response = await axiosInstance.get<CommentsResponse>(`/api/posts/${post.id}/comments/${parentId}/replies`, {
          params: { page: targetPage },
        });

        if (replyRequestTokensRef.current[parentId] !== nextToken) return;

        const payload = response.data;
        const incoming = payload.data || [];

        setReplyStates((prev) => {
          const current = prev[parentId];
          const existingItems = current?.items ?? [];

          return {
            ...prev,
            [parentId]: {
              items: mode === "replace" ? incoming : [...existingItems, ...incoming],
              page: payload.meta?.current_page ?? targetPage,
              hasMore: Boolean(payload.links?.next),
              loaded: true,
              loading: false,
              expanded: true,
            },
          };
        });
      } catch (error) {
        console.error("Failed to fetch replies:", error);
        setReplyStates((prev) => ({
          ...prev,
          [parentId]: {
            items: prev[parentId]?.items ?? [],
            page: prev[parentId]?.page ?? 0,
            hasMore: prev[parentId]?.hasMore ?? true,
            loaded: prev[parentId]?.loaded ?? false,
            expanded: prev[parentId]?.expanded ?? true,
            loading: false,
          },
        }));
      }
    },
    [post.id],
  );

  useEffect(() => {
    if (!open) return;
    if (loadedForPostIdRef.current === post.id) return;

    loadedForPostIdRef.current = post.id;
    void fetchComments(1, "replace");
  }, [open, post.id, fetchComments]);

  useEffect(() => {
    if (!open || !inView || !hasMore || initialLoading || loadingMore || page < 1) return;
    void fetchComments(page + 1, "append");
  }, [open, inView, hasMore, initialLoading, loadingMore, page, fetchComments]);

  const submitComment = useCallback(async () => {
    const value = content.trim();
    if ((!value && commentImages.length === 0) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/api/posts/${post.id}/comment`,
        buildCommentFormData(value, commentImages),
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const created = response.data;

      const optimisticComment: Comment = {
        id: created.id,
        content: created.content,
        parent_id: created.parent_id ?? null,
        media: created.media ?? [],
        like_count: created.like_count ?? 0,
        user_liked: created.user_liked ?? false,
        reply_count: created.reply_count ?? 0,
        created_at: created.created_at,
        user: {
          id: created.user?.id ?? auth?.user?.id ?? "",
          name: created.user?.name ?? auth?.user?.name ?? "You",
          username: created.user?.username ?? auth?.user?.username ?? "you",
          email: auth?.user?.email ?? "",
          avatar: created.user?.avatar ?? auth?.user?.avatar,
          avatar_url: created.user?.avatar_url,
        },
      };

      setComments((prev) => [...prev, optimisticComment]);
      setCount((prev) => prev + 1);
      setContent("");
      setCommentImages((prev) => {
        revokeImageDrafts(prev);
        return [];
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, commentImages, isSubmitting, post.id, auth?.user]);

  const addCommentImages = useCallback((files: FileList | File[]) => {
    setCommentImages((prev) => [...prev, ...createImageDrafts(files, prev.length)]);
  }, []);

  const removeCommentImage = useCallback((imageId: string) => {
    setCommentImages((prev) => {
      const removed = prev.find((image) => image.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((image) => image.id !== imageId);
    });
  }, []);

  const toggleReplyComposer = useCallback((comment: Comment) => {
    setReplyComposers((prev) => {
      const current = prev[comment.id];
      return {
        ...prev,
        [comment.id]: {
          open: !(current?.open ?? false),
          content: current?.content ?? "",
          submitting: current?.submitting ?? false,
          images: current?.images ?? [],
        },
      };
    });
  }, []);

  const setReplyComposerContent = useCallback((commentId: string, value: string) => {
    setReplyComposers((prev) => ({
      ...prev,
      [commentId]: {
        open: prev[commentId]?.open ?? true,
        content: value,
        submitting: prev[commentId]?.submitting ?? false,
        images: prev[commentId]?.images ?? [],
      },
    }));
  }, []);

  const addReplyImages = useCallback((commentId: string, files: FileList | File[]) => {
    setReplyComposers((prev) => {
      const current = prev[commentId];
      const currentImages = current?.images ?? [];
      return {
        ...prev,
        [commentId]: {
          open: true,
          content: current?.content ?? "",
          submitting: current?.submitting ?? false,
          images: [...currentImages, ...createImageDrafts(files, currentImages.length)],
        },
      };
    });
  }, []);

  const removeReplyImage = useCallback((commentId: string, imageId: string) => {
    setReplyComposers((prev) => {
      const current = prev[commentId];
      const removed = current?.images?.find((image) => image.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return {
        ...prev,
        [commentId]: {
          open: current?.open ?? true,
          content: current?.content ?? "",
          submitting: current?.submitting ?? false,
          images: (current?.images ?? []).filter((image) => image.id !== imageId),
        },
      };
    });
  }, []);

  const submitReply = useCallback(
    async (parentComment: Comment) => {
      const composer = replyComposers[parentComment.id];
      const value = composer?.content?.trim() ?? "";
      const images = composer?.images ?? [];
      if ((!value && images.length === 0) || composer?.submitting) return;

      setReplyComposers((prev) => ({
        ...prev,
        [parentComment.id]: {
          open: true,
          content: prev[parentComment.id]?.content ?? "",
          submitting: true,
          images: prev[parentComment.id]?.images ?? [],
        },
      }));

      try {
        const response = await axiosInstance.post(
          `/api/posts/${post.id}/comment`,
          buildCommentFormData(value, images, parentComment.id),
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        const created = response.data;
        const reply: Comment = {
          id: created.id,
          content: created.content,
          parent_id: created.parent_id ?? parentComment.id,
          media: created.media ?? [],
          like_count: created.like_count ?? 0,
          user_liked: created.user_liked ?? false,
          reply_count: created.reply_count ?? 0,
          created_at: created.created_at,
          user: {
            id: created.user?.id ?? auth?.user?.id ?? "",
            name: created.user?.name ?? auth?.user?.name ?? "You",
            username: created.user?.username ?? auth?.user?.username ?? "you",
            email: auth?.user?.email ?? "",
            avatar: created.user?.avatar ?? auth?.user?.avatar,
            avatar_url: created.user?.avatar_url,
          },
        };

        setReplyCountOverrides((prev) => ({
          ...prev,
          [parentComment.id]: (prev[parentComment.id] ?? parentComment.reply_count ?? 0) + 1,
        }));

        setReplyStates((prev) => {
          const current = prev[parentComment.id];
          if (!current?.expanded) {
            return prev;
          }

          const nextItems = [...(current.items ?? []), reply];
          return {
            ...prev,
            [parentComment.id]: {
              ...current,
              items: nextItems,
              loaded: true,
            },
          };
        });

        setReplyComposers((prev) => ({
          ...prev,
          [parentComment.id]: {
            open: false,
            content: "",
            submitting: false,
            images: [],
          },
        }));
        revokeImageDrafts(images);

        setCount((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to post reply:", error);
        setReplyComposers((prev) => ({
          ...prev,
          [parentComment.id]: {
            open: true,
            content: prev[parentComment.id]?.content ?? value,
            submitting: false,
            images: prev[parentComment.id]?.images ?? images,
          },
        }));
      }
    },
    [replyComposers, post.id, auth?.user],
  );

  const updateCommentEverywhere = useCallback((commentId: string, updater: (comment: Comment) => Comment) => {
    setComments((prev) => prev.map((comment) => (comment.id === commentId ? updater(comment) : comment)));
    setReplyStates((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([parentId, state]) => {
        next[parentId] = {
          ...state,
          items: state.items.map((reply) => (reply.id === commentId ? updater(reply) : reply)),
        };
      });
      return next;
    });
  }, []);

  const toggleCommentLike = useCallback(
    (comment: Comment) => {
      const nextLiked = !comment.user_liked;
      const nextCount = Math.max(0, (comment.like_count ?? 0) + (nextLiked ? 1 : -1));

      updateCommentEverywhere(comment.id, (item) => ({
        ...item,
        user_liked: nextLiked,
        like_count: nextCount,
      }));

      axiosInstance
        .post(`/api/posts/${post.id}/comments/${comment.id}/${nextLiked ? "like" : "unlike"}`)
        .then((response) => {
          updateCommentEverywhere(comment.id, (item) => ({
            ...item,
            user_liked: response.data.user_liked ?? nextLiked,
            like_count: response.data.like_count ?? nextCount,
          }));
        })
        .catch((error) => {
          console.error("Failed to toggle comment like:", error);
          updateCommentEverywhere(comment.id, (item) => ({
            ...item,
            user_liked: comment.user_liked,
            like_count: comment.like_count ?? 0,
          }));
        });
    },
    [post.id, updateCommentEverywhere],
  );

  const toggleReplies = useCallback(
    (comment: Comment) => {
      const current = replyStates[comment.id];
      const willExpand = !(current?.expanded ?? false);

      setReplyStates((prev) => ({
        ...prev,
        [comment.id]: {
          items: prev[comment.id]?.items ?? [],
          page: prev[comment.id]?.page ?? 0,
          hasMore: prev[comment.id]?.hasMore ?? true,
          loaded: prev[comment.id]?.loaded ?? false,
          loading: prev[comment.id]?.loading ?? false,
          expanded: willExpand,
        },
      }));

      if (willExpand && !(current?.loaded ?? false)) {
        void fetchReplies(comment.id, 1, "replace");
      }
    },
    [replyStates, fetchReplies],
  );

  const loadMoreReplies = useCallback(
    (comment: Comment) => {
      const current = replyStates[comment.id];
      if (!current || current.loading || !current.hasMore) return;
      void fetchReplies(comment.id, (current.page || 1) + 1, "append");
    },
    [replyStates, fetchReplies],
  );

  const renderReplies = useCallback(
    (parentId: string, depth: number): React.ReactNode => {
      const state = replyStates[parentId];
      const items = state?.items ?? [];
      if (items.length === 0 && state?.loaded && !state.loading) {
        return (
          <div style={{ marginLeft: Math.min(depth * INDENT_STEP, INDENT_MAX) }} className="text-xs text-white/50">
            No replies yet.
          </div>
        );
      }

      return (
        <div
          style={{ marginLeft: Math.min((depth + 1) * INDENT_STEP, INDENT_MAX) }}
          className="relative space-y-2 border-l border-white/10 pl-3"
        >
          {items.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth}
              replyCount={replyCountOverrides[reply.id] ?? reply.reply_count ?? 0}
              replyState={replyStates[reply.id]}
              replyComposer={replyComposers[reply.id]}
              onToggleReplyComposer={toggleReplyComposer}
              onReplyComposerChange={setReplyComposerContent}
              onSubmitReply={submitReply}
              onToggleCommentLike={toggleCommentLike}
              onToggleReplies={toggleReplies}
              onLoadMoreReplies={loadMoreReplies}
              onReplyImagesAdd={addReplyImages}
              onReplyImageRemove={removeReplyImage}
              renderReplies={renderReplies}
            />
          ))}
        </div>
      );
    },
    [replyStates, replyComposers, replyCountOverrides, toggleReplyComposer, setReplyComposerContent, submitReply, toggleCommentLike, toggleReplies, loadMoreReplies, addReplyImages, removeReplyImage],
  );

  const triggerNode = useMemo(() => {
    if (trigger) return trigger;

    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      >
        <MessageCircle className="h-4 w-4" />
        {count > 0 && <span className="text-xs font-semibold">{formatCount(count)}</span>}
      </Button>
    );
  }, [trigger, count]);

  const panel = (
    <CommentsPanel
      open={open}
      onClose={() => setOpen(false)}
      count={count}
      initialLoading={initialLoading}
      comments={comments}
      hasMore={hasMore}
      loadingMore={loadingMore}
      loadMoreRef={loadMoreRef}
      content={content}
      setContent={setContent}
      images={commentImages}
      onImagesAdd={addCommentImages}
      onImageRemove={removeCommentImage}
      onSubmit={submitComment}
      isSubmitting={isSubmitting}
      replyStates={replyStates}
      replyComposers={replyComposers}
      replyCountOverrides={replyCountOverrides}
      onToggleReplyComposer={toggleReplyComposer}
      onReplyComposerChange={setReplyComposerContent}
      onSubmitReply={submitReply}
      onToggleCommentLike={toggleCommentLike}
      onToggleReplies={toggleReplies}
      onLoadMoreReplies={loadMoreReplies}
      onReplyImagesAdd={addReplyImages}
      onReplyImageRemove={removeReplyImage}
      renderReplies={renderReplies}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerNode}</DrawerTrigger>
        <DrawerContent
          data-no-reel-nav="true"
          data-no-swipe="true"
          data-vaul-no-drag="true"
          className="z-[80] !inset-x-0 !top-0 !bottom-auto !mt-0 !h-[100dvh] !max-h-none !rounded-none border-0 bg-[#0b0e13] p-0"
        >
          <DrawerTitle className="sr-only">Comments</DrawerTitle>
          {panel}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent className="h-[80vh] max-w-2xl overflow-hidden border border-white/15 bg-[#0b0e13] p-0 text-white">
        <DialogTitle className="sr-only">Comments</DialogTitle>
        {panel}
      </DialogContent>
    </Dialog>
  );
}

export default CommentSection;

