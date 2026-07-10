import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@/components/page-head';
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AccountDeletion() {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { data, setData, delete: destroy, processing, errors } = useForm({
        password: '',
    });

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        destroy('/settings/profile', {
            onSuccess: () => {
                // Redirect handled by Laravel
            },
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Delete Account" />

            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Delete Account</h1>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your Shoplace account
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="space-y-6">
                    {/* Warning Section */}
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <div className="flex gap-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
                            <div className="space-y-2">
                                <h2 className="font-semibold text-destructive">
                                    Warning: This action cannot be undone
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Deleting your account will permanently remove all your data, including:
                                </p>
                                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                                    <li>Your profile and all personal information</li>
                                    <li>All your posts and comments</li>
                                    <li>Your messages and conversations</li>
                                    <li>Your followers and following list</li>
                                    <li>Your ads and any associated data</li>
                                    <li>Your wallet balance and transaction history</li>
                                </ul>
                                <p className="pt-2 text-sm text-muted-foreground">
                                    This action is <strong>permanent</strong> and cannot be reversed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Section */}
                    {!showConfirmation ? (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <h3 className="font-semibold mb-2">Ready to delete your account?</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Before proceeding, make sure you have backed up any important data.
                                    Once deleted, your account cannot be recovered.
                                </p>
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={() => setShowConfirmation(true)}
                                    className="w-full"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete My Account
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleDelete} className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-4">
                                        Confirm account deletion
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        To confirm the deletion of your account, please enter your password:
                                    </p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData('password', e.target.value)
                                            }
                                            disabled={processing}
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setData('password', '');
                                        }}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing || !data.password}
                                        className="flex-1"
                                    >
                                        {processing
                                            ? 'Deleting...'
                                            : 'Permanently Delete Account'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* FAQ Section */}
                    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                        <h3 className="font-semibold">Frequently Asked Questions</h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    Can I recover my account after deletion?
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    No, account deletion is permanent. All data will be
                                    immediately removed from our servers.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    What happens to my username?
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Your username will be available for other users to claim
                                    after your account is deleted.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    Will my posts and comments be deleted?
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Yes, all your posts, comments, and associated content will
                                    be permanently deleted.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    What about my wallet balance?
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Any remaining balance in your wallet will be forfeited upon
                                    account deletion.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-1">
                                    Is there a waiting period?
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    No, your account will be deleted immediately upon confirmation.
                                    There is no grace period.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h3 className="font-semibold mb-2">Need help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            If you have questions or concerns before deleting your account,
                            please contact our support team. We're here to help.
                        </p>
                        <Button variant="outline" className="w-full">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
