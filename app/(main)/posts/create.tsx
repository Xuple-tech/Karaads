import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Check,
  Globe2,
  ImageIcon,
  Lock,
  Trash2,
  Users,
  Video,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type TextStyle } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useCreatePostAd } from '@/features/ads/hooks';
import { useAuthStore } from '@/features/auth/store';
import { useCreatePost, useUpdatePost } from '@/features/feed/hooks';
import { usePostUploadStore } from '@/features/feed/upload-store';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import { clamp } from '@/lib/ui/responsive';
import { LinearGradient } from 'expo-linear-gradient';

type DraftType = 'post' | 'moment' | 'story';
type DraftMedia = {
  uri: string;
  name: string;
  mimeType: string;
  durationSeconds?: number;
};

type Visibility = 'everyone' | 'followers' | 'private';

const POST_MAX = 5000;
const MOMENT_MAX = 280;
const POST_EARNING_NOTICE =
  'From June 1, 2026, approved original videos with captions earn ₦10, or ₦30 with a Kara Verified badge. Duplicate, copyright, or caption-free posts do not earn.';

const STORY_COLORS = [
  // WhatsApp palette (deep, rich backgrounds)
  '#1f2c34', '#075e54', '#128c7e', '#1b5e20',
  '#004d40', '#006064', '#0a3d62', '#1e3799',
  '#0c2461', '#6a1b9a', '#4a148c', '#311b92',
  '#880e4f', '#b71c1c', '#bf360c', '#e65100',
  '#f57f17', '#33691e', '#827717', '#4e342e',
  // Extra harmonious darks
  '#212121', '#263238', '#37474f', '#01579b',
  '#4a0080',
];

type StoryFontKey = 'bold' | 'extrabold' | 'regular' | 'italic' | 'serif';
const STORY_FONT_STYLES: { key: StoryFontKey; fontFamily?: string; fontWeight?: TextStyle['fontWeight']; fontStyle: 'normal' | 'italic'; label: string }[] = [
  { key: 'bold',      fontFamily: undefined, fontWeight: '700',      fontStyle: 'normal', label: 'Bold' },
  { key: 'extrabold', fontFamily: undefined, fontWeight: '800', fontStyle: 'normal', label: 'Heavy' },
  { key: 'regular',   fontFamily: undefined, fontWeight: '400',   fontStyle: 'normal', label: 'Light' },
  { key: 'italic',    fontFamily: undefined, fontWeight: '400',   fontStyle: 'italic', label: 'Italic' },
  { key: 'serif',     fontFamily: 'serif',               fontStyle: 'normal', label: 'Serif' },
];

const extensionFromMimeType = (mimeType: string) => {
  const [, subtype] = mimeType.split('/');
  return subtype || 'bin';
};

const visibilityOptions: {
  value: Visibility;
  title: string;
  subtitle: string;
  Icon: typeof Globe2;
}[] = [
  {
    value: 'everyone',
    title: 'Everyone',
    subtitle: 'Anyone can view this post.',
    Icon: Globe2,
  },
  {
    value: 'followers',
    title: 'Followers',
    subtitle: 'Only followers can view this post.',
    Icon: Users,
  },
  {
    value: 'private',
    title: 'Private',
    subtitle: 'Only you can view this post.',
    Icon: Lock,
  },
];

