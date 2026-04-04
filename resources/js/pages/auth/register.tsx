'use client';

import GoogleLogo from '@/components/google-logo';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';
import auth from '@/routes/auth';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    redirect: string;
};

interface RegisterProps {
    redirect?: string | null;
}

export default function Register({ redirect }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        redirect: redirect ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(register.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Sign up to get started with Kwati AI">
            <Head title="Register" />

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
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                            Full name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Jane Smith"
                            className="h-10 rounded-lg text-sm"
                        />
                        <InputError message={errors.name} className="text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="you@example.com"
                            className="h-10 rounded-lg text-sm"
                        />
                        <InputError message={errors.email} className="text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="h-10 rounded-lg text-sm"
                        />
                        <InputError message={errors.password} className="text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="h-10 rounded-lg text-sm"
                        />
                        <InputError message={errors.password_confirmation} className="text-xs" />
                    </div>

                    <Button
                        type="submit"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        disabled={processing}
                    >
                        {processing ? (
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
                    <TextLink
                        href={redirect ? `${login.url()}?redirect=${encodeURIComponent(redirect)}` : login.url()}
                        className="font-medium text-foreground hover:underline"
                    >
                        Sign in
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
