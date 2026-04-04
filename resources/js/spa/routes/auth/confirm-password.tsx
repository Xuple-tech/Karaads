import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/spa/components/AuthLayout';
import { ApiError, apiRequest } from '@/spa/lib/api';

export function Component() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mutation = useMutation({
        mutationFn: () => apiRequest('/api/session/confirm-password', { method: 'POST', json: { password } }),
        onError: (mutationError) => {
            setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to confirm password.');
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        mutation.mutate();
    };

    return (
        <AuthLayout title="Confirm your password" description="This action requires password confirmation">
            <form className="space-y-4" onSubmit={onSubmit}>
                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                <Button
                    type="submit"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Confirming…
                        </>
                    ) : (
                        'Confirm password'
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
