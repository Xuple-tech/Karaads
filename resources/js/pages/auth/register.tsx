import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, usePage } from '@/components/page-head';

import GoogleSignInButton from '@/components/google-sign-in-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterPageProps {
    referral_code?: string;
    [key: string]: unknown;
}

export default function Register() {
    const { referral_code } = usePage<RegisterPageProps>().props;
    return (
        <AuthLayout
            title="Join SocialConnect"
            description="Connect with friends and the world around you"
        >
            <Head title="Register" />

            <div className="space-y-6">
                {/* Google Sign Up Button */}
                {/* <GoogleSignInButton /> */}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                            Or continue with email or phone
                        </span>
                    </div>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium"
                                    >
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="name"
                                        name="name"
                                        placeholder="John Doe"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>

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
                                        required
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="email"
                                        name="email"
                                        placeholder="you@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-medium"
                                    >
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="tel"
                                        name="phone"
                                        placeholder="+1234567890"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-medium"
                                    >
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                {/* Hidden referral code field */}
                                {referral_code && (
                                    <input
                                        type="hidden"
                                        name="referral_code"
                                        value={referral_code}
                                    />
                                )}

                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:from-blue-700 hover:to-purple-700"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    Create Account
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <TextLink
                                    href={login()}
                                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Sign in
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
