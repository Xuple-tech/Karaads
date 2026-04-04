import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import GoogleLogo from '@/components/google-logo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <AuthLayout title="Sign in" description="Enter your credentials to access your account">
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
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-10 rounded-lg text-sm"
                            disabled={login.isPending}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            <Link
                                to={`/forgot-password${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-10 rounded-lg pr-10 text-sm"
                                disabled={login.isPending}
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

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) => setRemember(checked as boolean)}
                            disabled={login.isPending}
                        />
                        <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        disabled={login.isPending}
                    >
                        {login.isPending ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
