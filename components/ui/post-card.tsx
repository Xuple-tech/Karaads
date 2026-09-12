import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Bookmark, Ellipsis, Heart, MessageCircle, Repeat2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import type { Post } from '@/lib/types/domain';
import { getDisplayPost, getPrimaryMedia, hasRenderableMedia } from '@/lib/utils/post';
import { Avatar } from './avatar';

type PostCardProps = {
  post: Post;
  isActive?: boolean;
  onLike?: (post: Post) => void;
  onSave?: (post: Post) => void;
  onComment?: (post: Post) => void;
  onRepost?: (post: Post) => void;
  onAuthorPress?: (username?: string) => void;
  onOpenPost?: (post: Post) => void;
};

const isVideoMedia = (post: Post): boolean => {
  const media = post.media?.[0];
  const mediaType = (media?.type ?? media?.mime_type ?? '').toLowerCase();
  const mediaUri = media?.url ?? media?.path ?? '';
  return mediaType.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(mediaUri);
};

const PostVideo = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(null, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.pause();
  });

  useEffect(() => {
    if (!uri) return;
    try {
      player.replace({ uri });
    } catch {
      // player may be releasing; ignore
    }
  }, [uri, player]);

  return <VideoView style={styles.media} player={player} nativeControls={false} contentFit="contain" />;
};

export const PostCard = ({ post, isActive = true, onLike, onSave, onComment, onRepost, onAuthorPress, onOpenPost }: PostCardProps) => {
  const displayPost = getDisplayPost(post);
  const media = getPrimaryMedia(post);
  const mediaUri = media?.url ?? media?.path;
  const videoMedia = isVideoMedia(displayPost);
  const authorName = post.user?.name ?? 'Creator';
  const authorUsername = post.user?.username ?? `user.${post.user?.id?.slice(0, 6) ?? 'unknown'}`;
  const visibleContent = post.content?.trim() ? post.content : displayPost.content;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={AppGradients.cardSurface}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.headerRow}>
        <Pressable style={styles.userRow} onPress={() => onAuthorPress?.(post.user?.username)}>
          <Avatar uri={post.user?.avatar} name={post.user?.name} size={40} showRing />
          <View>
            <Text style={styles.name}>{authorName}</Text>
            <Text style={styles.username}>@{authorUsername}</Text>
          </View>
        </Pressable>
        <Ellipsis size={18} stroke={AppColors.textMuted} />
      </View>

      {hasRenderableMedia(post) ? <Pressable onPress={() => onOpenPost?.(post)}>
        {mediaUri ? (
          videoMedia && isActive ? (
            <PostVideo uri={mediaUri} />
          ) : videoMedia && media?.thumbnail_url ? (
            <Image source={{ uri: media.thumbnail_url }} style={styles.media} />
          ) : videoMedia ? (
            <View style={[styles.media, styles.mediaFallback]}><Text style={styles.fallbackText}>Video</Text></View>
          ) : (
            <Image source={{ uri: mediaUri }} style={styles.media} />
          )
        ) : (
          <View style={[styles.media, styles.mediaFallback]}>
            <Text style={styles.fallbackText}>No media attached</Text>
          </View>
        )}
      </Pressable> : null}

      {visibleContent ? (
        <Pressable onPress={() => onOpenPost?.(post)}>
          <Text style={styles.content}>{visibleContent}</Text>
        </Pressable>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable style={styles.action} onPress={() => onLike?.(post)}>
          <Heart
            size={20}
            stroke={post.user_liked ? '#F43F5E' : AppColors.textSecondary}
            fill={post.user_liked ? '#F43F5E' : 'transparent'}
          />
          <Text style={[styles.actionText, post.user_liked && styles.likedText]}>{post.like_count ?? 0}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => onComment?.(post)}>
          <MessageCircle size={19} stroke={AppColors.textSecondary} />
          <Text style={styles.actionText}>{post.comment_count ?? 0}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => onRepost?.(post)}>
          <Repeat2 size={19} stroke={AppColors.textSecondary} />
          <Text style={styles.actionText}>{post.repost_count ?? 0}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => onSave?.(post)}>
          <Bookmark
            size={19}
            stroke={post.user_saved ? AppColors.accent : AppColors.textSecondary}
            fill={post.user_saved ? AppColors.accent : 'transparent'}
          />
          <Text style={[styles.actionText, post.user_saved && styles.savedText]}>{post.save_count ?? 0}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.7)',
    padding: 14,
    gap: 12,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontFamily: undefined,
    fontSize: 15,
  },
  username: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '400',
  },
  media: {
    width: '100%',
    height: 260,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.surfaceMuted,
  },
  mediaFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  fallbackText: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  content: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: undefined, fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: undefined,
  },
  likedText: {
    color: '#F43F5E',
  },
  savedText: {
    color: AppColors.accent,
  },
});
