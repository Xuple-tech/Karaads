import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import user from '@/routes/user';

interface Site {
  id: number;
  name: string;
  domain: string | null;
  url: string;
  site_type: string;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  active_subscription?: {
    plan: {
      name: string;
    };
  };
}

interface SitesIndexProps {
  sites: {
    data: Site[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function SitesIndex() {
  const { props } = usePage<{ props: SitesIndexProps }>();
  const { sites } = props;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <Head title="Sites" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
            <p className="text-muted-foreground">
              Manage your websites and applications
            </p>
          </div>
          <Link href="/ai-agents/sites/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Site
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Sites
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {sites.total || 0}
                  </h3>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Sites
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {sites.data.filter(s => s.is_active).length}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verified Sites
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {sites.data.filter(s => s.verified_at).length}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Sites</CardTitle>
            <CardDescription>
              All websites and applications connected to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.data.length > 0 ? (
                  sites.data.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded">
                            <Globe className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{site.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {site.domain || site.url}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {site.site_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={site.is_active ? 'default' : 'secondary'}
                          >
                            {site.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {site.verified_at ? (
                            <Badge variant="outline" className="bg-green-900">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-900">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {site.active_subscription?.plan.name || 'Free Plan'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(site.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={user.sites.show.url(site.id)}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            </Link>
                            <Link href={user.sites.edit.url(site.id)}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <Link
                              href={user.sites.agents.url(site.id)}
                            >
                              <DropdownMenuItem>
                                <Globe className="mr-2 h-4 w-4" />
                                Agents
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No sites yet</p>
                        <Link href="/agents/sites/create">
                          <Button variant="outline" size="sm" className="mt-3">
                            Create First Site
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {sites.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={sites.current_page}
                  totalPages={sites.last_page}
                  onPageChange={(page) => {
                    window.location.href = `/agents/sites?page=${page}`;
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}