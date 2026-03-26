import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  onSuccess?: (subscription: any) => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<StripeCheckoutProps> = ({
  planId,
  planName,
  billingCycle,
  amount,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent
    createPaymentIntent();
  }, [planId, billingCycle]);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post('/stripe/payment-intent', {
        plan_id: planId,
        billing_cycle: billingCycle,
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
      }
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      toast.error(error.response?.data?.error || 'Failed to create payment intent');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Stripe is not loaded');
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Card element not found');
        return;
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        return;
      }

      // Confirm subscription
      const response = await axios.post('/stripe/confirm-subscription', {
        plan_id: planId,
        payment_method_id: paymentMethod.id,
        billing_cycle: billingCycle,
      });

      if (response.data.success) {
        toast.success('Subscription created successfully!');
        if (onSuccess) {
          onSuccess(response.data.subscription);
        }
      }
    } catch (error: any) {
      console.error('Subscription confirmation error:', error);
      toast.error(error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Subscribe to {planName}</CardTitle>
        <CardDescription>
          ${amount.toFixed(2)}/{billingCycle === 'yearly' ? 'year' : 'month'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !stripe || !clientSecret}
            >
              {loading ? 'Processing...' : `Subscribe - $${amount.toFixed(2)}`}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your payment is secured by Stripe. No charges until you confirm.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

interface StripeCheckoutWrapperProps extends Omit<StripeCheckoutProps, 'stripe' | 'elements'> {
  stripePublishableKey: string;
}

export const StripeCheckout: React.FC<StripeCheckoutWrapperProps> = ({
  stripePublishableKey,
  ...props
}) => {
  const [stripePromise, setStripePromise] = React.useState(
    loadStripe(stripePublishableKey)
  );

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(props.amount * 100), // Convert to cents
    currency: 'usd',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;
