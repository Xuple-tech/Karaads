import { Button } from '@/components/ui/button';
import { Head, Link } from '@/components/page-head';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AccountDeletionInfo() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Account Deletion" />

            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Account Deletion</h1>
                        <p className="text-sm text-muted-foreground">
                            Learn about account deletion on Shoplace
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold">Account Deletion</h2>
                        <p className="text-muted-foreground">
                            Shoplace allows you to delete your account at any time. This page
                            explains what happens when you delete your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Before You Delete</h2>
                        <p className="text-muted-foreground">
                            Deleting your account is permanent and cannot be undone. Please
                            review the following information before proceeding:
                        </p>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="font-semibold mb-2">
                                    ⚠️ What happens when you delete your account
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    <li>
                                        Your profile, username, and all personal information
                                        will be permanently deleted
                                    </li>
                                    <li>
                                        All posts, comments, and content you created will be
                                        removed
                                    </li>
                                    <li>
                                        Your messages and conversations will be deleted
                                    </li>
                                    <li>
                                        Your follower and following lists will be cleared
                                    </li>
                                    <li>
                                        Any ads you have created will be removed
                                    </li>
                                    <li>
                                        Your wallet balance will be forfeited
                                    </li>
                                    <li>
                                        All associated transaction history will be deleted
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">How to Delete Your Account</h2>
                        <p className="text-muted-foreground">
                            If you have a Shoplace account, you can delete it through your
                            account settings:
                        </p>

                        <div className="mt-4 rounded-lg border border-border bg-card p-4">
                            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                                <li>Log in to your Shoplace account</li>
                                <li>Go to Settings</li>
                                <li>Select "Account settings"</li>
                                <li>
                                    Scroll to the "Delete Account" section
                                </li>
                                <li>
                                    Click "Delete My Account" and follow the prompts
                                </li>
                                <li>
                                    Confirm your password to complete the deletion
                                </li>
                            </ol>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">
                            Frequently Asked Questions
                        </h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">
                                    Can I recover my account after deletion?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    No. Once your account is deleted, it cannot be recovered.
                                    All data is permanently removed from our servers.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    What happens to my username?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Your username will become available for other users to
                                    claim after your account is deleted.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    Will my posts remain visible?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    No. All posts, comments, and content associated with your
                                    account will be permanently deleted and no longer visible
                                    on the platform.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    What about my messages?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    All your messages and conversations will be deleted. This
                                    will also affect your conversation partners, who will see
                                    those messages removed.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    Will my wallet balance be refunded?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    No. Any remaining balance in your wallet will be forfeited
                                    upon account deletion and cannot be refunded.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    Is there a waiting period before deletion?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    No. Your account will be deleted immediately upon
                                    confirmation. There is no grace period or waiting time.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    Can I delete my account if I owe money?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    You may still delete your account. However, any unpaid
                                    balances or outstanding obligations will remain the
                                    responsibility of the account holder.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">
                                    How long does deletion take?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Your account is deleted immediately. You will be logged out
                                    and will not be able to log back in.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Data Privacy</h2>
                        <p className="text-muted-foreground">
                            When you delete your account, we permanently remove your personal
                            data from our systems in accordance with applicable privacy laws.
                            For more information about how we handle your data, please review
                            our{' '}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold">Need Help?</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have questions about account deletion or need assistance,
                            please contact our support team. We're here to help.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <Button variant="outline">Contact Support</Button>
                            <Link href="/delete-account">
                                <Button className="bg-red-600 hover:bg-red-700 text-white">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete My Account
                                </Button>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
