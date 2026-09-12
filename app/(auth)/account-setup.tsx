import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KaraButton } from "@/components/ui/kara-button";
import { KaraInput } from "@/components/ui/kara-input";
import { AppColors, AppGradients, AppRadii } from "@/constants/app-theme";
import {
    useLogin,
    useSendActivationCode,
    useSetPassword,
    useVerifyActivationCode,
} from "@/features/auth/hooks";
import { isKaraApiError } from "@/lib/errors/api-error";
import { getErrorMessage } from "@/lib/errors/get-error-message";
import { useLocalSearchParams } from "@/lib/navigation/router";

type SetupStep = "verify_email" | "set_password";

export default function AccountSetupScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || "";

  const [step, setStep] = useState<SetupStep>("verify_email");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const verifyCodeMutation = useVerifyActivationCode();
  const setPasswordMutation = useSetPassword();
  const loginMutation = useLogin();
  const resendCodeMutation = useSendActivationCode();

  const loading =
    verifyCodeMutation.isPending ||
    setPasswordMutation.isPending ||
    loginMutation.isPending;

  const error =
    verifyCodeMutation.error ||
    setPasswordMutation.error ||
    loginMutation.error;

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      verifyCodeMutation.reset();
      verifyCodeMutation.error = new Error("Please enter the verification code");
      return;
    }

    if (code.length !== 8) {
      verifyCodeMutation.reset();
      verifyCodeMutation.error = new Error("Verification code must be 8 characters");
      return;
    }

    try {
      const result = await verifyCodeMutation.mutateAsync({ email, code });
      setActivationToken(result.activation_token);
      setStep("set_password");
    } catch (err) {
      // Error is already handled by mutation
      console.debug("Verify code error:", err);
    }
  };

  const handleSetPassword = async () => {
    if (!password.trim()) {
      setPasswordMutation.reset();
      setPasswordMutation.error = new Error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      setPasswordMutation.reset();
      setPasswordMutation.error = new Error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMutation.reset();
      setPasswordMutation.error = new Error("Passwords do not match");
      return;
    }

    if (!activationToken) {
      setPasswordMutation.reset();
      setPasswordMutation.error = new Error("Activation token is missing");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        activation_token: activationToken,
        password,
        password_confirmation: confirmPassword,
      });

      // After successful password setup, automatically login. Success flips
      // auth status to 'authenticated', switching the root navigator to the
      // main app automatically.
      await loginMutation.mutateAsync({ email, password });
    } catch (err) {
      // Error is already handled by mutation
      console.debug("Set password error:", err);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCodeMutation.mutateAsync({ email });
      Alert.alert("Code sent", "A new verification code has been sent to your email.");
    } catch (err) {
      Alert.alert("Unable to resend code", getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={AppGradients.heroBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <LinearGradient
          colors={AppGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBorderGrad}>
          <View style={styles.logoContainer}>
            <Ionicons name="mail-outline" size={38} color={AppColors.accent} />
          </View>
        </LinearGradient>
        <Text style={styles.title}>
          {step === "verify_email" ? "Verify Your Email" : "Set Your Password"}
        </Text>
        <Text style={styles.subtitle}>
          {step === "verify_email"
            ? `Enter the 8-character code sent to ${email}`
            : "Create a secure password for your account"}
        </Text>
      </View>

      <View style={styles.card}>
        {step === "verify_email" ? (
          <>
            <View style={styles.formBlock}>
              <KaraInput
                label="Verification Code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter 8-character code"
                autoCapitalize="characters"
                keyboardType="default"
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
              <KaraButton
                label={resendCodeMutation.isPending ? "Sending..." : "Resend Code"}
                variant="ghost"
                onPress={handleResendCode}
                loading={resendCodeMutation.isPending}
                disabled={loading}
              />
            </View>
          </>
        ) : (
          <View style={styles.formBlock}>
            <KaraInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a secure password"
              secureTextEntry
              autoCapitalize="none"
            />
            <KaraInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        )}

        {error ? (
          <View
            style={[
              styles.errorContainer,
              isKaraApiError(error) &&
              error.code === "ACCOUNT_SETUP_REQUIRED"
                ? styles.accountSetupError
                : null,
            ]}
          >
            <Ionicons
              name={
                isKaraApiError(error) && error.code === "ACCOUNT_SETUP_REQUIRED"
                  ? "mail-outline"
                  : "alert-circle"
              }
              size={18}
              color={
                isKaraApiError(error) && error.code === "ACCOUNT_SETUP_REQUIRED"
                  ? AppColors.accent
                  : AppColors.danger
              }
            />
            <View style={styles.errorContent}>
              <Text style={styles.error}>{getErrorMessage(error)}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <KaraButton
            label={step === "verify_email" ? "Verify Code" : "Set Password"}
            onPress={step === "verify_email" ? handleVerifyCode : handleSetPassword}
            loading={loading}
            variant="primary"
          />

          {step === "set_password" && (
            <KaraButton
              label="Back to Code Verification"
              variant="ghost"
              onPress={() => setStep("verify_email")}
              disabled={loading}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: AppColors.background,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBorderGrad: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 2.5,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0a1322',
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    fontFamily: undefined,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: undefined,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#0C1120',
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(42,49,77,0.8)',
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  formBlock: {
    gap: 18,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -8,
  },
  resendText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    gap: 12,
    marginTop: 8,
  },
  accountSetupError: {
    backgroundColor: `${AppColors.accent}15`,
    borderColor: `${AppColors.accent}30`,
  },
  errorContent: {
    flex: 1,
    gap: 4,
  },
});
