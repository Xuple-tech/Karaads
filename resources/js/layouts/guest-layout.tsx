import { LanguageProvider } from "@/hooks/use-lang";
import { SidebarHeader, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import AppLayout from "./app-layout";
function GuestLayout({ children }) {
    const { auth } = usePage().props;
    if (auth.user) {
        return <AppLayout>{children}</AppLayout>
    }
    return (<>
        <SidebarProvider >
            <SidebarInset>
                <SidebarHeader>
                    <div className="flex gap-2 items-center">
                        <Button asChild variant={'outline'}>
                            <Link href="/login">
                                Login
                            </Link>

                        </Button>
                        <Button asChild >
                            <Link href="/register">
                                Get Started
                            </Link>

                        </Button>
                    </div>
                </SidebarHeader>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </SidebarInset>
        </SidebarProvider>
    </>);
}

export default GuestLayout;
