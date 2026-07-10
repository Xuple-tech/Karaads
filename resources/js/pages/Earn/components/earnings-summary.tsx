import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Coins,
  Eye,
  Wallet,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface EarningsData {
  total_earned: number;
  available_balance: number;
  total_withdrawn?: number;
  ads_watched?: number;
  ads_completed?: number;
  average_earning_per_ad?: number;
  today_earnings: number;
  week_earnings?: number;
  month_earnings?: number;
}

interface EarningsSummaryProps {
  earnings: EarningsData;
  walletBalance?: number;
  formatCurrency?: (amount: number) => string;
}

export function EarningsSummary({
  earnings,
  walletBalance = 0,
  formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0),
}: EarningsSummaryProps) {
  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(earnings.total_earned),
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-200",
      trend: earnings.total_earned > 0 ? "+" : null,
      description: "Lifetime earnings",
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(walletBalance),
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-200",
      trend: null,
      description: "Available to withdraw",
    },
    {
      label: "Ads Completed",
      value: earnings.ads_completed ?? 0,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-200",
      trend: earnings.ads_completed ? `+${earnings.ads_completed}` : null,
      description: "Total ads watched",
    },
    {
      label: "Avg Per Ad",
      value: formatCurrency(earnings.average_earning_per_ad ?? 0),
      icon: BarChart3,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-200",
      trend: null,
      description: "Average reward per ad",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="relative overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${stat.bgColor}`}
            />
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                    {stat.trend}
                  </span>
                )}
              </div>
              <CardTitle className="mt-3 text-lg font-bold tracking-tight">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
