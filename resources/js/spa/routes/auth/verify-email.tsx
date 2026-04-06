import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/spa/components/AuthLayout';
import { apiRequest } from '@/spa/lib/api';
import { useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();
    const resend = useMutation({
        mutationFn: () => apiRequest('/api/session/email/verification-notification', { method: 'POST', json: {} }),
    });

    return (
        <AuthLayout title="Verify your email" description="One more step before you get started">
            <div className="space-y-5">
                {resend.isSuccess && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        A new verification link has been sent to your inbox.
                    </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed">
                    We sent a verification link to{' '}
                    <span className="font-medium text-foreground">{session.data?.user?.email}</span>.
                    Check your inbox and click the link to activate your account.
                </p>

                <Button
                    className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={resend.isPending}
                    onClick={() => resend.mutate()}
                >
                    {resend.isPending ? (
                        <>
                            <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" />
                            Sending…
                        </>
                    ) : (
                        'Resend verification email'
                    )}
                </Button>
            </div>
        </AuthLayout>
    );
}
