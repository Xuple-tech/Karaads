import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Inbox, 
  Filter,
  ChevronRight,
  Globe,
  Server,
  Key,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';

interface EmailAccount {
  id: number;
  provider: string;
  email_address: string;
  is_active: boolean;
  last_synced_at: string | null;
  emails_count?: number;
}

interface EmailRule {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  priority: number;
}

interface Props {
  emailAccounts: EmailAccount[];
  emailRules: EmailRule[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Index({ emailAccounts, emailRules, user }: Props) {
  const [loading, setLoading] = useState(false);
  const [imapDialogOpen, setImapDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
  
  const [syncOptions, setSyncOptions] = useState({
    limit: '50',
    since: ''
  });
  
  const [imapForm, setImapForm] = useState({
    email: '',
    password: '',
    host: '',
    port: '993',
    encryption: 'ssl'
  });

  // Connection handlers
  const handleConnectGmail = () => window.location.href = '/emails/connect/gmail';
  const handleConnectOutlook = () => window.location.href = '/emails/connect/outlook';

  // API actions
  const handleSync = async (accountId: number, options = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/emails/accounts/${accountId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(options),
      });

      if (response.ok) {
        toast.success('Emails synced successfully');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Failed to sync emails');
      }
    } catch (error) {
      toast.error('Failed to sync emails');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId: number) => {
    if (!confirm('Disconnect this email account?')) return;

    try {
      const response = await fetch(`/api/emails/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        toast.success('Email account disconnected');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  const handleConnectImap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emails/accounts/imap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(imapForm),
      });

      if (response.ok) {
        toast.success('IMAP account connected');
        setImapDialogOpen(false);
        setImapForm({
          email: '', password: '', host: '', port: '993', encryption: 'ssl'
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    const providerIcons: Record<string, string> = {
      gmail: 'G',
      outlook: 'O',
      imap: 'I',
      yahoo: 'Y'
    };
    return providerIcons[provider.toLowerCase()] || provider.charAt(0).toUpperCase();
  };

  return (
    <>
      <Head title="Email Automation" />
      <AppLayout>
        <div className="min-h-screen bg--50">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text--900 mb-2">Email Automation</h1>
              <p className="text--500">Connect accounts and automate responses</p>
            </div>

            <div className="grid gap-8">
              {/* Accounts Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text--800">Connected Accounts</h2>
                  <span className="text-sm text--500">{emailAccounts.length} connected</span>
                </div>

                {emailAccounts.length === 0 ? (
                  <Card className="border-2 border-dashed border--200 bg-/50">
                    <CardContent className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg--100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text--400" />
                      </div>
                      <h3 className="text-lg font-medium text--700 mb-2">No email accounts</h3>
                      <p className="text--500 mb-6 max-w-sm mx-auto">
                        Connect your first email account to start automating responses
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          onClick={handleConnectGmail}
                          className="bg-white border hover:bg--50 text--700"
                          variant="outline"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Gmail
                        </Button>
                        <Button 
                          onClick={handleConnectOutlook}
                          className="bg-white border hover:bg--50 text--700"
                          variant="outline"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Outlook
                        </Button>
                        <Button 
                          onClick={() => setImapDialogOpen(true)}
                          className="bg-white border hover:bg--50 text--700"
                          variant="outline"
                        >
                          <Server className="h-4 w-4 mr-2" />
                          IMAP
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {emailAccounts.map((account) => (
                        <Card key={account.id} className="border hover:border--300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <span className="font-semibold text-blue-600">
                                    {getProviderIcon(account.provider)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium text--900">{account.email_address}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text--500 capitalize">{account.provider}</span>
                                    {account.is_active && (
                                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                      </Badge>
                                    )}
                                    {account.emails_count && (
                                      <span className="text-xs text--400">• {account.emails_count} emails</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.location.href = `/emails/accounts/${account.id}/emails`}
                                  title="View emails"
                                >
                                  <Inbox className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setSyncDialogOpen(true);
                                  }}
                                  title="Sync options"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  onClick={() => handleDisconnect(account.id)}
                                  title="Disconnect"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Add more accounts */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text--700 mb-3">Add another account</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleConnectGmail}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Gmail
                        </Button>
                        <Button
                          onClick={handleConnectOutlook}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Outlook
                        </Button>
                        <Button
                          onClick={() => setImapDialogOpen(true)}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          IMAP
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Rules Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text--800">Automation Rules</h2>
                    <p className="text-sm text--500 mt-1">Configure how emails are processed</p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/emails/rules'}
                    variant="ghost"
                    size="sm"
                    className="text--600 hover:text--900"
                  >
                    Manage
                    <ChevronRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>

                {emailRules.length === 0 ? (
                  <Card className="border border--200">
                    <CardContent className="py-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg--100 flex items-center justify-center">
                        <Filter className="h-6 w-6 text--400" />
                      </div>
                      <h3 className="text-lg font-medium text--700 mb-2">No rules configured</h3>
                      <p className="text--500 mb-4">Create rules to automate email processing</p>
                      <Button
                        onClick={() => window.location.href = '/emails/rules/new'}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Rule
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {emailRules.map((rule) => (
                      <Card key={rule.id} className="border hover:border--300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text--900">{rule.name}</h3>
                              {rule.description && (
                                <p className="text-sm text--500 mt-1">{rule.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {rule.is_active ? (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg--50 text--600">
                                    Inactive
                                  </Badge>
                                )}
                                <span className="text-xs text--400">Priority: {rule.priority}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text--500 hover:text--700"
                              onClick={() => window.location.href = `/emails/rules/${rule.id}`}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Sync Dialog */}
        <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="limit" className="text-sm font-medium">Number of emails</Label>
                <Input
                  id="limit"
                  type="number"
                  value={syncOptions.limit}
                  onChange={(e) => setSyncOptions({ ...syncOptions, limit: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="since" className="text-sm font-medium">Since date</Label>
                <Input
                  id="since"
                  type="datetime-local"
                  value={syncOptions.since}
                  onChange={(e) => setSyncOptions({ ...syncOptions, since: e.target.value })}
                  className="h-9"
                />
                <p className="text-xs text--500">Leave empty to sync all emails</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSyncDialogOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button 
                onClick={() => selectedAccount && handleSync(selectedAccount.id, syncOptions)}
                disabled={loading}
                className="h-9"
              >
                {loading ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* IMAP Dialog */}
        <Dialog open={imapDialogOpen} onOpenChange={setImapDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Connect IMAP Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={imapForm.email}
                  onChange={(e) => setImapForm({ ...imapForm, email: e.target.value })}
                  className="h-9"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={imapForm.password}
                  onChange={(e) => setImapForm({ ...imapForm, password: e.target.value })}
                  className="h-9"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host" className="text-sm font-medium flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5" />
                  IMAP Host
                </Label>
                <Input
                  id="host"
                  value={imapForm.host}
                  onChange={(e) => setImapForm({ ...imapForm, host: e.target.value })}
                  className="h-9"
                  placeholder="imap.example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-sm font-medium">Port</Label>
                  <Input
                    id="port"
                    value={imapForm.port}
                    onChange={(e) => setImapForm({ ...imapForm, port: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encryption" className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Encryption
                  </Label>
                  <Select value={imapForm.encryption} onValueChange={(value) => setImapForm({ ...imapForm, encryption: value })}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setImapDialogOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button onClick={handleConnectImap} disabled={loading} className="h-9">
                {loading ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </>
  );
}