import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Terminal,
  Key,
  Activity,
  TrendingUp,
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  match: (url: string) => boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/developer-api',
    icon: LayoutDashboard,
    match: (url) => url === '/developer-api' || url === '/developer-api/',
  },
  {
    label: 'API Keys',
    href: '/developer-api/keys',
    icon: Key,
    match: (url) => url.startsWith('/developer-api/keys'),
  },
  {
    label: 'Usage',
    href: '/developer-api/usage',
    icon: Activity,
    match: (url) => url.startsWith('/developer-api/usage'),
  },
  {
    label: 'Billing',
    href: '/developer-api/billing',
    icon: TrendingUp,
    match: (url) => url.startsWith('/developer-api/billing'),
    badge: 'New',
  },
  {
    label: 'Quickstart',
    href: '/developer-api/quickstart',
    icon: BookOpen,
    match: (url) => url.startsWith('/developer-api/quickstart'),
  },
];

interface Props {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

function DeveloperSidebarContent({ url, navigate }: { url: string; navigate: (href: string) => void }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <>
      <SidebarHeader className="border-b px-3 py-4">
        <div className={cn(
          "flex items-center gap-2 transition-all",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold leading-tight">Kwati API</h2>
              <p className="text-xs text-muted-foreground">Developer Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.href)}
                    isActive={item.match(url)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && !isCollapsed && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                DU
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Developer User</p>
              <p className="text-xs text-muted-foreground truncate">developer@example.com</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      DU
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="right" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Developer User</p>
                    <p className="text-xs text-muted-foreground">developer@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </>
  );
}

export default function DeveloperPortalLayout({ title, description, children }: Props) {
  const { auth } = usePage<SharedData>().props;
  const { url } = usePage();

  function logout() {
    router.post('/developer-api/logout');
  }

  function navigate(href: string) {
    router.visit(href);
  }

  const userInitials = auth?.user?.email
    ?.split('@')[0]
    .split('.')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DU';

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar variant="inset" collapsible="icon">
          <DeveloperSidebarContent url={url} navigate={navigate} />
        </Sidebar>

        <SidebarInset className="overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{title || 'Developer Portal'}</h1>
                {description && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{auth?.user?.name || 'Developer'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{auth?.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Key className="mr-2 h-4 w-4" />
                      Manage API Keys
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}