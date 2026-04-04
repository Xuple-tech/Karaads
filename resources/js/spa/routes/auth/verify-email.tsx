import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';
import { useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();
    const resend = useMutation({
        mutationFn: () => apiRequest('/api/session/email/verification-notification', { method: 'POST', json: {} }),
    });

    return (
        <section className="mx-auto max-w-xl space-y-6 px-6 py-16">
            <h1 className="text-3xl font-semibold">Verify your email</h1>
            <p className="text-muted-foreground">
                Signed in as {session.data?.user?.email}. Use the button below to resend the verification email.
            </p>
            <Button onClick={() => resend.mutate()}>{resend.isPending ? 'Sending...' : 'Resend verification email'}</Button>
        </section>
    );
}
