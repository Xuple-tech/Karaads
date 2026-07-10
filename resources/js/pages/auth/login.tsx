import GoogleSignInButton from '@/components/google-sign-in-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@/components/page-head';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [emailValue, setEmailValue] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const statusMessage = useMemo(() => {
        const value = searchParams.get('status') || status;
        if (!value) return null;

        if (value === 'password-reset') {
            return 'Your password has been reset. Sign in with your new password.';
        }

        if (value === 'account-activated') {
            return 'Your account is ready. Sign in to continue.';
        }

        return value;
    }, [searchParams, status]);

    const isSetupRequired = (value: unknown) =>
        value === 'ACCOUNT_SETUP_REQUIRED' ||
        (Array.isArray(value) && value.includes('ACCOUNT_SETUP_REQUIRED'));

    const persistEmail = (value: string) => {
        const email = value.trim();
        if (email && email.includes('@')) {
            localStorage.setItem('karaads_last_email', email);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            description="Sign in to continue to your social network"
        >
            <Head title="Log in" />

            <div className="space-y-6">
                {statusMessage && (
                    <div className="rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {statusMessage}
                    </div>
                )}

                {/* Google Sign In Button */}
                {/* <GoogleSignInButton /> */}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                            Or sign in with email or phone
                        </span>
                    </div>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-5"
                    onError={(errors: Record<string, unknown>) => {
                        if (isSetupRequired(errors?.email) && emailValue) {
                            persistEmail(emailValue);
                            navigate('/auth/me/confirm/v0', {
                                state: { email: emailValue, autoSendCode: true },
                            });
                        }
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                    >
                                        Email or Phone Number
                                    </Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="email"
                                        required
                                        autoFocus
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="email"
                                        placeholder="you@example.com or +1234567890"
                                        value={emailValue}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEmailValue(value);
                                            persistEmail(value);
                                        }}
                                    />
                                    <InputError
                                        message={
                                            isSetupRequired(errors.email)
                                                ? undefined
                                                : errors.email
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {rememberMe ? (
                                            <input type="hidden" name="remember" value="on" />
                                        ) : null}
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked === true)}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm text-gray-600 dark:text-gray-400"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:from-blue-700 hover:to-purple-700"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    Sign In
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Sign up
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
