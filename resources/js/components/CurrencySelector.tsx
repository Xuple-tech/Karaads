import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string) => void;
  showAutoDetect?: boolean;
}

export default function CurrencySelector({
  onCurrencyChange,
  showAutoDetect = true,
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
    detectCurrency();
    loadUserPreference();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get('/api/currency/supported');
      setCurrencies(response.data.supported_currencies);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Fallback to common currencies
      setCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'NGN']);
    }
  };

  const detectCurrency = async () => {
    try {
      const response = await axios.get('/api/currency/detect');
      setDetectedCurrency(response.data.detected_currency);
      setLoading(false);

      if (autoDetect) {
        setSelectedCurrency(response.data.detected_currency);
        onCurrencyChange?.(response.data.detected_currency);
      }
    } catch (error) {
      console.error('Failed to detect currency:', error);
      setLoading(false);
    }
  };

  const loadUserPreference = async () => {
    try {
      const response = await axios.get('/api/currency/user-currency');
      if (response.data.preferred_currency) {
        setSelectedCurrency(response.data.preferred_currency);
        setAutoDetect(false); // User has set a preference
      }
    } catch (error) {
      // Not authenticated or no preference set
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);

    // Save preference if user is authenticated
    try {
      await axios.post('/api/currency/user-currency', {
        currency: newCurrency,
        auto_detect: false,
      });
    } catch (error) {
      // Not authenticated, that's ok
    }
  };

  const handleAutoDetect = async () => {
    const newAutoDetect = !autoDetect;
    setAutoDetect(newAutoDetect);

    if (newAutoDetect && detectedCurrency) {
      setSelectedCurrency(detectedCurrency);
      onCurrencyChange?.(detectedCurrency);
    }

    // Save preference if user is authenticated
    try {
      await axios.post('/api/currency/user-currency', {
        currency: selectedCurrency,
        auto_detect: newAutoDetect,
      });
    } catch (error) {
      // Not authenticated
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-4 w-16 rounded bg-muted/60" />
        <div className="h-8 w-28 rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium">Currency:</label>
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAutoDetect && detectedCurrency && (
        <button
          onClick={handleAutoDetect}
          className={`text-xs px-2 py-1 rounded ${
            autoDetect
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
          title={`Auto-detect is ${autoDetect ? 'enabled' : 'disabled'}`}
        >
          {autoDetect ? '🌍 Auto' : 'Manual'}
        </button>
      )}
    </div>
  );
}
