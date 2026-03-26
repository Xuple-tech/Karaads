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
import { ArrowLeft, Globe } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  domain: string | null;
  url: string;
  site_type: string;
  industry: string | null;
  description: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

interface SiteEditProps {
  site: Site;
}

export default function SiteEdit() {
  const { props } = usePage<{ props: SiteEditProps }>();
  const { site } = props;

  const { data, setData, put, processing, errors } = useForm({
    name: site.name,
    domain: site.domain || '',
    url: site.url,
    site_type: site.site_type,
    industry: site.industry || '',
    description: site.description || '',
    primary_color: site.primary_color || '',
    secondary_color: site.secondary_color || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/ai-agents/sites/${site.id}`);
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
      <Head title={`Edit ${site.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/agents/sites/${site.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit {site.name}
              </h1>
              <p className="text-muted-foreground">
                Update site information and settings
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Update your website or application details
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={data.primary_color}
                          onChange={(e) =>
                            setData('primary_color', e.target.value)
                          }
                          placeholder="#3B82F6"
                          type="color"
                          className="w-12 p-1"
                        />
                        <Input
                          value={data.primary_color}
                          onChange={(e) =>
                            setData('primary_color', e.target.value)
                          }
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
                          onChange={(e) =>
                            setData('secondary_color', e.target.value)
                          }
                          placeholder="#1E40AF"
                          type="color"
                          className="w-12 p-1"
                        />
                        <Input
                          value={data.secondary_color}
                          onChange={(e) =>
                            setData('secondary_color', e.target.value)
                          }
                          placeholder="#1E40AF"
                          className="flex-1"
                        />
                      </div>
                    </div>
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
                        <SelectItem value="">Not specified</SelectItem>
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
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Link href={`/agents/sites/${site.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}