import { Link, usePage } from '@inertiajs/react';
import {
  BookOpen,
  Code2,
  FileCode,
  Home,
  KeyRound,
  Monitor,
  Moon,
  ScrollText,
  Sun,
  Shield,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect } from 'react';

type SharedProps = {
  auth: {
    user?: { name?: string | null } | null;
  };
  console: {
    base_url: string;
    docs_base_url: string;
  };
};

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage<SharedProps>();
  const docsBaseUrl = props.console.docs_base_url;
  const consoleBaseUrl = props.console.base_url;

  const groups = [
    {
      title: 'Overview',
      items: [
        { label: 'Documentation Home', href: docsBaseUrl, icon: Home },
      ],
    },
    {
      title: 'Agents',
      items: [
        { label: 'Overview', href: `${docsBaseUrl}/agents`, icon: BookOpen },
        { label: 'Widget', href: `${docsBaseUrl}/agents/widget`, icon: Code2 },
        { label: 'Configuration', href: `${docsBaseUrl}/agents/configuration`, icon: Shield },
        { label: 'Templates', href: `${docsBaseUrl}/agents/templates`, icon: FileCode },
        { label: 'Knowledge Base', href: `${docsBaseUrl}/agents/knowledge-base`, icon: ScrollText },
        { label: 'Tools', href: `${docsBaseUrl}/agents/tools`, icon: KeyRound },
      ],
    },
    {
      title: 'API / LLM',
      items: [
        { label: 'Overview', href: `${docsBaseUrl}/api`, icon: BookOpen },
        { label: 'Authentication', href: `${docsBaseUrl}/api/authentication`, icon: Shield },
        { label: 'API Keys', href: `${docsBaseUrl}/api/keys`, icon: KeyRound },
        { label: 'Models', href: `${docsBaseUrl}/api/models`, icon: Code2 },
        { label: 'Chat Completions', href: `${docsBaseUrl}/api/chat-completions`, icon: FileCode },
        { label: 'Streaming', href: `${docsBaseUrl}/api/streaming`, icon: ScrollText },
        { label: 'Usage', href: `${docsBaseUrl}/api/usage`, icon: BookOpen },
        { label: 'Errors', href: `${docsBaseUrl}/api/errors`, icon: Shield },
        { label: 'Pricing', href: `${docsBaseUrl}/api/pricing`, icon: KeyRound },
        { label: 'Reference', href: `${docsBaseUrl}/api/reference`, icon: FileCode },
      ],
    }, 
  ];

  // Helper to get user initials
  const getUserInitials = () => {
    if (!props.auth.user?.name) return '?';
    return props.auth.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  const {appearance} = useAppearance();
    function updateAppearance(theme: string) {
        theme = (theme == 'light') ? 'buz-light' : (theme === 'dark' ? 'buz-dark' : 'buz-light');
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
      if(appearance === 'system'){
        updateAppearance('buz-light');
      }
      else{
          updateAppearance('buz-light');
      }
    },[appearance])

  return (
    <SidebarProvider defaultOpen={true}>
      {/* <div className="flex min-h-screen w-full"> */}
        <Sidebar collapsible="icon" variant="inset">
          <SidebarContent>
            <SidebarHeader className='s'>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kwati Ai Docs
              </div>
            </SidebarHeader>

            {groups.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {props.auth.user?.name || 'Guest'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {props.auth.user
                      ? 'Signed in'
                      : 'Public reference'}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Shield className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {props.auth.user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={consoleBaseUrl}>Open Console</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Sign out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`${consoleBaseUrl}/login`}>Sign in</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`${consoleBaseUrl}/register`}>Create account</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => updateAppearance('light')}
                  className={`h-7 w-7 ${appearance === 'light' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                  title="Light"
                >
                  <Sun className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => updateAppearance('dark')}
                  className={`h-7 w-7 ${appearance === 'dark' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                  title="Dark"
                >
                  <Moon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => updateAppearance('system')}
                  className={`h-7 w-7 ${appearance === 'system' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                  title="System"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={consoleBaseUrl}>Open Console</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`${docsBaseUrl}/api`}>API Docs</Link>
              </Button>
            </div>
          </div>

          <div className="px-6 py-8 lg:px-12">
            <div className="mx-auto max-w-5xl">{children}</div>
          </div>
        </SidebarInset>
      {/* </div> */}
    </SidebarProvider>
  );
}