export default function CreatePostScreen() {
  const params = useLocalSearchParams<{ mode?: string; editPostId?: string; content?: string; visibility?: Visibility; adMode?: string; adGoal?: string; adBudget?: string }>();
  const editPostId = Array.isArray(params.editPostId) ? params.editPostId[0] : params.editPostId;
  const editContent = Array.isArray(params.content) ? params.content[0] : params.content;
  const editVisibility = Array.isArray(params.visibility) ? params.visibility[0] : params.visibility;
  const adMode = Array.isArray(params.adMode) ? params.adMode[0] : params.adMode;
  const adGoal = Array.isArray(params.adGoal) ? params.adGoal[0] : params.adGoal;
  const adBudgetRaw = Array.isArray(params.adBudget) ? params.adBudget[0] : params.adBudget;
  const adBudget = Number(adBudgetRaw);
  const isAdPostFlow = !editPostId && (adMode === '1' || Boolean(adGoal || adBudgetRaw));
  const isEditing = Boolean(editPostId);
  const forcedMode = isEditing ? 'post' : params.mode === 'story' || params.mode === 'moment' || params.mode === 'post' ? params.mode : null;
  const isStoryMode = forcedMode === 'story';
  const isModeLocked = forcedMode !== null;
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = clamp(width / 390, 0.88, 1.12);
  const screenPadding = width < 360 ? 12 : width >= 768 ? 22 : 16;
  const contentMaxWidth = width >= 768 ? 760 : undefined;
  const [draftType, setDraftType] = useState<DraftType>(forcedMode ?? 'post');
  const [storySubMode, setStorySubMode] = useState<'text' | 'media'>('text');
  const [storyFontStyle, setStoryFontStyle] = useState<StoryFontKey>('bold');
  const [content, setContent] = useState(editContent ?? '');
  const [storyBgColor, setStoryBgColor] = useState(STORY_COLORS[0]);
  const [media, setMedia] = useState<DraftMedia[]>([]);
  const [visibility, setVisibility] = useState<Visibility>(
    editVisibility === 'followers' || editVisibility === 'private' || editVisibility === 'everyone'
      ? editVisibility
      : 'everyone',
  );
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const createPostAd = useCreatePostAd();
  const startPostUpload = usePostUploadStore((state) => state.start);
  const finishPostUpload = usePostUploadStore((state) => state.succeed);
  const failPostUpload = usePostUploadStore((state) => state.fail);
  const activeMutation = isEditing ? updatePost : createPost;
  const screenTitle = isEditing ? 'Edit post' : draftType === 'story' ? 'Create status' : draftType === 'moment' ? 'Create moment' : isAdPostFlow ? 'Create ad post' : 'Create post';
  const submitLabel = isEditing ? 'Save' : draftType === 'story' ? 'Share' : isAdPostFlow ? 'Create ad' : 'Publish';
  const authorName = user?.name?.trim() || 'You';
  const handle = user?.username ? `@${user.username}` : '@karaads';
  const initials = authorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const canSubmit = useMemo(() => {
    if (draftType === 'story') {
      return storySubMode === 'text' ? content.trim().length > 0 : media.length > 0;
    }
    return content.trim().length > 0 || media.length > 0;
  }, [content, draftType, media.length, storySubMode]);

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: draftType === 'story' ? 0.65 : 0.85,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const MAX_FILE_SIZE = 1073741824; // 1 GB
    let oversized = 0;
    const next = result.assets
      .filter((asset) => {
        if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_FILE_SIZE) {
          oversized++;
          return false;
        }
        return true;
      })
      .map((asset) => {
        const mimeType = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const ext = extensionFromMimeType(mimeType);

        return {
          uri: asset.uri,
          mimeType,
          name: asset.fileName ?? `upload-${Date.now()}.${ext}`,
          durationSeconds: typeof asset.duration === 'number' ? asset.duration / 1000 : undefined,
        };
      });

    if (oversized > 0) {
      Alert.alert('File too large', `${oversized} file${oversized > 1 ? 's' : ''} exceeded 1 GB and ${oversized > 1 ? 'were' : 'was'} removed.`);
    }

    setMedia([...media, ...next]);
  };

  const submit = async () => {
    if (!isEditing && draftType === 'post' && !isAdPostFlow) {
      const input = { type: draftType, content, media, visibility } as const;
      startPostUpload();
      router.replace('MainTabs', { screen: 'Home' });
      try {
        await createPost.mutateAsync(input);
        finishPostUpload();
      } catch (error) {
        failPostUpload(getErrorMessage(error, 'Your post could not be uploaded. Tap to dismiss and try again.'));
      }
      return;
    }

    try {
      if (isEditing && editPostId) {
        await updatePost.mutateAsync({
          postId: editPostId,
          content,
          visibility,
        });
        router.replace('MainTabs', { screen: 'Home', params: { pinPostId: editPostId } });
        return;
      }

      const createdPost = await createPost.mutateAsync({
        type: draftType,
        content,
        media,
        visibility: isStoryMode ? 'everyone' : visibility,
      });

      if (isStoryMode) {
        router.replace('MainTabs', { screen: 'Home' });
        return;
      }

      if (draftType === 'moment') {
        router.replace('Moment');
        return;
      }

      if (isAdPostFlow) {
        try {
          await createPostAd.mutateAsync({
            postId: createdPost.id,
            budget: Number.isFinite(adBudget) && adBudget > 0 ? adBudget : 5000,
            goal: adGoal ?? 'views',
            durationDays: 7,
          });
          router.replace('AdsManagement');
          return;
        } catch (error) {
          Alert.alert('Post created', `The post was created, but the ad request failed: ${getErrorMessage(error, 'Unable to create ad.')}`);
        }
      }

      router.replace('MainTabs', { screen: 'Home', params: { pinPostId: createdPost.id } });
    } catch {
      // Mutation state already captures the API error for inline rendering.
    }
  };

  const switchModeBySwipe = Gesture.Exclusive(
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .runOnJS(true)
      .onEnd(() => {
        if (isModeLocked) return;
        setDraftType('post');
      }),
    Gesture.Fling()
      .direction(Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => {
        if (isModeLocked) return;
        setDraftType('moment');
      }),
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, draftType === 'story' && storySubMode === 'text' && { backgroundColor: storyBgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ─────────── TOP BAR ─────────── */}
      <View style={[
        styles.topBar,
        { paddingTop: insets.top + 8, paddingHorizontal: screenPadding },
        draftType === 'story' && styles.topBarStory,
      ]}>
        {/* Row 1: back button | toggle or title | share button */}
        <View style={styles.topBarRow}>
          <Pressable
            style={[styles.utilityBtn, draftType === 'story' && styles.utilityBtnStory, { width: 46 * scale, height: 46 * scale, borderRadius: 23 * scale }]}
            onPress={() => router.back()}>
            <ArrowLeft size={20} color={draftType === 'story' ? AppColors.white : AppColors.textPrimary} />
          </Pressable>

          {draftType === 'story' ? (
            <View style={styles.storySubSwitch}>
              <Pressable
                style={[styles.storySubBtn, storySubMode === 'text' && styles.storySubBtnActive]}
                onPress={() => setStorySubMode('text')}>
                <Text style={[styles.storySubBtnText, storySubMode === 'text' && styles.storySubBtnTextActive]}>Text</Text>
              </Pressable>
              <Pressable
                style={[styles.storySubBtn, storySubMode === 'media' && styles.storySubBtnActive]}
                onPress={() => setStorySubMode('media')}>
                <Text style={[styles.storySubBtnText, storySubMode === 'media' && styles.storySubBtnTextActive]}>Media</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.titleTop, { fontSize: Math.round(20 * scale) }]}>{screenTitle}</Text>
          )}

          <Pressable
            style={[
              styles.publishBtnTop,
              draftType === 'story' && styles.publishBtnStory,
              { height: 46 * scale, minWidth: 96 * scale, borderRadius: AppRadii.pill },
              (!canSubmit || activeMutation.isPending || createPostAd.isPending) && styles.publishBtnDisabled,
            ]}
            onPress={submit}
            disabled={!canSubmit || activeMutation.isPending || createPostAd.isPending}>
            <LinearGradient
              colors={AppGradients.primary as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.publishBtnTopText}>{activeMutation.isPending || createPostAd.isPending ? '...' : submitLabel}</Text>
          </Pressable>
        </View>

        {/* Row 2: color swatches — only in story text mode */}
        {draftType === 'story' && storySubMode === 'text' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorSwatchScroll}
            contentContainerStyle={styles.colorSwatchContent}>
            {STORY_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }, storyBgColor === color && styles.colorSwatchActive]}
                onPress={() => setStoryBgColor(color)}
              />
            ))}
          </ScrollView>
        ) : null}

        {/* Row 3: font style picker — only in story text mode */}
        {draftType === 'story' && storySubMode === 'text' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fontStyleScroll}
            contentContainerStyle={styles.fontStyleContent}>
            {STORY_FONT_STYLES.map(({ key, fontFamily, fontWeight, fontStyle, label }) => (
              <Pressable
                key={key}
                style={[styles.fontStyleBtn, storyFontStyle === key && styles.fontStyleBtnActive]}
                onPress={() => setStoryFontStyle(key)}>
                <Text style={[
                  styles.fontStyleBtnText,
                  { fontFamily, fontWeight, fontStyle },
                  storyFontStyle === key && styles.fontStyleBtnTextActive,
                ]}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* ─────────── STORY MODE (WhatsApp style) ─────────── */}
      {draftType === 'story' ? (
        <>
          {/* TEXT sub-mode: full-screen coloured canvas with text input */}
          {storySubMode === 'text' ? (
            <View style={styles.storyBody}>
              <TextInput
                value={content}
                onChangeText={setContent}
                style={[
                  styles.storyInput,
                  {
                    fontFamily: STORY_FONT_STYLES.find((f) => f.key === storyFontStyle)?.fontFamily,
                    fontWeight: STORY_FONT_STYLES.find((f) => f.key === storyFontStyle)?.fontWeight ?? '700',
                    fontStyle: STORY_FONT_STYLES.find((f) => f.key === storyFontStyle)?.fontStyle ?? 'normal',
                  },
                ]}
                placeholder="Type your status..."
                placeholderTextColor="rgba(255,255,255,0.45)"
                multiline
                textAlign="center"
                textAlignVertical="center"
              />
            </View>
          ) : null}

          {/* MEDIA sub-mode: media picker fills the body */}
          {storySubMode === 'media' ? (
            <View style={styles.storyBody}>
              {media.length === 0 ? (
                <Pressable style={styles.storyMediaPickerZone} onPress={pickMedia}>
                  <ImageIcon size={48} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.storyMediaPickerTitle}>Tap to add photo or video</Text>
                  <Text style={styles.storyMediaPickerSub}>Up to 10 files • PNG, JPG, MP4, MOV</Text>
                </Pressable>
              ) : (
                <View style={styles.storyMediaPreviewWrap}>
                  {/* Show first item as large preview */}
                  <Image source={{ uri: media[0].uri }} style={styles.storyMediaLargePreview} contentFit="cover" />
                  {/* Thumbnail strip for additional items */}
                  {media.length > 1 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyMediaThumbRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                      {media.map((item, index) => (
                        <Pressable key={`${item.uri}-${index}`} style={styles.storyMediaThumb} onPress={() => setMedia((m) => m.filter((_, i) => i !== index))}>
                          <Image source={{ uri: item.uri }} style={styles.storyMediaThumbImg} contentFit="cover" />
                          <View style={styles.storyMediaThumbRemove}>
                            <Trash2 size={10} color={AppColors.white} />
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : null}
                  {/* Remove main / add more */}
                  <View style={styles.storyMediaActions}>
                    <Pressable style={styles.storyMediaActionBtn} onPress={() => setMedia([])}>
                      <Trash2 size={16} color="#F87171" />
                      <Text style={[styles.storyMediaActionText, { color: '#F87171' }]}>Remove</Text>
                    </Pressable>
                    <Pressable style={styles.storyMediaActionBtn} onPress={pickMedia}>
                      <ImageIcon size={16} color={AppColors.white} />
                      <Text style={styles.storyMediaActionText}>Add more</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {/* Optional caption for media stories */}
              <TextInput
                value={content}
                onChangeText={setContent}
                style={[styles.storyMediaCaption, { marginHorizontal: screenPadding }]}
                placeholder="Add a caption (optional)..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
              />
            </View>
          ) : null}

          <View style={[styles.storyBottom, { paddingBottom: insets.bottom + 16 }]}>
            {activeMutation.error ? (
              <View style={[styles.storyErrorBanner, { marginHorizontal: screenPadding }]}>
                <Text style={styles.storyErrorText}>{getErrorMessage(activeMutation.error)}</Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}

      {/* ─────────── POST MODE (Facebook style) ─────────── */}
      {draftType === 'post' ? (
        <GestureDetector gesture={switchModeBySwipe}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: screenPadding,
                paddingBottom: 120 + insets.bottom,
                alignItems: contentMaxWidth ? 'center' : undefined,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {!isEditing ? (
              <View style={[styles.earningNotice, contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
                <Text style={styles.earningNoticeTitle}>Create post</Text>
                <Text style={styles.earningNoticeText}>{POST_EARNING_NOTICE}</Text>
              </View>
            ) : null}

            <View style={[styles.postCard, contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
              <View style={styles.authorRow}>
                <View style={styles.authorLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials || 'KA'}</Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{authorName}</Text>
                    <Text style={styles.authorHandle}>{handle}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.postDivider} />
              <TextInput
                value={content}
                onChangeText={setContent}
                style={styles.postInput}
                placeholder="What's on your mind?"
                placeholderTextColor={AppColors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={POST_MAX}
              />
              {media.length > 0 ? (
                <View style={styles.previewGrid}>
                  {media.map((item, index) => (
                    <View key={`${item.uri}-${index}`} style={styles.previewWrap}>
                      <Image source={{ uri: item.uri }} style={styles.preview} contentFit="cover" />
                      <Pressable style={styles.removeBtn} onPress={() => setMedia((current) => current.filter((_, i) => i !== index))}>
                        <Trash2 size={13} color={AppColors.white} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={[styles.postActionBar, contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
              {isEditing ? (
                <Text style={styles.postActionHint}>Editing post text</Text>
              ) : (
                <Pressable style={styles.postActionBtn} onPress={pickMedia}>
                  <ImageIcon size={18} color={AppColors.accent} />
                  <Text style={styles.postActionBtnText}>Photo/Video</Text>
                </Pressable>
              )}
              <View style={styles.postActionBarRight}>
                {!isModeLocked && !isEditing ? (
                  <Pressable style={styles.modePill} onPress={() => setDraftType('moment')}>
                    <Text style={styles.modeText}>Moment</Text>
                  </Pressable>
                ) : null}
                <Text style={styles.charCounter}>{content.length}/{POST_MAX}</Text>
              </View>
            </View>

            <View style={[styles.card, contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
              <Text style={styles.sectionTitle}>Audience</Text>
              {visibilityOptions.map(({ value, title, subtitle, Icon }) => {
                const active = visibility === value;
                return (
                  <Pressable key={value} style={[styles.audienceItem, active && styles.audienceItemActive]} onPress={() => setVisibility(value)}>
                    <View style={styles.audienceMeta}>
                      <View style={[styles.audienceIconWrap, active && styles.audienceIconWrapActive]}>
                        <Icon size={18} color={active ? '#7FE7FF' : AppColors.textSecondary} />
                      </View>
                      <View style={styles.audienceTextWrap}>
                        <Text style={styles.audienceTitle}>{title}</Text>
                        <Text style={styles.audienceSubtitle}>{subtitle}</Text>
                      </View>
                    </View>
                    {active ? <Check size={18} color="#7FE7FF" /> : null}
                  </Pressable>
                );
              })}
            </View>

            {activeMutation.error ? <Text style={styles.error}>{getErrorMessage(activeMutation.error)}</Text> : null}
          </ScrollView>
        </GestureDetector>
      ) : null}

      {/* ─────────── MOMENT MODE (TikTok style) ─────────── */}
      {draftType === 'moment' ? (
        <GestureDetector gesture={switchModeBySwipe}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: screenPadding,
                paddingBottom: 120 + insets.bottom,
                alignItems: contentMaxWidth ? 'center' : undefined,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            <View style={[contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
              {media.length > 0 ? (
                <View style={styles.momentPreviewWrap}>
                  <Image source={{ uri: media[0].uri }} style={styles.momentPreview} contentFit="cover" />
                  <Pressable style={styles.momentPreviewRemove} onPress={() => setMedia([])}>
                    <Trash2 size={16} color={AppColors.white} />
                  </Pressable>
                  {media.length > 1 ? (
                    <View style={styles.momentPreviewMore}>
                      <Text style={styles.momentPreviewMoreText}>+{media.length - 1} more</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Pressable style={styles.momentUploadZone} onPress={pickMedia}>
                  <Video size={42} stroke="rgba(255,255,255,0.35)" />
                  <Text style={styles.momentUploadTitle}>Add a video or photo</Text>
                  <Text style={styles.momentUploadSub}>Tap to select from your gallery</Text>
                </Pressable>
              )}

              <TextInput
                value={content}
                onChangeText={setContent}
                style={styles.momentCaptionInput}
                placeholder="Add a caption..."
                placeholderTextColor={AppColors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={MOMENT_MAX}
              />

              <View style={styles.momentMeta}>
                <Text style={styles.charCounter}>{content.length}/{MOMENT_MAX}</Text>
                {!isModeLocked ? (
                  <Pressable style={styles.modePill} onPress={() => setDraftType('post')}>
                    <Text style={styles.modeText}>Post</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.card, { marginTop: 8 }]}>
                <Text style={styles.sectionTitle}>Audience</Text>
                {visibilityOptions.map(({ value, title, subtitle, Icon }) => {
                  const active = visibility === value;
                  return (
                    <Pressable key={value} style={[styles.audienceItem, active && styles.audienceItemActive]} onPress={() => setVisibility(value)}>
                      <View style={styles.audienceMeta}>
                        <View style={[styles.audienceIconWrap, active && styles.audienceIconWrapActive]}>
                          <Icon size={18} color={active ? '#7FE7FF' : AppColors.textSecondary} />
                        </View>
                        <View style={styles.audienceTextWrap}>
                          <Text style={styles.audienceTitle}>{title}</Text>
                          <Text style={styles.audienceSubtitle}>{subtitle}</Text>
                        </View>
                      </View>
                      {active ? <Check size={18} color="#7FE7FF" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {activeMutation.error ? <Text style={styles.error}>{getErrorMessage(activeMutation.error)}</Text> : null}
          </ScrollView>
        </GestureDetector>
      ) : null}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'column',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.12)',
  },
  topBarStory: {
    borderBottomWidth: 0,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  utilityBtn: {
    width: 46,
    height: 46,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(14,20,34,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  utilityBtnStory: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleTop: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 20,
    fontFamily: undefined, fontWeight: '700',
    textAlign: 'center',
  },
  publishBtnTop: {
    height: 46,
    minWidth: 96,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#2E90FF',
    shadowOpacity: 0.38,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    flexShrink: 0,
  },
  publishBtnStory: {
    shadowColor: '#fff',
    shadowOpacity: 0.15,
  },
  publishBtnTopText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  publishBtnDisabled: {
    opacity: 0.45,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // ── Story mode ──────────────────────────────────────────
  colorSwatchScroll: {
    height: 48,
    flexShrink: 0,
    marginHorizontal: -4,
  },
  colorSwatchContent: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: AppRadii.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: AppColors.white,
    shadowColor: AppColors.white,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  fontStyleScroll: {
    height: 44,
    flexShrink: 0,
    marginHorizontal: -4,
  },
  fontStyleContent: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  fontStyleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  fontStyleBtnActive: {
    borderColor: AppColors.white,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fontStyleBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  fontStyleBtnTextActive: {
    color: AppColors.white,
  },
  storyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  storyInput: {
    width: '100%',
    color: AppColors.white,
    fontSize: 26,
    lineHeight: 34,
    // fontFamily and fontStyle are applied inline from storyFontStyle state
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  storyBottom: {
    paddingTop: 12,
    gap: 10,
  },
  storyMediaRow: {
    flexGrow: 0,
    height: 80,
  },
  storyMediaThumb: {
    width: 72,
    height: 72,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  storyMediaThumbImg: {
    width: '100%',
    height: '100%',
  },
  storyMediaBtn: {
    height: 60,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  storyErrorBanner: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    borderRadius: AppRadii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  storyErrorText: {
    color: '#F87171',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    textAlign: 'center',
  },
  storyMediaBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '600',
  },

  // ── Story top-bar toggle ─────────────────────────────────
  storyTopCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  storySubSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: AppRadii.pill,
    padding: 3,
  },
  storySubBtn: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: AppRadii.pill,
  },
  storySubBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  storySubBtnText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
  },
  storySubBtnTextActive: {
    color: AppColors.white,
  },

  // ── Story media-mode body ────────────────────────────────
  storyMediaPickerZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    margin: 20,
    borderRadius: AppRadii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  storyMediaPickerTitle: {
    color: AppColors.white,
    fontSize: 17,
    fontFamily: undefined, fontWeight: '700',
  },
  storyMediaPickerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
  },
  storyMediaPreviewWrap: {
    flex: 1,
    gap: 10,
  },
  storyMediaLargePreview: {
    flex: 1,
    borderRadius: AppRadii.md,
    margin: 12,
  },
  storyMediaThumbRow: {
    maxHeight: 72,
    flexShrink: 0,
  },
  storyMediaThumbRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    padding: 3,
  },
  storyMediaActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  storyMediaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: AppRadii.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  storyMediaActionText: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
  },
  storyMediaCaption: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: AppRadii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
    maxHeight: 100,
    marginBottom: 8,
  },

  // ── Post mode (Facebook style) ──────────────────────────
  earningNotice: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    gap: 4,
  },
  earningNoticeTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: undefined, fontWeight: '800',
  },
  earningNoticeText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '600',
  },
  postCard: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,32,0.85)',
    padding: 14,
    gap: 10,
  },
  postDivider: {
    height: 1,
    backgroundColor: 'rgba(46,144,255,0.1)',
    marginVertical: 2,
  },
  postInput: {
    minHeight: 100,
    color: AppColors.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    paddingTop: 4,
    fontFamily: undefined, fontWeight: '400',
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: 'rgba(10,18,32,0.7)',
  },
  postActionBtnText: {
    color: AppColors.accent,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
  },
  postActionHint: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  postActionBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // ── Moment mode (TikTok style) ──────────────────────────
  momentUploadZone: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 440,
    borderRadius: AppRadii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(10,14,24,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  momentUploadTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '700',
  },
  momentUploadSub: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '400',
  },
  momentPreviewWrap: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 440,
    borderRadius: AppRadii.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,14,24,0.9)',
  },
  momentPreview: {
    width: '100%',
    height: '100%',
  },
  momentPreviewRemove: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentPreviewMore: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  momentPreviewMoreText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
  momentCaptionInput: {
    minHeight: 60,
    color: AppColors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 12,
    paddingBottom: 4,
    fontFamily: undefined, fontWeight: '400',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.12)',
    marginTop: 14,
  },
  momentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },

  // ── Shared ──────────────────────────────────────────────
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modePill: {
    minWidth: 80,
    height: 36,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,32,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  modePillActive: {
    borderColor: AppColors.accentStrong,
    backgroundColor: 'rgba(46,144,255,0.15)',
  },
  modeText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
  },
  modeTextActive: {
    color: AppColors.accent,
  },
  card: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,32,0.85)',
    padding: 14,
    gap: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: AppRadii.pill,
    backgroundColor: '#BE3BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '700',
  },
  authorName: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  authorHandle: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginTop: 1,
    fontFamily: undefined, fontWeight: '400',
  },
  charCounter: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '600',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewWrap: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: AppRadii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: 'rgba(12,20,36,0.8)',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '700',
  },
  audienceItem: {
    minHeight: 76,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.15)',
    backgroundColor: 'rgba(10,18,32,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audienceItemActive: {
    borderColor: AppColors.accent,
    backgroundColor: 'rgba(90,178,255,0.1)',
  },
  audienceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  audienceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
  },
  audienceIconWrapActive: {
    backgroundColor: 'rgba(90,178,255,0.15)',
    borderColor: 'rgba(90,178,255,0.35)',
  },
  audienceTextWrap: {
    flex: 1,
  },
  audienceTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '700',
  },
  audienceSubtitle: {
    marginTop: 3,
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '400',
  },
  error: {
    color: AppColors.danger,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
  },
});
