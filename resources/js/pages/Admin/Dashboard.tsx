import React from 'react';
import { Head } from '@inertiajs/react';
import { BarChart3, Users, MessageSquare, Image, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/AdminLayout';
import TrialAnalytics from '@/components/Admin/TrialAnalytics';

interface Stats {
  totalUsers: number;
  totalReferrals: number;
  totalConversations: number;
  totalChats: number;
  totalImageUploads: number;
  imageUploadsToday: number;
  imageUploadsThisWeek: number;
  imageUploadsThisMonth: number;
  averageImageSize: string;
  totalStorageUsed: string;
  // API Usage Stats
  totalApiRequests: number;
  totalTokensUsed: number;
  apiRequestsToday: number;
  apiRequestsThisWeek: number;
  apiRequestsThisMonth: number;
  errorCount: number;
  avgResponseTime: string;
  uniqueIPs: number;
  topCountries: Array<{country: string; count: number}>;
}

interface RecentImageUpload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_path: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  conversation_id: string;
  chat_id: string;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  upload_count: number;
}

interface DashboardProps {
  stats: Stats;
  recentImageUploads: RecentImageUpload[];
  topUsers: TopUser[];
  trial?: {
    totalTrialUsers: number;
    activeTrialUsers: number;
    expiringSoonTrials: number;
    expiredTrials: number;
    trialToUpgradeRate: number;
    trialAgentsCreated: number;
    expiredTrialsThisMonth: number;
  };
}

export default function Dashboard({ stats, recentImageUploads, topUsers, trial }: DashboardProps) {
  // Debug logging
  console.log('Dashboard props:', { stats, recentImageUploads, topUsers, trial });

  // Default stats if not provided
  const defaultStats: Stats = {
    totalUsers: 0,
    totalReferrals: 0,
    totalConversations: 0,
    totalChats: 0,
    totalImageUploads: 0,
    imageUploadsToday: 0,
    imageUploadsThisWeek: 0,
    imageUploadsThisMonth: 0,
    averageImageSize: '0 MB',
    totalStorageUsed: '0 MB',
    // API Usage Stats defaults
    totalApiRequests: 0,
    totalTokensUsed: 0,
    apiRequestsToday: 0,
    apiRequestsThisWeek: 0,
    apiRequestsThisMonth: 0,
    errorCount: 0,
    avgResponseTime: '0 ms',
    uniqueIPs: 0,
    topCountries: [],
  };

  const displayStats = stats || defaultStats;

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your application's usage and statistics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalReferrals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Users referred by others
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalApiRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {displayStats.apiRequestsToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalTokensUsed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg response: {displayStats.avgResponseTime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {displayStats.totalApiRequests > 0
                  ? ((displayStats.errorCount / displayStats.totalApiRequests) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {displayStats.errorCount} errors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.uniqueIPs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Image Uploads</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalImageUploads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {displayStats.imageUploadsToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalStorageUsed}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {displayStats.averageImageSize}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.totalConversations.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Image Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Image Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentImageUploads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent uploads</p>
                ) : (
                  recentImageUploads.map((upload) => (
                    <div key={upload.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <Image className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {upload.file_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {upload.file_size} • {upload.created_at}
                        </p>
                        {upload.user && (
                          <p className="text-xs text-muted-foreground">
                            by {upload.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users yet</p>
                ) : (
                  topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {user.upload_count} uploads
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly/Monthly Trends */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.imageUploadsThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                Image uploads this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayStats.imageUploadsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Image uploads this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Analytics Section */}
        {trial && (
          <div className="mt-8 pt-8 border-t">
            <TrialAnalytics trialAnalytics={trial} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
