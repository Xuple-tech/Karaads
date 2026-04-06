import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <AuthLayout title="Reset your password" description="Enter your email to receive a reset link">
            <div className="space-y-5">
                <form className="space-y-4" onSubmit={onSubmit}>
                    {message && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-10 rounded-lg text-sm"
                            disabled={mutation.isPending}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <>
                                <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" />
                                Sending…
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    <Link className="font-medium text-foreground hover:underline" to="/login">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
