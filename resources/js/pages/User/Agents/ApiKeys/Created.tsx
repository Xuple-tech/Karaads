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
import { CheckCircle, Copy, Key, AlertTriangle, Calendar } from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
}

interface CreatedApiKey {
  name: string;
  expires_at: string | null;
}

interface ApiKeysCreatedProps {
  agent: AIAgent;
  plain_api_key: string;
  plain_secret_key: string;
  apiKey: CreatedApiKey;
}

export default function ApiKeysCreated() {
  const { props } = usePage<{ props: ApiKeysCreatedProps }>();
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
      <Head title="API Key Created" />

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Created</h1>
          <p className="text-muted-foreground mt-2">
            Your new API key has been created. Save it now - you won't be able to see it again!
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Security Notice</AlertTitle>
          <AlertDescription>
            Copy and save your API key and secret key now. They will not be shown again.
            Store them securely.
          </AlertDescription>
        </Alert>

        {/* Keys Display */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Details</CardTitle>
            <CardDescription>
              Key information for {apiKey.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
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
                  Use this key for API authentication
                </p>
              </div>

              <div>
                <Label>Secret Key</Label>
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
                  Keep this secret key secure - it's used for signing requests
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Key Name</p>
                  <p className="font-medium">{apiKey.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expires</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Never'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agent</p>
                  <p className="font-medium">{agent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className="mt-1">Active</Badge>
                </div>
              </div>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertTitle>Usage Example</AlertTitle>
              <AlertDescription className="space-y-2">
                
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

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          {/* <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>✅ Store your keys in a secure password manager</p>
            <p>✅ Add keys to your application's environment variables</p>
            <p>✅ Test the API key with a simple request</p>
            <p>✅ Set up monitoring for API usage</p>
            <p>✅ Document key usage and rotation schedule</p>
          </CardContent> */}
        </Card>
      </div>
    </Layout>
  );
}