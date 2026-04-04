import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
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
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-16">
            <form className="w-full space-y-5 rounded-3xl border border-border/70 bg-card p-8" onSubmit={onSubmit}>
                <h1 className="text-3xl font-semibold">Reset password</h1>
                <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
                {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="w-full" type="submit">{mutation.isPending ? 'Sending...' : 'Send reset link'}</Button>
            </form>
        </section>
    );
}
