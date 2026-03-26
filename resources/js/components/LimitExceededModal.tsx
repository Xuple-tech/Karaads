import React from 'react';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LimitExceededModalProps {
  isOpen: boolean;
  limitData?: {
    reason: string;
    limit: number;
    used: number;
    reset_at: string;
    reset_type: 'daily' | 'monthly';
    plan_name: string;
  };
  onClose: () => void;
  onUpgrade: () => void;
}

/**
 * Modal displayed when user hits their usage limit
 * Shows limit details and provides options to upgrade or wait for reset
 */
export function LimitExceededModal({
  isOpen,
  limitData,
  onClose,
  onUpgrade,
}: LimitExceededModalProps) {
  if (!isOpen || !limitData) return null;

  const resetDate = new Date(limitData.reset_at);
  const now = new Date();

  // Format reset time
  const resetLabel = limitData.reset_type === 'daily'
    ? `tomorrow at ${resetDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    : `on ${resetDate.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })}`;

  // Calculate time remaining
  const timeRemaining = Math.floor((resetDate.getTime() - now.getTime()) / 1000);
  const hoursRemaining = Math.floor(timeRemaining / 3600);
  const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

  const timeLabel = hoursRemaining > 0
    ? `${hoursRemaining}h ${minutesRemaining}m remaining`
    : `${minutesRemaining}m remaining`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in scale-95">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {limitData.reason === 'Daily image limit exceeded'
                    ? 'Daily Limit Reached'
                    : 'Monthly Limit Reached'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  You've reached your quota for images
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Current Usage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Images Generated
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {limitData.used} / {limitData.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (limitData.used / limitData.limit) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Reset Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Limit Resets {resetLabel}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {timeLabel}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Current plan: <span className="font-semibold">{limitData.plan_name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Upgrade Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-700">
                <Zap className="w-4 h-4 inline text-yellow-500 mr-1" />
                <strong>Get more images:</strong>
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-5 list-disc">
                <li><strong>Paid</strong>: 50 images/day</li>
                <li><strong>Premium</strong>: 200 images/day</li>
                <li><strong>Gold</strong>: Unlimited images</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-4 h-4" />
              Upgrade My Plan
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg transition border border-gray-200"
            >
              I'll Wait for Reset
            </Button>
          </div>

          {/* Footer Text */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-center">
            <p className="text-xs text-gray-500">
              Need more? <a href="/subscription/plans" className="text-blue-600 hover:text-blue-700 font-medium">Compare all plans →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
