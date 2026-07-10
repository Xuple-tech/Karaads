import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@/components/page-head';
import { LogOut, MailCheck } from 'lucide-react';
import { useState } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const [feedback, setFeedback] = useState<string | null>(
        status === 'verification-link-sent'
            ? 'A new verification link has been sent to your email.'
            : status || null,
    );

    return (
        <AuthLayout
            title="Verify Your Email"
            description="Check your inbox for the verification link"
        >
            <Head title="Email verification" />

            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                        <MailCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                {feedback && (
                    <div className="rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {feedback}
                    </div>
                )}

                <Form
                    {...send.form()}
                    className="space-y-5 text-center"
                    onSuccess={(result: Record<string, unknown>) => {
                        const resultStatus = result?.status;
                        if (resultStatus === 'verification-link-sent') {
                            setFeedback(
                                'A new verification link has been sent to your email.',
                            );
                            return;
                        }

                        setFeedback('Verification email sent successfully.');
                    }}
                >
                    {({ processing }) => (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please check your email and click the
                                verification link to continue.
                            </p>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                                <p className="font-medium">
                                    Next steps
                                </p>
                                <ol className="mt-2 list-decimal space-y-1 pl-5">
                                    <li>Verify your email address.</li>
                                    <li>Open the password reset email.</li>
                                    <li>Set your new password.</li>
                                    <li>Sign in with your new password.</li>
                                </ol>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Use resend only if you did not receive the
                                verification email yet.
                            </p>

                            <Button
                                className="h-11 w-full rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:from-blue-700 hover:to-purple-700"
                                disabled={processing}
                            >
                                {processing && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}
                                Resend Verification Email
                            </Button>

                            <TextLink
                                href={logout()}
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </TextLink>
                        </div>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
