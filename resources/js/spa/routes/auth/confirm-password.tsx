import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () => apiRequest('/api/session/confirm-password', { method: 'POST', json: { password } }),
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to confirm password.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    return (
        <AuthLayout title="Confirm your identity" description="This action requires password confirmation">
            <div className="space-y-5">
                {/* Icon */}
                <div className="flex justify-center py-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] border border-[#383838]">
                        <ShieldCheck className="h-6 w-6 text-[#8b5cf6]" />
                    </div>
                </div>

                <form className="space-y-3" onSubmit={onSubmit}>
                    {error && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            disabled={mutation.isPending}
                            className="h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="h-11 w-full rounded-xl bg-[#8b5cf6] text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Confirming…
                            </span>
                        ) : (
                            'Confirm password'
                        )}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}
