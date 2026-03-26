import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
};

type SharedProps = {
    console: {
        base_url: string;
    };
};

export default function ConsoleLogin({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const page = usePage<SharedProps>();
    const baseUrl = page.props.console.base_url;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`${baseUrl}/login`, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Developer Console" description="Sign in to manage API keys, billing, models, and usage.">
            <Head title="Developer Console Login" />

            {status && <div className="rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</div>}

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="pl-10" required />
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {canResetPassword && <TextLink href="/forgot-password">Forgot password?</TextLink>}
                    </div>
                    <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="pr-10 pl-10"
                            required
                        />
                        <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-500" onClick={() => setShowPassword((value) => !value)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox id="remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked as boolean)} />
                    <Label htmlFor="remember">Remember this console session</Label>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Sign in
                </Button>

                <div className="text-center text-sm text-stone-600">
                    Need an account? <TextLink href="/register">Create one</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
