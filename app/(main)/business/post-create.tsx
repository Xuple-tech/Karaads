import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ArrowLeft, ImagePlus, Send, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppRadii } from '@/constants/app-theme';
import { useCreateBusinessPagePost, useMyBusinessPage, useMyBusinessPages } from '@/features/business/hooks';
import { router } from '@/lib/navigation/router';

export default function CreateBusinessPagePostScreen() {
  const insets = useSafeAreaInsets();
  const page = useMyBusinessPage();
  const pages = useMyBusinessPages();
  const createPost = useCreateBusinessPagePost();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ uri: string; name: string; mimeType: string }[]>([]);
  const activePage = page.data ?? pages.data?.[0] ?? null;

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (result.canceled) return;
    setMedia((current) => [
      ...current,
      ...result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName ?? `page-post-${Date.now()}-${index}`,
        mimeType: asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      })),
    ]);
  };

  const submit = async () => {
    if (createPost.isPending) return;
    if (!activePage?.id) {
      Alert.alert('Create a page first', 'You need a business page before you can publish a page post.');
      return;
    }
    if (!content.trim() && media.length === 0) {
      Alert.alert('Add something to post', 'Write text or add an image/video before publishing.');
      return;
    }
    try {
      await createPost.mutateAsync({
        pageId: activePage.id,
        content,
        media,
      });
      Alert.alert('Posted', 'Your page post has been published.');
      setContent('');
      setMedia([]);
      router.replace('Business');
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to publish this page post right now.';
      Alert.alert('Post failed', message);
    }
  };

  const canPost = Boolean(activePage?.id) && (content.trim().length > 0 || media.length > 0);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.circleBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} stroke={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Page Post</Text>
          <Pressable style={[styles.postBtn, createPost.isPending && styles.postBtnDisabled]} disabled={createPost.isPending} onPress={submit}>
            {createPost.isPending ? <ActivityIndicator color="#07101D" /> : <Send size={17} color="#07101D" />}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.pageLabel}>{activePage?.name ?? (page.isLoading || pages.isLoading ? 'Loading page...' : 'Business Page')}</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write a page update..."
            placeholderTextColor={AppColors.textMuted}
            style={styles.input}
            multiline
            textAlignVertical="top"
          />

          {media.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
              {media.map((item) => (
                <View key={item.uri} style={styles.mediaThumb}>
                  {item.mimeType.startsWith('image') ? <Image source={{ uri: item.uri }} style={styles.mediaImage} contentFit="cover" /> : <Text style={styles.videoText}>Video</Text>}
                  <Pressable style={styles.removeMedia} onPress={() => setMedia((current) => current.filter((entry) => entry.uri !== item.uri))}>
                    <X size={13} stroke={AppColors.white} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <Pressable style={styles.mediaBtn} onPress={pickMedia}>
            <ImagePlus size={18} stroke={AppColors.accent} />
            <Text style={styles.mediaBtnText}>Add image or video</Text>
          </Pressable>
          <Pressable style={[styles.publishBtn, !canPost && styles.publishBtnMuted]} onPress={submit} disabled={createPost.isPending}>
            <Text style={styles.publishBtnText}>{createPost.isPending ? 'Publishing...' : 'Publish Page Post'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 16, gap: 14 },
  topBar: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  circleBtn: { width: 42, height: 42, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  title: { color: AppColors.textPrimary, fontSize: 20, fontFamily: undefined, fontWeight: '800' },
  postBtn: { width: 42, height: 42, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent },
  postBtnDisabled: { opacity: 0.5 },
  card: { borderRadius: 24, padding: 16, gap: 14, backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)' },
  pageLabel: { color: AppColors.accent, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  input: { minHeight: 170, color: AppColors.textPrimary, fontSize: 18, lineHeight: 25, fontFamily: undefined, fontWeight: '600' },
  mediaRow: { gap: 10 },
  mediaThumb: { width: 106, height: 106, borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(8,15,28,0.76)', alignItems: 'center', justifyContent: 'center' },
  mediaImage: { width: '100%', height: '100%' },
  videoText: { color: AppColors.textPrimary, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  removeMedia: { position: 'absolute', right: 7, top: 7, width: 24, height: 24, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.58)' },
  mediaBtn: { minHeight: 46, borderRadius: AppRadii.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(90,178,255,0.24)', backgroundColor: 'rgba(90,178,255,0.08)' },
  mediaBtnText: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '800' },
  publishBtn: { minHeight: 48, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent },
  publishBtnMuted: { opacity: 0.72 },
  publishBtnText: { color: '#07101D', fontSize: 15, fontFamily: undefined, fontWeight: '800' },
});
