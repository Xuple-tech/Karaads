import React, { FormEventHandler, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Eye, EyeOff, LoaderCircle, Terminal } from 'lucide-react';
import type { SharedData } from '@/types';
import { developerPortalUrl, normalizeDeveloperPortalBaseUrl } from '@/lib/developer-portal-url';

export default function DeveloperApiRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { developerPortal } = usePage<SharedData>().props;
    const baseUrl = normalizeDeveloperPortalBaseUrl(developerPortal?.base_url);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(developerPortalUrl(baseUrl, 'register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Developer Console — Create account" />

            <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center p-4">
                {/* Logo / Brand */}
                <div className="w-full max-w-sm mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                        <Terminal className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Kwati Developer Console
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Create an account to get API access
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-7 shadow-xl">
                    <form className="space-y-4" onSubmit={submit}>
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
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
                                placeholder="Jane Smith"
                                className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
                                disabled={processing}
                            />
                            <InputError message={errors.name} className="text-xs" />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
                                disabled={processing}
                            />
                            <InputError message={errors.email} className="text-xs" />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary pr-10"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="text-xs" />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-zinc-300">
                                Confirm password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary pr-10"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="text-xs" />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 mt-1"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Create account
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-xs text-zinc-600 text-center space-y-2">
                    <p>
                        Already have an account?{' '}
                        <a href={developerPortalUrl(baseUrl, 'login')} className="text-zinc-400 hover:text-white transition-colors">
                            Sign in
                        </a>
                    </p>
                    <p>
                        <a href="/" className="hover:text-zinc-400 transition-colors">
                            ← Back to Kwati AI
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
