import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

const WITHDRAWAL_MIN_AMOUNT = 1000;
const WITHDRAWAL_DAILY_LIMIT = 5000;
const WITHDRAWAL_FLAT_FEE = 50;

export interface WithdrawBankItem {
  bank_code?: string;
  code?: string;
  name?: string;
  bank_name?: string;
  InstitutionCode?: string | number;
  InstitutionName?: string;
}

interface WithdrawSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletBalance: number;
  withdrawAmount: string;
  onWithdrawAmountChange: (value: string) => void;
  bankCode: string;
  onBankCodeChange: (value: string) => void;
  bankSearch: string;
  onBankSearchChange: (value: string) => void;
  bankList: WithdrawBankItem[];
  bankListLoading: boolean;
  bankCacheSavedAt: number | null;
  accountNumber: string;
  onAccountNumberChange: (value: string) => void;
  accountName: string;
  narration: string;
  onNarrationChange: (value: string) => void;
  withdrawError: string | null;
  withdrawErrorType?: 'validation' | 'system' | 'notice' | null;
  withdrawSuccess: string | null;
  withdrawSubmitting: boolean;
  resolveLoading: boolean;
  onResolveAccount: () => void;
  onWithdraw: () => void;
  formatCurrency: (amount: number) => string;
}

export function WithdrawSheet({
  open,
  onOpenChange,
  walletBalance,
  withdrawAmount,
  onWithdrawAmountChange,
  bankCode,
  onBankCodeChange,
  bankSearch,
  onBankSearchChange,
  bankList,
  bankListLoading,
  bankCacheSavedAt,
  accountNumber,
  onAccountNumberChange,
  accountName,
  narration,
  onNarrationChange,
  withdrawError,
  withdrawErrorType,
  withdrawSuccess,
  withdrawSubmitting,
  resolveLoading,
  onResolveAccount,
  onWithdraw,
  formatCurrency,
}: WithdrawSheetProps) {
  const [step, setStep] = useState(1);
  const deferredBankSearch = useDeferredValue(bankSearch.trim().toLowerCase());

  const normalizedBanks = useMemo(
    () =>
      bankList
        .map((bank) => {
          const code = String(
            bank.bank_code ?? bank.code ?? bank.InstitutionCode ?? "",
          ).trim();
          const name = String(
            bank.name ?? bank.bank_name ?? bank.InstitutionName ?? code,
          ).trim();

          return {
            ...bank,
            normalizedCode: code,
            normalizedName: name,
          };
        })
        .filter((bank) => bank.normalizedCode !== ""),
    [bankList],
  );

  const filteredBanks = useMemo(() => {
    if (deferredBankSearch === "") {
      return normalizedBanks;
    }

    return normalizedBanks.filter((bank) => {
      const name = bank.normalizedName.toLowerCase();
      const code = bank.normalizedCode.toLowerCase();

      return (
        name.includes(deferredBankSearch) || code.includes(deferredBankSearch)
      );
    });
  }, [normalizedBanks, deferredBankSearch]);

  const selectedBankName = useMemo(() => {
    const selected = normalizedBanks.find(
      (bank) => bank.normalizedCode === bankCode,
    );
    return selected ? selected.normalizedName : "";
  }, [bankCode, normalizedBanks]);

  const amountValue = Number.parseFloat(withdrawAmount);
  const feeAmount = amountValue > 0 ? WITHDRAWAL_FLAT_FEE : 0;
  const netAmount = Number.isFinite(amountValue)
    ? Math.max(0, amountValue - WITHDRAWAL_FLAT_FEE)
    : 0;
  const amountValidationMessage = !Number.isFinite(amountValue)
    ? "Enter the amount you want to withdraw."
    : amountValue <= 0
      ? "Amount must be greater than zero."
      : amountValue < WITHDRAWAL_MIN_AMOUNT
        ? `Minimum withdrawal amount is ${formatCurrency(WITHDRAWAL_MIN_AMOUNT)}.`
        : amountValue > WITHDRAWAL_DAILY_LIMIT
          ? `Daily withdrawal limit is ${formatCurrency(WITHDRAWAL_DAILY_LIMIT)}.`
          : amountValue > walletBalance
            ? "Amount exceeds wallet balance."
            : null;
  const amountIsValid =
    Number.isFinite(amountValue) &&
    amountValue > 0 &&
    amountValue <= walletBalance &&
    amountValue >= WITHDRAWAL_MIN_AMOUNT &&
    amountValue <= WITHDRAWAL_DAILY_LIMIT;
  const canContinueToBank = amountIsValid && amountValidationMessage === null;
  const canContinueToReview =
    bankCode.trim() !== "" &&
    accountNumber.trim().length === 10 &&
    accountName.trim() !== "";

  useEffect(() => {
    if (!open) {
      setStep(1);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[95vh] flex-col rounded-t-3xl border-0 bg-white p-0 text-gray-900 shadow-2xl dark:bg-[oklch(0.22_0.02_260)] dark:text-white"
      >
        <SheetDescription className="sr-only">
          Withdraw your Karaads earnings to your bank account in three steps.
        </SheetDescription>

        {/* Drag handle */}
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted" />

        {/* Sticky header */}
        <div className="shrink-0 px-5 pb-3 pt-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
                Withdraw earnings
              </SheetTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Balance:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(walletBalance)}
                </span>
              </p>
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {step} / 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-widest">
            <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>Amount</span>
            <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>Bank</span>
            <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>Review</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 md:px-6">

          {/* ── STEP 1: Amount ── */}
          {step === 1 ? (
            <div className="space-y-4">
              {/* Big centered amount input */}
              <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 dark:border-white/10 dark:bg-white/5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Enter amount
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-light text-muted-foreground">₦</span>
                  <input
                    type="number"
                    min={String(WITHDRAWAL_MIN_AMOUNT)}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => onWithdrawAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-48 bg-transparent text-center text-5xl font-bold text-foreground outline-none placeholder:text-muted [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {Number.isFinite(amountValue) && amountValue > 0 ? (
                  <div className="mt-5 flex items-center gap-2.5 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      − {formatCurrency(feeAmount)}
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="text-muted-foreground">You receive</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">
                      {formatCurrency(netAmount)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Min {formatCurrency(WITHDRAWAL_MIN_AMOUNT)} &nbsp;·&nbsp; Max{" "}
                    {formatCurrency(WITHDRAWAL_DAILY_LIMIT)} / day
                  </p>
                )}
              </div>

              {/* Narration */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="narration"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Narration{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="narration"
                  value={narration}
                  onChange={(e) => onNarrationChange(e.target.value)}
                  placeholder="Withdrawal from Karaads"
                  className="h-11 rounded-xl border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              {/* Info pills */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/8 dark:text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  ₦{WITHDRAWAL_FLAT_FEE} flat fee
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:border-white/10 dark:bg-white/8 dark:text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Daily limit {formatCurrency(WITHDRAWAL_DAILY_LIMIT)}
                </span>
              </div>
            </div>
          ) : null}

          {/* ── STEP 2: Bank ── */}
          {step === 2 ? (
            <div className="mt-1 space-y-4">
              {/* Bank search */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Bank
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={bankSearch}
                    onChange={(e) => onBankSearchChange(e.target.value)}
                    placeholder={
                      bankListLoading && bankList.length === 0
                        ? "Loading banks…"
                        : "Search bank name or code"
                    }
                    className="h-11 rounded-xl border-border bg-background pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
                <Select value={bankCode} onValueChange={onBankCodeChange}>
                  <SelectTrigger className="h-11 rounded-xl border-border bg-background text-sm text-foreground focus:ring-1 focus:ring-primary/40">
                    <SelectValue
                      placeholder={
                        bankListLoading && bankList.length === 0
                          ? "Loading banks…"
                          : "Select your bank"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank, index) => (
                        <SelectItem
                          key={`${bank.normalizedCode}-${index}`}
                          value={bank.normalizedCode}
                        >
                          {bank.normalizedName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-results" disabled>
                        No banks match your search
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Account number + verify */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="account-number"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Account number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => onAccountNumberChange(e.target.value)}
                    placeholder="0123456789"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-11 flex-1 rounded-xl border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onResolveAccount}
                    disabled={resolveLoading || accountNumber.length !== 10 || !bankCode}
                    className="h-11 shrink-0 rounded-xl border-border bg-muted px-5 text-sm font-medium text-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-40"
                  >
                    {resolveLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>

              {/* Account preview */}
              {selectedBankName || accountName ? (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <p className="border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Account preview
                  </p>
                  <div className="grid grid-cols-2">
                    <div className="border-r border-border bg-muted/20 px-4 py-3.5">
                      <p className="text-[11px] text-muted-foreground">Bank</p>
                      <p className="mt-0.5 text-sm font-medium leading-tight text-foreground">
                        {selectedBankName || "—"}
                      </p>
                    </div>
                    <div className="bg-muted/20 px-4 py-3.5">
                      <p className="text-[11px] text-muted-foreground">Account name</p>
                      <p
                        className={`mt-0.5 text-sm font-medium leading-tight ${
                          accountName
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "italic text-muted-foreground"
                        }`}
                      >
                        {accountName || "Not verified"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {bankCode && accountNumber.length === 10 && !accountName ? (
                <p className="text-xs text-amber-600 dark:text-amber-300/80">
                  Tap Verify to confirm the account name before continuing.
                </p>
              ) : null}

              {bankCacheSavedAt && bankListLoading ? (
                <p className="text-center text-xs text-muted-foreground">
                  Refreshing bank list in background…
                </p>
              ) : null}
            </div>
          ) : null}

          {/* ── STEP 3: Review ── */}
          {step === 3 ? (
            <div className="mt-1 space-y-4">
              {/* Amount hero */}
              <div className="flex flex-col items-center rounded-2xl border border-border bg-muted/30 py-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  You are sending
                </p>
                <p className="mt-3 text-5xl font-bold tabular-nums text-foreground">
                  {formatCurrency(amountIsValid ? amountValue : 0)}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    Fee{" "}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(amountIsValid ? WITHDRAWAL_FLAT_FEE : 0)}
                    </span>
                  </span>
                  <span className="h-3 w-px bg-border" />
                  <span>
                    Recipient gets{" "}
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">
                      {formatCurrency(amountIsValid ? netAmount : 0)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Transfer detail rows */}
              <div className="overflow-hidden rounded-2xl border border-border">
                {[
                  { label: "Bank", value: selectedBankName || "No bank selected" },
                  { label: "Account number", value: accountNumber || "—" },
                  {
                    label: "Account name",
                    value: accountName || "Not verified",
                    accent: !!accountName,
                  },
                  {
                    label: "Narration",
                    value: narration || "Withdrawal from Karaads",
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between bg-muted/20 px-4 py-3.5 ${
                      i < arr.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span
                      className={`max-w-[58%] text-right text-sm font-medium ${
                        row.accent ? "text-emerald-600 dark:text-emerald-300" : "text-foreground"
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Protected with duplicate-request detection
                </span>
              </div>
            </div>
          ) : null}

          {/* Alerts */}
          <div className="mt-4 space-y-3">
            {step === 1 && amountValidationMessage ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-3.5 py-3 text-xs text-amber-700 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{amountValidationMessage}</span>
              </div>
            ) : null}

            {withdrawError ? (
              withdrawErrorType === "system" ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/5 px-3.5 py-3 text-xs">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-300">Service unavailable</p>
                    <p className="mt-0.5 text-red-500/80 dark:text-red-400/70">{withdrawError}</p>
                  </div>
                </div>
              ) : withdrawErrorType === "notice" ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 text-xs">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
                  <div>
                    <p className="font-semibold text-amber-200">Transfer failed, money returned</p>
                    <p className="mt-0.5 text-amber-100/75">{withdrawError}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 text-xs">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-300">Action required</p>
                    <p className="mt-0.5 text-amber-600/80 dark:text-amber-400/70">{withdrawError}</p>
                  </div>
                </div>
              )
            ) : null}

            {withdrawSuccess ? (
              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/6">
                <div className="flex items-center gap-3 border-b border-emerald-500/15 px-4 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Withdrawal successful</p>
                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/65">The transfer was confirmed successful</p>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-3.5">
                  <p className="text-xs leading-relaxed text-muted-foreground">{withdrawSuccess}</p>
                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Payment typically arrives within <span className="font-semibold text-foreground">30 minutes to 1 hour 30 minutes</span>. Check your bank account shortly.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-sm md:px-6 dark:border-white/10 dark:bg-[oklch(0.22_0.02_260)]/95">
          <div className="flex gap-3">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="h-12 flex-1 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : null}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && canContinueToBank) setStep(2);
                  else if (step === 2 && canContinueToReview) setStep(3);
                }}
                disabled={
                  (step === 1 && !canContinueToBank) ||
                  (step === 2 && !canContinueToReview)
                }
                className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onWithdraw}
                disabled={withdrawSubmitting || !canContinueToReview}
                className="h-12 flex-1 rounded-2xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                {withdrawSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Confirm & send"
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
      
