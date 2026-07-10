import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@/components/page-head';
import { Shield } from 'lucide-react';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm Password"
            description="Secure area - please confirm your password"
        >
            <Head title="Confirm password" />

            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                        <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <Form {...store.form()} resetOnSuccess={['password']}>
                    {({ processing, errors }) => (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="h-11 rounded-lg border-gray-300 dark:border-gray-700"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    autoFocus
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                className="h-11 w-full rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2 h-4 w-4" />}
                                Confirm & Continue
                            </Button>
                        </div>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}