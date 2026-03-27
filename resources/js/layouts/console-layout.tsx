import { Link, usePage } from '@inertiajs/react';
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Home,
  KeyRound,
  Layers3,
  LogOut,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect } from 'react';

type ConsolePageProps = {
  auth: {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  };
  console: {
    base_url: string;
    docs_base_url: string;
  };
};

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

type ConsoleLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  items: NavItem[];
  actions?: React.ReactNode;
};

export default function ConsoleLayout({
  children,
  title,
  subtitle,
  items,
  actions,
}: ConsoleLayoutProps) {
  const { props } = usePage<ConsolePageProps>();
  const user = props.auth.user;
  const docsBaseUrl = props.console.docs_base_url.replace(/\/+$/, '');

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const {appearance} = useAppearance();
  function updateAppearance(theme: string) {
    document.documentElement.setAttribute('class', theme);
    localStorage.setItem('console', theme);
  }
  useEffect(()=>{
    if(appearance === 'dark'){
      updateAppearance('buz-dark');
    }
    if(appearance === 'light'){
      updateAppearance('buz-light');
    }
  },[appearance])
    return (
    <SidebarProvider defaultOpen={true}>
      {/* <div className=""> */}
        <Sidebar variant="inset" collapsible="icon">
          <SidebarContent>
            {/* Branding */}
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                  <span className="text-xs font-bold text-background">K</span>
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Kwati
                </span>
              </div>
            </div>

            {/* Navigation */}
            <SidebarGroup className="px-2 py-3">
              <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Navigation
              </SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.key}>
                      {item.href ? (
                        <SidebarMenuButton
                          asChild
                          isActive={item.active}
                          tooltip={item.label}
                          className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-foreground"
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={item.active}
                          tooltip={item.label}
                          onClick={item.onClick}
                          className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-foreground"
                        >
                          <button type="button">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* User footer */}
          <SidebarFooter className="border-t border-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent focus:outline-none"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.name || 'Console user'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email || 'Signed in'}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{user?.name || 'Console user'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/console/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/console/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/console/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2 text-destructive-foreground focus:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex flex-1 items-center justify-end gap-2">
              {actions}
              <Button variant="outline" size="sm" asChild>
                <Link href={docsBaseUrl}>
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  Docs
                </Link>
              </Button>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-5xl">
              <header className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Console
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </header>
              {children}
            </div>
          </div>
        </SidebarInset>
      {/* </div> */}
    </SidebarProvider>
  );
}

export const consoleNavIcons = {
  overview: Home,
  keys: KeyRound,
  usage: BarChart3,
  billing: CreditCard,
  models: Layers3,
  docs: BookOpen,
};
