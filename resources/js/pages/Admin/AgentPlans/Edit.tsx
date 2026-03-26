import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2, CreditCard, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface EditPageProps {
  plan: AgentPlan;
  planTypes: string[];
}

const AgentPlansEdit = ({ plan, planTypes }: EditPageProps) => {
  const { data, setData, put, processing, errors } = useForm({
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    type: plan.type,
    stripe_product_id: plan.stripe_product_id || '',
    stripe_monthly_price_id: plan.stripe_monthly_price_id || '',
    stripe_yearly_price_id: plan.stripe_yearly_price_id || '',
    monthly_price: plan.monthly_price || '',
    yearly_price: plan.yearly_price || '',
    max_sites: plan.max_sites || '',
    max_agents_per_site: plan.max_agents_per_site || '',
    max_total_agents: plan.max_total_agents || '',
    max_monthly_conversations: plan.max_monthly_conversations || '',
    max_daily_conversations: plan.max_daily_conversations || '',
    max_monthly_messages: plan.max_monthly_messages || '',
    knowledge_base_size_mb: plan.knowledge_base_size_mb || '',
    max_file_uploads: plan.max_file_uploads || '',
    custom_domains_allowed: plan.custom_domains_allowed,
    white_label_allowed: plan.white_label_allowed,
    api_access: plan.api_access,
    webhook_support: plan.webhook_support,
    advanced_analytics: plan.advanced_analytics,
    priority_support: plan.priority_support,
    custom_branding: plan.custom_branding,
    sso_integration: plan.sso_integration,
    is_active: plan.is_active,
    display_order: plan.display_order || 0,
    features: plan.features || [],
    limits: plan.limits || {},
  });

  const [features, setFeatures] = useState<string[]>(
    Array.isArray(plan.features) ? plan.features : []
  );
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    setData('features', features);
  }, [features, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert empty strings to null for numeric fields
    const formData = { ...data };
    const numericFields = [
      'monthly_price', 'yearly_price', 'max_sites', 'max_agents_per_site',
      'max_total_agents', 'max_monthly_conversations', 'max_daily_conversations',
      'max_monthly_messages', 'knowledge_base_size_mb', 'max_file_uploads',
      'display_order'
    ];

    numericFields.forEach(field => {
      if (formData[field as keyof typeof formData] === '') {
        formData[field as keyof typeof formData] = null;
      } else if (formData[field as keyof typeof formData]) {
        formData[field as keyof typeof formData] = Number(formData[field as keyof typeof formData]);
      }
    });

    put(route('admin.agent-plans.update', plan.id));
  };

  const handleSyncStripe = () => {
    if (confirm(`Sync "${plan.name}" with Stripe? This will update Stripe product and price information.`)) {
      window.location.href = route('admin.agent-plans.sync-stripe', plan.id);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  const generateSlug = () => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setData('slug', slug);
  };

  const getPlanTypeDescription = (type: string) => {
    switch (type) {
      case 'per_site':
        return 'Charged per site with multiple agents allowed per site';
      case 'per_agent':
        return 'Charged per individual agent';
      case 'mixed':
        return 'Combination of per site and per agent pricing';
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <Head title={`Edit: ${plan.name}`} />

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
              <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
              <p className="text-muted-foreground">
                {plan.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(plan.stripe_product_id || plan.monthly_price || plan.yearly_price) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSyncStripe}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Stripe
              </Button>
            )}
            <Button type="submit" form="edit-plan-form" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {plan.site_subscriptions_count > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This plan has <strong>{plan.site_subscriptions_count} active subscription(s)</strong>.
              Changes may affect existing customers.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form id="edit-plan-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Information</CardTitle>
                      <CardDescription>
                        Basic details about your plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Plan Name *</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="slug">Slug *</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={generateSlug}
                            >
                              Generate
                            </Button>
                          </div>
                          <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            required
                          />
                          {errors.slug && (
                            <p className="text-sm text-red-600">{errors.slug}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Plan Type *</Label>
                          <Select
                            value={data.type}
                            onValueChange={(value) => setData('type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {planTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            {getPlanTypeDescription(data.type)}
                          </p>
                          {errors.type && (
                            <p className="text-sm text-red-600">{errors.type}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="display_order">Display Order</Label>
                          <Input
                            id="display_order"
                            type="number"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          rows={3}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={data.is_active}
                          onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Active Plan</Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{data.name}</h3>
                          <Badge className="capitalize">
                            {data.type.replace('_', ' ')}
                          </Badge>
                        </div>

                        {data.description && (
                          <p className="text-sm text-gray-600">
                            {data.description}
                          </p>
                        )}

                        <Separator />

                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <Badge variant={data.is_active ? "success" : "secondary"}>
                              {data.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Slug:</span>
                            <code className="text-xs">{data.slug}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order:</span>
                            <span className="font-medium">{data.display_order}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subscriptions:</span>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{plan.site_subscriptions_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Information</CardTitle>
                    <CardDescription>
                      Set your plan pricing and Stripe integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthly_price">Monthly Price ($)</Label>
                        <Input
                          id="monthly_price"
                          type="number"
                          step="0.01"
                          value={data.monthly_price}
                          onChange={(e) => setData('monthly_price', e.target.value)}
                          placeholder="0.00"
                          min="0"
                        />
                        {errors.monthly_price && (
                          <p className="text-sm text-red-600">{errors.monthly_price}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearly_price">Yearly Price ($)</Label>
                        <Input
                          id="yearly_price"
                          type="number"
                          step="0.01"
                          value={data.yearly_price}
                          onChange={(e) => setData('yearly_price', e.target.value)}
                          placeholder="0.00"
                          min="0"
                        />
                        {errors.yearly_price && (
                          <p className="text-sm text-red-600">{errors.yearly_price}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Stripe Integration</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
                          <Input
                            id="stripe_product_id"
                            value={data.stripe_product_id}
                            onChange={(e) => setData('stripe_product_id', e.target.value)}
                            placeholder="prod_..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="stripe_monthly_price_id">Monthly Price ID</Label>
                            <Input
                              id="stripe_monthly_price_id"
                              value={data.stripe_monthly_price_id}
                              onChange={(e) => setData('stripe_monthly_price_id', e.target.value)}
                              placeholder="price_..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stripe_yearly_price_id">Yearly Price ID</Label>
                            <Input
                              id="stripe_yearly_price_id"
                              value={data.stripe_yearly_price_id}
                              onChange={(e) => setData('stripe_yearly_price_id', e.target.value)}
                              placeholder="price_..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-6 text-center">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold">{data.name}</h3>
                        <p className="text-gray-600">Perfect for getting started</p>
                      </div>

                      <div className="mb-6">
                        {data.monthly_price ? (
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">
                              ${parseFloat(data.monthly_price as string).toFixed(2)}
                              <span className="text-lg font-normal text-gray-500">/month</span>
                            </div>
                            {data.yearly_price && (
                              <div className="text-lg">
                                or ${parseFloat(data.yearly_price as string).toFixed(2)}
                                <span className="text-sm text-gray-500">/year</span>
                              </div>
                            )}
                          </div>
                        ) : data.yearly_price ? (
                          <div className="text-4xl font-bold">
                            ${parseFloat(data.yearly_price as string).toFixed(2)}
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
                        {!data.monthly_price && !data.yearly_price ? (
                          <p>Free forever plan with basic features</p>
                        ) : (
                          <p>Billed monthly, cancel anytime</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Toggles</CardTitle>
                  <CardDescription>
                    Enable or disable features for this plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { key: 'custom_domains_allowed', label: 'Custom Domains' },
                      { key: 'white_label_allowed', label: 'White Label' },
                      { key: 'api_access', label: 'API Access' },
                      { key: 'webhook_support', label: 'Webhook Support' },
                      { key: 'advanced_analytics', label: 'Advanced Analytics' },
                      { key: 'priority_support', label: 'Priority Support' },
                      { key: 'custom_branding', label: 'Custom Branding' },
                      { key: 'sso_integration', label: 'SSO Integration' },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor={feature.key} className="font-medium">
                          {feature.label}
                        </Label>
                        <Switch
                          id={feature.key}
                          checked={data[feature.key as keyof typeof data] as boolean}
                          onCheckedChange={(checked) => setData(feature.key as any, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature List</CardTitle>
                  <CardDescription>
                    Add features to display in your plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button type="button" onClick={addFeature}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="border rounded-lg divide-y">
                      {features.map((feature, index) => (
                        <div key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                          <span>{feature}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {features.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No features added yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AgentPlansEdit;
