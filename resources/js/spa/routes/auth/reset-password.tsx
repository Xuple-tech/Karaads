import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const navigate = useNavigate();
    const { token = '' } = useParams();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        email: searchParams.get('email') ?? '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () => apiRequest('/api/session/reset-password', { method: 'POST', json: { ...form, token } }),
        onSuccess: () => navigate('/login'),
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to reset password.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    const inputClass = "h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50";

    return (
        <AuthLayout title="Set a new password" description="Choose a strong, secure password">
            <form className="space-y-3" onSubmit={onSubmit}>
                {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    readOnly
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    placeholder="Email address"
                    className={`${inputClass} opacity-50 cursor-default`}
                />

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                        placeholder="New password"
                        disabled={mutation.isPending}
                        className={`${inputClass} pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))}
                        placeholder="Confirm new password"
                        disabled={mutation.isPending}
                        className={`${inputClass} pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                    {mutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Saving…
                        </span>
                    ) : (
                        'Reset password'
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}
