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
        <header className="border-sidebar-border/50 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 rounded-t-[inherit] border-b px-6 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Link href="/new" prefetch>
                    <Button variant="ghost" title="New chat" size="icon" className="h-8 w-8 p-0">
                        <SquarePenIcon size={24} />
                    </Button>
                </Link>
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
                <div className="ms-auto">
                    <Select
                        onValueChange={(e) => {
                            changeLanguage(e);
                        }}
                        defaultValue={lang}
                    >
                        <SelectTrigger>
                            <Globe className='me-2'/>
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ENGLISH">
                                English
                            </SelectItem>
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
