import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

export default function SitesCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    domain: '',
    url: '',
    site_type: 'website',
    industry: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/ai-agents/sites');
  };

  const siteTypes = [
    { value: 'website', label: 'Website' },
    { value: 'web_app', label: 'Web Application' },
    { value: 'mobile_app', label: 'Mobile App' },
    { value: 'ecommerce', label: 'E-commerce Store' },
    { value: 'saas', label: 'SaaS Platform' },
  ];

  const industries = [
    'Technology',
    'E-commerce',
    'Healthcare',
    'Education',
    'Finance',
    'Real Estate',
    'Entertainment',
    'Travel',
    'Food & Beverage',
    'Other',
  ];

  return (
    <Layout>
      <Head title="Create New Site" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/ai-agents/sites">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sites
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Site
            </h1>
            <p className="text-muted-foreground">
              Add a new website or application to manage AI agents
            </p>
          </div>
        </div>

        <Card className='bg-accent'>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Provide details about your website or application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Site Name *
                    </label>
                    <Input
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="My Awesome Website"
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Website URL *
                    </label>
                    <Input
                      value={data.url}
                      onChange={(e) => setData('url', e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The main URL where your AI agents will be deployed
                    </p>
                    {errors.url && (
                      <p className="text-sm text-red-500 mt-1">{errors.url}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Custom Domain (Optional)
                    </label>
                    <Input
                      value={data.domain}
                      onChange={(e) => setData('domain', e.target.value)}
                      placeholder="https://app.example.com"
                      type="url"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your custom domain for the AI agent widget
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Site Type *
                    </label>
                    <Select
                      value={data.site_type}
                      onValueChange={(value) => setData('site_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.site_type && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.site_type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Industry (Optional)
                    </label>
                    <Select
                      value={data.industry}
                      onValueChange={(value) => setData('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description (Optional)
                    </label>
                    <Textarea
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe your website or application..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Link href="/agents/sites">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Site'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • Make sure your website URL is accessible and publicly available
            </p>
            <p>• Custom domains require DNS verification</p>
            <p>
              • You can add AI agents to your site after creation
            </p>
            <p>• Site verification may be required for certain features</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}