import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye, Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: boolean;
  referral_code: string | null;
  referrals_count: number;
  referred_by_name: string | null;
  referred_by_email: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UsersIndexProps {
  users: {
    data: User[];
    links: any[];
    // meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    // };
  };
  filters: {
    search?: string;
    is_admin?: string;
  };
}

export default function Index({ users, filters }: UsersIndexProps) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search || '');
  const [adminFilter, setAdminFilter] = useState(filters.is_admin || '');

  const handleSearch = () => {
    router.get(route('admin.users.index'), {
      search: search || undefined,
      is_admin: adminFilter || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      router.delete(route('admin.users.destroy', userId), {
        preserveState: true,
      });
    }
  };

  return (
    <AdminLayout>
      <Head title="Users Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, permissions, and access.
            </p>
          </div>
          <Button asChild>
            <Link href={route('admin.users.create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Link>
          </Button>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-800">{flash.success}</div>
          </div>
        )}
        {flash?.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{flash.error}</div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={adminFilter || 'all'} onValueChange={(value) => setAdminFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Admin Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="1">Admins</SelectItem>
                  <SelectItem value="0">Regular Users</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                        {user.role ?? 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tracking-wider text-muted-foreground">
                        {user.referral_code ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{user.referrals_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.referred_by_name ? (
                        <div>
                          <p className="text-sm font-medium leading-none">{user.referred_by_name}</p>
                          <p className="text-xs text-muted-foreground">{user.referred_by_email}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email_verified_at ? (
                        <Badge variant="outline" className="text-green-600">
                          <Check className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          <X className="mr-1 h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={route('admin.users.show', user.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={route('admin.users.edit', user.id)}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {users.last_page > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={users.links.prev ? `${users.links.prev}&search=${search}&is_admin=${adminFilter}` : undefined}
                        className={users.links.prev ? '' : 'pointer-events-none opacity-50'}
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from({ length: users.last_page }, (_, i) => i + 1)
                      .filter(page => {
                        const current = users.current_page;
                        return page === 1 || page === users.last_page || (page >= current - 1 && page <= current + 1);
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href={`${route('admin.users.index')}?page=${page}&search=${search}&is_admin=${adminFilter}`}
                              isActive={page === users.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        href={users.links.next ? `${users.links.next}&search=${search}&is_admin=${adminFilter}` : undefined}
                        className={users.links.next ? '' : 'pointer-events-none opacity-50'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
