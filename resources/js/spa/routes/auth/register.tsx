import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import GoogleLogo from '@/components/google-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    return (
        <AuthLayout title="Create an account" description="Sign up to get started with Kwati AI">
            {error && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                <a
                    href={`/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-muted text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                >
                    <GoogleLogo className="h-4 w-4" />
                    Continue with Google
                </a>

                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                </div>

                <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={form.name}
                            onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                            placeholder="Jane Smith"
                            className="h-10 rounded-lg text-sm"
                            disabled={register.isPending}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                            placeholder="you@example.com"
                            className="h-10 rounded-lg text-sm"
                            disabled={register.isPending}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                                placeholder="••••••••"
                                className="h-10 rounded-lg pr-10 text-sm"
                                disabled={register.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={form.password_confirmation}
                                onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))}
                                placeholder="••••••••"
                                className="h-10 rounded-lg pr-10 text-sm"
                                disabled={register.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        disabled={register.isPending}
                    >
                        {register.isPending ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
