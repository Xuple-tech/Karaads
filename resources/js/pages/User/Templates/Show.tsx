import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Cpu,
  ArrowLeft,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  ShoppingCart,
  Headphones,
  BookOpen,
  Globe,
  Rocket,
  Star,
  Users,
  MessageSquare,
  PenTool as Tool,
  BookOpen as Book,
} from 'lucide-react';

interface Site {
  id: number;
  name: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
  welcome_message: string;
  default_config: Record<string, any>;
  widget_settings: Record<string, any> | null;
  tools_config: any[] | null;
  knowledge_base_structure: any[] | null;
  features: string[];
  estimated_setup_time: number;
  icon: string | null;
  preview_image: string | null;
}

interface SimilarTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
}

interface TemplateShowProps {
  template: Template;
  similarTemplates: SimilarTemplate[];
}

export default function TemplateShow() {
  const { props } = usePage<{ props: TemplateShowProps }>();
  const { template, similarTemplates } = props;
  const { data, setData, post, processing, errors } = useForm({
    site_id: '',
    name: `${template.name} Agent`,
  });
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const sites: Site[] = []; // This would come from Inertia props

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ecommerce':
        return ShoppingCart;
      case 'support':
        return Headphones;
      case 'education':
        return BookOpen;
      case 'travel':
        return Globe;
      case 'productivity':
        return Zap;
      case 'starter':
        return Rocket;
      default:
        return Cpu;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/agents/templates/${template.id}/apply`);
  };

  const CategoryIcon = getCategoryIcon(template.category);

  return (
    <Layout>
      <Head title={template.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agents/templates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Templates
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {template.name}
                </h1>
                {template.is_premium && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CategoryIcon className="h-4 w-4" />
                <span>{template.category}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{template.estimated_setup_time} min setup</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Template Overview</CardTitle>
                <CardDescription>
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Welcome Message</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p>{template.welcome_message}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Key Features</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {template.default_config && (
                  <div>
                    <h3 className="font-medium mb-3">Default Configuration</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(template.default_config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
                <CardDescription>
                  Everything you get with this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Pre-built Conversations</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optimized conversation flows
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Tool className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Tools & Integrations</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.tools_config?.length || 0} pre-configured tools
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Book className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium">Knowledge Base</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.knowledge_base_structure?.length || 0} knowledge items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Template */}
            <Card>
              <CardHeader>
                <CardTitle>Use This Template</CardTitle>
                <CardDescription>
                  Create an agent from this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      {template.is_premium ? (
                        <>
                          <Crown className="mr-2 h-5 w-5" />
                          Use Premium Template
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Use This Template
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create Agent from Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Create a new AI agent using the "{template.name}" template.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Agent Name *</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="My AI Agent"
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="site_id">Select Site *</Label>
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
                            <p className="text-sm text-red-500">{errors.site_id}</p>
                          )}
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">
                          Cancel
                        </AlertDialogCancel>
                        <Button type="submit" disabled={processing}>
                          {processing ? 'Creating...' : 'Create Agent'}
                        </Button>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>

                {template.is_premium && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-800">
                        Premium Template
                      </p>
                    </div>
                    <p className="text-sm text-purple-700">
                      Requires a paid subscription to use.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimated_setup_time} minute setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Pre-configured for immediate use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Fully customizable after creation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Details */}
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setup Time:</span>
                  <span className="font-medium">{template.estimated_setup_time} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools Included:</span>
                  <span className="font-medium">{template.tools_config?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Knowledge Items:</span>
                  <span className="font-medium">{template.knowledge_base_structure?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant={template.is_premium ? 'default' : 'outline'}>
                    {template.is_premium ? 'Premium' : 'Free'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Similar Templates */}
            {similarTemplates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Templates</CardTitle>
                  <CardDescription>
                    Other templates you might like
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {similarTemplates.map((similar) => (
                      <Link
                        key={similar.id}
                        href={`/agents/templates/${similar.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="bg-blue-100 p-2 rounded">
                            {getCategoryIcon(similar.category)({
                              className: 'h-4 w-4 text-blue-600',
                            })}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{similar.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {similar.category}
                            </p>
                          </div>
                          {similar.is_premium && (
                            <Crown className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}