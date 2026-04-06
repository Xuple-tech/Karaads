export function Component() {
    return (
        <section className="mx-auto max-w-3xl px-6 py-16 space-y-10">
            <div className="space-y-3 border-b border-border/40 pb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
                <p className="text-muted-foreground leading-relaxed">
                    This policy explains how Kwati AI handles your data across chat, voice, and billing services.
                </p>
                <p className="text-xs text-muted-foreground/60">Last updated: April 4, 2026</p>
            </div>

            <div className="space-y-8">
                {[
                    {
                        title: 'What we collect',
                        body: 'We collect account details, chat and voice conversation content, billing and subscription records, device and session metadata, and support requests required to operate the service.',
                    },
                    {
                        title: 'How data is used',
                        body: 'Data is used to deliver chat and voice features, maintain account security, enforce billing limits, process subscription payments, and improve reliability and abuse prevention.',
                    },
                    {
                        title: 'Sharing and retention',
                        body: 'Payment data is processed through billing providers. Technical infrastructure providers may process limited operational data on our behalf. We retain data for as long as needed to run the service, meet legal obligations, and resolve disputes.',
                    },
                    {
                        title: 'Your controls',
                        body: 'You can update profile information, manage subscriptions, reset personalization settings, and contact support about deletion or correction requests.',
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
