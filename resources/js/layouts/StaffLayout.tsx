import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Heart, Zap, AlertCircle, Lock, Settings, LogOut } from 'lucide-react';
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

interface StaffLayoutProps {
    children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
    const { auth } = usePage().props;

    const links = [
        { name: 'Monitoring', icon: LayoutDashboard, route: route('staff.monitoring') },
        { name: 'System Health', icon: Heart, route: route('staff.health') },
        { name: 'API Performance', icon: Zap, route: route('staff.api-performance') },
        { name: 'Error Logs', icon: AlertCircle, route: route('staff.logs') },
        { name: 'Security Logs', icon: Lock, route: route('staff.security-logs') },
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
                        <h1 className="text-lg font-semibold">Tech Staff Dashboard</h1>
                        {auth?.user?.email && (
                            <span className="ml-auto text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                                TECH_STAFF
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

export default StaffLayout;
