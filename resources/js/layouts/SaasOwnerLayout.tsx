import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, FileText, BarChart3, CreditCard, Settings, LogOut } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import AppLogoIcon from '@/components/app-logo-icon';

interface SaasOwnerLayoutProps {
    children: React.ReactNode;
}

const SaasOwnerLayout: React.FC<SaasOwnerLayoutProps> = ({ children }) => {
    const { auth } = usePage().props;

    const links = [
        { name: 'Dashboard', icon: LayoutDashboard, route: route('saas-owner.dashboard') },
        { name: 'Team Members', icon: Users, route: route('saas-owner.team-members.index') },
        { name: 'Custom Prompts', icon: FileText, route: route('saas-owner.prompts.index') },
        { name: 'Analytics', icon: BarChart3, route: route('saas-owner.analytics') },
        { name: 'Billing', icon: CreditCard, route: route('saas-owner.billing') },
        { name: 'Settings', icon: Settings, route: route('saas-owner.settings') },
    ];

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="">
                    <Link href="/" className="">
                        <AppLogoIcon />
                        <span>Kwati AI</span>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="p-2 space-y-2">
                    <SidebarMenu>
                        {links.map((link) => {
                            return (
                                <SidebarMenuItem key={link.name}>
                                    <SidebarMenuButton asChild>
                                        <Link href={link.route}>
                                            <link.icon className="h-4 w-4" />
                                            <span>{link.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarContent>

                <div className="mt-auto p-2 border-t">
                    <SidebarMenu>
                        <SidebarMenuItem key={'logout'}>
                            <SidebarMenuButton asChild>
                                <Link href={route('logout')} method="post" as="button">
                                    <LogOut className="h-4 w-4" />
                                    <span>Log Out</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </Sidebar>

            <SidebarInset className="">
                <SidebarHeader className="p-3 sticky top-0 bg-sidebar">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="text-lg font-semibold">SaaS Owner Dashboard</h1>
                        {auth?.user?.email && (
                            <span className="ml-auto text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                SAAS_OWNER
                            </span>
                        )}
                    </div>
                </SidebarHeader>

                <main className="p-4 space-y-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SaasOwnerLayout;
