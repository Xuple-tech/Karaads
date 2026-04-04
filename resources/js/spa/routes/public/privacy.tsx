export function Component() {
    return (
        <section className="mx-auto max-w-4xl space-y-8 px-6 py-16">
            <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Privacy</p>
                <h1 className="text-4xl font-semibold">Privacy Policy</h1>
                <p className="text-lg text-muted-foreground">
                    This policy explains how KwatiAI handles account, chat, voice, and billing data across the restored user SPA.
                </p>
                <p className="text-sm text-muted-foreground">Last updated: April 4, 2026</p>
            </div>

            <div className="space-y-6 text-sm leading-7 text-foreground">
                <section>
                    <h2 className="text-lg font-semibold">What we collect</h2>
                    <p className="mt-2 text-muted-foreground">
                        We collect account details, chat and voice conversation content, billing and subscription records, device and session metadata, and support requests required to operate the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">How data is used</h2>
                    <p className="mt-2 text-muted-foreground">
                        Data is used to deliver chat and voice features, maintain account security, enforce billing limits, process subscription payments, and improve reliability and abuse prevention.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">Sharing and retention</h2>
                    <p className="mt-2 text-muted-foreground">
                        Payment data is processed through billing providers, and technical infrastructure providers may process limited operational data on our behalf. We retain data for as long as needed to run the service, meet legal obligations, and resolve disputes.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">Your controls</h2>
                    <p className="mt-2 text-muted-foreground">
                        You can update profile information, manage subscriptions, reset some personalization settings, and contact support about deletion or correction requests.
                    </p>
                </section>
            </div>
        </section>
    );
}
