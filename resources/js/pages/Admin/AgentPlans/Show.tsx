import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CreditCard,
  RefreshCw,
  Users,
  Globe,
  MessageSquare,
  Database,
  Zap,
  DollarSign,
  Calendar,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Site {
  id: number;
  name: string;
  domain: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Subscription {
  id: number;
  site: Site;
  user: User;
  status: string;
  created_at: string;
}

interface AgentPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  stripe_product_id: string | null;
  stripe_monthly_price_id: string | null;
  stripe_yearly_price_id: string | null;
  monthly_price: number | null;
  yearly_price: number | null;
  max_sites: number | null;
  max_agents_per_site: number | null;
  max_total_agents: number | null;
  max_monthly_conversations: number | null;
  max_daily_conversations: number | null;
  max_monthly_messages: number | null;
  knowledge_base_size_mb: number | null;
  max_file_uploads: number | null;
  custom_domains_allowed: boolean;
  white_label_allowed: boolean;
  api_access: boolean;
  webhook_support: boolean;
  advanced_analytics: boolean;
  priority_support: boolean;
  custom_branding: boolean;
  sso_integration: boolean;
  is_active: boolean;
  display_order: number | null;
  features: string[] | Record<string, any> | null;
  limits: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  site_subscriptions_count: number;
}

