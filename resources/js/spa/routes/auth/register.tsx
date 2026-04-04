import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey } from '@/spa/lib/session';

export function Component() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState<string | null>(null);

    const register = useMutation({
        mutationFn: () => apiRequest('/api/session/register', { method: 'POST', json: form }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
            navigate('/app');
        },
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to create account.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        register.mutate();
    };

    return (
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-16">
            <form className="w-full space-y-5 rounded-3xl border border-border/70 bg-card p-8" onSubmit={onSubmit}>
                <div>
                    <h1 className="text-3xl font-semibold">Create account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">User authentication is now handled fully inside the SPA.</p>
                </div>
                {['name', 'email', 'password', 'password_confirmation'].map((field) => (
                    <label className="block space-y-2" key={field}>
                        <span className="text-sm">{field.replaceAll('_', ' ')}</span>
                        <input
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3"
                            type={field.includes('password') ? 'password' : 'text'}
                            value={form[field as keyof typeof form]}
                            onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))}
                        />
                    </label>
                ))}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="w-full" disabled={register.isPending} type="submit">
                    {register.isPending ? 'Creating account...' : 'Create account'}
                </Button>
                <p className="text-sm text-muted-foreground">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </form>
        </section>
    );
}
