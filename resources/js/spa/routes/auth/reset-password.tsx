import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const navigate = useNavigate();
    const { token = '' } = useParams();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        email: searchParams.get('email') ?? '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: () => apiRequest('/api/session/reset-password', { method: 'POST', json: { ...form, token } }),
        onSuccess: () => navigate('/login'),
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to reset password.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    return (
        <AuthLayout title="Set a new password" description="Choose a strong, secure password">
            <form className="space-y-4" onSubmit={onSubmit}>
                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        readOnly
                        onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="h-10 rounded-lg text-sm opacity-60"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                            placeholder="••••••••"
                            className="h-10 rounded-lg pr-10 text-sm"
                            disabled={mutation.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm((c) => ({ ...c, password_confirmation: e.target.value }))}
                            placeholder="••••••••"
                            className="h-10 rounded-lg pr-10 text-sm"
                            disabled={mutation.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <>
                            <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" />
                            Saving…
                        </>
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
