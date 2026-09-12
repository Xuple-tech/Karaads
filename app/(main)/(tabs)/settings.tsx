import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Check, SunMoon } from 'lucide-react-native';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import {
    useBeginTwoFactorSetup,
    useChangePassword,
    useConfirmTwoFactorSetup,
    useDisableTwoFactor,
    useSaveAppearanceSettings,
    useSavePrivacySettings,
    useSettings,
    useUpdateProfileSettings,
} from '@/features/settings/hooks';
import type { AppearanceTheme, DefaultVisibility, MessagePermission } from '@/features/settings/service';
import { useThemeStore } from '@/features/settings/theme-store';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import { clamp } from '@/lib/ui/responsive';

type SettingsTab = 'profile' | 'password' | 'two_factor' | 'appearance' | 'privacy';

const normalizeSettingsSection = (value?: string | string[]): SettingsTab => {
  const section = Array.isArray(value) ? value[0] : value;
  if (section === 'password' || section === 'two_factor' || section === 'appearance' || section === 'privacy') return section;
  return 'profile';
};

const messageOptions: { value: MessagePermission; title: string; subtitle: string }[] = [
  { value: 'everyone', title: 'Everyone', subtitle: 'Anyone can start a chat' },
  { value: 'following', title: 'People I follow', subtitle: 'Only people you follow can message you' },
  { value: 'nobody', title: 'Nobody', subtitle: 'Messages disabled' },
];

const visibilityOptions: { value: DefaultVisibility; title: string; subtitle: string }[] = [
  { value: 'everyone', title: 'Everyone', subtitle: 'Default visibility is public' },
  { value: 'followers', title: 'Followers', subtitle: 'Only your followers' },
  { value: 'private', title: 'Private', subtitle: 'Only you can see new posts until changed' },
];

