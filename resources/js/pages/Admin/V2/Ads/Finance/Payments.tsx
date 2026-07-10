import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  reference: string
  amount: string | number
  currency: string
  status: string
  provider: string
  fees?: string | number
  meta?: Record<string, unknown>
  created_at: string
}

export default function Payments({ payments, filters }: { payments: { data: Payment[]; links?: any[] }; filters: Record<string, string> }) {
  const status = filters?.status ?? ''

  const onStatusChange = (value: string) => {
    router.get('/admin/v2/ads/finance/payments', value ? { status: value } : {}, { preserveScroll: true })
  }

  const rows = useMemo(() => payments?.data ?? [], [payments])

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0
    return num.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })
  }

  const statusTone: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    successful: 'default',
    success: 'default',
    pending: 'secondary',
    failed: 'destructive',
  }

  const act = (paymentId: string, action: 'approve' | 'fail') => {
    const route = `/admin/v2/ads/finance/payments/${paymentId}/${action}`
    router.post(route, {}, { preserveScroll: true })
  }

  return (
    <>
      <Head title="V2 Payments" />
      <AdminLayout>
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Ad Payments</CardTitle>
              <p className="text-sm text-muted-foreground">Incoming funding attempts for advertiser wallets.</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                    <TableCell>
                      <Badge variant={statusTone[row.status] ?? 'outline'} className="capitalize">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(row.amount)}</TableCell>
                    <TableCell>{row.fees ? formatCurrency(row.fees) : '—'}</TableCell>
                    <TableCell className="uppercase text-xs text-muted-foreground">{row.provider || 'paystack'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {row.status === 'pending' && (
                        <>
                          <Button size="xs" variant="outline" onClick={() => act(row.id, 'fail')}>
                            Mark Failed
                          </Button>
                          <Button size="xs" onClick={() => act(row.id, 'approve')}>
                            Approve & Credit
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  )
}
