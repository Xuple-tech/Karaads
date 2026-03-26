import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Analytics = ({ revenueTrend, planDistribution, metrics }) => {
    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

    const statsCards = [
        {
            title: 'Monthly Recurring Revenue',
            value: `$${metrics.mrr?.toLocaleString()}`,
            icon: DollarSign,
            description: 'Current MRR',
            variant: 'primary'
        },
        {
            title: 'Annual Recurring Revenue',
            value: `$${metrics.arr?.toLocaleString()}`,
            icon: DollarSign,
            description: 'Current ARR',
            variant: 'default'
        },
        {
            title: 'Total Customers',
            value: metrics.totalCustomers?.toLocaleString() || 0,
            icon: Users,
            description: 'Active customers',
            variant: 'success'
        },
        {
            title: 'Churn Rate',
            value: `${metrics.churnRate}%`,
            icon: TrendingUp,
            description: 'Last 30 days',
            variant: 'default'
        },
    ];

    return (
        <AdminLayout>
            <Head title="Subscription Analytics" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscription Analytics</h1>
                    <p className="text-muted-foreground">
                        Analytics and insights for site subscriptions
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    {React.createElement(stat.icon, { className: 'h-8 w-8 text-blue-500' })}
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-gray-500">{stat.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value}`, 'MRR']} />
                                    <Area type="monotone" dataKey="mrr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Plan Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {planDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Subscriptions']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="font-medium">New Subscriptions (30 days)</span>
                                    <span className="text-2xl font-bold text-blue-600">{metrics.newSubscriptions}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-medium">Churn Rate</span>
                                    <span className="text-2xl font-bold text-green-600">{metrics.churnRate}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Total Customers</span>
                                    <span className="text-2xl font-bold text-purple-600">{metrics.totalCustomers}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Performance Indicators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-800">Average Revenue Per User (ARPU)</h4>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${(metrics.mrr / metrics.totalCustomers).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">Monthly average per customer</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-800">Customer Lifetime Value (CLV)</h4>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${(metrics.mrr / (metrics.churnRate / 100)).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">Estimated value over lifetime</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue by Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Plan</th>
                                        <th className="text-left py-2">Active Subscriptions</th>
                                        <th className="text-left py-2">Monthly Revenue</th>
                                        <th className="text-left py-2">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planDistribution.map((plan, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 font-medium">{plan.name}</td>
                                            <td className="py-2">{plan.count}</td>
                                            <td className="py-2">
                                                ${(plan.count * 50).toLocaleString()} {/* Placeholder calculation */}
                                            </td>
                                            <td className="py-2">
                                                {((plan.count / planDistribution.reduce((sum, p) => sum + p.count, 0)) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Analytics;
