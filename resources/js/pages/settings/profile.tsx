import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@/components/page-head';
import { useAuth } from '@/hooks/use-auth';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import axiosInstance from '@/lib/axios';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// AppLayout removed - wrapped by ProtectedRoute
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

const BADGE_FEE_NAIRA = 5000;
const BADGE_FEE_LABEL = `N${BADGE_FEE_NAIRA.toLocaleString()}`;

interface VerificationRequest {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    category: 'creator' | 'public_figure' | 'brand' | 'business';
    full_name: string;
    contact_email: string;
    reason: string;
    portfolio_url?: string | null;
    social_url?: string | null;
    payment_amount?: number | null;
    payment_status?: string | null;
    payment_provider?: string | null;
    payment_reference?: string | null;
    paid_at?: string | null;
    review_notes?: string | null;
    created_at?: string | null;
    reviewed_at?: string | null;
}

const getProcessingIcon = (status: string | null | undefined) => {
    switch (status) {
        case 'queued':
        case 'processing':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'ready':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'failed':
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
            return null;
    }
};

const resolveMediaUrl = (value: unknown, fallback = ''): string => {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
        return fallback;
    }

    if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
        return trimmed;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    return `/storage/${trimmed}`;
};

const coerceString = (value: unknown, fallback = ''): string => {
    return typeof value === 'string' ? value : fallback;
};

