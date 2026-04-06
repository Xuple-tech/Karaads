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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirect = searchParams.get('redirect') || '/app';

    const login = useMutation({
        mutationFn: () =>
            apiRequest<{ redirect_to?: string; token: string }>('/api/session/login', {
                method: 'POST',
                json: { email, password, remember },
            }),
        onSuccess: async (data) => {
            setAuthToken(data.token);
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
            navigate(data.redirect_to || redirect);
        },
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to sign in.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        login.mutate();
    };

    return (
        <AuthLayout title="Welcome back" description="Sign in to your Kwati AI account">
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
                    {/* Email */}
                    <input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        disabled={login.isPending}
                        className="h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50"
                    />

                    {/* Password */}
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            disabled={login.isPending}
                            className="h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Remember + forgot */}
                    <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={login.isPending}
                                className="h-3.5 w-3.5 rounded border-[#484848] bg-[#2a2a2a] accent-[#8b5cf6]"
                            />
                            <span className="text-xs text-muted-foreground">Remember me</span>
                        </label>
                        <Link
                            to={`/forgot-password${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={login.isPending}
                        className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    >
                        {login.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Signing in…
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className="text-center text-[13px] text-muted-foreground pt-2">
                    Don't have an account?{' '}
                    <Link
                        to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                        className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
                    >
                        Sign up free
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
