import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface PriceDisplayProps {
  amountInUSD: number;
  userCurrency?: string;
  className?: string;
}

export default function PriceDisplay({
  amountInUSD,
  userCurrency = 'USD',
  className = '',
}: PriceDisplayProps) {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    convertCurrency();
  }, [amountInUSD, userCurrency]);

  const convertCurrency = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/currency/convert', {
        amount: amountInUSD,
        from: 'USD',
        to: userCurrency,
      });

      setConvertedAmount(response.data.converted.amount);
    } catch (err) {
      setError('Failed to convert currency');
      console.error(err);
      // Fallback: if same currency, just use the amount
      if (userCurrency === 'USD') {
        setConvertedAmount(amountInUSD);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        {amountInUSD} USD
      </div>
    );
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: userCurrency,
  }).format(convertedAmount || amountInUSD);

  return <span className={className}>{formatted}</span>;
}
