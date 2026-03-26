import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Calendar, Zap, CheckCircle, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface TrialStatusProps {
  isOnTrial: boolean;
  hasTrialExpired: boolean;
  daysRemaining: number;
  agentQuota: number;
  remainingQuota: number;
  variant?: 'card' | 'banner' | 'inline';
  showUpgradeButton?: boolean;
  upgradeUrl?: string;
}

export default function TrialStatus({
  isOnTrial,
  hasTrialExpired,
  daysRemaining,
  agentQuota,
  remainingQuota,
  variant = 'card',
  showUpgradeButton = true,
  upgradeUrl = '/subscription',
}: TrialStatusProps) {
  if (!isOnTrial && !hasTrialExpired) {
    return null;
  }

  const usedQuota = agentQuota - remainingQuota;
  const quotaPercentage = (usedQuota / agentQuota) * 100;
  const isQuotaWarning = remainingQuota <= 1;

  if (variant === 'banner') {
    return (
      <div className={`${
        hasTrialExpired 
          ? 'bg-red-50 border-l-4 border-red-500' 
          : daysRemaining <= 2
          ? 'bg-yellow-50 border-l-4 border-yellow-500'
          : 'bg-blue-50 border-l-4 border-blue-500'
      } p-4 rounded-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {hasTrialExpired ? (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              {hasTrialExpired ? (
                <>
                  <h3 className="font-semibold text-red-900">Trial Expired</h3>
                  <p className="text-sm text-red-800 mt-1">
                    Your free trial has ended. Upgrade to a paid plan to continue using AI agents.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-blue-900">Free Trial Active</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    You have <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> remaining in your trial.
                    {remainingQuota > 0 && ` You can create ${remainingQuota} more agent${remainingQuota !== 1 ? 's' : ''}.`}
                  </p>
                </>
              )}
            </div>
          </div>
          {showUpgradeButton && hasTrialExpired && (
            <Link href={upgradeUrl}>
              <Button size="sm" variant="default">
                Upgrade Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        {hasTrialExpired ? (
          <>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Trial Expired
            </Badge>
          </>
        ) : (
          <>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining}d left
            </Badge>
            {isQuotaWarning && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {remainingQuota} agent{remainingQuota !== 1 ? 's' : ''} left
              </Badge>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {hasTrialExpired ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Trial Expired
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Free Trial
                </>
              )}
            </CardTitle>
            <CardDescription>
              {hasTrialExpired 
                ? 'Your trial period has ended' 
                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </CardDescription>
          </div>
          {!hasTrialExpired && (
            <Badge variant="outline" className="h-fit">
              {daysRemaining} days
            </Badge>
          )}
          {hasTrialExpired && (
            <Badge variant="destructive" className="h-fit">
              Expired
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasTrialExpired && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Trial Progress</span>
                <span className="text-muted-foreground">{daysRemaining} / 7 days</span>
              </div>
              <Progress value={(7 - daysRemaining) / 7 * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Agent Creation Quota</span>
                <span className="text-muted-foreground">{usedQuota} / {agentQuota}</span>
              </div>
              <Progress value={quotaPercentage} className="h-2" />
              {remainingQuota > 0 && (
                <p className="text-xs text-muted-foreground">
                  {remainingQuota} agent{remainingQuota !== 1 ? 's' : ''} remaining
                </p>
              )}
              {remainingQuota === 0 && (
                <p className="text-xs text-red-600 font-medium">
                  You've reached your agent creation limit for the trial
                </p>
              )}
            </div>
          </>
        )}

        {hasTrialExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Your agents will stop responding to new conversations</li>
              <li>• You can view but not edit existing agents</li>
              <li>• Upgrade to a paid plan to regain full access</li>
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Trial Features</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Create up to {agentQuota} AI agents</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Full widget customization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Basic analytics & conversations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Email & chat support</span>
            </div>
          </div>
        </div>

        {showUpgradeButton && (
          <Link href={upgradeUrl}>
            <Button className="w-full" variant={hasTrialExpired ? 'default' : 'outline'}>
              {hasTrialExpired ? 'Upgrade to Paid Plan' : 'Upgrade Before Trial Ends'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
