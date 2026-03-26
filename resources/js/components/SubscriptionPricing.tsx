import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencySelector from './CurrencySelector';

interface PricingData {
  [key: string]: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

export default function SubscriptionPricing() {
  const [prices, setPrices] = useState<PricingData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/currency/subscription-prices');
      setPrices(response.data);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    fetchPrices();
  };

  if (loading) {
    return <div className="text-center py-8">Loading pricing...</div>;
  }

  if (!prices) {
    return <div className="text-center py-8 text-red-600">Failed to load pricing</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pricing</h2>
        <CurrencySelector onCurrencyChange={handleCurrencyChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>Perfect for individuals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">
                {prices.basic_monthly?.formatted || '$9.99'}
              </div>
              <p className="text-sm text-gray-600">per month</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ 100 requests/day</li>
              <li>✓ Basic support</li>
              <li>✓ API access</li>
            </ul>
            <Button className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For growing teams</CardDescription>
              </div>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Popular</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">
                {prices.pro_monthly?.formatted || '$29.99'}
              </div>
              <p className="text-sm text-gray-600">per month</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ 1,000 requests/day</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom integrations</li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Custom solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold">
                {prices.enterprise_monthly?.formatted || '$99.99'}
              </div>
              <p className="text-sm text-gray-600">per month</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited requests</li>
              <li>✓ Dedicated support</li>
              <li>✓ Custom SLA</li>
              <li>✓ White-label option</li>
            </ul>
            <Button className="w-full bg-gray-800 hover:bg-gray-900">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>

      {/* Yearly pricing note */}
      <div className="text-center text-sm text-gray-600">
        💡 Save 20% with annual plans
      </div>
    </div>
  );
}