export default function SettingsTabScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = clamp(width / 390, 0.88, 1.12);
  const screenPadding = width < 360 ? 12 : width >= 768 ? 24 : 16;
  const contentMaxWidth = width >= 768 ? 880 : undefined;
  const sessionUser = useAuthStore((state) => state.user);

  const settingsQuery = useSettings();
  const updateProfile = useUpdateProfileSettings();
  const savePrivacy = useSavePrivacySettings();
  const changePassword = useChangePassword();
  const saveAppearance = useSaveAppearanceSettings();
  const beginTwoFactor = useBeginTwoFactorSetup();
  const confirmTwoFactor = useConfirmTwoFactorSetup();
  const disableTwoFactor = useDisableTwoFactor();
  const setThemePreference = useThemeStore((state) => state.setPreference);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(sessionUser?.name ?? '');
  const [username, setUsername] = useState(sessionUser?.username ?? '');
  const [bio, setBio] = useState(sessionUser?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState(sessionUser?.avatar ?? '');
  const [avatarUpload, setAvatarUpload] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [coverUri, setCoverUri] = useState(sessionUser?.cover ?? '');
  const [coverUpload, setCoverUpload] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [messagePermission, setMessagePermission] = useState<MessagePermission>('everyone');
  const [defaultVisibility, setDefaultVisibility] = useState<DefaultVisibility>('everyone');
  const [theme, setTheme] = useState<AppearanceTheme>('system');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!settingsQuery.data) return;
    setMessagePermission(settingsQuery.data.message_permission);
    setDefaultVisibility(settingsQuery.data.default_post_visibility);
    setTheme(settingsQuery.data.appearance_theme);
    setTwoFactorEnabled(settingsQuery.data.two_factor_enabled);
    setThemePreference(settingsQuery.data.appearance_theme);
  }, [setThemePreference, settingsQuery.data]);

  useEffect(() => {
    if (!sessionUser) return;
    setName(sessionUser.name ?? '');
    setUsername(sessionUser.username ?? '');
    setBio(sessionUser.bio ?? '');
    setAvatarUri(sessionUser.avatar ?? '');
    setCoverUri(sessionUser.cover ?? '');
  }, [sessionUser]);

  useEffect(() => {
    setActiveTab(normalizeSettingsSection(params.section));
  }, [params.section]);

  const profileError = updateProfile.error ? getErrorMessage(updateProfile.error) : null;
  const privacyError = savePrivacy.error ? getErrorMessage(savePrivacy.error) : null;
  const passwordError = changePassword.error ? getErrorMessage(changePassword.error) : null;
  const appearanceError = saveAppearance.error ? getErrorMessage(saveAppearance.error) : null;
  const twoFactorError =
    (beginTwoFactor.error && getErrorMessage(beginTwoFactor.error)) ||
    (confirmTwoFactor.error && getErrorMessage(confirmTwoFactor.error)) ||
    (disableTwoFactor.error && getErrorMessage(disableTwoFactor.error)) ||
    null;

  const canSavePassword = useMemo(() => {
    return currentPassword.trim().length > 0 && newPassword.trim().length >= 6 && confirmPassword.trim().length >= 6;
  }, [confirmPassword, currentPassword, newPassword]);

  const blockedUsers = settingsQuery.data?.blocked_users ?? [];

  const pickImage = async (target: 'avatar' | 'cover') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: target === 'avatar' ? [1, 1] : [16, 9],
    });

    if (result.canceled || result.assets.length === 0) return;

    const selected = result.assets[0];
    const mimeType = selected.mimeType ?? 'image/jpeg';
    const extension = mimeType.split('/')[1] ?? 'jpg';
    const filename = selected.fileName ?? `${target}-${Date.now()}.${extension}`;
    if (target === 'avatar') {
      setAvatarUri(selected.uri);
      setAvatarUpload({ uri: selected.uri, name: filename, mimeType });
      return;
    }
    setCoverUri(selected.uri);
    setCoverUpload({ uri: selected.uri, name: filename, mimeType });
  };

  const renderPanel = () => {
    if (activeTab === 'profile') {
      return (
        <SectionCard title="Profile" subtitle="Update your public details.">
          <View style={styles.avatarRow}>
            <Pressable style={styles.avatarWrap} onPress={() => pickImage('avatar')}>
              {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" /> : <Text style={styles.avatarFallback}>+</Text>}
            </Pressable>
            <View style={styles.avatarMeta}>
              <Text style={styles.avatarTitle}>Profile picture</Text>
              <Text style={styles.avatarSub}>Square crop, high contrast works best.</Text>
              <Pressable style={styles.secondaryBtn} onPress={() => pickImage('avatar')}>
                <Text style={styles.secondaryBtnText}>Change photo</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.coverWrap}>
            <Text style={styles.inputLabel}>Cover photo</Text>
            <Pressable style={styles.coverPicker} onPress={() => pickImage('cover')}>
              {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" /> : <Text style={styles.coverFallback}>Tap to upload cover</Text>}
            </Pressable>
          </View>

          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Username" value={username} onChangeText={setUsername} placeholder="username" />
          <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Write your bio" multiline />

          <PrimaryButton
            label={updateProfile.isPending ? 'Saving...' : 'Save profile'}
            disabled={updateProfile.isPending}
            onPress={() =>
              updateProfile.mutate({
                name: name.trim(),
                username: username.trim(),
                bio: bio.trim(),
                avatar: avatarUpload,
                cover: coverUpload,
              })
            }
          />
          {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
        </SectionCard>
      );
    }

    if (activeTab === 'password') {
      return (
        <SectionCard title="Password" subtitle="Use a strong password with at least 6 characters.">
          <Input label="Current password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry />
          <Input label="New password" value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry />
          <Input
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />
          <PrimaryButton
            label={changePassword.isPending ? 'Saving...' : 'Save password'}
            disabled={!canSavePassword || changePassword.isPending}
            onPress={async () => {
              try {
                await changePassword.mutateAsync({
                  current_password: currentPassword.trim(),
                  password: newPassword.trim(),
                  password_confirmation: confirmPassword.trim(),
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              } catch {
                // mutation error is rendered via passwordError
              }
            }}
          />
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        </SectionCard>
      );
    }

    if (activeTab === 'two_factor') {
      const setup = beginTwoFactor.data;

      return (
        <SectionCard title="Two-Factor Authentication" subtitle="Add another layer of account protection.">
          <View style={[styles.statusPill, twoFactorEnabled ? styles.statusPillOn : styles.statusPillOff]}>
            <Text style={styles.statusPillText}>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</Text>
          </View>

          {twoFactorEnabled ? (
            <>
              <Text style={styles.helperText}>
                Login requires a code from your authenticator app. Disabling removes that requirement.
              </Text>
              <PrimaryButton
                label={disableTwoFactor.isPending ? 'Disabling...' : 'Disable 2FA'}
                disabled={disableTwoFactor.isPending}
                onPress={async () => {
                  try {
                    await disableTwoFactor.mutateAsync();
                    setTwoFactorEnabled(false);
                  } catch {
                    // mutation error is rendered via twoFactorError
                  }
                }}
              />
            </>
          ) : setup ? (
            <>
              <Text style={styles.helperText}>
                Scan this into your authenticator app, then enter the 6-digit code it shows.
              </Text>
              {setup.secret ? (
                <View style={styles.secretWrap}>
                  <Text style={styles.secretLabel}>Setup key</Text>
                  <Text style={styles.secretValue} selectable>{setup.secret}</Text>
                </View>
              ) : null}
              <Input label="Authenticator code" value={twoFactorCode} onChangeText={setTwoFactorCode} placeholder="123456" />
              <PrimaryButton
                label={confirmTwoFactor.isPending ? 'Confirming...' : 'Confirm & enable'}
                disabled={confirmTwoFactor.isPending || twoFactorCode.trim().length < 6}
                onPress={async () => {
                  try {
                    await confirmTwoFactor.mutateAsync(twoFactorCode);
                    setTwoFactorEnabled(true);
                    setTwoFactorCode('');
                    beginTwoFactor.reset();
                  } catch {
                    // mutation error is rendered via twoFactorError
                  }
                }}
              />
            </>
          ) : (
            <>
              <Text style={styles.helperText}>
                When enabled, login requires a code from your authenticator app.
              </Text>
              <PrimaryButton
                label={beginTwoFactor.isPending ? 'Starting...' : 'Enable 2FA'}
                disabled={beginTwoFactor.isPending}
                onPress={() => beginTwoFactor.mutate()}
              />
            </>
          )}
          {twoFactorError ? <Text style={styles.error}>{twoFactorError}</Text> : null}
        </SectionCard>
      );
    }

    if (activeTab === 'appearance') {
      return (
        <SectionCard title="Appearance" subtitle="Pick how KaraAds should look on this device.">
          <View style={styles.themeGroup}>
            {(['light', 'dark', 'system'] as AppearanceTheme[]).map((option) => {
              const selected = theme === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.themeItem, selected && styles.themeItemActive]}
                  onPress={() => {
                    setTheme(option);
                    setThemePreference(option);         // apply immediately
                    saveAppearance.mutate({ appearance_theme: option }); // persist to API
                  }}>
                  <SunMoon size={16} color={selected ? '#0B1D34' : AppColors.textSecondary} />
                  <Text style={[styles.themeText, selected && styles.themeTextActive]}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                </Pressable>
              );
            })}
          </View>

          {appearanceError ? <Text style={styles.error}>{appearanceError}</Text> : null}
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Privacy" subtitle="Control reach, messaging, and visibility.">
        <OptionGroup
          title="Who can message me"
          subtitle="Control who can start new chats."
          options={messageOptions}
          selectedValue={messagePermission}
          onSelect={(value) => setMessagePermission(value as MessagePermission)}
        />

        <OptionGroup
          title="Default post visibility"
          subtitle="Set the default audience for new posts."
          options={visibilityOptions}
          selectedValue={defaultVisibility}
          onSelect={(value) => setDefaultVisibility(value as DefaultVisibility)}
        />

        <PrimaryButton
          label={savePrivacy.isPending ? 'Saving...' : 'Save settings'}
          disabled={savePrivacy.isPending}
          onPress={() =>
            savePrivacy.mutate({
              message_permission: messagePermission,
              default_post_visibility: defaultVisibility,
            })
          }
        />
        {privacyError ? <Text style={styles.error}>{privacyError}</Text> : null}

        <View style={styles.blockedWrap}>
          <View style={styles.blockedTop}>
            <Text style={styles.blockedTitle}>Blocked users</Text>
            <Text style={styles.blockedCount}>{blockedUsers.length}</Text>
          </View>
          {blockedUsers.length === 0 ? (
            <Text style={styles.blockedNone}>No blocked users.</Text>
          ) : (
            blockedUsers.map((user, index) => (
              <Text key={`${user.id}-${index}`} style={styles.blockedUser}>
                @{user.username}
              </Text>
            ))
          )}
        </View>
      </SectionCard>
    );
  };

  return (
    <SwipeStackView>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.hero, { paddingTop: insets.top + 10, paddingHorizontal: screenPadding }]}>
          <Pressable style={[styles.roundBtn, { width: 48 * scale, height: 48 * scale, borderRadius: 24 * scale }]} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.textPrimary} />
          </Pressable>
          <View style={styles.heroCenter}>
            <Text style={[styles.heroTitle, { fontSize: Math.round(21 * scale) }]}>Edit Profile</Text>
          </View>
          <View style={{ width: 48 * scale, height: 48 * scale }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: screenPadding,
              paddingBottom: insets.bottom + 92,
              alignItems: contentMaxWidth ? 'center' : undefined,
            },
          ]}>
          <View style={[styles.shell, contentMaxWidth ? { width: '100%', maxWidth: contentMaxWidth } : null]}>
            {settingsQuery.isFetching && !settingsQuery.data ? <Text style={styles.loading}>Loading settings...</Text> : null}
            {renderPanel()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SwipeStackView>
  );
}

const SectionCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSub}>{subtitle}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const PrimaryButton = ({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) => (
  <Pressable style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]} disabled={disabled} onPress={onPress}>
    <Text style={styles.primaryBtnText}>{label}</Text>
  </Pressable>
);

const OptionGroup = ({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
}: {
  title: string;
  subtitle: string;
  options: { value: string; title: string; subtitle: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) => (
  <View style={styles.optionGroup}>
    <Text style={styles.optionGroupTitle}>{title}</Text>
    <Text style={styles.optionGroupSub}>{subtitle}</Text>
    {options.map((option) => {
      const selected = selectedValue === option.value;
      return (
        <Pressable key={option.value} style={[styles.optionRow, selected && styles.optionRowSelected]} onPress={() => onSelect(option.value)}>
          <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
            {selected ? <Check size={14} color="#0A1730" /> : null}
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSub}>{option.subtitle}</Text>
          </View>
        </Pressable>
      );
    })}
  </View>
);

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={AppColors.textMuted}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
    />
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0B1A2D',
  },
  roundBtn: {
    borderWidth: 1,
    borderColor: '#2D4C72',
    backgroundColor: '#12253C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCenter: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    color: AppColors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  scrollContent: {
    paddingTop: 14,
  },
  shell: {
    width: '100%',
    gap: 12,
  },
  healthStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  healthChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 2,
  },
  healthChipPositive: {
    borderColor: 'rgba(56,189,125,0.45)',
    backgroundColor: 'rgba(16,89,62,0.38)',
  },
  healthChipNeutral: {
    borderColor: '#2B4364',
    backgroundColor: '#13253D',
  },
  healthChipLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  healthChipValue: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  settingsPickerWrap: {
    position: 'relative',
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileOnlyTab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#79B4F8',
    backgroundColor: '#CFE6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },
  profileOnlyTabText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  profileOnlyTabTextActive: {
    color: '#0B1D34',
  },
  settingsDropdownBtn: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A425F',
    backgroundColor: '#102238',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  settingsDropdownText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsDropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A425F',
    backgroundColor: '#0E2035',
    overflow: 'hidden',
    zIndex: 20,
  },
  settingsDropdownItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsDropdownItemActive: {
    backgroundColor: 'rgba(207,230,255,0.14)',
  },
  settingsDropdownItemText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsDropdownItemTextActive: {
    color: AppColors.textPrimary,
  },
  loading: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A415F',
    backgroundColor: '#101F34',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSub: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBody: {
    gap: 12,
    marginTop: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: '#172A43',
    borderWidth: 1,
    borderColor: '#365478',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    color: AppColors.textMuted,
    fontSize: 30,
    fontWeight: '500',
  },
  avatarMeta: {
    flex: 1,
    gap: 4,
  },
  avatarTitle: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  avatarSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38608A',
    backgroundColor: '#173353',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 2,
  },
  secondaryBtnText: {
    color: '#B8D9FF',
    fontSize: 13,
    fontWeight: '700',
  },
  coverWrap: {
    gap: 8,
  },
  coverPicker: {
    width: '100%',
    height: 132,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#365478',
    backgroundColor: '#172A43',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrap: {
    gap: 6,
  },
  inputLabel: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4768',
    backgroundColor: '#132740',
    paddingHorizontal: 12,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  inputMulti: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 10,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#D3E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#0B1D34',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusPillOn: {
    borderColor: 'rgba(34,197,94,0.45)',
    backgroundColor: 'rgba(16,89,62,0.38)',
  },
  statusPillOff: {
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(89,30,37,0.38)',
  },
  statusPillText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  secretWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4768',
    backgroundColor: '#132740',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  secretLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  secretValue: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  themeGroup: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A425F',
    backgroundColor: '#132740',
    padding: 6,
    flexDirection: 'row',
    gap: 6,
  },
  themeItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeItemActive: {
    backgroundColor: '#D3E9FF',
  },
  themeText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  themeTextActive: {
    color: '#0B1D34',
  },
  optionGroup: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A425F',
    backgroundColor: '#132740',
    padding: 10,
    gap: 8,
  },
  optionGroupTitle: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  optionGroupSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: -2,
    marginBottom: 2,
  },
  optionRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#345170',
    backgroundColor: '#102238',
    minHeight: 62,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionRowSelected: {
    borderColor: '#8EC2FF',
    backgroundColor: '#18385B',
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5D7390',
  },
  checkWrapSelected: {
    borderColor: '#D3E9FF',
    backgroundColor: '#D3E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  blockedWrap: {
    borderTopWidth: 1,
    borderTopColor: '#2A425F',
    paddingTop: 10,
    gap: 6,
  },
  blockedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockedTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  blockedCount: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  blockedNone: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  blockedUser: {
    color: AppColors.textPrimary,
    fontSize: 14,
  },
  error: {
    color: AppColors.danger,
    fontSize: 12,
  },
});
