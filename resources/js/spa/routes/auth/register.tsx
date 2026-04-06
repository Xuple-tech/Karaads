import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import GoogleLogo from '@/components/google-logo';
import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { setAuthToken } from '@/spa/lib/auth-token';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey } from '@/spa/lib/session';

export function Component() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/app';
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = useMutation({
        mutationFn: () => apiRequest<{ token: string }>('/api/session/register', { method: 'POST', json: form }),
        onSuccess: async (data) => {
            setAuthToken(data.token);
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
            navigate('/app');
        },
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to create account.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        register.mutate();
    };

    const inputClass = "h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50";

    return (
        <AuthLayout title="Create your account" description="Start using Kwati AI for free">
            <div className="space-y-3">
                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Google */}
                <a
                    href={`/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#2a2a2a] border border-[#383838] text-sm font-medium text-foreground transition-colors hover:bg-[#333333] hover:border-[#484848]"
                >
                    <GoogleLogo className="h-4 w-4" />
                    Continue with Google
                </a>

                <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 border-t border-[#2f2f2f]" />
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">or</span>
                    <div className="flex-1 border-t border-[#2f2f2f]" />
                </div>

                <form className="space-y-3" onSubmit={onSubmit}>
                    <input
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Full name"
                        disabled={register.isPending}
                        className={inputClass}
                    />

                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                        placeholder="Email address"
                        disabled={register.isPending}
                        className={inputClass}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                            placeholder="Password"
                            disabled={register.isPending}
                            className={`${inputClass} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))}
                            placeholder="Confirm password"
                            disabled={register.isPending}
                            className={`${inputClass} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={register.isPending}
                        className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    >
                        {register.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Creating account…
                            </span>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                <p className="text-center text-[13px] text-muted-foreground pt-2">
                    Already have an account?{' '}
                    <Link
                        to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                        className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
