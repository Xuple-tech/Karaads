import { Head, Link } from '@inertiajs/react';
import {
  Activity,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  Eye,
  Megaphone,
  MousePointer,
  Wallet,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Summary = {
  campaigns_total: number;
  campaigns_active: number;
  campaigns_review: number;
  creatives_total: number;
  creatives_active: number;
  payments_total: number;
  payments_successful: number;
  payments_pending: number;
  wallet_balance: number;
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  paid_amount: number;
  billable_revenue: number;
  impressions: number;
  clicks: number;
  ctr: number;
};

type StatusRow = { status: string; total: number; budget: number; spent: number };
type DailyRow = { date: string; impressions: number; clicks: number; revenue: number };
type CampaignRow = {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget_total: number;
  spent: number;
  creatives_count: number;
  advertiser?: { name?: string | null; email?: string | null; username?: string | null } | null;
  created_at?: string | null;
};
type PaymentRow = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  provider?: string | null;
  created_at?: string | null;
  advertiser?: { name?: string | null; email?: string | null; username?: string | null } | null;
};

type Props = {
  summary: Summary;
  statusBreakdown: StatusRow[];
  dailyPerformance: DailyRow[];
  recentCampaigns: CampaignRow[];
  recentPayments: PaymentRow[];
};

const money = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const compact = (value: number) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const statusTone: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-200',
  in_review: 'bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-200',
  paused: 'bg-slate-500/15 text-slate-700 ring-slate-500/20 dark:text-slate-200',
  completed: 'bg-sky-500/15 text-sky-700 ring-sky-500/20 dark:text-sky-200',
  rejected: 'bg-rose-500/15 text-rose-700 ring-rose-500/20 dark:text-rose-200',
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Megaphone;
  tone: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-[28px] border p-5 shadow-sm', tone)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs font-semibold opacity-70">{hint}</p>
        </div>
        <div className="rounded-2xl bg-white/60 p-3 shadow-sm dark:bg-white/10">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1', statusTone[status] ?? 'bg-muted text-muted-foreground ring-border')}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export default function AdsDashboard({ summary, statusBreakdown, dailyPerformance, recentCampaigns, recentPayments }: Props) {
  const maxImpressions = Math.max(1, ...dailyPerformance.map((row) => row.impressions));
  const spendRate = summary.total_budget > 0 ? Math.min(100, Math.round((summary.total_spent / summary.total_budget) * 100)) : 0;

  return (
    <>
      <Head title="Ads Dashboard" />
      <AdminLayout>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),linear-gradient(135deg,#08111f,#111827)] dark:shadow-black/30">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-sky-700 dark:text-sky-200">
                  Karaads Ads Control
                </div>
                <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  Ads dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60">
                  Monitor paid campaigns, wallet funding, delivery performance, approvals, and ad spend from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                  <Link href="/admin/v2/ads/moderation/queue?paid=1">View paid ads</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/admin/v2/ads/finance/payments">Payments</Link>
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active campaigns" value={compact(summary.campaigns_active)} hint={`${compact(summary.campaigns_review)} waiting for review`} icon={Megaphone} tone="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-100" />
            <StatCard label="Paid funding" value={money(summary.paid_amount)} hint={`${compact(summary.payments_successful)} successful payments`} icon={CreditCard} tone="border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-100" />
            <StatCard label="Total spent" value={money(summary.total_spent)} hint={`${spendRate}% of campaign budget used`} icon={BadgeDollarSign} tone="border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-100" />
            <StatCard label="Wallet balance" value={money(summary.wallet_balance)} hint={`${money(summary.remaining_budget)} budget remaining`} icon={Wallet} tone="border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-100" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
            <Card className="overflow-hidden border-slate-200/70 shadow-sm dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>14-day delivery</CardTitle>
                  <p className="text-sm text-muted-foreground">Impressions, clicks, and billable revenue.</p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  CTR {summary.ctr}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                    <Eye className="h-5 w-5 text-sky-500" />
                    <p className="mt-3 text-2xl font-black">{compact(summary.impressions)}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Impressions</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                    <MousePointer className="h-5 w-5 text-emerald-500" />
                    <p className="mt-3 text-2xl font-black">{compact(summary.clicks)}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Clicks</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <p className="mt-3 text-2xl font-black">{money(summary.billable_revenue)}</p>
                    <p className="text-xs font-semibold text-muted-foreground">Billable revenue</p>
                  </div>
                </div>
                <div className="mt-6 flex h-52 items-end gap-2 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
                  {dailyPerformance.map((row) => (
                    <div key={row.date} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                      <div className="relative flex h-36 w-full items-end rounded-full bg-slate-100 dark:bg-white/5">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-sky-600 to-cyan-300"
                          style={{ height: `${Math.max(4, (row.impressions / maxImpressions) * 100)}%` }}
                        />
                      </div>
                      <span className="truncate text-[10px] font-bold text-muted-foreground">{new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 shadow-sm dark:border-white/10">
              <CardHeader>
                <CardTitle>Status mix</CardTitle>
                <p className="text-sm text-muted-foreground">Campaign count by current state.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusBreakdown.length ? statusBreakdown.map((row) => (
                  <div key={row.status} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={row.status} />
                      <span className="text-lg font-black">{compact(row.total)}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-slate-950 dark:bg-white" style={{ width: `${Math.min(100, (row.spent / Math.max(1, row.budget)) * 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{money(row.spent)} spent of {money(row.budget)}</p>
                  </div>
                )) : (
                  <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No campaign statuses yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-slate-200/70 shadow-sm dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent campaigns</CardTitle>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/admin/v2/ads/moderation/queue?paid=1">
                    Open all <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCampaigns.length ? recentCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <p className="font-bold">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.advertiser?.name || campaign.advertiser?.email || 'Unknown advertiser'} • {campaign.creatives_count} creatives</p>
                        </TableCell>
                        <TableCell><StatusBadge status={campaign.status} /></TableCell>
                        <TableCell>{money(campaign.budget_total)}</TableCell>
                        <TableCell>{money(campaign.spent)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No campaigns yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 shadow-sm dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent payments</CardTitle>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/admin/v2/ads/finance/payments">
                    View payments <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Advertiser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Provider</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.length ? recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <p className="font-bold">{payment.advertiser?.name || payment.advertiser?.email || 'Unknown advertiser'}</p>
                          <p className="max-w-[220px] truncate text-xs text-muted-foreground">{payment.reference}</p>
                        </TableCell>
                        <TableCell><StatusBadge status={payment.status} /></TableCell>
                        <TableCell>{money(payment.amount)}</TableCell>
                        <TableCell className="text-xs font-bold uppercase text-muted-foreground">{payment.provider || 'paystack'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No ad payments yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
