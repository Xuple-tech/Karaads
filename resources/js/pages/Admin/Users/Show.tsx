import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Check, X, Calendar, Mail, User, Gift, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface Referral {
  id: string;
  name: string;
  email: string;
  joined_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  email_verified_at: string | null;
  google_id: string | null;
  avatar: string | null;
  language: string | null;
  referral_code: string | null;
  referred_by_name: string | null;
  referred_by_email: string | null;
  referrals: Referral[];
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  user: User;
}

export default function Show({ user }: ShowProps) {
  return (
    <AdminLayout>
      <Head title={`User Details - ${user.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('admin.users.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">
                User details and information.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={route('admin.users.edit', user.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
        </div>

        {/* User Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-sm">{user.name}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <Badge variant={user.is_admin ? "default" : "secondary"} className="mt-1">
                  {user.is_admin ? 'Administrator' : 'Regular User'}
                </Badge>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email Verification</Label>
                <div className="mt-1">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="text-sm font-mono">{user.id}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm">{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="text-sm">{new Date(user.updated_at).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Google Account</Label>
                <p className="text-sm">
                  {user.google_id ? (
                    <Badge variant="outline">Linked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not Linked</Badge>
                  )}
                </p>
              </div>
              {user.language && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Language</Label>
                    <p className="text-sm">{user.language}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Avatar */}
        {user.avatar && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Profile picture from Google account
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Referral Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Referral Code</Label>
                <p className="mt-1 font-mono text-sm tracking-wider">
                  {user.referral_code ?? '—'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Referred By</Label>
                {user.referred_by_name ? (
                  <div className="mt-1">
                    <p className="text-sm font-medium">{user.referred_by_name}</p>
                    <p className="text-xs text-muted-foreground">{user.referred_by_email}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Direct sign-up</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  People Referred ({user.referrals.length})
                </Label>
              </div>

              {user.referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No referrals yet.</p>
              ) : (
                <div className="divide-y rounded-md border">
                  {user.referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{referral.name}</p>
                        <p className="text-xs text-muted-foreground">{referral.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{referral.joined_at}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}