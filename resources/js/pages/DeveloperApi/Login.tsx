import React, { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Eye, EyeOff, LoaderCircle, Terminal } from 'lucide-react';

interface LoginProps {
    status?: string;
}

export default function DeveloperApiLogin({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('developer-api.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Developer Console — Sign in" />

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
                        Sign in to manage your API keys and usage
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-7 shadow-xl">
                    {status && (
                        <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
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
                                className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
                                disabled={processing}
                            />
                            <InputError message={errors.email} className="text-xs" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
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

                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', !!checked)}
                                    className="border-zinc-600 data-[state=checked]:bg-primary"
                                />
                                <span className="text-xs text-zinc-400">Remember me</span>
                            </label>
                            <a
                                href="/forgot-password"
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-xs text-zinc-600 text-center space-y-2">
                    <p>
                        Don't have an account?{' '}
                        <a href="/register" className="text-zinc-400 hover:text-white transition-colors">
                            Create one free
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
