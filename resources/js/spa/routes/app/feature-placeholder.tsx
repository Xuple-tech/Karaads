import { Blocks, Mail, Mic2, RadioTower, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const featureMap = [
    { match: '/mails', title: 'Mail Workspace', description: 'Your email workflow is now routed through the SPA shell and can be rebuilt here without touching the admin Inertia stack.', icon: Mail },
    { match: '/emails', title: 'Email Automation', description: 'Email-facing user tools belong in the SPA now. This screen keeps the route live while the feature set is being reattached.', icon: Mail },
    { match: '/meta', title: 'Meta Workspace', description: 'Meta-related user flows now sit under the React Router user runtime instead of mixed page rendering.', icon: RadioTower },
    { match: '/studio', title: 'Studio', description: 'Studio and media tools can be restored incrementally inside the user SPA without affecting backoffice routes.', icon: Blocks },
    { match: '/podcast', title: 'Podcast', description: 'Podcast routes remain under the user SPA shell and are ready for their dedicated UI to be reattached.', icon: Mic2 },
];

export function Component() {
    const location = useLocation();

    const feature = useMemo(() => {
        return featureMap.find((item) => location.pathname.startsWith(item.match)) ?? {
            title: 'User Workspace',
            description: 'This route is now controlled by React Router and ready for the original user interface to be reattached.',
            icon: Sparkles,
        };
    }, [location.pathname]);

    const Icon = feature.icon;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="space-y-3">
                <Badge className="rounded-full px-4 py-1.5">
                    <Icon className="mr-2 h-4 w-4" />
                    User SPA
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight">{feature.title}</h1>
                <p className="max-w-2xl text-muted-foreground">{feature.description}</p>
            </div>

            <Card className="rounded-3xl border-border/70">
                <CardHeader>
                    <CardTitle>Route status</CardTitle>
                    <CardDescription>The user route boundary is already migrated. Only the feature UI remains to be filled in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Current path</p>
                        <p className="mt-2 font-mono text-sm">{location.pathname}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link to="/new">Back to chat</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/user/settings">Settings</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/subscription">Billing</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
