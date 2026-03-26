import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, TestTube, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface Prompt {
  id: string;
  name: string;
  prompt: string;
  description: string;
  category: string;
  variables: string[];
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ShowProps {
  prompt: Prompt;
}

export default function Show({ prompt }: ShowProps) {
  const { flash } = usePage().props;
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${prompt.name}"?`)) {
      router.delete(route('admin.prompts.destroy', prompt.id));
    }
  };

  const handleTest = async () => {
    if (!testInput.trim()) {
      alert('Please enter test input');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(route('admin.prompts.test', prompt.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          test_input: testInput,
        }),
      });

      const data = await response.json();
      if (data.rendered) {
        setTestOutput(data.rendered);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminLayout>
      <Head title={prompt.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('admin.prompts.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Prompts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{prompt.name}</h1>
              <p className="text-muted-foreground">
                {prompt.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('admin.prompts.edit', prompt.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{flash.success}</div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Prompt Template */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                    {prompt.prompt}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card>
              <CardHeader>
                <CardTitle>Test Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-input">Test Input</Label>
                  <Textarea
                    id="test-input"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test input to render the prompt..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleTest} disabled={testing}>
                  <TestTube className="mr-2 h-4 w-4" />
                  {testing ? 'Testing...' : 'Test Render'}
                </Button>
                {testOutput && (
                  <div>
                    <Label>Rendered Output</Label>
                    <div className="bg-green-50 p-4 rounded-lg mt-2">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-green-800">
                        {testOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {prompt.category || 'Uncategorized'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Usage Count</Label>
                  <div className="mt-1 text-2xl font-bold">
                    {prompt.usage_count}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                      {prompt.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(prompt.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variables */}
            {prompt.variables && prompt.variables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prompt.variables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {'{{' + variable + '}}'}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
