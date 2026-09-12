import { ArrowLeft, CheckCircle2, CircleDollarSign } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useEarningsSummary, useRequestWithdrawal, useResolveBankAccount, useWithdrawalBanks } from '@/features/earnings/hooks';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';

const currencySymbol = (code: string) => {
  if (code.toUpperCase() === 'NGN') return '₦';
  if (code.toUpperCase() === 'USD') return '$';
  return `${code.toUpperCase()} `;
};

const money = (value: number, currency = 'NGN') =>
  `${currencySymbol(currency)}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)}`;

export default function WithdrawScreen() {
  const insets = useSafeAreaInsets();
  const [amountInput, setAmountInput] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [narration, setNarration] = useState('');
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const summary = useEarningsSummary();
  const banks = useWithdrawalBanks(true);
  const resolveAccount = useResolveBankAccount();
  const withdraw = useRequestWithdrawal();
  const selectedBank = banks.data?.find((bank) => bank.code === bankCode);
  const filteredBanks = useMemo(() => {
    const term = bankSearch.trim().toLowerCase();
    if (!term) return banks.data ?? [];
    return (banks.data ?? []).filter((bank) => bank.name.toLowerCase().includes(term) || bank.code.includes(term));
  }, [bankSearch, banks.data]);
  const data = summary.data ?? {
    currency: 'NGN',
    availableBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingWithdrawal: 0,
    today: 0,
    week: 0,
    month: 0,
    adsWatched: 0,
    adsCompleted: 0,
    avgPerAd: 0,
    adsAvailable: 0,
  };

  const parsedAmount = Number(amountInput.replace(/[^\d.]/g, ''));
  const canSubmitWithdrawal =
    parsedAmount > 0 &&
    parsedAmount <= data.availableBalance &&
    bankCode.trim().length > 0 &&
    accountNumber.trim().length === 10 &&
    accountName.trim().length > 0;
  const withdrawalError = withdraw.error ? getErrorMessage(withdraw.error) : null;
  const verificationError = resolveAccount.error ? getErrorMessage(resolveAccount.error, 'Account verification failed.') : null;

  const clearVerifiedAccount = () => {
    setAccountName('');
    resolveAccount.reset();
  };

  const onChangeBankCode = (value: string) => {
    setBankCode(value);
    clearVerifiedAccount();
  };

  const onChangeAccountNumber = (value: string) => {
    setAccountNumber(value.replace(/\D/g, '').slice(0, 10));
    clearVerifiedAccount();
  };

  const onVerifyAccount = async () => {
    const normalizedBankCode = bankCode.trim();
    const normalizedAccountNumber = accountNumber.trim();
    if (!normalizedBankCode || normalizedAccountNumber.length !== 10) return;
    try {
      const resolved = await resolveAccount.mutateAsync({
        bankCode: normalizedBankCode,
        accountNumber: normalizedAccountNumber,
      });
      setAccountName(resolved.accountName);
    } catch {
      setAccountName('');
    }
  };

  const onSubmitWithdrawal = async () => {
    if (!canSubmitWithdrawal) return;
    try {
      await withdraw.mutateAsync({
        amount: parsedAmount,
        bankCode: bankCode.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || undefined,
        narration: narration.trim() || undefined,
      });
      Alert.alert('Withdrawal submitted', 'Your payout request has been queued.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      // error surfaced through withdrawalError text
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={AppColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Withdraw Earnings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={AppGradients.earnBalance as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroIcon}>
              <CircleDollarSign size={22} color="#fff" />
            </View>
            <View style={styles.heroBody}>
              <Text style={styles.heroTitle}>Transfer funds to your bank account</Text>
              <Text style={styles.heroMeta}>Available balance: {money(data.availableBalance, data.currency)}</Text>
              <Text style={styles.heroMeta}>Pending withdrawal: {money(data.pendingWithdrawal, data.currency)}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Withdrawal details</Text>

            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={AppColors.textMuted}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Select bank</Text>
            <Pressable style={styles.bankSelect} onPress={() => setBankPickerOpen(true)}>
              <View style={styles.bankSelectCopy}>
                <Text style={selectedBank ? styles.bankSelectValue : styles.bankSelectPlaceholder}>
                  {selectedBank?.name ?? (banks.isLoading ? 'Loading banks...' : 'Choose your bank')}
                </Text>
                {selectedBank ? <Text style={styles.bankSelectCode}>Bank code: {selectedBank.code}</Text> : null}
              </View>
              <Text style={styles.bankSelectChevron}>⌄</Text>
            </Pressable>

            <Text style={styles.inputLabel}>Account number</Text>
            <View style={styles.verifyRow}>
              <TextInput
                value={accountNumber}
                onChangeText={onChangeAccountNumber}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="10-digit account number"
                placeholderTextColor={AppColors.textMuted}
                style={[styles.input, styles.accountInput]}
              />
              <Pressable
                style={[styles.verifyBtn, (!bankCode.trim() || accountNumber.length !== 10 || resolveAccount.isPending) && styles.verifyBtnDisabled]}
                disabled={!bankCode.trim() || accountNumber.length !== 10 || resolveAccount.isPending}
                onPress={onVerifyAccount}>
                {resolveAccount.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
              </Pressable>
            </View>

            {accountName ? (
              <View style={styles.verifiedAccount}>
                <CheckCircle2 size={20} color="#22C55E" />
                <View style={styles.verifiedCopy}>
                  <Text style={styles.verifiedLabel}>Verified account</Text>
                  <Text style={styles.verifiedName}>{accountName}</Text>
                </View>
              </View>
            ) : null}
            {verificationError ? <Text style={styles.errorText}>{verificationError}</Text> : null}

            <Text style={styles.inputLabel}>Narration (optional)</Text>
            <TextInput
              value={narration}
              onChangeText={setNarration}
              placeholder="Withdrawal from KaraAds wallet"
              placeholderTextColor={AppColors.textMuted}
              style={[styles.input, styles.inputMulti]}
              multiline
            />

            {withdrawalError ? <Text style={styles.errorText}>{withdrawalError}</Text> : null}

            <Pressable
              style={[styles.submitBtn, (!canSubmitWithdrawal || withdraw.isPending) && styles.submitBtnDisabled]}
              disabled={!canSubmitWithdrawal || withdraw.isPending}
              onPress={onSubmitWithdrawal}>
              <LinearGradient
                colors={AppGradients.primary as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.submitBtnText}>{withdraw.isPending ? 'Submitting...' : 'Continue'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={bankPickerOpen} transparent animationType="slide" onRequestClose={() => setBankPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBankPickerOpen(false)}>
          <Pressable style={[styles.bankSheet, { paddingBottom: insets.bottom + 16 }]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select your bank</Text>
            <TextInput
              value={bankSearch}
              onChangeText={setBankSearch}
              placeholder="Search bank name"
              placeholderTextColor={AppColors.textMuted}
              style={[styles.input, styles.bankSearch]}
              autoCapitalize="none"
            />
            {banks.isLoading ? (
              <View style={styles.bankLoading}><ActivityIndicator color={AppColors.accent} /></View>
            ) : (
              <FlatList
                data={filteredBanks}
                keyExtractor={(bank) => bank.code}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={<Text style={styles.noBanks}>No matching bank found.</Text>}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.bankOption, item.code === bankCode && styles.bankOptionSelected]}
                    onPress={() => {
                      onChangeBankCode(item.code);
                      setBankPickerOpen(false);
                      setBankSearch('');
                    }}>
                    <View style={styles.bankOptionCopy}>
                      <Text style={styles.bankOptionName}>{item.name}</Text>
                      <Text style={styles.bankOptionCode}>{item.code}</Text>
                    </View>
                    {item.code === bankCode ? <CheckCircle2 size={20} color={AppColors.accent} /> : null}
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.12)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,20,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontFamily: undefined, fontWeight: '700',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  heroCard: {
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.3)',
    backgroundColor: 'rgba(10,18,32,0.9)',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,144,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.3)',
  },
  heroBody: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '700',
  },
  heroMeta: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
  },
  formCard: {
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: 'rgba(8,14,26,0.85)',
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '700',
    marginBottom: 4,
  },
  inputLabel: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  input: {
    minHeight: 50,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.25)',
    backgroundColor: 'rgba(10,18,34,0.9)',
    paddingHorizontal: 14,
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '400',
  },
  inputMulti: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  verifyRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  accountInput: { flex: 1 },
  verifyBtn: { minWidth: 82, minHeight: 50, paddingHorizontal: 14, borderRadius: AppRadii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent },
  verifyBtnDisabled: { opacity: 0.45 },
  verifyBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  verifiedAccount: { minHeight: 58, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: AppRadii.md, borderWidth: 1, borderColor: 'rgba(34,197,94,0.35)', backgroundColor: 'rgba(34,197,94,0.1)' },
  verifiedCopy: { flex: 1 },
  verifiedLabel: { color: '#86EFAC', fontSize: 11, fontWeight: '600' },
  verifiedName: { marginTop: 2, color: AppColors.textPrimary, fontSize: 15, fontWeight: '800' },
  bankSelect: { minHeight: 56, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderRadius: AppRadii.md, borderWidth: 1, borderColor: 'rgba(46,144,255,0.25)', backgroundColor: 'rgba(10,18,34,0.9)' },
  bankSelectCopy: { flex: 1 },
  bankSelectValue: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '700' },
  bankSelectPlaceholder: { color: AppColors.textMuted, fontSize: 16 },
  bankSelectCode: { marginTop: 2, color: AppColors.textMuted, fontSize: 11 },
  bankSelectChevron: { color: AppColors.textSecondary, fontSize: 22 },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    marginTop: 4,
    fontFamily: undefined, fontWeight: '400',
  },
  submitBtn: {
    minHeight: 54,
    borderRadius: AppRadii.pill,
    marginTop: 8,
    backgroundColor: AppColors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#2E90FF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  bankSheet: { height: '72%', paddingHorizontal: 16, paddingTop: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.background },
  sheetHandle: { width: 42, height: 4, alignSelf: 'center', marginBottom: 14, borderRadius: 2, backgroundColor: AppColors.textMuted },
  sheetTitle: { marginBottom: 12, color: AppColors.textPrimary, fontSize: 20, fontWeight: '800' },
  bankSearch: { marginBottom: 10 },
  bankLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bankOption: { minHeight: 58, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: AppColors.border },
  bankOptionSelected: { borderRadius: AppRadii.md, borderBottomWidth: 0, backgroundColor: 'rgba(46,144,255,0.12)' },
  bankOptionCopy: { flex: 1 },
  bankOptionName: { color: AppColors.textPrimary, fontSize: 15, fontWeight: '700' },
  bankOptionCode: { marginTop: 2, color: AppColors.textMuted, fontSize: 11 },
  noBanks: { paddingVertical: 30, color: AppColors.textMuted, textAlign: 'center' },
});
