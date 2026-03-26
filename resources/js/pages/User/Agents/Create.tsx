import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ArrowLeft, Cpu, Palette, Settings, AlertCircle } from 'lucide-react';
import TrialStatus from '@/components/subscription/TrialStatus';

interface Site {
  id: number;
  name: string;
  domain: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  is_premium: boolean;
  category: string;
}

interface AgentsCreateProps {
  sites: Site[];
  templates: Template[];
  trial: {
    isOnTrial: boolean;
    hasTrialExpired: boolean;
    daysRemaining: number;
    agentQuota: number;
    remainingQuota: number;
    canCreateAgents: boolean;
  };
}

export default function AgentsCreate() {
  const { props } = usePage<{ props: AgentsCreateProps }>();
  const { sites, templates, trial } = props;

  const { data, setData, post, processing, errors } = useForm({
    site_id: '',
    name: '',
    description: '',
    agent_type: 'widget',
    behavior_profile: '',
    welcome_message: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    template_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/ai-agents/agents');
  };

  const agentTypes = [
    { value: 'widget', label: 'Website Widget' },
    { value: 'api', label: 'API Integration' },
    { value: 'full_site', label: 'Full Site Assistant' },
    { value: 'mobile_app', label: 'Mobile App Assistant' },
  ];

  const behaviorProfiles = [
    { value: 'helpful', label: 'Helpful Assistant' },
    { value: 'professional', label: 'Professional Support' },
    { value: 'friendly', label: 'Friendly Chat' },
    { value: 'technical', label: 'Technical Expert' },
    { value: 'sales', label: 'Sales Representative' },
  ];

  return (
    <Layout>
      <Head title="Create AI Agent" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/ai-agents/agents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create AI Agent
            </h1>
            <p className="text-muted-foreground">
              Create a new AI agent for your website or application
            </p>
          </div>
        </div>

        {/* Trial Status Alert */}
        {!trial.canCreateAgents && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Cannot Create Agents</h3>
              <p className="text-sm text-red-800 mt-1">
                {trial.hasTrialExpired 
                  ? 'Your free trial has expired. Upgrade to a paid plan to create new agents.'
                  : 'You have reached your agent creation limit or your trial has expired. Upgrade your plan to create more agents.'}
              </p>
              <Link href="/subscription" className="mt-3 inline-block">
                <Button size="sm" variant="default">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        )}

        {trial.isOnTrial && trial.canCreateAgents && trial.remainingQuota <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Limited Trial Quota</h3>
              <p className="text-sm text-yellow-800 mt-1">
                You can create {trial.remainingQuota} more agent{trial.remainingQuota !== 1 ? 's' : ''} during your free trial. 
                Consider upgrading to continue creating unlimited agents.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Configure your AI agent's basic settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="appearance">Appearance</TabsTrigger>
                      <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Site *
                          </label>
                          <Select
                            value={data.site_id}
                            onValueChange={(value) => setData('site_id', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a site" />
                            </SelectTrigger>
                            <SelectContent>
                              {sites.map((site) => (
                                <SelectItem key={site.id} value={site.id.toString()}>
                                  {site.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.site_id && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.site_id}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Agent Name *
                          </label>
                          <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Customer Support Assistant"
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Description
                          </label>
                          <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe what this agent does..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Agent Type *
                          </label>
                          <Select
                            value={data.agent_type}
                            onValueChange={(value) => setData('agent_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent type" />
                            </SelectTrigger>
                            <SelectContent>
                              {agentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Template (Optional)
                          </label>
                          <Select
                            value={data.template_id}
                            onValueChange={(value) => setData('template_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem >None (Custom)</SelectItem>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name}
                                  {template.is_premium && ' (Premium)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground mt-1">
                            Start with a pre-configured template
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Primary Color
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={data.primary_color}
                                onChange={(e) => setData('primary_color', e.target.value)}
                                type="color"
                                className="w-12 p-1"
                              />
                              <Input
                                value={data.primary_color}
                                onChange={(e) => setData('primary_color', e.target.value)}
                                placeholder="#3B82F6"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Secondary Color
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={data.secondary_color}
                                onChange={(e) => setData('secondary_color', e.target.value)}
                                type="color"
                                className="w-12 p-1"
                              />
                              <Input
                                value={data.secondary_color}
                                onChange={(e) => setData('secondary_color', e.target.value)}
                                placeholder="#1E40AF"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Behavior Tab */}
                    <TabsContent value="behavior" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Behavior Profile
                          </label>
                          <Select
                            value={data.behavior_profile}
                            onValueChange={(value) => setData('behavior_profile', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select behavior profile" />
                            </SelectTrigger>
                            <SelectContent>
                              {behaviorProfiles.map((profile) => (
                                <SelectItem key={profile.value} value={profile.value}>
                                  {profile.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground mt-1">
                            Defines the agent's communication style
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Welcome Message
                          </label>
                          <Textarea
                            value={data.welcome_message}
                            onChange={(e) => setData('welcome_message', e.target.value)}
                            placeholder="Hello! How can I help you today?"
                            rows={3}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            The first message users see when starting a conversation
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <Link href="/ai-agents/agents">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Creating...' : 'Create Agent'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Agent appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-900 text-white p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: data.primary_color }}
                      />
                      <div>
                        <p className="font-medium">AI Assistant</p>
                        <p className="text-sm text-gray-300">
                          {data.name || 'Your Agent'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm">
                          {data.welcome_message || 'Hello! How can I help you today?'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                          Ask a question
                        </div>
                        <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                          Get support
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>This is a preview of how your agent will appear to users.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trial Status Card */}
            {(trial.isOnTrial || trial.hasTrialExpired) && (
              <TrialStatus
                isOnTrial={trial.isOnTrial}
                hasTrialExpired={trial.hasTrialExpired}
                daysRemaining={trial.daysRemaining}
                agentQuota={trial.agentQuota}
                remainingQuota={trial.remainingQuota}
                variant="card"
                upgradeUrl="/subscription"
              />
            )}

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Choose a descriptive name for easy identification</p>
                <p>• Select colors that match your website's branding</p>
                <p>• The welcome message sets the tone for conversations</p>
                <p>• You can further customize the agent after creation</p>
                <p>• Templates provide pre-configured setups</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}