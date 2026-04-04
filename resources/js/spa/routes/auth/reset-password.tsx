import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const navigate = useNavigate();
    const { token = '' } = useParams();
    const [searchParams] = useSearchParams();
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

    return (
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-16">
            <form className="w-full space-y-5 rounded-3xl border border-border/70 bg-card p-8" onSubmit={onSubmit}>
                <h1 className="text-3xl font-semibold">Choose a new password</h1>
                <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="Email address" />
                <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} placeholder="Password" />
                <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" type="password" value={form.password_confirmation} onChange={(e) => setForm((current) => ({ ...current, password_confirmation: e.target.value }))} placeholder="Confirm password" />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="w-full" type="submit">{mutation.isPending ? 'Resetting...' : 'Reset password'}</Button>
            </form>
        </section>
    );
}
