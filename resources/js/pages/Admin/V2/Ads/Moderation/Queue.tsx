import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Campaign { id: string; name: string; status: string; }
interface Creative { id: string; title: string; status: string; campaign?: { id: string; name: string; status: string } | null }
interface PaymentReport {
  total_paid_amount: number;
  total_payment_count: number;
  pending_payment_count: number;
  funded_campaign_count: number;
  active_campaign_count: number;
  in_review_campaign_count: number;
  paid_creative_count: number;
  active_creative_count: number;
  total_budget: number;
  total_spent: number;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function ReportCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function Queue({ campaigns, creatives, mode = 'review', paymentReport = null }: { campaigns: { data: Campaign[] }; creatives: { data: Creative[] }; mode?: 'paid' | 'review'; paymentReport?: PaymentReport | null }) {
  const isPaidMode = mode === 'paid';
  const approveCampaign = (id: string) => router.post(`/admin/v2/ads/moderation/campaigns/${id}/approve`, {}, { preserveScroll: true });
  const rejectCampaign = (id: string) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (!reason || reason.trim().length < 3) return;
    router.post(`/admin/v2/ads/moderation/campaigns/${id}/reject`, { reason }, { preserveScroll: true });
  };

  const approveCreative = (id: string) => router.post(`/admin/v2/ads/moderation/creatives/${id}/approve`, {}, { preserveScroll: true });
  const rejectCreative = (id: string) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (!reason || reason.trim().length < 3) return;
    router.post(`/admin/v2/ads/moderation/creatives/${id}/reject`, { reason }, { preserveScroll: true });
  };

  return (
    <>
      <Head title={isPaidMode ? 'All Paid Ads' : 'V2 Moderation Queue'} />
      <AdminLayout>
        <div className="space-y-6">
          {isPaidMode && paymentReport ? (
            <Card>
              <CardHeader>
                <CardTitle>Paid Ads Payment Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <ReportCard label="Total paid" value={formatNaira(paymentReport.total_paid_amount)} hint={`${paymentReport.total_payment_count} successful payments`} />
                  <ReportCard label="Total budget" value={formatNaira(paymentReport.total_budget)} hint="Funded campaign budgets" />
                  <ReportCard label="Total spent" value={formatNaira(paymentReport.total_spent)} hint="Spend recorded on campaigns" />
                  <ReportCard label="Funded ads" value={paymentReport.funded_campaign_count} hint={`${paymentReport.active_campaign_count} active, ${paymentReport.in_review_campaign_count} in review`} />
                  <ReportCard label="Creatives" value={paymentReport.paid_creative_count} hint={`${paymentReport.active_creative_count} active creatives`} />
                </div>
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                  Pending or failed payment records: <strong>{paymentReport.pending_payment_count}</strong>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>{isPaidMode ? 'All Paid Campaigns' : 'Campaigns In Review'}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {campaigns.data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8">{isPaidMode ? 'No paid campaigns found' : 'No campaigns in review'}</TableCell></TableRow>}
                  {campaigns.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="xs" variant="outline" onClick={() => rejectCampaign(row.id)}>Reject</Button>
                        <Button size="xs" onClick={() => approveCampaign(row.id)}>Approve</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{isPaidMode ? 'All Paid Ad Creatives' : 'Creatives Pending Approval'}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {creatives.data.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8">{isPaidMode ? 'No paid creatives found' : 'No creatives pending approval'}</TableCell></TableRow>}
                  {creatives.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.campaign?.name || '—'}
                        {row.status === 'draft' && (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">campaign approved, creative needs review</span>
                        )}
                      </TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="xs" variant="outline" onClick={() => rejectCreative(row.id)}>Reject</Button>
                        <Button size="xs" onClick={() => approveCreative(row.id)}>Approve</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
