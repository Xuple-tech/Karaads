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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import user from '@/routes/user';

interface KnowledgeBase {
  id: number;
  title: string;
  content: string;
  content_type: 'faq' | 'product_info' | 'policy' | 'custom' | 'website_content';
  source_url?: string;
  is_active: boolean;
}

interface AIAgent {
  id: number;
  name: string;
}

interface EditProps {
  agent: AIAgent;
  knowledge: KnowledgeBase;
}

export default function KnowledgeBaseEdit() {
  const { props } = usePage<{ props: EditProps }>();
  const { agent, knowledge } = props;
  const { data, setData, put, processing, errors } = useForm({
    title: knowledge.title,
    content: knowledge.content,
    content_type: knowledge.content_type,
    source_url: knowledge.source_url || '',
    is_active: knowledge.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(user.agents.knowledgeBase.update.url({ agent: agent.id, knowledge: knowledge.id }), {
      onSuccess: () => {
        // Redirect handled by Laravel
      },
    });
  };

  return (
    <Layout>
      <Head title="Edit Knowledge Base Item" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={user.agents.knowledgeBase.index.url(agent.id)}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Knowledge Base Item
            </h1>
            <p className="text-muted-foreground">
              Update item for {agent.name}'s knowledge base
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Update information about this knowledge base item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., How to reset password"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Content Type */}
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select value={data.content_type} onValueChange={(value) => setData('content_type', value)}>
                  <SelectTrigger id="content_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="product_info">Product Info</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="website_content">Website Content</SelectItem>
                  </SelectContent>
                </Select>
                {errors.content_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.content_type}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the content for this knowledge base item..."
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  rows={10}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                )}
              </div>

              {/* Source URL */}
              <div>
                <Label htmlFor="source_url">Source URL (Optional)</Label>
                <Input
                  id="source_url"
                  placeholder="https://example.com/source"
                  value={data.source_url}
                  onChange={(e) => setData('source_url', e.target.value)}
                  className={errors.source_url ? 'border-red-500' : ''}
                />
                {errors.source_url && (
                  <p className="text-sm text-red-500 mt-1">{errors.source_url}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active (visible to AI agent)
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Link href={user.agents.knowledgeBase.index.url(agent.id)}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
