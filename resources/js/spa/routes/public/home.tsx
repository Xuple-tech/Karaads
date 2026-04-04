import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const { data } = useSessionQuery();

    return (
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-6 py-16">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-primary">User SPA</p>
                    <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                        User pages now run as a React Router app on top of Laravel APIs.
                    </h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">
                        Chat, billing, auth, settings, and the rest of the user surface now boot from a dedicated SPA shell.
                        Admin, SaaS owner, and staff remain on Inertia.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg">
                            <Link to={data?.authenticated ? '/app' : '/login'}>{data?.authenticated ? 'Open chat' : 'Sign in'}</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link to="/pricing">See pricing</Link>
                        </Button>
                    </div>
                </div>
                <div className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-card to-background p-6 shadow-2xl">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Architecture split</p>
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <p className="font-medium">User Runtime</p>
                            <p className="text-sm text-muted-foreground">React Router, TanStack Query, session-backed JSON endpoints.</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <p className="font-medium">Backoffice Runtime</p>
                            <p className="text-sm text-muted-foreground">Existing Inertia app for `/admin`, `/saas-owner`, and `/staff`.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
