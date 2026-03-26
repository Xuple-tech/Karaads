import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    variant = 'default'
}) => {
    const variants = {
        default: 'bg-white dark:bg-gray-800',
        primary: 'bg-primary/5 border-primary/20',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    };

    return (
        <Card className={cn(variants[variant], className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className="text-2xl font-bold mt-2">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <div className={cn(
                                "inline-flex items-center text-xs mt-2",
                                trend.value > 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
                                <span className="ml-1 text-muted-foreground">
                                    {trend.label}
                                </span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn(
                            "p-3 rounded-full",
                            variant === 'default' ? "bg-muted" :
                            variant === 'primary' ? "bg-primary/10 text-primary" :
                            variant === 'success' ? "bg-green-100 text-green-600" :
                            variant === 'warning' ? "bg-yellow-100 text-yellow-600" :
                            "bg-red-100 text-red-600"
                        )}>
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsCard;
