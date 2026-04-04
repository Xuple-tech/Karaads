import GoogleLogo from '@/components/google-logo';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';
import auth from '@/routes/auth';
import password from '@/routes/password';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    redirect: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    redirect?: string | null;
}

export default function Login({ status, canResetPassword, redirect }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
        redirect: redirect ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Sign in" description="Enter your credentials to access your account">
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {status}
                </div>
            )}

            <div className="space-y-5">
                <a
                    href={redirect ? `${auth.google.url()}?redirect=${encodeURIComponent(redirect)}` : auth.google.url()}
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

                <form className="space-y-4" onSubmit={submit}>
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
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className="h-10 rounded-lg text-sm"
                            disabled={processing}
                        />
                        <InputError message={errors.email} className="text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={redirect ? `${password.request.url()}?redirect=${encodeURIComponent(redirect)}` : password.request.url()}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="h-10 rounded-lg pr-10 text-sm"
                                disabled={processing}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="text-xs" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            disabled={processing}
                        />
                        <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        disabled={processing}
                    >
                        {processing ? (
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
                    <TextLink
                        href={redirect ? `${register().url}?redirect=${encodeURIComponent(redirect)}` : register().url}
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign up
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}

