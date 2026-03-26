import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Copy, Key, AlertTriangle, RefreshCw } from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
}

interface ApiKey {
  id: number;
  name: string;
  expires_at: string | null;
  is_active: boolean;
}

interface ApiKeysRegeneratedProps {
  agent: AIAgent;
  plain_api_key: string;
  plain_secret_key: string;
  apiKey: ApiKey;
}

export default function ApiKeysRegenerated() {
  const { props } = usePage<{ props: ApiKeysRegeneratedProps }>();
  const { agent, plain_api_key, plain_secret_key, apiKey } = props;
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [secretKeyCopied, setSecretKeyCopied] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const copyToClipboard = (text: string, type: 'api' | 'secret') => {
    navigator.clipboard.writeText(text);
    if (type === 'api') {
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } else {
      setSecretKeyCopied(true);
      setTimeout(() => setSecretKeyCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <Head title="API Key Regenerated" />

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Regenerated</h1>
          <p className="text-muted-foreground mt-2">
            Your API key has been regenerated. Update your applications with the new keys.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important: Update Your Applications</AlertTitle>
          <AlertDescription>
            The old API key has been invalidated. Any applications using the old key will
            stop working until you update them with the new key.
          </AlertDescription>
        </Alert>

        {/* Keys Display */}
        <Card>
          <CardHeader>
            <CardTitle>New API Key Details</CardTitle>
            <CardDescription>
              New key information for {apiKey.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>New API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={plain_api_key}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(plain_api_key, 'api')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {apiKeyCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Use this new key for API authentication
                </p>
              </div>

              <div>
                <Label>New Secret Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={plain_secret_key}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(plain_secret_key, 'secret')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {secretKeyCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  New secret key for signing requests
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Key Name</p>
                  <p className="font-medium">{apiKey.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expires</p>
                  <span className="font-medium">
                    {apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Never'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agent</p>
                  <p className="font-medium">{agent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                    {apiKey.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertTitle>Update Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Update the following in your applications:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Environment variables</li>
                  <li>Configuration files</li>
                  <li>Deployment scripts</li>
                  <li>CI/CD pipelines</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between pt-6 border-t">
              <Link href={`/ai-agents/agents/${agent.id}/api-keys`}>
                <Button variant="outline">
                  View All API Keys
                </Button>
              </Link>
              <Link href={`/ai-agents/agents/${agent.id}`}>
                <Button>
                  Go to Agent Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Immediate Actions</CardTitle>
          </CardHeader>
          {/* <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>✅ Update all applications using this API key</p>
            <p>✅ Test API calls with the new key</p>
            <p>✅ Monitor for any failed requests during transition</p>
            <p>✅ Document the key rotation date and reason</p>
            <p>✅ Consider rotating other keys for security</p>
          </CardContent> */}
        </Card>
      </div>
    </Layout>
  );
}