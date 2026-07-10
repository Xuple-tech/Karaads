import { Head } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type InterestOption = {
    value: string;
    label: string;
};

type OnboardingBootstrapResponse = {
    interest_options: InterestOption[];
    user: {
        birth_date?: string | null;
        onboarding_interests?: string[] | null;
        onboarding_complete?: boolean;
    };
};

type OnboardingSubmitResponse = {
    message: string;
    user?: unknown;
};

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();
    const [birthDate, setBirthDate] = useState<string>(auth?.user?.birth_date ?? '');
    const [selectedInterests, setSelectedInterests] = useState<string[]>(auth?.user?.onboarding_interests ?? []);
    const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string>('');

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const response = await axiosInstance.get<OnboardingBootstrapResponse>('/api/users/onboarding');
                if (!mounted) return;

                const payload = response.data;
                setInterestOptions(payload.interest_options ?? []);

                if (payload.user?.birth_date) {
                    setBirthDate(payload.user.birth_date);
                }

                if (Array.isArray(payload.user?.onboarding_interests)) {
                    setSelectedInterests(payload.user.onboarding_interests);
                }
            } catch (error) {
                if (!mounted) return;
                setGeneralError('Failed to load onboarding options. Please refresh and try again.');
                console.error('Failed to load onboarding data', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const selectedCount = selectedInterests.length;
    const canSubmit = useMemo(
        () => Boolean(birthDate) && selectedCount >= 3 && selectedCount <= 5 && !submitting,
        [birthDate, selectedCount, submitting],
    );

    const toggleInterest = (value: string) => {
        setErrors((prev) => ({ ...prev, interests: '' }));
        setSelectedInterests((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            }
            if (prev.length >= 5) {
                return prev;
            }
            return [...prev, value];
        });
    };

    const submit = async () => {
        setSubmitting(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await axiosInstance.post<OnboardingSubmitResponse>('/api/users/onboarding', {
                birth_date: birthDate,
                interests: selectedInterests,
            });

            const payload = response.data as any;
            const user = payload?.user?.data ?? payload?.user ?? null;

            if (user) {
                setAuth({ user });
            }

            navigate('/app', { replace: true });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                const apiErrors = (error.response.data as any)?.errors ?? {};
                const nextErrors: Record<string, string> = {};

                if (Array.isArray(apiErrors.birth_date) && apiErrors.birth_date[0]) {
                    nextErrors.birth_date = String(apiErrors.birth_date[0]);
                }
                if (Array.isArray(apiErrors.interests) && apiErrors.interests[0]) {
                    nextErrors.interests = String(apiErrors.interests[0]);
                }
                if (!nextErrors.interests) {
                    const firstItemErrorKey = Object.keys(apiErrors).find((key) => key.startsWith('interests.'));
                    const firstItemError = firstItemErrorKey ? apiErrors[firstItemErrorKey] : null;
                    if (Array.isArray(firstItemError) && firstItemError[0]) {
                        nextErrors.interests = String(firstItemError[0]);
                    }
                }

                setErrors(nextErrors);
            } else {
                setGeneralError('Unable to save onboarding right now. Please try again.');
                console.error('Failed to complete onboarding', error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Onboarding" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2a44,_#090b10_55%)] text-white">
                <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8 sm:px-6">
                    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-8">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Welcome</p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                Set up your feed
                            </h1>
                            <p className="mt-2 text-sm text-white/70">
                                Add your date of birth and choose 3 to 5 interests to personalize what you see.
                            </p>
                        </div>

                        {generalError ? (
                            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                {generalError}
                            </div>
                        ) : null}

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="birth_date" className="mb-2 block text-sm font-medium text-white/90">
                                    Date of birth
                                </label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={birthDate}
                                    max={new Date().toISOString().slice(0, 10)}
                                    onChange={(event) => {
                                        setBirthDate(event.target.value);
                                        setErrors((prev) => ({ ...prev, birth_date: '' }));
                                    }}
                                    className="h-11 border-white/20 bg-white/5 text-white [color-scheme:dark]"
                                    disabled={loading || submitting}
                                />
                                {errors.birth_date ? (
                                    <p className="mt-2 text-xs text-red-300">{errors.birth_date}</p>
                                ) : null}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="block text-sm font-medium text-white/90">Interests</label>
                                    <span className="text-xs text-white/60">{selectedCount}/5 selected</span>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                    {loading ? (
                                        <p className="text-sm text-white/60">Loading interests...</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map((option) => {
                                                const selected = selectedInterests.includes(option.value);
                                                const isDisabled = !selected && selectedInterests.length >= 5;

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => toggleInterest(option.value)}
                                                        disabled={submitting || isDisabled}
                                                        className={cn(
                                                            'rounded-full border px-3 py-2 text-sm transition',
                                                            selected
                                                                ? 'border-emerald-300/70 bg-emerald-400/20 text-emerald-100'
                                                                : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10',
                                                            isDisabled && 'cursor-not-allowed opacity-50',
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-white/60">Choose at least 3 interests and up to 5.</p>
                                {errors.interests ? (
                                    <p className="mt-1 text-xs text-red-300">{errors.interests}</p>
                                ) : null}
                            </div>

                            <Button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit || loading}
                                className="h-11 w-full rounded-xl bg-white text-black hover:bg-white/90"
                            >
                                {submitting ? 'Saving...' : 'Continue to app'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
