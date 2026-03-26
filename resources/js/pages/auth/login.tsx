import GoogleLogo from '@/components/google-logo';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react';
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
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome back" description="Sign in to your Kwati AI account to continue">
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-sm font-medium text-emerald-700">{status}</p>
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    <a
                        href={auth.google.url()}
                        className="border-z inc -200 text-primary -700 hover:bg-z inc -50 flex h-11 w-full items-center justify-center gap-3 rounded-lg border bg-white text-sm font-medium shadow-sm transition-all hover:shadow"
                        disabled={processing}
                    >
                        <GoogleLogo className="h-5 w-5" />
                        Google
                    </a>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="border-z inc -200 w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-body -500 px-4 text-white">Or continue with</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-z inc -700 text-sm font-medium">
                            Email Address
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="text-z inc -400 h-5 w-5" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="border-z inc -200 h-11 rounded-lg pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                                disabled={processing}
                            />
                        </div>
                        <InputError message={errors.email} className="text-sm" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-z inc -700 text-sm font-medium">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={password.request.url()} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="text-z inc -400 h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="border-z inc -200 h-11 rounded-lg pr-10 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                                disabled={processing}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-z inc -400 hover:text-z inc -600 absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="text-sm" />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            className="border-z inc -300 h-4 w-4 rounded data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                            disabled={processing}
                        />
                        <Label htmlFor="remember" className="text-z inc -600 cursor-pointer text-sm">
                            Remember me for 30 days
                        </Label>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="from-accent -600 to-primary -700 h-11 w-full rounded-lg bg-gradient-to-r text-sm font-medium shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign in
                        </>
                    )}
                </Button>

                <div className="text-z inc -600 pt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={register().url} className="font-medium text-blue-600 hover:text-blue-700">
                        Sign up
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
