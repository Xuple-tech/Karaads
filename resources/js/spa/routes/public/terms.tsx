export function Component() {
    return (
        <section className="mx-auto max-w-3xl px-6 py-16 space-y-10">
            <div className="space-y-3 border-b border-border/40 pb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Service</h1>
                <p className="text-muted-foreground leading-relaxed">
                    These terms govern your use of Kwati AI chat, voice, billing, and related services.
                </p>
                <p className="text-xs text-muted-foreground/60">Effective date: April 4, 2026</p>
            </div>

            <div className="space-y-8">
                {[
                    {
                        title: 'Acceptable use',
                        body: 'You must use the service lawfully, avoid abusive or harmful activity, and keep account credentials secure. Misuse may result in suspension or termination.',
                    },
                    {
                        title: 'Subscriptions and payments',
                        body: 'Paid plans, renewals, cancellations, refunds, and usage limits are governed by the subscription details shown at checkout and inside the billing area.',
                    },
                    {
                        title: 'Service changes',
                        body: 'Features, limits, supported models, and interfaces may change over time. We may suspend access for abuse, fraud, unpaid balances, or legal reasons.',
                    },
                    {
                        title: 'Liability and support',
                        body: 'The service is provided on an evolving basis. To the maximum extent permitted by law, liability is limited and support obligations are defined by the active plan and applicable law.',
                    },
                ].map(({ title, body }) => (
                    <div key={title}>
                        <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground leading-7">{body}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
