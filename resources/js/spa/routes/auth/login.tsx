import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey } from '@/spa/lib/session';

export function Component() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirect = searchParams.get('redirect') || '/app';

    const login = useMutation({
        mutationFn: () =>
            apiRequest<{ redirect_to?: string }>('/api/session/login', {
                method: 'POST',
                json: { email, password },
            }),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
            navigate(data.redirect_to || redirect);
        },
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to sign in.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        login.mutate();
    };

    return (
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-16">
            <form className="w-full space-y-5 rounded-3xl border border-border/70 bg-card p-8" onSubmit={onSubmit}>
                <div>
                    <h1 className="text-3xl font-semibold">Sign in</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Session auth now powers the SPA runtime.</p>
                </div>
                <label className="block space-y-2">
                    <span className="text-sm">Email</span>
                    <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="block space-y-2">
                    <span className="text-sm">Password</span>
                    <input className="w-full rounded-2xl border border-border bg-background px-4 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button className="w-full" disabled={login.isPending} type="submit">
                    {login.isPending ? 'Signing in...' : 'Sign in'}
                </Button>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <Link to="/forgot-password">Forgot password</Link>
                    <Link to="/register">Create account</Link>
                </div>
            </form>
        </section>
    );
}
