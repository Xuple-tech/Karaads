import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import InputError from '@/components/input-error';

interface Prompt {
  id: string;
  name: string;
  prompt: string;
  description: string;
  category: string;
  variables: string[];
}

interface EditProps {
  prompt: Prompt;
}

export default function Edit({ prompt }: EditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: prompt.name,
    prompt: prompt.prompt,
    description: prompt.description,
    category: prompt.category,
    variables: prompt.variables || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.prompts.update', prompt.id));
  };

  const addVariable = () => {
    setData('variables', [...data.variables, '']);
  };

  const updateVariable = (index: number, value: string) => {
    const newVariables = [...data.variables];
    newVariables[index] = value;
    setData('variables', newVariables);
  };

  const removeVariable = (index: number) => {
    setData('variables', data.variables.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <Head title={`Edit ${prompt.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={route('admin.prompts.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Prompts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Prompt Template</h1>
            <p className="text-muted-foreground">
              Update the AI prompt template details.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Prompt Template Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Code Review Assistant"
                  />
                  <InputError message={errors.name} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.category} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Brief description of what this prompt template does"
                  rows={3}
                />
                <InputError message={errors.description} />
              </div>

              <div>
                <Label htmlFor="prompt">Prompt Template *</Label>
                <Textarea
                  id="prompt"
                  value={data.prompt}
                  onChange={(e) => setData('prompt', e.target.value)}
                  placeholder="Write your prompt template here. Use {{variable}} for dynamic content."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Use double curly braces for variables, e.g., {{topic}}, {{language}}
                </p>
                <InputError message={errors.prompt} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Variables</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                    Add Variable
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {data.variables.map((variable, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={variable}
                        onChange={(e) => updateVariable(index, e.target.value)}
                        placeholder="variable_name"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariable(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <InputError message={errors.variables} />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href={route('admin.prompts.index')}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  {processing ? 'Updating...' : 'Update Template'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