const getInitials = (value: unknown): string => {
    const name = coerceString(value).trim();

    if (name === '') {
        return 'U';
    }

    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const page = usePage<Partial<SharedData>>();
    const { setAuth } = useAuth();
    const authUser =
        page.props?.auth && typeof page.props.auth === 'object' && page.props.auth?.user
            ? page.props.auth.user
            : null;
    const userName = coerceString(authUser?.name);
    const userEmail = coerceString(authUser?.email);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverError, setCoverError] = useState<string | null>(null);
    const [coverSuccess, setCoverSuccess] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(true);
    const [verificationSubmitting, setVerificationSubmitting] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationForm, setVerificationForm] = useState({
        category: 'creator',
        full_name: userName,
        contact_email: userEmail,
        reason: '',
        portfolio_url: '',
        social_url: '',
    });
    const coverImageUrl = coverPreview || resolveMediaUrl(authUser?.cover);
    const avatarImageUrl =
        avatarPreview ||
        resolveMediaUrl(authUser?.avatar, resolveMediaUrl(authUser?.avatar_url));
    const hasActiveBadge = Boolean(
        authUser?.is_verified ||
        authUser?.has_verification_badge
    );
    const badgeExpiresAt = coerceString(authUser?.kara_verified_expires_at);
    const canRequestBadge = !verificationRequest ||
        verificationRequest.status === 'rejected' ||
        (verificationRequest.status === 'approved' && !hasActiveBadge);

    useEffect(() => {
        setVerificationForm((current) => ({
            ...current,
            full_name: current.full_name || userName,
            contact_email: current.contact_email || userEmail,
        }));
    }, [userEmail, userName]);

    useEffect(() => {
        const loadVerificationRequest = async () => {
            try {
                const response = await axiosInstance.get('/api/users/verification-request');
                setVerificationRequest(response.data?.data ?? null);
            } catch {
                setVerificationRequest(null);
            } finally {
                setVerificationLoading(false);
            }
        };

        loadVerificationRequest();
    }, []);

    const syncAuthenticatedUser = async () => {
        try {
            const response = await axiosInstance.get('/api/users/profile');
            const user = response.data?.data ?? response.data ?? null;
            if (user) {
                setAuth({ user });
            }
        } catch {
            // Keep the current page state if the auth refresh fails.
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setCoverPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload only the cover
        setCoverUploading(true);
        setCoverError(null);
        setCoverSuccess(false);
        try {
            const formData = new FormData();
            formData.append('cover', file);
            await axiosInstance.patch('/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCoverSuccess(true);
            setTimeout(() => setCoverSuccess(false), 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.errors?.cover?.[0] ?? 'Upload failed';
            setCoverError(msg);
        } finally {
            setCoverUploading(false);
            // Reset input so same file can be re-selected
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload only the avatar
        setAvatarUploading(true);
        setAvatarError(null);
        setAvatarSuccess(false);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await axiosInstance.patch('/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setAvatarSuccess(true);
            setTimeout(() => setAvatarSuccess(false), 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.errors?.avatar?.[0] ?? 'Upload failed';
            setAvatarError(msg);
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verification_payment') !== 'paystack') return;
        const reference = params.get('reference') || undefined;

        setVerificationSuccess('Checking your Paystack payment...');
        axiosInstance
            .post('/api/users/verification-request/paystack/verify', { reference })
            .then(async (response) => {
                const request = response.data?.data ?? null;
                setVerificationRequest(request);
                if (request?.payment_status === 'paid') {
                    await syncAuthenticatedUser();
                    setVerificationSuccess(response.data?.message ?? 'Payment confirmed. Your Kara Verified badge is now active for 30 days.');
                } else {
                    setVerificationSuccess(null);
                    setVerificationError('Paystack payment is not confirmed yet. If you paid, tap Verify Paystack payment.');
                }
            })
            .catch(() => {
                setVerificationSuccess(null);
                setVerificationError('Unable to check your Paystack payment yet.');
            })
            .finally(() => {
                window.history.replaceState({}, '', window.location.pathname);
            });
    }, []);

    const submitVerificationRequest = async () => {
        setVerificationSubmitting(true);
        setVerificationError(null);
        setVerificationSuccess(null);

        try {
            const response = await axiosInstance.post('/api/users/verification-request', {
                ...verificationForm,
                payment_method: 'paystack',
            });
            setVerificationRequest(response.data?.data ?? null);
            if (response.data?.authorization_url) {
                setVerificationSuccess('Redirecting to Paystack...');
                window.location.href = response.data.authorization_url;
                return;
            }
            setVerificationSuccess(response.data?.message ?? 'Verification request submitted.');
            setShowVerificationForm(false);
        } catch (err: any) {
            const errors = err?.response?.data?.errors;
            const firstValidationError = errors
                ? Object.values(errors).flat().find((value) => typeof value === 'string')
                : null;
            setVerificationError(firstValidationError || err?.response?.data?.message || 'Unable to submit request.');
        } finally {
            setVerificationSubmitting(false);
        }
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void submitVerificationRequest();
    };

    const handlePaystackVerify = async () => {
        setVerificationSubmitting(true);
        setVerificationError(null);
        setVerificationSuccess(null);

        try {
            const response = await axiosInstance.post('/api/users/verification-request/paystack/verify', {
                reference: verificationRequest?.payment_reference,
            });
            const request = response.data?.data ?? null;
            setVerificationRequest(request);
            if (request?.payment_status === 'paid') {
                await syncAuthenticatedUser();
            }
            setVerificationSuccess(response.data?.message ?? 'Payment checked.');
        } catch (err: any) {
            setVerificationError(err?.response?.data?.message || 'Unable to verify Paystack payment.');
        } finally {
            setVerificationSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Media Upload Section - direct uploads, no form submit needed */}
                    <div>
                        <HeadingSmall
                            title="Profile pictures"
                            description="Upload and manage your profile pictures"
                        />

                        {/* Cover Upload */}
                        <div className="space-y-2 mt-4">
                            <Label>Cover Picture</Label>
                            <div className="relative group h-32 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900 overflow-hidden cursor-pointer">
                                {coverImageUrl ? (
                                    <img
                                        src={coverImageUrl}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover pointer-events-none"
                                    />
                                ) : (
                                    <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-2">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                        <p className="text-sm text-gray-500">Click to add cover</p>
                                    </div>
                                )}
                                {/* hover overlay */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {coverUploading
                                        ? <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        : <Camera className="h-8 w-8 text-white" />
                                    }
                                </div>
                                {/* Input covers entire area — browser opens file picker natively */}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    disabled={coverUploading}
                                    onChange={handleCoverChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                            </div>
                            {coverSuccess && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-green-600">Cover updated</span>
                                </div>
                            )}
                            {coverError && (
                                <p className="text-sm text-red-500">{coverError}</p>
                            )}
                        </div>

                        {/* Avatar Upload */}
                        <div className="space-y-2 mt-6">
                            <Label>Avatar</Label>
                            <div className="flex items-end gap-4">
                                <div className="flex-shrink-0">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarImageUrl} />
                                        <AvatarFallback>
                                            {getInitials(authUser?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1">
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={avatarUploading}
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        {avatarUploading
                                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            : <Camera className="mr-2 h-4 w-4" />
                                        }
                                        Change Avatar
                                    </Button>
                                    {avatarSuccess && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-xs text-green-600">Avatar updated</span>
                                        </div>
                                    )}
                                    {avatarError && (
                                        <p className="mt-1 text-sm text-red-500">{avatarError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Section - Separate Form */}
                    <div>
                        <HeadingSmall
                            title="Profile information"
                            description="Update your name and email address"
                        />

                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={userName}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={userEmail}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    {mustVerifyEmail &&
                                        authUser?.email_verified_at === null && (
                                            <div>
                                                <p className="-mt-4 text-sm text-muted-foreground">
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Saved
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    <div>
                        <HeadingSmall
                            title="Kara Verified"
                            description="Apply for the public verified badge."
                        />

                        <div className="mt-4 rounded-2xl border border-border/60 bg-muted/20 p-5">
                            {verificationLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading verification status...
                                </div>
                            ) : verificationRequest && !canRequestBadge ? (
                                <div className="space-y-3">
                                    {verificationSuccess ? <p className="text-sm text-green-600">{verificationSuccess}</p> : null}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium">Current request status:</span>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                                            {verificationRequest.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Submitted on {verificationRequest.created_at ? new Date(verificationRequest.created_at).toLocaleString() : 'N/A'}.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Badge fee: {BADGE_FEE_LABEL} {verificationRequest.payment_status ? `(${verificationRequest.payment_status})` : ''}{verificationRequest.payment_provider ? ` via ${verificationRequest.payment_provider}` : ''}.
                                    </p>
                                    {hasActiveBadge && badgeExpiresAt ? (
                                        <p className="text-sm text-muted-foreground">
                                            Your badge renews every 30 days. Current badge expires on {new Date(badgeExpiresAt).toLocaleString()}.
                                        </p>
                                    ) : null}
                                    {verificationRequest.payment_provider === 'paystack' && verificationRequest.payment_status !== 'paid' ? (
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button type="button" onClick={handlePaystackVerify} disabled={verificationSubmitting}>
                                                {verificationSubmitting ? 'Checking...' : 'Verify Paystack payment'}
                                            </Button>
                                        </div>
                                    ) : null}
                                    {verificationError ? <p className="text-sm text-red-500">{verificationError}</p> : null}
                                    {verificationRequest.review_notes ? (
                                        <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-sm">
                                            <p className="font-medium">Review notes</p>
                                            <p className="mt-1 text-muted-foreground">{verificationRequest.review_notes}</p>
                                        </div>
                                    ) : null}
                                    {verificationRequest.status === 'rejected' ? (
                                        <p className="text-sm text-muted-foreground">
                                            You can submit a fresh request after updating your profile and supporting links.
                                        </p>
                                    ) : null}
                                </div>
                            ) : !showVerificationForm ? (
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    {verificationRequest?.status === 'rejected' ? (
                                        <p className="w-full text-sm text-muted-foreground">
                                            Your last request was rejected. Update your details and submit a new request below.
                                            {verificationRequest.review_notes ? ` Review notes: ${verificationRequest.review_notes}` : ''}
                                        </p>
                                    ) : null}
                                    {verificationRequest?.status === 'approved' && !hasActiveBadge ? (
                                        <p className="w-full text-sm text-muted-foreground">
                                            Your last Kara Verified badge has expired. Renew for another 30 days.
                                        </p>
                                    ) : null}
                                    <p className="text-sm text-muted-foreground">Badge fee: {BADGE_FEE_LABEL} for 30 days. Paystack only.</p>
                                    <Button type="button" asChild>
                                        <Link href="/settings/verification">
                                            {verificationRequest?.status === 'approved' && !hasActiveBadge ? `Renew badge - ${BADGE_FEE_LABEL}` : `Pay ${BADGE_FEE_LABEL}`}
                                        </Link>
                                    </Button>
                                    {verificationError ? <p className="text-sm text-red-500">{verificationError}</p> : null}
                                    {verificationSuccess ? <p className="w-full text-sm text-green-600">{verificationSuccess}</p> : null}
                                </div>
                            ) : (
                                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="verification-category">Account type</Label>
                                        <select
                                            id="verification-category"
                                            value={verificationForm.category}
                                            onChange={(e) => setVerificationForm((current) => ({ ...current, category: e.target.value as typeof current.category }))}
                                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="creator">Creator</option>
                                            <option value="public_figure">Public figure</option>
                                            <option value="brand">Brand</option>
                                            <option value="business">Business</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-full-name">Full name</Label>
                                            <Input
                                                id="verification-full-name"
                                                value={verificationForm.full_name}
                                                onChange={(e) => setVerificationForm((current) => ({ ...current, full_name: e.target.value }))}
                                                placeholder="Your full name or business name"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-contact-email">Contact email</Label>
                                            <Input
                                                id="verification-contact-email"
                                                type="email"
                                                value={verificationForm.contact_email}
                                                onChange={(e) => setVerificationForm((current) => ({ ...current, contact_email: e.target.value }))}
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="verification-reason">Why should this account be Kara Verified?</Label>
                                        <textarea
                                            id="verification-reason"
                                            value={verificationForm.reason}
                                            onChange={(e) => setVerificationForm((current) => ({ ...current, reason: e.target.value }))}
                                            className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Share why this account is notable, trusted, or at risk of impersonation."
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-portfolio-url">Portfolio or website</Label>
                                            <Input
                                                id="verification-portfolio-url"
                                                value={verificationForm.portfolio_url}
                                                onChange={(e) => setVerificationForm((current) => ({ ...current, portfolio_url: e.target.value }))}
                                                placeholder="https://your-site.com"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-social-url">Public social profile</Label>
                                            <Input
                                                id="verification-social-url"
                                                value={verificationForm.social_url}
                                                onChange={(e) => setVerificationForm((current) => ({ ...current, social_url: e.target.value }))}
                                                placeholder="https://instagram.com/yourhandle"
                                            />
                                        </div>
                                    </div>

                                    {verificationError ? <p className="text-sm text-red-500">{verificationError}</p> : null}

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button type="submit" disabled={verificationSubmitting}>
                                            {verificationSubmitting ? 'Redirecting...' : `Pay ${BADGE_FEE_LABEL} with Paystack`}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowVerificationForm(false)} disabled={verificationSubmitting}>
                                            Cancel
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Badge becomes active automatically after Paystack confirms payment and lasts 30 days.
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </>
    );
}
