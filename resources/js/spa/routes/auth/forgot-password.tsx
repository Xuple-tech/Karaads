import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () => apiRequest<{ message: string }>('/api/session/forgot-password', { method: 'POST', json: { email } }),
        onSuccess: (data) => {
            setError(null);
            setMessage(data.message);
        },
        onError: (mutationError) => {
            setMessage(null);
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to send reset email.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    return (
        <AuthLayout title="Reset your password" description="Enter your email and we'll send you a reset link">
            <div className="space-y-3">
                {message && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-400">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form className="space-y-3" onSubmit={onSubmit}>
                    <input
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        disabled={mutation.isPending}
                        className="h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Sending…
                            </span>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>

                <p className="text-center text-[13px] text-muted-foreground pt-2">
                    <Link to="/login" className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors">
                        ← Back to sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
