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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Key, Calendar, Shield } from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
}

interface ApiKeysCreateProps {
  agent: AIAgent;
}

export default function ApiKeysCreate() {
  const { props } = usePage<{ props: ApiKeysCreateProps }>();
  const { agent } = props;

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    permissions: ['read', 'write'],
    expires_at: '',
  });

  const [customDate, setCustomDate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/ai-agents/agents/${agent.id}/api-keys`);
  };

  const permissionOptions = [
    { id: 'read', label: 'Read Access', description: 'Read data from the agent' },
    { id: 'write', label: 'Write Access', description: 'Send messages and interact' },
    { id: 'admin', label: 'Admin Access', description: 'Full access including settings' },
    { id: 'conversations', label: 'Conversations', description: 'Access conversations' },
    { id: 'analytics', label: 'Analytics', description: 'Access analytics data' },
  ];

  const togglePermission = (permission: string) => {
    const current = data.permissions || [];
    const newPermissions = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    setData('permissions', newPermissions);
  };

  const expirationOptions = [
    { value: null, label: 'Never expire' },
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: '365', label: '1 year' },
    { value: 'custom', label: 'Custom date' },
  ];

  const handleExpirationChange = (value: string) => {
    if (value === 'custom') {
      setCustomDate(true);
      setData('expires_at', '');
    } else if (value) {
      setCustomDate(false);
      const date = new Date();
      date.setDate(date.getDate() + parseInt(value));
      setData('expires_at', date.toISOString().split('T')[0]);
    } else {
      setCustomDate(false);
      setData('expires_at', '');
    }
  };

  return (
    <Layout>
      <Head title={`Create API Key - ${agent.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/ai-agents/agents/${agent.id}/api-keys`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to API Keys
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create API Key
            </h1>
            <p className="text-muted-foreground">
              Create a new API key for {agent.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Configuration</CardTitle>
                  <CardDescription>
                    Configure your API key's permissions and expiration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Key Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Production API Key"
                        className="mt-2"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        A descriptive name to identify this key
                      </p>
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-3 block">Permissions</Label>
                      <div className="space-y-3">
                        {permissionOptions.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-start space-x-3"
                          >
                            <Checkbox
                              id={`permission-${option.id}`}
                              checked={data.permissions?.includes(option.id)}
                              onCheckedChange={() => togglePermission(option.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={`permission-${option.id}`}
                                className="font-medium"
                              >
                                {option.label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="expires_at" className="mb-2 block">
                        Expiration
                      </Label>
                      <Select
                        value={customDate ? 'custom' : data.expires_at ? 'custom' : ''}
                        onValueChange={handleExpirationChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          {expirationOptions.map((option) => (
                            <SelectItem key={option.value || 'never'} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {customDate && (
                        <Input
                          type="date"
                          value={data.expires_at}
                          onChange={(e) => setData('expires_at', e.target.value)}
                          className="mt-2"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Recommended: Set an expiration date for security
                      </p>
                      {errors.expires_at && (
                        <p className="text-sm text-red-500 mt-1">{errors.expires_at}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <Link href={`/ai-agents/agents/${agent.id}/api-keys`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Creating...' : 'Create API Key'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>• Only grant necessary permissions</p>
                  <p>• Set expiration dates for temporary access</p>
                  <p>• Store keys in environment variables</p>
                  <p>• Never commit keys to version control</p>
                  <p>• Rotate keys periodically</p>
                  <p>• Monitor key usage regularly</p>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent:</span>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {agent.slug}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Keys:</span>
                    <span className="font-medium">Creating new</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}