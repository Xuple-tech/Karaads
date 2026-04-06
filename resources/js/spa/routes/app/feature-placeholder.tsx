import { Blocks, Mail, Mic2, RadioTower, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const featureMap = [
    { match: '/mails', title: 'Mail Workspace', description: 'Your email workflow lives here.', icon: Mail },
    { match: '/emails', title: 'Email Automation', description: 'Email automation tools for your account.', icon: Mail },
    { match: '/meta', title: 'Meta Workspace', description: 'Meta-related integrations and tools.', icon: RadioTower },
    { match: '/studio', title: 'Studio', description: 'Studio and media tools.', icon: Blocks },
    { match: '/podcast', title: 'Podcast', description: 'Podcast generation and library.', icon: Mic2 },
];

export function Component() {
    const location = useLocation();

    const feature = useMemo(() => {
        return featureMap.find((item) => location.pathname.startsWith(item.match)) ?? {
            title: 'Coming soon',
            description: 'This feature is on its way.',
            icon: Sparkles,
        };
    }, [location.pathname]);

    const Icon = feature.icon;

    return (
        <div className="mx-auto max-w-xl flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{feature.title}</h1>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">{feature.description}</p>
            </div>

            <div className="flex items-center gap-2">
                <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to="/new">Back to chat</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Link to="/user/settings">Settings</Link>
                </Button>
            </div>
        </div>
    );
}
