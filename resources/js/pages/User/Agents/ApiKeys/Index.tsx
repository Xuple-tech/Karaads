import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Key,
  MoreVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Calendar,
} from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
}

interface ApiKey {
  id: number;
  name: string;
  api_key: string;
  secret_key: string;
  permissions: string[];
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiKeysIndexProps {
  agent: AIAgent;
  apiKeys: {
    data: ApiKey[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function ApiKeysIndex() {
  const { props } = usePage<{ props: ApiKeysIndexProps }>();
  const { agent, apiKeys } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<number | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const handleToggleActive = (apiKeyId: number, currentStatus: boolean) => {
    router.post(`/ai-agents/agents/${agent.id}/api-keys/${apiKeyId}/toggle-active`, {
      _method: 'post',
    });
  };

  const handleRegenerate = (apiKeyId: number) => {
    setRegeneratingKey(apiKeyId);
    router.post(`/ai-agents/agents/${agent.id}/api-keys/${apiKeyId}/regenerate`, {
      _method: 'post',
    });
  };

  const handleDelete = (apiKeyId: number) => {
    router.delete(`/ai-agents/agents/${agent.id}/api-keys/${apiKeyId}`);
    setShowDeleteDialog(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Layout>
      <Head title={`API Keys - ${agent.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              API Keys for {agent.name}
            </h1>
            <p className="text-muted-foreground">
              Manage API keys for accessing {agent.name} programmatically
            </p>
          </div>
          <Link href={`/ai-agents/agents/${agent.id}/api-keys/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Keys
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {apiKeys.total || 0}
                  </h3>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Keys
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {apiKeys.data.filter(k => k.is_active).length}
                  </h3>
                </div>
                <Key className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expired Keys
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {apiKeys.data.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length}
                  </h3>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Never Used
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {apiKeys.data.filter(k => !k.last_used_at).length}
                  </h3>
                </div>
                <EyeOff className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              All API keys for accessing {agent.name}. Keep your keys secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.data.length > 0 ? (
                  apiKeys.data.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {apiKey.api_key.substring(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.api_key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={apiKey.is_active ? 'default' : 'secondary'}
                        >
                          {apiKey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apiKey.expires_at ? (
                          <span className={new Date(apiKey.expires_at) < new Date() ? 'text-red-600' : ''}>
                            {formatDate(apiKey.expires_at)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(apiKey.last_used_at)}
                      </TableCell>
                      <TableCell>
                        {formatDate(apiKey.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(apiKey.id, apiKey.is_active)}
                            title={apiKey.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {apiKey.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerate(apiKey.id)}
                            disabled={regeneratingKey === apiKey.id}
                            title="Regenerate"
                          >
                            <RefreshCw className={`h-4 w-4 ${regeneratingKey === apiKey.id ? 'animate-spin' : ''}`} />
                          </Button>
                          <AlertDialog
                            open={showDeleteDialog === apiKey.id}
                            onOpenChange={(open) =>
                              setShowDeleteDialog(open ? apiKey.id : null)
                            }
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete API Key?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the API key "{apiKey.name}".
                                  Any applications using this key will stop working.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(apiKey.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-center">
                        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No API keys yet</p>
                        <Link href={`/ai-agents/agents/${agent.id}/api-keys/create`}>
                          <Button variant="outline" size="sm" className="mt-3">
                            Create First API Key
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {apiKeys.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={apiKeys.current_page}
                  totalPages={apiKeys.last_page}
                  onPageChange={(page) => {
                    window.location.href = `/ai-agents/agents/${agent.id}/api-keys?page=${page}`;
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        {/* <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Security Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700 space-y-2">
            <p>• API keys grant access to your agent's functionality</p>
            <p>• Never share your API keys in client-side code or public repositories</p>
            <p>• Rotate keys regularly and delete unused ones</p>
            <p>• Use environment variables to store API keys in production</p>
            <p>• Monitor key usage and set appropriate expiration dates</p>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}