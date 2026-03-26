'use client';

import GoogleLogo from '@/components/google-logo';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Lock, Mail, User, UserPlus } from 'lucide-react';
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
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(register.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create your account" description="Join Kwati AI and transform your workflow">
            <Head title="Register" />

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    

                    <a
                        href={auth.google.url()}
                        className="border-white-200 text-primary hover:bg-white-50 flex h-11 w-full items-center justify-center gap-3 rounded-lg border bg-white text-sm font-medium shadow-sm transition-all hover:shadow"
                        disabled={processing}
                    >
                        <GoogleLogo className="h-5 w-5" />
                        Google
                    </a>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="border-white-200 w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-body text-primary-500 px-3">Or sign up with</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white-700 text-sm font-medium">
                            Full Name
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <User className="text-white-400 h-5 w-5" />
                            </div>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="John Doe"
                                className="border-white-200 h-11 rounded-lg pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                        <InputError message={errors.name} className="text-sm" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white-700 text-sm font-medium">
                            Email Address
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="text-white-400 h-5 w-5" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="you@example.com"
                                className="border-white-200 h-11 rounded-lg pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                        <InputError message={errors.email} className="text-sm" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white-700 text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="text-white-400 h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className="border-white-200 h-11 rounded-lg pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                        <InputError message={errors.password} className="text-sm" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-white-700 text-sm font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="text-white-400 h-5 w-5" />
                            </div>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className="border-white-200 h-11 rounded-lg pl-10 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="text-sm" />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="from-accent -600 to-primary h-11 w-full rounded-lg bg-gradient-to-r text-sm font-medium shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create account
                        </>
                    )}
                </Button>

                <div className="text-white-600 pt-4 text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={login.url()} className="font-medium text-blue-600 hover:text-blue-700">
                        Sign in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
