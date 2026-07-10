import { Button } from '@/components/ui/button';
import { Head, Link } from '@/components/page-head';
import axiosInstance from '@/lib/axios';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';

export default function AccountDeletionRequest() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post('/delete-account', { email });

            if (response.status >= 200 && response.status < 300) {
                setSubmitted(true);
                setEmail('');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Delete Account" />

            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Delete Account</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-2xl px-4 py-8">
                {submitted ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
                        <div className="flex gap-4">
                            <Check className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                            <div>
                                <h2 className="font-bold text-green-900 dark:text-green-100">
                                    Confirmation Email Sent
                                </h2>
                                <p className="mt-2 text-sm text-green-800 dark:text-green-200">
                                    We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the confirmation link to delete your account.
                                </p>
                                <p className="mt-4 text-xs text-green-700 dark:text-green-300">
                                    The confirmation link will expire in 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <p className="font-semibold">This action cannot be undone</p>
                                    <p className="mt-1">
                                        Deleting your account will permanently remove your profile, posts, messages, and all associated data from Shoplace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Request Account Deletion</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        A confirmation email will be sent to this address
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {loading ? 'Sending...' : 'Send Confirmation Email'}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <h3 className="font-semibold text-foreground">What happens next:</h3>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>We'll send you a confirmation email</li>
                                <li>Click the link in the email to confirm deletion</li>
                                <li>You'll need to enter your password to verify</li>
                                <li>Your account and all data will be permanently deleted</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                            <p className="font-semibold">Already have a confirmation email?</p>
                            <p className="text-muted-foreground">
                                If you already received a confirmation email, simply click the link in it and enter your password to complete the deletion.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
