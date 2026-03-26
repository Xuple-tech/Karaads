import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Globe, SquarePenIcon } from 'lucide-react';
// No need for useState here anymore, useLang provides it
// import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLang } from '@/hooks/use-lang';
export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    // This useLang now gets the shared state from context
    const { lang, changeLanguage } = useLang();
    return (
        <header className="border-sidebar-border/50 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 rounded-t-[inherit] border-b bg-background/80 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border" />
                <Link href="/new" prefetch>
                    <Button variant="ghost" title="New chat" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <SquarePenIcon size={16} />
                    </Button>
                </Link>
                <div className="ms-auto flex items-center gap-2">
                    <Select
                        onValueChange={(e) => {
                            changeLanguage(e);
                        }}
                        defaultValue={lang}
                    >
                        <SelectTrigger className="h-8 gap-1.5 border-0 bg-transparent px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-0">
                            <Globe className="h-3.5 w-3.5" />
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="ENGLISH">English</SelectItem>
                            <SelectItem value="HAUSA">Hausa</SelectItem>
                            <SelectItem value="IGBO">Igbo</SelectItem>
                            <SelectItem value="YORUBA">Yoruba</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </header>
    );
}
