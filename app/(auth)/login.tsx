import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { KaraButton } from '@/components/ui/kara-button';
import { KaraInput } from '@/components/ui/kara-input';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useLogin } from '@/features/auth/hooks';
import { isKaraApiError } from '@/lib/errors/api-error';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useLogin();
  const insets = useSafeAreaInsets();
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(12)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    const identifier = values.identifier.trim();
    try {
      // Success flips auth status to 'authenticated', which switches the root
      // navigator from the auth flow to the main app automatically.
      await login.mutateAsync({ ...values, identifier });
    } catch (error) {
      console.debug('Login error:', error);
      if (isKaraApiError(error) && error.code === 'ACCOUNT_SETUP_REQUIRED') {
        router.push('AccountSetup', { email: identifier });
      }
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
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">
        <Animated.View style={[{ opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
          <LinearGradient
            colors={['#060C20', '#0D1B3E', '#152952']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <View style={[styles.blob, styles.blobOne]} />
            <View style={[styles.blob, styles.blobTwo]} />
            <View style={[styles.blob, styles.blobThree]} />
            <LinearGradient
              colors={AppGradients.storyRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBorder}>
              <View style={styles.logoContainer}>
                <Image source={require('@/assets/images/favicon.png')} style={styles.logoImage} contentFit="contain" />
              </View>
            </LinearGradient>
            <Text style={styles.heroTitle}>Welcome Back!</Text>
            <Text style={styles.heroSubtitle}>Sign in to continue to KaraAds</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <View style={styles.formBlock}>
            <Controller
              control={control}
              name="identifier"
              render={({ field }) => (
                <KaraInput
                  label="Email or Phone Number"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="none"
                  keyboardType="default"
                  placeholder="Email address or phone number"
                  error={errors.identifier?.message}
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
                  autoCapitalize="none"
                  secureTextEntry
                  placeholder="Enter your password"
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          {login.error ? (
            <View
              style={[
                styles.errorContainer,
                isKaraApiError(login.error) && login.error.code === 'ACCOUNT_SETUP_REQUIRED' ? styles.accountSetupError : null,
              ]}>
              <Ionicons
                name={isKaraApiError(login.error) && login.error.code === 'ACCOUNT_SETUP_REQUIRED' ? 'mail-outline' : 'alert-circle'}
                size={18}
                color={isKaraApiError(login.error) && login.error.code === 'ACCOUNT_SETUP_REQUIRED' ? AppColors.accent : AppColors.danger}
              />
              <View style={styles.errorContent}>
                <Text style={styles.error}>{getErrorMessage(login.error)}</Text>
                {isKaraApiError(login.error) && login.error.code === 'ACCOUNT_SETUP_REQUIRED' ? (
                  <>
                    <Text style={styles.accountSetupHelp}>
                      Check your email for an 8-character verification code, then set your password to complete account setup.
                    </Text>
                    <KaraButton
                      label="Complete Account Setup"
                      variant="ghost"
                      onPress={() => {
                        const identifier = control._formValues.identifier;
                        if (identifier) {
                          router.push('AccountSetup', { email: identifier });
                        }
                      }}
                    />
                  </>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Text style={styles.forgotLink} onPress={() => router.push('ForgotPassword')}>
              Forgot password?
            </Text>
            <KaraButton label="Sign In" onPress={submit} loading={login.isPending} variant="primary" />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text onPress={() => router.push('Register')}>
              <Text style={styles.registerLink}>
                Don&apos;t have an account? <Text style={styles.registerLinkBold}>Sign up</Text>
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
    justifyContent: 'center',
  },
  hero: {
    minHeight: 250,
    borderRadius: AppRadii.xl,
    paddingHorizontal: 24,
    paddingVertical: 28,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobOne: { width: 260, height: 260, right: -70, top: -70 },
  blobTwo: { width: 180, height: 180, left: -60, bottom: -70, backgroundColor: 'rgba(37,99,235,0.25)' },
  blobThree: { width: 110, height: 110, right: 50, bottom: 14, backgroundColor: 'rgba(90,178,255,0.2)' },
  logoBorder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 2.5,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  heroTitle: {
    color: AppColors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    fontFamily: undefined,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#C8DCF8',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 280,
    fontFamily: undefined, fontWeight: '400',
  },
  card: {
    marginTop: -24,
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.8)',
    backgroundColor: '#0C1120',
    padding: 24,
    gap: 20,
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
    lineHeight: 18,
  },
  errorContent: {
    flex: 1,
    gap: 4,
  },
  accountSetupError: {
    backgroundColor: `${AppColors.accent}15`,
    borderColor: `${AppColors.accent}30`,
  },
  accountSetupHelp: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actions: {
    gap: 18,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: undefined,
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
