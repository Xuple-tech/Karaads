import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KaraButton } from '@/components/ui/kara-button';
import { KaraInput } from '@/components/ui/kara-input';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useResendVerificationCode, useVerifyEmail } from '@/features/auth/hooks';
import { useAuthStore } from '@/features/auth/store';
import { getErrorMessage } from '@/lib/errors/get-error-message';

export default function VerifyAccountScreen() {
  const insets = useSafeAreaInsets();
  const sessionUser = useAuthStore((state) => state.user);
  const email = sessionUser?.email ?? '';
  const verifyEmail = useVerifyEmail(email);
  const resendCode = useResendVerificationCode(email);
  const [code, setCode] = useState('');

  const onVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    // Success flips auth status to 'authenticated', which switches the root
    // navigator from the auth flow to the main app automatically.
    await verifyEmail.mutateAsync(trimmed);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={AppGradients.heroBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.card}>
        <LinearGradient
          colors={AppGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />
        <Text style={styles.title}>Verify your account</Text>
        <Text style={styles.subtitle}>Enter the code sent to your email to continue.</Text>

        <KaraInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          keyboardType="default"
          placeholder="Enter code"
        />

        {verifyEmail.error ? <Text style={styles.error}>{getErrorMessage(verifyEmail.error)}</Text> : null}
        {resendCode.error ? <Text style={styles.error}>{getErrorMessage(resendCode.error)}</Text> : null}

        <View style={styles.actions}>
          <KaraButton label="Verify" onPress={onVerify} loading={verifyEmail.isPending} />
          <Pressable style={styles.linkWrap} onPress={() => resendCode.mutate()}>
            <Text style={styles.linkText}>{resendCode.isPending ? 'Sending...' : 'Resend code'}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#0C1120',
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.8)',
    padding: 24,
    gap: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  cardAccent: {
    height: 3,
    borderRadius: 3,
    marginBottom: 4,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: undefined,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  linkWrap: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: AppColors.accent, fontSize: 14, fontWeight: '700', fontFamily: undefined },
  error: {
    color: AppColors.danger,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
});