interface ShowPageProps {
  plan: AgentPlan;
  subscriptions: {
    data: Subscription[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const AgentPlansShow = ({ plan, subscriptions }: ShowPageProps) => {
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    if (plan.site_subscriptions_count > 0) {
      alert('Cannot delete plan that has active subscriptions.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      window.location.href = route('admin.agent-plans.destroy', {
        agentPlan: plan.id,
        _method: 'DELETE'
      });
    }
  };

  const handleSyncStripe = () => {
    if (confirm(`Sync "${plan.name}" with Stripe? This will update Stripe product and price information.`)) {
      window.location.href = route('admin.agent-plans.sync-stripe', plan.id);
    }
  };

  const handleToggleStatus = () => {
    if (confirm(`Are you sure you want to ${plan.is_active ? 'deactivate' : 'activate'} "${plan.name}"?`)) {
      window.location.href = route('admin.agent-plans.toggle-status', plan.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanTypeLabel = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  const features = Array.isArray(plan.features) ? plan.features : [];

  return (
    <AdminLayout>
      <Head title={`Plan: ${plan.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('admin.agent-plans.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
                <Badge variant={plan.is_active ? "success" : "secondary"}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getPlanTypeLabel(plan.type)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Plan ID: {plan.id} • Created {formatDate(plan.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleToggleStatus}>
              {plan.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            {(plan.stripe_product_id || plan.monthly_price || plan.yearly_price) && (
              <Button variant="outline" size="sm" onClick={handleSyncStripe}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Stripe
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={route('admin.agent-plans.edit', plan.id)}>
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

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Plan Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Name</h3>
                        <p className="text-lg font-semibold">{plan.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Type</h3>
                        <Badge variant="outline" className="text-base capitalize">
                          {getPlanTypeLabel(plan.type)}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Slug</h3>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{plan.slug}</code>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Display Order</h3>
                        <p className="text-lg font-semibold">{plan.display_order || 0}</p>
                      </div>
                    </div>

                    {plan.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-line">{plan.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Limits Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Limits</CardTitle>
                    <CardDescription>
                      Usage limits and quotas for this plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <h4 className="font-medium">Site Limits</h4>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Max Sites:</span>
                            <span className="font-medium">
                              {plan.max_sites === null ? 'Unlimited' : plan.max_sites}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Agents per Site:</span>
                            <span className="font-medium">
                              {plan.max_agents_per_site === null ? 'Unlimited' : plan.max_agents_per_site}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Agents:</span>
                            <span className="font-medium">
                              {plan.max_total_agents === null ? 'Unlimited' : plan.max_total_agents}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                          <h4 className="font-medium">Conversation Limits</h4>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Monthly Conversations:</span>
                            <span className="font-medium">
                              {plan.max_monthly_conversations === null ? 'Unlimited' : plan.max_monthly_conversations.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Daily Conversations:</span>
                            <span className="font-medium">
                              {plan.max_daily_conversations === null ? 'Unlimited' : plan.max_daily_conversations.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Monthly Messages:</span>
                            <span className="font-medium">
                              {plan.max_monthly_messages === null ? 'Unlimited' : plan.max_monthly_messages.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-gray-400" />
                          <h4 className="font-medium">Storage Limits</h4>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Knowledge Base:</span>
                            <span className="font-medium">
                              {plan.knowledge_base_size_mb === null ? 'Unlimited' : `${plan.knowledge_base_size_mb} MB`}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">File Uploads:</span>
                            <span className="font-medium">
                              {plan.max_file_uploads === null ? 'Unlimited' : plan.max_file_uploads}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats & Actions */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Active Subscriptions</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {plan.site_subscriptions_count}
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Plan Status</span>
                        </div>
                        <Badge variant={plan.is_active ? "success" : "secondary"}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Created</span>
                        </div>
                        <div className="text-sm">
                          {formatDate(plan.created_at)}
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Last Updated</span>
                        </div>
                        <div className="text-sm">
                          {formatDate(plan.updated_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={route('admin.agent-plans.edit', plan.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Plan
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleToggleStatus}
                    >
                      {plan.is_active ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate Plan
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate Plan
                        </>
                      )}
                    </Button>
                    {(plan.stripe_product_id || plan.monthly_price || plan.yearly_price) && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSyncStripe}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync with Stripe
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => copyToClipboard(JSON.stringify(plan, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy Plan Data'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Stripe Info */}
                {(plan.stripe_product_id || plan.stripe_monthly_price_id || plan.stripe_yearly_price_id) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Stripe Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plan.stripe_product_id && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Product ID</h4>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                            {plan.stripe_product_id}
                          </code>
                        </div>
                      )}
                      {plan.stripe_monthly_price_id && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Monthly Price ID</h4>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                            {plan.stripe_monthly_price_id}
                          </code>
                        </div>
                      )}
                      {plan.stripe_yearly_price_id && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Yearly Price ID</h4>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                            {plan.stripe_yearly_price_id}
                          </code>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pricing Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <div className="font-medium">Monthly Price</div>
                              <div className="text-sm text-gray-500">Billed monthly</div>
                            </div>
                          </div>
                          <div className="text-xl font-bold">
                            {plan.monthly_price !== null ? `$${plan.monthly_price.toFixed(2)}` : 'Free'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <div className="font-medium">Yearly Price</div>
                              <div className="text-sm text-gray-500">Billed annually</div>
                            </div>
                          </div>
                          <div className="text-xl font-bold">
                            {plan.yearly_price !== null ? `$${plan.yearly_price.toFixed(2)}` : 'Free'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {plan.stripe_product_id && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Stripe Integration</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Stripe Product ID:</span>
                            <code className="text-xs">{plan.stripe_product_id}</code>
                          </div>
                          {plan.stripe_monthly_price_id && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Monthly Price ID:</span>
                              <code className="text-xs">{plan.stripe_monthly_price_id}</code>
                            </div>
                          )}
                          {plan.stripe_yearly_price_id && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Yearly Price ID:</span>
                              <code className="text-xs">{plan.stripe_yearly_price_id}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="border rounded-lg p-6 text-center">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-gray-600">Perfect for getting started</p>
                      </div>

                      <div className="mb-6">
                        {plan.monthly_price !== null ? (
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">
                              ${plan.monthly_price.toFixed(2)}
                              <span className="text-lg font-normal text-gray-500">/month</span>
                            </div>
                            {plan.yearly_price !== null && (
                              <div className="text-lg">
                                or ${plan.yearly_price.toFixed(2)}
                                <span className="text-sm text-gray-500">/year</span>
                              </div>
                            )}
                          </div>
                        ) : plan.yearly_price !== null ? (
                          <div className="text-4xl font-bold">
                            ${plan.yearly_price.toFixed(2)}
                            <span className="text-lg font-normal text-gray-500">/year</span>
                          </div>
                        ) : (
                          <div className="text-4xl font-bold text-green-600">
                            Free
                          </div>
                        )}
                      </div>

                      <Button className="w-full" size="lg">
                        Choose Plan
                      </Button>

                      <div className="mt-6 text-sm text-gray-500">
                        {!plan.monthly_price && !plan.yearly_price ? (
                          <p>Free forever plan with basic features</p>
                        ) : (
                          <p>Billed monthly, cancel anytime</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  All features included in this plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Enabled Features</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'custom_domains_allowed', label: 'Custom Domains', icon: Globe },
                        { key: 'white_label_allowed', label: 'White Label', icon: Zap },
                        { key: 'api_access', label: 'API Access', icon: Database },
                        { key: 'webhook_support', label: 'Webhook Support', icon: LinkIcon },
                        { key: 'advanced_analytics', label: 'Advanced Analytics', icon: Eye },
                        { key: 'priority_support', label: 'Priority Support', icon: Users },
                        { key: 'custom_branding', label: 'Custom Branding', icon: Zap },
                        { key: 'sso_integration', label: 'SSO Integration', icon: Users },
                      ].map((feature) => (
                        <div
                          key={feature.key}
                          className={`flex items-center p-3 border rounded-lg ${
                            plan[feature.key as keyof AgentPlan] ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <feature.icon className={`h-5 w-5 mr-3 ${
                            plan[feature.key as keyof AgentPlan] ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium">{feature.label}</div>
                          </div>
                          {plan[feature.key as keyof AgentPlan] ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Feature List</h3>
                    <div className="border rounded-lg divide-y">
                      {features.length > 0 ? (
                        features.map((feature, index) => (
                          <div key={index} className="p-3 hover:bg-gray-50">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span>{feature}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No feature list configured
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>
                  {plan.site_subscriptions_count} active subscription(s) to this plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.data.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {subscriptions.data.map((subscription) => (
                      <div key={subscription.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{subscription.site.name}</div>
                            <div className="text-sm text-gray-500">{subscription.site.domain}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Subscribed by</div>
                            <div className="font-medium">{subscription.user.name}</div>
                            <div className="text-xs text-gray-500">{subscription.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">
                            {subscription.status}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {formatDate(subscription.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No active subscriptions for this plan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AgentPlansShow;
