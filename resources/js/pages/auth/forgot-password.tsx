import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@/components/page-head';
import { LoaderCircle, Mail } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(
        status
            ? {
                  type: 'success',
                  text: status,
              }
            : null,
    );

    return (
        <AuthLayout
            title="Reset Your Password"
            description="Enter your email to receive a reset link"
        >
            <Head title="Forgot password" />

            {feedback && (
                <div
                    className={`mb-6 rounded-lg p-4 text-center text-sm font-medium ${
                        feedback.type === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                >
                    {feedback.text}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                        <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <Form
                    {...email.form()}
                    onSuccess={(result: Record<string, unknown>) => {
                        setFeedback({
                            type: 'success',
                            text:
                                typeof result?.status === 'string' &&
                                result.status.trim() !== ''
                                    ? result.status
                                    : 'Password reset link sent. Check your email.',
                        });
                    }}
                    onError={(errors: Record<string, unknown>) => {
                        const emailError = errors?.email;
                        const firstError =
                            typeof emailError === 'string'
                                ? emailError
                                : Array.isArray(emailError) &&
                                    typeof emailError[0] === 'string'
                                  ? emailError[0]
                                  : null;

                        setFeedback({
                            type: 'error',
                            text:
                                firstError ??
                                'We could not send a reset link right now. Please try again.',
                        });
                    }}
                >
                    {({ processing, errors }) => (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="you@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                className="h-11 w-full rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:from-blue-700 hover:to-purple-700"
                                disabled={processing}
                            >
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Send Reset Link
                            </Button>
                        </div>
                    )}
                </Form>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <span>Remember your password? </span>
                    <TextLink
                        href={login()}
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        Back to login
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
