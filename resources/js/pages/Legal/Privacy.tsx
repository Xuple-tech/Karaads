import { Head } from '@inertiajs/react';

type PrivacyProps = {
    title?: string;
    description?: string;
    lastUpdated?: string;
};

export default function Privacy({ title, description, lastUpdated }: PrivacyProps) {
    return (
        <>
            <Head title={title ?? 'Privacy Policy'} />

            <main className="mx-auto max-w-4xl px-6 py-12">
                <h1 className="text-4xl font-semibold tracking-tight">{title ?? 'Privacy Policy'}</h1>
                <p className="mt-4 text-muted-foreground">
                    {description ?? 'This policy explains how KwatiAI handles account, chat, and billing data.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Last updated: {lastUpdated ?? '2024'}
                </p>

                <section className="mt-10 space-y-6 text-sm leading-7 text-foreground">
                    <p>We store account, conversation, and payment-related data needed to operate the service.</p>
                    <p>We use that information to provide chat history, secure accounts, process billing, and improve reliability.</p>
                    <p>You can contact support for questions about retention, corrections, or account deletion.</p>
                </section>
            </main>
        </>
    );
}
