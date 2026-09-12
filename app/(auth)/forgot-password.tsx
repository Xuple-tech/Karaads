import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { KaraButton } from '@/components/ui/kara-button';
import { KaraInput } from '@/components/ui/kara-input';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useForgotPassword } from '@/features/auth/hooks';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or phone number'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const forgotPassword = useForgotPassword();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  const submit = handleSubmit(async (values) => {
    const identifier = values.identifier.trim();
    if (!identifier.includes('@')) {
      setError('identifier', {
        message: 'Password reset by phone is not enabled on the server yet. Please use your email address.',
      });
      return;
    }

    await forgotPassword.mutateAsync({ identifier });
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="key-outline" size={28} color={AppColors.accent} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>Enter your email or phone number and we will send password reset instructions.</Text>

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

          {forgotPassword.error ? <Text style={styles.error}>{getErrorMessage(forgotPassword.error)}</Text> : null}
          {isSubmitSuccessful && !forgotPassword.error ? (
            <Text style={styles.success}>If this account exists, reset instructions have been sent.</Text>
          ) : null}

          <KaraButton label="Send Reset Link" onPress={submit} loading={forgotPassword.isPending} />
          <KaraButton label="Back to Login" onPress={() => router.back()} variant="ghost" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  card: {
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.8)',
    backgroundColor: '#0C1120',
    padding: 24,
    gap: 18,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,144,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.28)',
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: undefined,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '400',
  },
  error: {
    color: AppColors.danger,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  success: {
    color: AppColors.success,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '700',
  },
});
