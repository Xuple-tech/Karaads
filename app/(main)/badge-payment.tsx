import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, BadgeCheck, CreditCard } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const BADGE_AMOUNT = 5000;
const PAYMENT_TIMEOUT_MS = 8000;

class PendingBadgeCheckoutError extends Error {
  reference?: string;

  constructor(reference?: string) {
    super(
      `Your badge application was created${reference ? ` (reference: ${reference})` : ''}, but the server did not create a Paystack checkout. The backend must return authorization_url or access_code from Paystack.`,
    );
    this.name = 'PendingBadgeCheckoutError';
    this.reference = reference;
  }
}

const withTimeout = async <T,>(callback: (signal: AbortSignal) => Promise<T>, timeoutMs = PAYMENT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await callback(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

const readPaymentUrl = (value: unknown): string | undefined => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nestedData = payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : {};
  const nestedPaystack = payload.paystack && typeof payload.paystack === 'object' ? (payload.paystack as Record<string, unknown>) : {};
  const nestedPayment = payload.payment && typeof payload.payment === 'object' ? (payload.payment as Record<string, unknown>) : {};
  const candidates = [
    payload.authorization_url,
    payload.authorizationUrl,
    payload.paystack_url,
    payload.paystackUrl,
    payload.checkout_url,
    payload.checkoutUrl,
    payload.payment_url,
    payload.paymentUrl,
    payload.redirect_url,
    payload.redirectUrl,
    payload.url,
    nestedData.authorization_url,
    nestedData.authorizationUrl,
    nestedData.paystack_url,
    nestedData.paystackUrl,
    nestedData.checkout_url,
    nestedData.checkoutUrl,
    nestedData.payment_url,
    nestedData.paymentUrl,
    nestedData.redirect_url,
    nestedData.redirectUrl,
    nestedData.url,
    nestedPaystack.authorization_url,
    nestedPaystack.authorizationUrl,
    nestedPaystack.checkout_url,
    nestedPaystack.checkoutUrl,
    nestedPaystack.url,
    nestedPayment.authorization_url,
    nestedPayment.authorizationUrl,
    nestedPayment.checkout_url,
    nestedPayment.checkoutUrl,
    nestedPayment.url,
  ];

  const explicitUrl = candidates.find((item): item is string => typeof item === 'string' && /^https?:\/\//i.test(item.trim()))?.trim();
  if (explicitUrl) return explicitUrl;

  const urlKeys = new Set([
    'authorization_url', 'authorizationurl', 'checkout_url', 'checkouturl',
    'payment_url', 'paymenturl', 'paystack_url', 'paystackurl', 'redirect_url',
    'redirecturl', 'url', 'href', 'link',
  ]);
  const accessCodeKeys = new Set(['access_code', 'accesscode']);
  const seen = new Set<unknown>();
  let recursiveAccessCode: string | undefined;
  const findNestedCheckout = (candidate: unknown, depth = 0): string | undefined => {
    if (!candidate || depth > 7 || seen.has(candidate)) return undefined;
    if (Array.isArray(candidate)) {
      seen.add(candidate);
      for (const item of candidate) {
        const found = findNestedCheckout(item, depth + 1);
        if (found) return found;
      }
      return undefined;
    }
    if (typeof candidate !== 'object') return undefined;
    seen.add(candidate);
    for (const [rawKey, item] of Object.entries(candidate as Record<string, unknown>)) {
      const key = rawKey.toLowerCase();
      if (urlKeys.has(key) && typeof item === 'string' && /^https?:\/\//i.test(item.trim())) {
        return item.trim();
      }
      if (accessCodeKeys.has(key) && typeof item === 'string' && /^[A-Za-z0-9._-]+$/.test(item.trim())) {
        recursiveAccessCode ??= item.trim();
      }
    }
    for (const item of Object.values(candidate as Record<string, unknown>)) {
      const found = findNestedCheckout(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  };
  const nestedCheckoutUrl = findNestedCheckout(value);
  if (nestedCheckoutUrl) return nestedCheckoutUrl;
  if (recursiveAccessCode) return `https://checkout.paystack.com/${encodeURIComponent(recursiveAccessCode)}`;

  const accessCodeCandidates = [
    payload.access_code,
    payload.accessCode,
    nestedData.access_code,
    nestedData.accessCode,
    nestedPaystack.access_code,
    nestedPaystack.accessCode,
    nestedPayment.access_code,
    nestedPayment.accessCode,
  ];
  const accessCode = accessCodeCandidates.find(
    (item): item is string => typeof item === 'string' && /^[A-Za-z0-9._-]+$/.test(item.trim()),
  )?.trim();
  if (accessCode) return `https://checkout.paystack.com/${encodeURIComponent(accessCode)}`;

  const anyPaystackUrl = JSON.stringify(value).match(/https?:\/\/[^"'\s]+paystack[^"'\s]+/i)?.[0];
  return anyPaystackUrl;
};

const openCheckoutUrl = async (paymentUrl: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = paymentUrl;
    return;
  }

  try {
    await WebBrowser.openBrowserAsync(paymentUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: '#17CFFF',
    });
  } catch {
    await Linking.openURL(paymentUrl);
  }
};

const readReference = (value: unknown): string | undefined => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nestedData = payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : {};
  const candidate = payload.reference ?? payload.ref ?? payload.payment_reference ?? payload.paymentReference
    ?? nestedData.reference ?? nestedData.ref ?? nestedData.payment_reference ?? nestedData.paymentReference;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined;
};

const summarizePaymentResponse = (value: unknown): string => {
  const sensitiveKeys = /token|secret|password|authorization/i;
  try {
    const summary = JSON.stringify(value, (key, item) => {
      if (sensitiveKeys.test(key) && !/authorization_url|authorizationurl/i.test(key)) return '[hidden]';
      return item;
    });
    if (!summary) return 'empty response';
    return summary.length > 900 ? `${summary.slice(0, 900)}…` : summary;
  } catch {
    return 'unreadable response';
  }
};

const initializeBadgePayment = async (): Promise<{ paymentUrl: string; reference?: string }> => {
  const { token, user } = useAuthStore.getState();
  if (!token) {
    throw new Error('Your session has expired. Please sign in again before making a payment.');
  }
  const email = user?.email?.trim();
  if (!email) {
    throw new Error('Add an email address to your account before paying for a badge.');
  }
  const fullName = user?.name?.trim();
  if (!fullName) {
    throw new Error('Add your full name to your profile before paying for a badge.');
  }
  const response = await apiRequest<unknown>('/users/verification-request', {
    method: 'POST',
    token,
    version: 'v1_2',
    body: {
      category: 'creator',
      email,
      contact_email: email,
      full_name: fullName,
      reason: 'Payment for Kara Verified creator badge verification',
      amount: BADGE_AMOUNT,
      currency: 'NGN',
      callback_url: 'https://karaads.com/payment/callback',
    },
  });
  const paymentUrl = readPaymentUrl(response.data);
  if (!paymentUrl) {
    const payload = response.data && typeof response.data === 'object' ? response.data as Record<string, unknown> : {};
    const status = typeof payload.status === 'string' ? payload.status.toLowerCase() : '';
    const paymentStatus = typeof payload.payment_status === 'string' ? payload.payment_status.toLowerCase() : '';
    if (status === 'pending' || paymentStatus === 'pending') {
      throw new PendingBadgeCheckoutError(readReference(response.data));
    }
    throw new Error(`Backend response did not include checkout details: ${summarizePaymentResponse(response.data)}`);
  }
  return { paymentUrl, reference: readReference(response.data) };
};

const verifyBadgePayment = async (reference?: string): Promise<void> => {
  const token = useAuthStore.getState().token;
  if (reference) {
    await withTimeout((signal) =>
      apiRequest<unknown>('/users/verification-request/paystack/verify', {
        method: 'POST',
        token: token ?? undefined,
        version: 'v1_2',
        signal,
        body: { reference },
      }),
    ).catch(() => undefined);
  }
  // Paystack also confirms server-to-server via webhook, so re-check status regardless
  // of whether the client-side verify call above succeeded.
  await apiRequest<unknown>('/users/verification-request', { token: token ?? undefined, version: 'v1_2' });
};

export default function BadgePaymentScreen() {
  const insets = useSafeAreaInsets();
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [applicationPending, setApplicationPending] = useState(false);
  const loading = paystackLoading;

  const startPaystackPayment = async () => {
    if (loading) return;
    setPaymentError(null);
    setPaystackLoading(true);
    try {
      const { paymentUrl, reference } = await initializeBadgePayment();
      await openCheckoutUrl(paymentUrl);
      await verifyBadgePayment(reference);
      Alert.alert('Payment submitted', 'We’re confirming your badge payment. It will show as verified once Paystack confirms it.');
    } catch (error) {
      const message = getErrorMessage(error, 'The backend did not return a Paystack payment link yet.');
      if (error instanceof PendingBadgeCheckoutError) setApplicationPending(true);
      setPaymentError(message);
      Alert.alert('Payment unavailable', message);
    } finally {
      setPaystackLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={AppColors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Badge Payment</Text>
        <View style={styles.headerGhost} />
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <BadgeCheck size={32} color="#07111F" />
        </View>
        <Text style={styles.eyebrow}>KARA VERIFIED</Text>
        <Text style={styles.title}>Get your badge</Text>
        <Text style={styles.amount}>₦5,000</Text>
        <Text style={styles.body}>
          Pay with Paystack to request your Kara Verified badge. Verified creators earn ₦30 for approved videos longer than 30 seconds.
        </Text>

        <Pressable style={styles.payBtn} onPress={startPaystackPayment} disabled={loading}>
          {paystackLoading ? <ActivityIndicator color="#07111F" /> : <CreditCard size={18} color="#07111F" />}
          <Text style={styles.payBtnText}>
            {paystackLoading ? 'Opening Paystack...' : applicationPending ? 'Retry Paystack' : 'Pay with Paystack'}
          </Text>
        </Pressable>
        {paymentError ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorTitle}>Payment could not start</Text>
            <Text style={styles.errorText}>{paymentError}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111F',
    paddingHorizontal: 18,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 17,
    fontFamily: undefined, fontWeight: '800',
  },
  headerGhost: {
    width: 40,
    height: 40,
  },
  card: {
    marginTop: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#17CFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    marginTop: 18,
    color: '#4DD7FF',
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: undefined, fontWeight: '800',
  },
  title: {
    marginTop: 8,
    color: AppColors.white,
    fontSize: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  amount: {
    marginTop: 2,
    color: AppColors.white,
    fontSize: 30,
    fontFamily: undefined, fontWeight: '800',
  },
  body: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '600',
  },
  payBtn: {
    marginTop: 24,
    width: '100%',
    minHeight: 52,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnText: {
    color: '#07111F',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  errorPanel: {
    width: '100%',
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(248,113,113,0.10)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorTitle: {
    color: '#FCA5A5',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  errorText: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: undefined, fontWeight: '600',
  },
});
