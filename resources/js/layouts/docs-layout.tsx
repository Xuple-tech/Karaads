import { PageContentExplainer } from '@/components/page-content-explainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, Code2, FileCode, Home, Monitor, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function DocsLayout({ children }: { children: React.ReactNode }) {
    const { appearance, updateAppearance } = useAppearance();
    const [theme, setTheme] = useState<Theme>(appearance || 'system');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Apply theme based on user preference
    useEffect(() => {
        const applyTheme = (selectedTheme: Theme) => {
            let actualTheme = selectedTheme;

            // If theme is 'system', check prefers-color-scheme
            if (selectedTheme === 'system') {
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                actualTheme = mq.matches ? 'dark' : 'light';
            }

            // Update document class
            document.documentElement.className = `dev-docs-theme-${actualTheme}`;

            // Also update data-theme attribute for shadcn
            document.documentElement.setAttribute('data-theme', actualTheme);
        };

        applyTheme(theme);

        // Only listen for system changes if theme is 'system'
        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');

            const handleSystemChange = () => {
                applyTheme('system');
            };

            mq.addEventListener('change', handleSystemChange);
            return () => mq.removeEventListener('change', handleSystemChange);
        }
    }, [theme]);

    // Sync with appearance from useAppearance hook
    useEffect(() => {
        if (appearance) {
            setTheme(appearance as Theme);
        }
    }, [appearance]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        updateAppearance(newTheme);
    };

    const navItems = [
        { icon: Home, label: 'Home', href: '/docs' },
        // { icon: BookOpen, label: 'Introduction', href: '/docs/introduction' },
        { icon: Code2, label: 'Quick Start', href: '/docs/agents' },
        { icon: BookOpen, label: 'Knowledge Base', href: '/docs/agents/knowledge-base' },
        { icon: FileCode, label: 'Tools', href: '/docs/agents/tools' },
        // { icon: Settings, label: 'Configuration', href: '/docs/configuration' },
        // { icon: Globe, label: 'Deployment', href: '/docs/deployment' },
    ];

    const ThemeSwitcher = () => (
        <TooltipProvider>
            <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleThemeChange('light')}
                            className={cn('h-8 w-8', theme === 'light' && 'bg-background text-foreground shadow-sm')}
                            aria-label="Light mode"
                        >
                            <Sun className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Light</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleThemeChange('dark')}
                            className={cn('h-8 w-8', theme === 'dark' && 'bg-background text-foreground shadow-sm')}
                            aria-label="Dark mode"
                        >
                            <Moon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Dark</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleThemeChange('system')}
                            className={cn('h-8 w-8', theme === 'system' && 'bg-background text-foreground shadow-sm')}
                            aria-label="System preference"
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>System</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );

    return (
        <SidebarProvider>
            <Sidebar variant="inset" collapsible="offcanvas">
                <SidebarHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                                <span className="text-primary-foreground font-bold">AI</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Kwati AI</h1>
                                <p className="text-muted-foreground text-xs">Documentation</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="hidden md:inline-flex">
                            v1.2.0
                        </Badge>
                    </div>
                </SidebarHeader>

                <div className="px-4 py-3">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <input
                            type="search"
                            placeholder="Search documentation..."
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border py-2 pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                    </div>
                </div>

                <SidebarContent>
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                        <nav className="space-y-1 p-2">
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground w-full justify-start gap-3"
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </ScrollArea>
                </SidebarContent>

                <SidebarFooter className="border-t p-4">
                    <div className="space-y-4">
                        <div>
                            <p className="text-foreground mb-2 text-sm font-medium">Theme Preferences</p>
                            <ThemeSwitcher />
                            <p className="text-muted-foreground mt-2 text-xs">
                                Current: <span className="font-medium">{theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}</span>
                            </p>
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>

            {/* Main Content */}
            <SidebarInset>
                {/* Top Bar */}
                <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
                    <div className="flex h-16 items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-2 md:flex">
                                <span className="text-muted-foreground text-sm">Theme:</span>
                                <ThemeSwitcher />
                            </div>
                            <Button variant="outline" size="sm" className="hidden md:inline-flex">
                                GitHub
                            </Button>
                            <Button size="sm" className="hidden md:inline-flex">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4">
                    <div className="prose prose-lg dark:prose-invert max-w-none">{children}</div>
                </main>

                {/* Footer */}
                <footer className="mt-12 border-t px-6 py-3">
                    <div className="max-w4xl container mx-auto">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                                    <span className="text-primary-foreground text-lg font-bold">AI</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Kwati AI</h3>
                                    <p className="text-muted-foreground text-sm">Intelligent solutions for everyone</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/docs/legal/privacy-policy">Privacy</a>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="/docs/legal/terms">Terms</a>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href="mailto:support@kwatiai.com">Contact</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </footer>
            </SidebarInset>

            {/* Page Content Explainer Agent */}
            <PageContentExplainer />
        </SidebarProvider>
    );
}
