import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import InputError from '@/components/input-error';
import admin from '@/routes/admin';

interface Config {
  id: string;
  key: string;
  value: any;
  type: string;
  description: string;
}

interface ConfigurationProps {
  configs: Config[];
}

export default function Configuration({ configs }: ConfigurationProps) {
  const { flash } = usePage().props;
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    configs.forEach(config => {
      initial[config.key] = config.value;
    });
    return initial;
  });
  const [types, setTypes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    configs.forEach(config => {
      initial[config.key] = config.type;
    });
    return initial;
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Update each config
      for (const config of configs) {
        const newValue = formData[config.key];
        const newType = types[config.key];

        if (newValue !== config.value || newType !== config.type) {
          await fetch(admin.management.configuration.update.url(config.id), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
              value: newValue,
              type: newType,
            }),
          });
        }
      }

      router.reload();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const renderValueInput = (config: Config) => {
    const value = formData[config.key];
    const type = types[config.key];

    switch (type) {
      case 'boolean':
        return (
          <Select
            value={value ? 'true' : 'false'}
            onValueChange={(val) => setFormData({ ...formData, [config.key]: val === 'true' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [config.key]: Number(e.target.value) })}
          />
        );
      case 'json':
        return (
          <Textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, [config.key]: parsed });
              } catch {
                setFormData({ ...formData, [config.key]: e.target.value });
              }
            }}
            rows={4}
            className="font-mono text-sm"
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFormData({ ...formData, [config.key]: e.target.value })}
          />
        );
    }
  };

  return (
    <AdminLayout>
      <Head title="System Configuration" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
            <p className="text-muted-foreground">
              Manage system-wide configuration settings
            </p>
          </div>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{flash.success}</div>
          </div>
        )}

        {flash?.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{flash.error}</div>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {configs.map((config) => (
              <Card key={config.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {config.key}
                  </CardTitle>
                  {config.description && (
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={types[config.key]}
                        onValueChange={(val) => setTypes({ ...types, [config.key]: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Value</Label>
                      {renderValueInput(config)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button type="submit" disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                {processing ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
