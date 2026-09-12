import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ArrowLeft, BriefcaseBusiness, Building2, Camera, Globe2, Mail, MapPin, Phone, Sparkles } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppRadii } from '@/constants/app-theme';
import { useCreateBusinessPage } from '@/features/business/hooks';
import { useAuthStore } from '@/features/auth/store';
import { router } from '@/lib/navigation/router';

const categories = ['Creator', 'Shop', 'Service', 'Restaurant', 'Entertainment', 'Community'];

export default function CreateBusinessPageScreen() {
  const insets = useSafeAreaInsets();
  const sessionUser = useAuthStore((state) => state.user);
  const createPage = useCreateBusinessPage();
  const [name, setName] = useState(sessionUser?.name ? `${sessionUser.name} Page` : '');
  const [category, setCategory] = useState('Creator');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(sessionUser?.email ?? '');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [coverUri, setCoverUri] = useState('');
  const [avatarUpload, setAvatarUpload] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [coverUpload, setCoverUpload] = useState<{ uri: string; name: string; mimeType: string } | null>(null);

  const canCreate = useMemo(() => name.trim().length >= 2 && category.trim().length >= 2, [category, name]);

  const pickImage = async (target: 'avatar' | 'cover') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: target === 'avatar' ? [1, 1] : [16, 9],
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const upload = {
      uri: asset.uri,
      name: asset.fileName ?? `${target}-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    };

    if (target === 'avatar') {
      setAvatarUri(asset.uri);
      setAvatarUpload(upload);
      return;
    }

    setCoverUri(asset.uri);
    setCoverUpload(upload);
  };

  const submit = async () => {
    if (!canCreate || createPage.isPending) return;
    await createPage.mutateAsync({
      name,
      category,
      description,
      avatar: avatarUpload,
      cover: coverUpload,
      phone,
      email,
      website,
      address,
    });
    router.replace('Business');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 34 }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.circleBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} stroke={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Create Page</Text>
          <View style={styles.circleBtn}>
            <BriefcaseBusiness size={20} stroke={AppColors.accent} />
          </View>
        </View>

        <View style={styles.hero}>
          <LinearGradient colors={['rgba(0,213,255,0.22)', 'rgba(46,144,255,0.16)', 'rgba(124,58,237,0.18)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroIcon}>
            <Sparkles size={22} stroke={AppColors.accent} />
          </View>
          <Text style={styles.heroTitle}>Start your KaraAds business page</Text>
          <Text style={styles.heroText}>
            Add your page name, category, and contact details so people can discover your brand, message you, and see your posts.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.mediaBlock}>
            <Pressable style={styles.coverPicker} onPress={() => pickImage('cover')}>
              {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" /> : null}
              <LinearGradient colors={['rgba(3,8,18,0.12)', 'rgba(3,8,18,0.72)']} style={StyleSheet.absoluteFill} />
              <View style={styles.coverPickerTextWrap}>
                <Camera size={17} stroke={AppColors.textPrimary} />
                <Text style={styles.coverPickerText}>{coverUri ? 'Change cover image' : 'Add cover image'}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.avatarPicker} onPress={() => pickImage('avatar')}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Camera size={22} stroke={AppColors.accent} />
              )}
            </Pressable>
          </View>

          <Field
            icon={<Building2 size={18} stroke={AppColors.textMuted} />}
            label="Page name"
            value={name}
            onChangeText={setName}
            placeholder="Example: Kara Ads Review Team"
          />

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.map((item) => {
                const selected = item === category;
                return (
                  <Pressable key={item} style={[styles.categoryPill, selected && styles.categoryPillActive]} onPress={() => setCategory(item)}>
                    <Text style={[styles.categoryText, selected && styles.categoryTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>About page</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell people what your page is about"
              placeholderTextColor={AppColors.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Field icon={<Phone size={18} stroke={AppColors.textMuted} />} label="Phone" value={phone} onChangeText={setPhone} placeholder="Business phone number" keyboardType="phone-pad" />
          <Field icon={<Mail size={18} stroke={AppColors.textMuted} />} label="Email" value={email} onChangeText={setEmail} placeholder="Business email" keyboardType="email-address" autoCapitalize="none" />
          <Field icon={<Globe2 size={18} stroke={AppColors.textMuted} />} label="Website" value={website} onChangeText={setWebsite} placeholder="https://example.com" autoCapitalize="none" />
          <Field icon={<MapPin size={18} stroke={AppColors.textMuted} />} label="Location" value={address} onChangeText={setAddress} placeholder="City or business address" />

          {createPage.error ? <Text style={styles.errorText}>Could not create the page online, but your page details can still be saved locally.</Text> : null}

          <Pressable
            style={[styles.createBtn, (!canCreate || createPage.isPending) && styles.createBtnDisabled]}
            onPress={submit}
            disabled={!canCreate || createPage.isPending}>
            {createPage.isPending ? <ActivityIndicator color="#07101D" /> : <Text style={styles.createBtnText}>Create Business Page</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Field = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.textMuted}
        style={styles.inputInline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 16, gap: 14 },
  topBar: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  circleBtn: { width: 42, height: 42, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  topTitle: { color: AppColors.textPrimary, fontSize: 20, fontFamily: undefined, fontWeight: '800' },
  hero: { borderRadius: 24, overflow: 'hidden', padding: 18, gap: 10, borderWidth: 1, borderColor: 'rgba(0,213,255,0.22)' },
  heroIcon: { width: 42, height: 42, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  heroTitle: { color: AppColors.textPrimary, fontSize: 22, lineHeight: 27, fontFamily: undefined, fontWeight: '800' },
  heroText: { color: AppColors.textSecondary, fontSize: 14, lineHeight: 20, fontFamily: undefined, fontWeight: '600' },
  formCard: { borderRadius: 24, padding: 16, gap: 14, backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)' },
  mediaBlock: { paddingBottom: 32 },
  coverPicker: { height: 138, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: 'rgba(8,15,28,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)' },
  coverImage: { ...StyleSheet.absoluteFillObject },
  coverPickerTextWrap: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 14 },
  coverPickerText: { color: AppColors.textPrimary, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  avatarPicker: { position: 'absolute', left: 16, bottom: 0, width: 76, height: 76, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#101827', borderWidth: 4, borderColor: AppColors.background },
  avatarImage: { width: '100%', height: '100%' },
  fieldBlock: { gap: 7 },
  label: { color: AppColors.textPrimary, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  inputRow: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: 'rgba(8,15,28,0.56)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9 },
  inputInline: { flex: 1, color: AppColors.textPrimary, fontSize: 15, fontFamily: undefined, fontWeight: '600', paddingVertical: 0 },
  input: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: 'rgba(8,15,28,0.56)', color: AppColors.textPrimary, fontSize: 15, fontFamily: undefined, fontWeight: '600', paddingHorizontal: 12 },
  textArea: { minHeight: 92, paddingTop: 12, lineHeight: 20 },
  categoryRow: { gap: 8, paddingRight: 4 },
  categoryPill: { minHeight: 38, borderRadius: AppRadii.pill, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  categoryPillActive: { backgroundColor: AppColors.accent, borderColor: AppColors.accent },
  categoryText: { color: AppColors.textSecondary, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  categoryTextActive: { color: '#07101D' },
  errorText: { color: AppColors.warning, fontSize: 12, lineHeight: 17, fontFamily: undefined, fontWeight: '700' },
  createBtn: { minHeight: 50, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent, marginTop: 4 },
  createBtnDisabled: { opacity: 0.55 },
  createBtnText: { color: '#07101D', fontSize: 15, fontFamily: undefined, fontWeight: '800' },
});
