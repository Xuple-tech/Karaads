import React, { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';

interface Props {
    status?: string;
    errors?: Record<string, string>;
}

export default function AdminLogin({ status }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Admin — Sign in" />

            <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center p-4">
                {/* Brand */}
                <div className="w-full max-w-sm mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                        <ShieldCheck className="w-6 h-6 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Kwati Admin Console
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Internal access only
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
                                placeholder="admin@example.com"
                                className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500"
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
                                    className="h-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="text-xs" />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-xs text-zinc-600">
                    Unauthorised access is prohibited and monitored.
                </p>
            </div>
        </>
    );
}
