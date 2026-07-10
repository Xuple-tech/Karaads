import { Button } from '@/components/ui/button';
import { Head } from '@/components/page-head';
import axiosInstance from '@/lib/axios';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmAccountDeletionProps {
    token: string;
}

export default function ConfirmAccountDeletion({ token }: ConfirmAccountDeletionProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axiosInstance.post(`/delete-account/${token}`, { password });
        } catch (err) {
            const message = (err as any)?.response?.data?.message || 'An error occurred. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <Head title="Confirm Account Deletion" />

            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Confirm Account Deletion</h1>
                    <p className="mt-2 text-muted-foreground">
                        Enter your password to permanently delete your account
                    </p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="text-sm text-red-800 dark:text-red-200">
                            <p className="font-semibold">This action is permanent</p>
                            <p className="mt-1">
                                All your data will be deleted and cannot be recovered.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? 'Deleting...' : 'Delete Account Permanently'}
                    </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                    You will be logged out after your account is deleted.
                </p>
            </div>
        </div>
    );
}
