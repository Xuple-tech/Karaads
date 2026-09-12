import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { KaraButton } from '@/components/ui/kara-button';
import { KaraInput } from '@/components/ui/kara-input';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useRegister } from '@/features/auth/hooks';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const register = useRegister();
  const insets = useSafeAreaInsets();
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(12)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      // Success flips auth status to 'authenticated', which switches the root
      // navigator from the auth flow to the main app automatically.
      await register.mutateAsync(values);
    } catch (error) {
      console.debug('Register error:', error);
    }
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 340,
        delay: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 380,
        delay: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY, heroOpacity, heroTranslateY]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
          <LinearGradient
            colors={['#060C20', '#0D1B3E', '#152952']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <View style={[styles.blob, styles.blobOne]} />
            <View style={[styles.blob, styles.blobTwo]} />
            <View style={[styles.blob, styles.blobThree]} />
            <Pressable style={styles.topRow} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <LinearGradient
              colors={AppGradients.storyRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBorder}>
              <View style={styles.logoContainer}>
                <Image source={require('@/assets/images/favicon.png')} style={styles.logoImage} contentFit="contain" />
              </View>
            </LinearGradient>
            <Text style={styles.heroTitle}>Get Started</Text>
            <Text style={styles.heroSubtitle}>Create your KaraAds account and join the community.</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
          <Text style={styles.formTitle}>Create account</Text>
          <View style={styles.formBlock}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <KaraInput
                  label="Full Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Your full name"
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <KaraInput
                  label="Username"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="none"
                  placeholder="Choose a username"
                  error={errors.username?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <KaraInput
                  label="Email Address"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <KaraInput
                  label="Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="Create a secure password"
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password_confirmation"
              render={({ field }) => (
                <KaraInput
                  label="Confirm Password"
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="Confirm your password"
                  error={errors.password_confirmation?.message}
                />
              )}
            />
          </View>

          {register.error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={AppColors.danger} />
              <Text style={styles.error}>{getErrorMessage(register.error)}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <KaraButton label="Sign up" onPress={submit} loading={register.isPending} variant="primary" />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text onPress={() => router.push('Login')}>
              <Text style={styles.registerLink}>
                Already have an account? <Text style={styles.registerLinkBold}>Sign in</Text>
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  hero: {
    minHeight: 212,
    borderRadius: AppRadii.xl,
    paddingHorizontal: 22,
    paddingVertical: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobOne: { width: 240, height: 240, right: -62, top: -60 },
  blobTwo: { width: 170, height: 170, left: -50, bottom: -72, backgroundColor: 'rgba(37,99,235,0.25)' },
  blobThree: { width: 100, height: 100, right: 50, bottom: 8, backgroundColor: 'rgba(90,178,255,0.18)' },
  topRow: {
    minHeight: 34,
    borderRadius: 17,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(9,18,38,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBorder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(9,18,38,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 42,
    height: 42,
  },
  backText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: undefined,
  },
  heroTitle: {
    color: AppColors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    fontFamily: undefined,
    marginTop: 6,
  },
  heroSubtitle: {
    color: '#C8DCF8',
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 290,
    fontFamily: undefined, fontWeight: '400',
  },
  card: {
    marginTop: -24,
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.8)',
    backgroundColor: '#0C1120',
    padding: 22,
    gap: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  formTitle: {
    color: AppColors.accent,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: undefined,
    textAlign: 'center',
  },
  formBlock: {
    gap: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${AppColors.danger}15`,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${AppColors.danger}30`,
  },
  error: {
    color: AppColors.danger,
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    gap: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  registerLink: {
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  registerLinkBold: {
    color: AppColors.accent,
    fontWeight: '700',
  },
});
