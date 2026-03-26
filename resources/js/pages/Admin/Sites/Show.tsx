// @/Pages/Admin/Sites/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Download,
    Eye,
    EyeOff,
    Globe,
    User,
    Bot,
    MessageSquare,
    Settings,
    BarChart,
    Calendar,
    CheckCircle,
    XCircle,
    Code,
    Mail,
    Shield
} from 'lucide-react';

const Show = ({ site, stats, recent_activity }) => {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this site?')) {
            router.delete(route('admin.sites.destroy', site.id));
        }
    };

    const handleToggleStatus = () => {
        router.post(route('admin.sites.toggle-status', site.id));
    };

    const handleToggleWidget = () => {
        router.post(route('admin.sites.toggle-widget', site.id));
    };

    const handleVerify = () => {
        router.post(route('admin.sites.verify', site.id));
    };

    const handleResendVerification = () => {
        router.post(route('admin.sites.resend-verification', site.id));
    };

    const handleGetEmbedCode = () => {
        window.open(route('admin.sites.embed-code', site.id), '_blank');
    };

    const handleAnalytics = () => {
        router.visit(route('admin.sites.analytics', site.id));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not verified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title={`${site.name} - Site`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.sites.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
                                <Badge variant={site.is_active ? "success" : "secondary"}>
                                    {site.is_active ? (
                                        <>
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Inactive
                                        </>
                                    )}
                                </Badge>
                                <Badge variant="outline">
                                    {site.site_type.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Badge>
                                {site.verified_at && (
                                    <Badge variant="success">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {site.domain} • {site.url}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleGetEmbedCode}>
                            <Code className="h-4 w-4 mr-2" />
                            Embed Code
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleAnalytics}>
                            <BarChart className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToggleWidget}>
                            {site.widget_enabled ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Disable Widget
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Enable Widget
                                </>
                            )}
                        </Button>
                        {!site.verified_at && (
                            <Button variant="outline" size="sm" onClick={handleVerify}>
                                <Shield className="h-4 w-4 mr-2" />
                                Verify
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.sites.edit', site.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                                    <p className="text-2xl font-bold">{stats.total_agents}</p>
                                </div>
                                <Bot className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                                    <p className="text-2xl font-bold">{stats.active_agents}</p>
                                </div>
                                <Bot className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                                    <p className="text-2xl font-bold">{stats.total_conversations}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                                    <p className="text-2xl font-bold capitalize">{stats.subscription_status}</p>
                                </div>
                                <Globe className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">
                            <Globe className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="agents">
                            <Bot className="h-4 w-4 mr-2" />
                            Agents
                        </TabsTrigger>
                        <TabsTrigger value="subscription">
                            <Settings className="h-4 w-4 mr-2" />
                            Subscription
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            <Calendar className="h-4 w-4 mr-2" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Site Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                                        <p className="text-base">
                                            {site.user?.name} ({site.user?.email})
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Domain</h4>
                                        <p className="text-base">{site.domain}</p>
                                    </div>

                                    {site.subdomain && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Subdomain</h4>
                                            <p className="text-base">{site.subdomain}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">URL</h4>
                                        <a
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {site.url}
                                        </a>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Site Type</h4>
                                        <Badge variant="outline">
                                            {site.site_type.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Badge>
                                    </div>

                                    {site.industry && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
                                            <p className="text-base">
                                                {site.industry.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                        <p className="text-base">{formatDate(site.created_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Configuration & Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration & Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Verification Status</h4>
                                        <div className="flex items-center space-x-2 mt-2">
                                            {site.verified_at ? (
                                                <Badge variant="success" className="flex items-center">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Verified on {formatDate(site.verified_at)}
                                                </Badge>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="secondary" className="flex items-center">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Not Verified
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleResendVerification}
                                                    >
                                                        <Mail className="h-4 w-4 mr-1" />
                                                        Resend Verification
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Widget Status</h4>
                                        <div className="mt-2">
                                            <Badge variant={site.widget_enabled ? "success" : "secondary"}>
                                                {site.widget_enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-2"
                                                onClick={handleToggleWidget}
                                            >
                                                {site.widget_enabled ? 'Disable' : 'Enable'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Site Status</h4>
                                        <div className="mt-2">
                                            <Badge variant={site.is_active ? "success" : "secondary"}>
                                                {site.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-2"
                                                onClick={handleToggleStatus}
                                            >
                                                {site.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Agent Limit</h4>
                                        <p className="text-base">
                                            {site.current_agents_count || 0} / {site.max_agents || 3} agents
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${Math.min(((site.current_agents_count || 0) / (site.max_agents || 3)) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Language & Timezone</h4>
                                        <p className="text-base">
                                            Language: {site.language?.toUpperCase() || 'EN'}
                                        </p>
                                        <p className="text-base">
                                            Timezone: {site.timezone || 'UTC'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Appearance Preview */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>
                                        Site visual identity and branding
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {site.logo_url && (
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Logo</h4>
                                                <img
                                                    src={site.logo_url}
                                                    alt="Site Logo"
                                                    className="h-16 w-auto"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Colors</h4>
                                            <div className="flex items-center space-x-2">
                                                {site.primary_color && (
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className="w-12 h-12 rounded-full border"
                                                            style={{ backgroundColor: site.primary_color }}
                                                        />
                                                        <span className="text-xs mt-1">Primary</span>
                                                    </div>
                                                )}
                                                {site.secondary_color && (
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className="w-12 h-12 rounded-full border"
                                                            style={{ backgroundColor: site.secondary_color }}
                                                        />
                                                        <span className="text-xs mt-1">Secondary</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Embed Widget</h4>
                                            <Button variant="outline" size="sm" onClick={handleGetEmbedCode}>
                                                <Code className="h-4 w-4 mr-2" />
                                                Get Embed Code
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Copy and paste this code into your site
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Agents Tab */}
                    <TabsContent value="agents">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Agents</CardTitle>
                                        <CardDescription>
                                            AI agents deployed on this site
                                        </CardDescription>
                                    </div>
                                    <Button asChild>
                                        <Link href={route('admin.ai-agents.create')}>
                                            Create Agent
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {site.agents && site.agents.length > 0 ? (
                                    <div className="space-y-4">
                                        {site.agents.map((agent) => (
                                            <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Bot className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium">{agent.name}</h4>
                                                        <Badge variant={agent.is_active ? "success" : "secondary"}>
                                                            {agent.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <Badge variant="outline">{agent.agent_type}</Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('admin.ai-agents.show', agent.id)}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {agent.description || 'No description'}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Created: {formatDate(agent.created_at)}</span>
                                                    <span>Last updated: {formatDate(agent.updated_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No agents yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Create your first AI agent for this site.
                                        </p>
                                        <Button asChild>
                                            <Link href={route('admin.ai-agents.create')}>
                                                Create First Agent
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subscription Tab */}
                    <TabsContent value="subscription">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subscription</CardTitle>
                                <CardDescription>
                                    Current subscription plan and billing information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {site.subscriptions && site.subscriptions.length > 0 ? (
                                    <div className="space-y-6">
                                        {site.subscriptions.map((subscription) => (
                                            <div key={subscription.id} className="border rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold">{subscription.plan?.name || 'No Plan'}</h4>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={
                                                                subscription.status === 'active' ? 'success' :
                                                                subscription.status === 'canceled' ? 'destructive' :
                                                                subscription.status === 'expired' ? 'warning' : 'secondary'
                                                            }>
                                                                {subscription.status}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {subscription.billing_cycle}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold">
                                                            ${subscription.price}/{subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {subscription.currency}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Billing Period</h5>
                                                        <p>
                                                            {new Date(subscription.starts_at).toLocaleDateString()} -
                                                            {subscription.expires_at ?
                                                                ` ${new Date(subscription.expires_at).toLocaleDateString()}` :
                                                                ' No expiry'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-medium text-muted-foreground">Created</h5>
                                                        <p>{formatDate(subscription.created_at)}</p>
                                                    </div>
                                                </div>

                                                {subscription.plan && (
                                                    <div className="border-t pt-4">
                                                        <h5 className="text-sm font-medium mb-2">Plan Features</h5>
                                                        <ul className="space-y-2">
                                                            {subscription.plan.features?.map((feature, index) => (
                                                                <li key={index} className="flex items-center">
                                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                                                    <span>{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No subscription</h3>
                                        <p className="text-muted-foreground mb-4">
                                            This site doesn't have an active subscription.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest events and changes for this site
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent_activity && recent_activity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recent_activity.map((activity, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        {activity.icon === 'Bot' && <Bot className="h-5 w-5 text-gray-600" />}
                                                        {activity.icon === 'MessageSquare' && <MessageSquare className="h-5 w-5 text-gray-600" />}
                                                        {activity.icon === 'Globe' && <Globe className="h-5 w-5 text-gray-600" />}
                                                        {activity.icon === 'User' && <User className="h-5 w-5 text-gray-600" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{activity.title}</p>
                                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                                        <p className="text-muted-foreground">
                                            Activity will appear here once the site starts being used.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default Show;
