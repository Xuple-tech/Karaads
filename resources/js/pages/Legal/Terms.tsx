import { Head } from '@inertiajs/react';

type TermsProps = {
    title?: string;
    description?: string;
    effectiveDate?: string;
};

export default function Terms({ title, description, effectiveDate }: TermsProps) {
    return (
        <>
            <Head title={title ?? 'Terms of Service'} />

            <main className="mx-auto max-w-4xl px-6 py-12">
                <h1 className="text-4xl font-semibold tracking-tight">{title ?? 'Terms of Service'}</h1>
                <p className="mt-4 text-muted-foreground">
                    {description ?? 'These terms govern your use of the chat and billing services provided by KwatiAI.'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Effective date: {effectiveDate ?? '2024'}
                </p>

                <section className="mt-10 space-y-6 text-sm leading-7 text-foreground">
                    <p>Use the service lawfully, protect your account credentials, and avoid abusive or harmful activity.</p>
                    <p>Billing, renewals, cancellations, and refunds are governed by the subscription terms shown at checkout.</p>
                    <p>Service availability, limits, and features may change as the product evolves.</p>
                </section>
            </main>
        </>
    );
}
