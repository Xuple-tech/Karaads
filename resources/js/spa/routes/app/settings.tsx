import { useMutation, useQuery } from '@tanstack/react-query';
import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey, useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        setName(session.data?.user?.name ?? '');
        setEmail(session.data?.user?.email ?? '');
    }, [session.data?.user?.email, session.data?.user?.name]);

    const prefs = useQuery({
        queryKey: ['spa', 'chat-preferences'],
        queryFn: () => apiRequest<any>('/api-/_0001/user/chat-preferences'),
    });

    const updateProfile = useMutation({
        mutationFn: () => apiRequest('/api/settings/profile', { method: 'PUT', json: { name, email } }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
        },
    });

    const resetPrefs = useMutation({
        mutationFn: () => apiRequest('/api-/_0001/user/chat-preferences/reset', { method: 'POST', json: {} }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'chat-preferences'] });
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        updateProfile.mutate();
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <form className="space-y-4 rounded-3xl border border-border/70 bg-background p-6" onSubmit={onSubmit}>
                <h1 className="text-2xl font-semibold">Profile</h1>
                <input className="w-full rounded-2xl border border-border bg-card px-4 py-3" onChange={(e) => setName(e.target.value)} placeholder="Name" value={name} />
                <input className="w-full rounded-2xl border border-border bg-card px-4 py-3" onChange={(e) => setEmail(e.target.value)} placeholder="Email" value={email} />
                <Button type="submit">{updateProfile.isPending ? 'Saving...' : 'Save profile'}</Button>
            </form>
            <div className="space-y-4 rounded-3xl border border-border/70 bg-background p-6">
                <h2 className="text-2xl font-semibold">Chat preferences</h2>
                <pre className="overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                    {JSON.stringify(prefs.data?.preferences ?? {}, null, 2)}
                </pre>
                <Button onClick={() => resetPrefs.mutate()} variant="outline">
                    Reset preferences
                </Button>
            </div>
        </div>
    );
}
