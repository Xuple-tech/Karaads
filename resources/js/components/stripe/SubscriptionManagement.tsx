import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  plan_id: string;
  plan: {
    name: string;
    monthly_price: number;
    yearly_price: number;
  };
  status: string;
  auto_renew: boolean;
  next_payment_at: string;
  billing_cycle: string;
  started_at: string;
}

interface SubscriptionManagementProps {
  subscription: Subscription | null;
  onUpdate?: (subscription: Subscription) => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  subscription,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">No active subscription</div>
        </CardContent>
      </Card>
    );
  }

  const handleCancel = async (immediate: boolean = false) => {
    if (!window.confirm(
      immediate
        ? 'Cancel subscription immediately?'
        : 'Cancel subscription at the end of the billing period?'
    )) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/stripe/cancel', { immediate });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCancelConfirm(false);
        if (onUpdate) {
          // Refetch subscription
          const subResponse = await axios.get('/subscriptions/my');
          onUpdate(subResponse.data.subscription);
        }
      }
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Reactivate your subscription?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/stripe/reactivate');
      if (response.data.success) {
        toast.success(response.data.message);
        if (onUpdate) {
          // Refetch subscription
          const subResponse = await axios.get('/subscriptions/my');
          onUpdate(subResponse.data.subscription);
        }
      }
    } catch (error: any) {
      console.error('Failed to reactivate subscription:', error);
      toast.error(error.response?.data?.error || 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const isPastDue = subscription.status === 'past_due';
  const isCancelling = subscription.auto_renew === false;
  const nextPaymentDate = new Date(subscription.next_payment_at);
  const amount = subscription.billing_cycle === 'yearly'
    ? subscription.plan.yearly_price
    : subscription.plan.monthly_price;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              {subscription.plan.name} Plan
            </CardTitle>
            <CardDescription>
              Subscribed since {new Date(subscription.started_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            {subscription.status}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600">Billing Cycle</div>
            <div className="text-lg font-semibold">
              {subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Amount</div>
            <div className="text-lg font-semibold">${amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Auto-Renewal Status */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">Auto-Renewal</div>
              <div className="text-sm text-gray-500">
                {subscription.auto_renew
                  ? `Renews on ${nextPaymentDate.toLocaleDateString()}`
                  : 'Subscription will be cancelled at the end of the period'}
              </div>
            </div>
            {subscription.auto_renew ? (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Enabled
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                Disabled
              </span>
            )}
          </div>
        </div>

        {/* Past Due Alert */}
        {isPastDue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-900">Payment Due</div>
              <div className="text-sm text-red-700">
                Please update your payment method to avoid service interruption
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-6 space-y-3">
          {subscription.auto_renew ? (
            <>
              {showCancelConfirm ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="font-medium text-amber-900 mb-2">Cancel Options</div>
                    <div className="space-y-2 text-sm text-amber-800">
                      <div className="flex gap-2">
                        <input type="radio" id="end-period" name="cancel-option" defaultChecked />
                        <label htmlFor="end-period">
                          Cancel at the end of the billing period (keep access until then)
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input type="radio" id="immediate" name="cancel-option" />
                        <label htmlFor="immediate">Cancel immediately (lose access now)</label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        const immediate = (
                          document.querySelector('input[name="cancel-option"]:checked') as HTMLInputElement
                        )?.id === 'immediate';
                        handleCancel(immediate);
                      }}
                      disabled={loading}
                    >
                      Confirm Cancellation
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={loading}
                >
                  Cancel Subscription
                </Button>
              )}
            </>
          ) : (
            <Button
              className="w-full"
              onClick={handleReactivate}
              disabled={loading}
            >
              Reactivate Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
