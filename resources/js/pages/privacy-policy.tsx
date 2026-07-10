import { Head } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Privacy Policy" />

            <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">Privacy Policy</h1>
                        <p className="text-xs text-muted-foreground">Last updated: February 20, 2026</p>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 text-sm leading-7 text-muted-foreground">
                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">1. Overview</h2>
                    <p>
                        Karaads collects and processes account and activity data to provide social features, messaging,
                        safety controls, and platform security.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">2. Data We Collect</h2>
                    <ul className="list-disc space-y-1 pl-6">
                        <li>Account details: name, username, email, phone, profile photo.</li>
                        <li>Content details: posts, captions, media uploads, comments, and interactions.</li>
                        <li>Messaging details: conversation metadata and message content between participants.</li>
                        <li>Security details: sign-in history, device/browser information, and abuse-prevention signals.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">3. How We Use Data</h2>
                    <ul className="list-disc space-y-1 pl-6">
                        <li>Operate feeds, profiles, messaging, and media processing.</li>
                        <li>Apply privacy and safety settings like message permissions and block/unblock controls.</li>
                        <li>Detect abuse, spam, fraud, and policy violations.</li>
                        <li>Improve feature quality, reliability, and performance.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">4. Privacy Controls</h2>
                    <p>You can control who can message you and the default visibility of new posts in settings.</p>
                    <p>When you block someone, messaging is restricted and visibility between both accounts is limited.</p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">5. Retention and Security</h2>
                    <p>
                        We retain data only as long as needed for product operation, legal requirements, and safety
                        enforcement. We apply technical and organizational safeguards, but no system is fully risk-free.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-semibold text-foreground">6. Contact</h2>
                    <p>For privacy requests, contact: privacy@karaads.com</p>
                </section>
            </main>
        </div>
    );
}

