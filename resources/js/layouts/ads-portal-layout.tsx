import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Menu, Moon, Plus, Sun, LayoutGrid, CreditCard, BarChart3, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useAppearance } from '@/hooks/use-appearance'
import { adsPortalPath } from '@/pages/ads-portal/paths'

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const items = [
    { label: 'Campaigns', href: adsPortalPath('/'), icon: LayoutGrid },
    { label: 'Create Campaign', href: adsPortalPath('/create'), icon: Plus },
    { label: 'Analytics', href: adsPortalPath('/'), icon: BarChart3 },
    { label: 'Billing', href: adsPortalPath('/'), icon: CreditCard },
  ]

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.label === 'Campaigns' && pathname === '/')
        const Icon = item.icon
        return (
          <RouterLink
            key={`${item.label}-${item.href}`}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </RouterLink>
        )
      })}
    </nav>
  )
}

export default function AdsPortalLayout({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const { resolvedAppearance: theme, updateAppearance } = useAppearance()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = auth?.user

  return (
    <div className={cn(theme === 'dark' ? 'dark' : '', 'min-h-screen bg-background text-foreground')}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_40%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_38%)]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/70 bg-card/85 backdrop-blur lg:block">
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 rounded-2xl border border-border bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Karaads</p>
              <h1 className="mt-2 text-lg font-semibold">Ads Manager</h1>
              <p className="mt-1 text-xs text-muted-foreground">Professional campaign workspace</p>
            </div>
            <SidebarNav />
            <div className="mt-auto rounded-2xl border border-border bg-background/80 p-3">
              <p className="text-xs text-muted-foreground">Need the social app?</p>
              <RouterLink to="/app" className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                <ChevronLeft className="h-4 w-4" />
                Back to app
              </RouterLink>
            </div>
          </div>
        </aside>

        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/75 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:pl-[17.5rem] lg:pr-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Manager</p>
                <p className="text-sm font-semibold">Campaign Console</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => updateAppearance(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
              <RouterLink to={adsPortalPath('/create')}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Campaign</span>
                </Button>
              </RouterLink>
              <div className="ml-1 hidden items-center gap-2 rounded-full border border-border bg-card px-2 py-1 sm:flex">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="max-w-[140px]">
                  <p className="truncate text-xs font-medium">{user?.name ?? 'User'}</p>
                  <p className="truncate text-[11px] text-muted-foreground">@{user?.username ?? 'account'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-5 lg:pl-[17.5rem] lg:pr-6">
          <main className="mx-auto max-w-7xl">{children}</main>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className={cn(theme === 'dark' ? 'dark' : '', 'w-[85%] bg-card')}>
            <SheetHeader className="border-b border-border">
              <SheetTitle>Ads Manager</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
