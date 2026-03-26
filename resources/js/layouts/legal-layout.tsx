// @/layouts/legal-layout.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import docs from '@/routes/docs';
import { Link } from '@inertiajs/react';
import { Calendar, Download, Home, Mail } from 'lucide-react';

interface LegalLayoutProps {
    children: React.ReactNode;
    title: string;
    lastUpdated: string;
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
    const legalNavItems = [
        { label: 'Privacy Policy', href: docs.legal.privacy_policy.url()},
        { label: 'Terms of Service', href: docs.legal.terms.url()},

        { label: 'Developer Docs', href: '/docs'},
        
    ];

    return (
        <div className="from-background to-secondary/5 min-h-screen bg-gradient-to-b">
            <div className="container mx-auto max-w-6xl px-4 py-12">
                {/* Breadcrumb & Navigation */}
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-1/4">
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <Link href="/new">
                                    <Button variant="ghost" className="mb-6 gap-2">
                                        <Home className="h-4 w-4" />
                                        Home
                                    </Button>
                                </Link>

                                <div className="bg-card rounded-xl border p-6">
                                    <h3 className="mb-4 font-semibold">Legal Documents</h3>
                                    <nav className="space-y-2">
                                        {legalNavItems.map((item) => (
                                            <Button
                                                key={item.href}
                                                variant="ghost"
                                                className={`w-full justify-start ${title === item.label ? 'bg-secondary' : ''}`}
                                                asChild
                                            >
                                                <Link href={item.href}>{item.label}</Link>
                                            </Button>
                                        ))}
                                    </nav>

                                    <Separator className="my-6" />

                                    <div className="space-y-4">
                                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            Last Updated: {lastUpdated}
                                        </div>

                                   
                                        <Button variant="ghost" className="w-full gap-2" asChild>
                                            <a href="mailto:legal@kwaitiai.com">
                                                <Mail className="h-4 w-4" />
                                                Contact Legal
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-3/4">
                        <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                            <div className="from-primary/5 to-primary/10 border-b bg-gradient-to-r p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Badge variant="secondary" className="mb-4">
                                            Legal Document
                                        </Badge>
                                        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                                        <p className="text-muted-foreground mt-2">Effective Date: {lastUpdated}</p>
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="h-[calc(100vh-200px)]">
                                <div className="p-8">
                                    <div className="prose prose-lg dark:prose-invert max-w-none">{children}</div>
                                </div>
                            </ScrollArea>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
