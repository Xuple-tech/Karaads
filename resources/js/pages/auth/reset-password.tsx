import { update } from '@/routes/password';
import { Form, Head } from '@/components/page-head';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Lock } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

function getErrorMessage(value: unknown): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value)) {
        const firstMessage = value.find((entry) => typeof entry === 'string');
        return typeof firstMessage === 'string' ? firstMessage : undefined;
    }

    return undefined;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <AuthLayout
            title="Reset Your Password"
            description="Enter a new password to secure your account."
        >
            <Head title="Reset password" />

            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                        <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <Form
                    {...update.form()}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    onSuccess={() => {
                        window.location.href = '/login?status=password-reset';
                    }}
                >
                    {({ processing, errors }) => {
                        const resetLinkError =
                            getErrorMessage(errors.email) ||
                            getErrorMessage(errors.token);

                        return (
                            <div className="space-y-5">
                                {resetLinkError && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                                    >
                                        {resetLinkError}
                                    </div>
                                )}

                                <div className="hidden space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="h-11 rounded-lg border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                        autoComplete="email"
                                        value={email}
                                        readOnly
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="new-password"
                                        autoFocus
                                        placeholder="********"
                                    />
                                    <InputError
                                        message={getErrorMessage(errors.password)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-medium"
                                    >
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="new-password"
                                        placeholder="********"
                                    />
                                    <InputError
                                        message={getErrorMessage(
                                            errors.password_confirmation,
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-lg bg-linear-to-r from-primary to-accent text-white hover:from-blue-700 hover:to-purple-700"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    Update Password
                                </Button>
                            </div>
                        );
                    }}
                </Form>
            </div>
        </AuthLayout>
    );
}
