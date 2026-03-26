import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Zap 
} from 'lucide-react';

interface TrialAnalyticsProps {
  trialAnalytics: {
    totalTrialUsers: number;
    activeTrialUsers: number;
    expiringSoonTrials: number;
    expiredTrials: number;
    trialToUpgradeRate: number;
    trialAgentsCreated: number;
    expiredTrialsThisMonth: number;
  };
}

export default function TrialAnalytics({ trialAnalytics }: TrialAnalyticsProps) {
  const {
    totalTrialUsers,
    activeTrialUsers,
    expiringSoonTrials,
    expiredTrials,
    trialToUpgradeRate,
    trialAgentsCreated,
    expiredTrialsThisMonth,
  } = trialAnalytics;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trial System Analytics</h2>
        <p className="text-muted-foreground">Monitor trial users, conversions, and trial activity</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Trial Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrialUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTrialUsers} active this week
            </p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoonTrials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next 3 days
            </p>
          </CardContent>
        </Card>

        {/* Trial to Paid Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upgrade Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialToUpgradeRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trial to paid conversion
            </p>
          </CardContent>
        </Card>

        {/* Agents Created by Trial Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Agents</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialAgentsCreated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Created during trials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trial Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Status Distribution</CardTitle>
            <CardDescription>Current state of all trial subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Active Trials
                </span>
                <span className="text-sm font-bold">{totalTrialUsers}</span>
              </div>
              <Progress 
                value={(totalTrialUsers / (totalTrialUsers + expiredTrials + 1)) * 100} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Expiring Soon (3 days)
                </span>
                <span className="text-sm font-bold">{expiringSoonTrials}</span>
              </div>
              <Progress 
                value={(expiringSoonTrials / (totalTrialUsers + 1)) * 100} 
                className="h-2" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Expired (This Month)
                </span>
                <span className="text-sm font-bold">{expiredTrialsThisMonth}</span>
              </div>
              <Progress 
                value={(expiredTrialsThisMonth / (totalTrialUsers + 1)) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversion Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Trial to Paid Pipeline</CardTitle>
            <CardDescription>Trial engagement and conversion metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Trial Users</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {totalTrialUsers}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {trialToUpgradeRate}%
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
              <h4 className="font-medium text-sm mb-3">Estimated Conversions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    From {totalTrialUsers} trial users
                  </span>
                  <span className="font-medium">
                    ~{Math.round(totalTrialUsers * (trialToUpgradeRate / 100))} expected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on current {trialToUpgradeRate}% conversion rate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {trialAgentsCreated}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agents created
                </p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {activeTrialUsers > 0 ? (trialAgentsCreated / activeTrialUsers).toFixed(1) : 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per active user
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Management */}
      {expiringSoonTrials > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Trials Expiring Soon
            </CardTitle>
            <CardDescription>
              {expiringSoonTrials} trial{expiringSoonTrials !== 1 ? 's' : ''} will expire in the next 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consider sending reminder emails to users whose trials are about to expire 
              to encourage upgrade before losing access to their agents and data.
            </p>
            <div className="mt-4 p-3 bg-white border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">
                💡 Tip: A 48-hour reminder email can improve trial-to-paid conversion rates
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active This Week</p>
              <p className="text-lg font-bold">{activeTrialUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTrialUsers > 0 
                  ? `${((activeTrialUsers / totalTrialUsers) * 100).toFixed(1)}% of total` 
                  : 'No activity'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired This Month</p>
              <p className="text-lg font-bold">{expiredTrialsThisMonth}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {expiredTrialsThisMonth > 0 
                  ? `${((expiredTrialsThisMonth / totalTrialUsers) * 100).toFixed(1)}% of trials` 
                  : 'No expirations'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Agents/User</p>
              <p className="text-lg font-bold">
                {activeTrialUsers > 0 
                  ? (trialAgentsCreated / activeTrialUsers).toFixed(1) 
                  : '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Engagement metric
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-lg font-bold flex items-center gap-1">
                {trialToUpgradeRate > 20 ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Good
                  </>
                ) : trialToUpgradeRate > 10 ? (
                  <>
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Fair
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Poor
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
