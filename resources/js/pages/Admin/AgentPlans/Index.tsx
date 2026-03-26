import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Eye,
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
  Calendar
} from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';

interface AgentPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: string;
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
  features: Record<string, any> | null;
  limits: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  site_subscriptions_count: number;
}

interface AgentPlansPageProps {
  plans: {
    data: AgentPlan[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  };
  planTypes: string[];
}

const AgentPlansIndex = ({ plans, planTypes }: AgentPlansPageProps) => {
  const [currentFilters, setCurrentFilters] = useState({});
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);

  const columns = [
    {
      key: 'name',
      title: 'Plan Name',
      render: (row: AgentPlan) => (
        <div className="space-y-1">
          <div className="font-medium flex items-center space-x-2">
            <span>{row.name}</span>
            {row.is_active ? (
              <Badge variant="success" className="text-xs">Active</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>
          <div className="text-xs text-gg-500">{row.slug}</div>
          {row.description && (
            <div className="text-sm text-gg-600 truncate max-w-xs">
              {row.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (row: AgentPlan) => (
        <Badge variant="outline" className="capitalize">
          {row.type.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'pricing',
      title: 'Pricing',
      render: (row: AgentPlan) => (
        <div className="space-y-1">
          {row.monthly_price !== null && (
            <div className="flex items-center text-sm">
              <DollarSign className="h-3 w-3 mr-1 text-gg-400" />
              <span className="font-medium">${row.monthly_price}</span>
              <span className="text-xs text-gg-500 ml-1">/month</span>
            </div>
          )}
          {row.yearly_price !== null && (
            <div className="flex items-center text-sm">
              <Calendar className="h-3 w-3 mr-1 text-gg-400" />
              <span className="font-medium">${row.yearly_price}</span>
              <span className="text-xs text-gg-500 ml-1">/year</span>
            </div>
          )}
          {!row.monthly_price && !row.yearly_price && (
            <Badge variant="outline" className="text-xs">Free</Badge>
          )}
        </div>
      )
    },
    {
      key: 'limits',
      title: 'Limits',
      render: (row: AgentPlan) => (
        <div className="text-xs space-y-1">
          {row.max_sites !== null && row.max_sites > 0 && (
            <div className="flex items-center">
              <Globe className="h-3 w-3 mr-1 text-gg-400" />
              <span>{row.max_sites} sites</span>
            </div>
          )}
          {row.max_agents_per_site !== null && row.max_agents_per_site > 0 && (
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gg-400" />
              <span>{row.max_agents_per_site}/site</span>
            </div>
          )}
          {row.max_total_agents !== null && row.max_total_agents > 0 && (
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gg-400" />
              <span>{row.max_total_agents} total agents</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'features',
      title: 'Features',
      render: (row: AgentPlan) => (
        <div className="flex flex-wrap gap-1">
          {row.custom_domains_allowed && (
            <Badge variant="outline" className="text-xs">Custom Domains</Badge>
          )}
          {row.api_access && (
            <Badge variant="outline" className="text-xs">API</Badge>
          )}
          {row.white_label_allowed && (
            <Badge variant="outline" className="text-xs">White Label</Badge>
          )}
          {row.advanced_analytics && (
            <Badge variant="outline" className="text-xs">Analytics</Badge>
          )}
          {row.sso_integration && (
            <Badge variant="outline" className="text-xs">SSO</Badge>
          )}
        </div>
      )
    },
    {
      key: 'subscriptions',
      title: 'Subscriptions',
      render: (row: AgentPlan) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-gg-400" />
          <span className="font-medium">{row.site_subscriptions_count}</span>
        </div>
      )
    },
    {
      key: 'display_order',
      title: 'Order',
      render: (row: AgentPlan) => (
        <div className="text-center">
          <Badge variant="secondary">{row.display_order || 0}</Badge>
        </div>
      )
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setCurrentFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setCurrentFilters({});
    window.location.href = route('admin.agent-plans.index');
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    window.location.href = `${route('admin.agent-plans.index')}?${params.toString()}`;
  };

  const filterOptions = [
    {
      name: 'search',
      placeholder: 'Search plans...',
      value: currentFilters.search
    },
    {
      name: 'type',
      placeholder: 'Filter by Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...planTypes.map(type => ({
          value: type,
          label: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)
        }))
      ],
      value: currentFilters.type
    },
    {
      name: 'is_active',
      placeholder: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
      value: currentFilters.is_active
    }
  ];

  const handleEdit = (plan: AgentPlan) => {
    window.location.href = route('admin.agent-plans.edit', plan.id);
  };

  const handleShow = (plan: AgentPlan) => {
    window.location.href = route('admin.agent-plans.show', plan.id);
  };

  const handleDelete = (plan: AgentPlan) => {
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

  const handleToggleStatus = (plan: AgentPlan) => {
    if (confirm(`Are you sure you want to ${plan.is_active ? 'deactivate' : 'activate'} "${plan.name}"?`)) {
      window.location.href = route('admin.agent-plans.toggle-status', plan.id);
    }
  };

  const handleSyncStripe = (plan: AgentPlan) => {
    if (confirm(`Sync "${plan.name}" with Stripe? This will update Stripe product and price information.`)) {
      window.location.href = route('admin.agent-plans.sync-stripe', plan.id);
    }
  };

  const getPlanStats = () => {
    const stats = {
      total: plans.total,
      active: plans.data.filter(p => p.is_active).length,
      free: plans.data.filter(p => !p.monthly_price && !p.yearly_price).length,
      paid: plans.data.filter(p => p.monthly_price || p.yearly_price).length,
      totalSubscriptions: plans.data.reduce((sum, plan) => sum + plan.site_subscriptions_count, 0),
    };
    return stats;
  };

  const planStats = getPlanStats();

  return (
    <AdminLayout>
      <Head title="Agent Plans" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Plans</h1>
            <p className="text-muted-foreground">
              Manage subscription plans for AI agents
            </p>
          </div>
          <Button asChild>
            <Link href={route('admin.agent-plans.create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{planStats.total}</div>
                  <div className="text-sm text-gg-500">Total Plans</div>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{planStats.active}</div>
                  <div className="text-sm text-gg-500">Active Plans</div>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{planStats.free}</div>
                  <div className="text-sm text-gg-500">Free Plans</div>
                </div>
                <DollarSign className="h-8 w-8 text-gg-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{planStats.paid}</div>
                  <div className="text-sm text-gg-500">Paid Plans</div>
                </div>
                <CreditCard className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{planStats.totalSubscriptions}</div>
                  <div className="text-sm text-gg-500">Total Subs</div>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterBar
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Plans ({plans.total})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={plans.data}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShow={handleShow}
              actions={[
                {
                  icon: Switch,
                  onClick: handleToggleStatus,
                  title: 'Toggle Status',
                  variant: 'outline',
                  size: 'sm'
                },
                {
                  icon: RefreshCw,
                  onClick: handleSyncStripe,
                  title: 'Sync Stripe',
                  variant: 'outline',
                  size: 'sm',
                  condition: (plan) => plan.stripe_product_id || plan.monthly_price || plan.yearly_price
                }
              ]}
              pagination={{
                total: plans.total,
                from: plans.from,
                to: plans.to,
                currentPage: plans.current_page,
                lastPage: plans.last_page,
                prevPageUrl: plans.prev_page_url,
                nextPageUrl: plans.next_page_url,
              }}
              emptyState={{
                title: "No plans found",
                description: "Get started by creating your first agent plan.",
                action: (
                  <Button asChild>
                    <Link href={route('admin.agent-plans.create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Plan
                    </Link>
                  </Button>
                )
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgentPlansIndex;
