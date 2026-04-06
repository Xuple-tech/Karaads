import { useMutation } from '@tanstack/react-query';
import { Mail } from 'lucide-react';

import AuthLayout from '@/spa/components/AuthLayout';
import { apiRequest } from '@/spa/lib/api';
import { useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();
    const resend = useMutation({
        mutationFn: () => apiRequest('/api/session/email/verification-notification', { method: 'POST', json: {} }),
    });

    return (
        <AuthLayout title="Check your email" description="We sent you a verification link">
            <div className="space-y-5">
                {/* Icon */}
                <div className="flex justify-center py-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] border border-[#383838]">
                        <Mail className="h-6 w-6 text-[#8b5cf6]" />
                    </div>
                </div>

                {resend.isSuccess && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-400 text-center">
                        A new link has been sent to your inbox.
                    </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    We sent a verification link to{' '}
                    <span className="font-medium text-foreground">{session.data?.user?.email}</span>.
                    Click the link in the email to activate your account.
                </p>

                <button
                    disabled={resend.isPending || resend.isSuccess}
                    onClick={() => resend.mutate()}
                    className="h-11 w-full rounded-xl bg-[#2a2a2a] border border-[#383838] text-sm font-medium text-foreground transition-colors hover:bg-[#333333] hover:border-[#484848] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resend.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
                            Sending…
                        </span>
                    ) : (
                        'Resend verification email'
                    )}
                </button>
            </div>
        </AuthLayout>
    );
}
