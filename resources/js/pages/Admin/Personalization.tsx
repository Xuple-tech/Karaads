import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Loader2, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemPersonalization {
  id: string;
  name: string;
  description?: string;
  system_prompt: string;
  min_tone_level: number;
  max_tone_level: number;
  min_detail_level: number;
  max_detail_level: number;
  min_response_length: number;
  max_response_length: number;
  is_default: boolean;
  is_active: boolean;
  template_count: number;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  default_tone_level: number;
  default_detail_level: number;
  default_response_length: number;
  is_system_template: boolean;
  is_active: boolean;
  usage_count: number;
  system_personalization?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export default function AdminPersonalizationPage() {
  const [personalizations, setPersonalizations] = useState<SystemPersonalization[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [personalizationForm, setPersonalizationForm] = useState({
    name: '',
    description: '',
    system_prompt: '',
    min_tone_level: 1,
    max_tone_level: 10,
    min_detail_level: 1,
    max_detail_level: 10,
    min_response_length: 1,
    max_response_length: 10,
    is_default: false,
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    emoji: '📝',
    system_personalization_id: '',
    default_tone_level: 5,
    default_detail_level: 5,
    default_response_length: 5,
    is_system_template: false,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [persRes, templatesRes] = await Promise.all([
        fetch('/api/admin/system-personalizations'),
        fetch('/api/admin/personalization-templates'),
      ]);

      if (!persRes.ok || !templatesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [persData, templatesData] = await Promise.all([
        persRes.json(),
        templatesRes.json(),
      ]);

      setPersonalizations(persData.personalizations);
      setTemplates(templatesData.templates);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validatePersonalizationForm = () => {
    if (!personalizationForm.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!personalizationForm.system_prompt.trim()) {
      toast.error('System prompt is required');
      return false;
    }
    if (personalizationForm.min_tone_level > personalizationForm.max_tone_level) {
      toast.error('Min tone cannot exceed max tone');
      return false;
    }
    if (personalizationForm.min_detail_level > personalizationForm.max_detail_level) {
      toast.error('Min detail cannot exceed max detail');
      return false;
    }
    if (personalizationForm.min_response_length > personalizationForm.max_response_length) {
      toast.error('Min length cannot exceed max length');
      return false;
    }
    return true;
  };

  const validateTemplateForm = () => {
    if (!templateForm.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (templateForm.system_personalization_id) {
      const sysPers = personalizations.find(p => p.id === templateForm.system_personalization_id);
      if (sysPers) {
        if (templateForm.default_tone_level < sysPers.min_tone_level || templateForm.default_tone_level > sysPers.max_tone_level) {
          toast.error(`Tone must be between ${sysPers.min_tone_level} and ${sysPers.max_tone_level}`);
          return false;
        }
        if (templateForm.default_detail_level < sysPers.min_detail_level || templateForm.default_detail_level > sysPers.max_detail_level) {
          toast.error(`Detail must be between ${sysPers.min_detail_level} and ${sysPers.max_detail_level}`);
          return false;
        }
        if (templateForm.default_response_length < sysPers.min_response_length || templateForm.default_response_length > sysPers.max_response_length) {
          toast.error(`Length must be between ${sysPers.min_response_length} and ${sysPers.max_response_length}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSavePersonalization = async () => {
    if (!validatePersonalizationForm()) return;

    try {
      setSaving(true);
      const url = editingId
        ? `/api/admin/system-personalizations/${editingId}`
        : '/api/admin/system-personalizations';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalizationForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      await fetchAllData();
      resetPersonalizationForm();
      toast.success(editingId ? 'Updated successfully' : 'Created successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!validateTemplateForm()) return;

    try {
      setSaving(true);
      const url = editingId
        ? `/api/admin/personalization-templates/${editingId}`
        : '/api/admin/personalization-templates';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      await fetchAllData();
      resetTemplateForm();
      toast.success(editingId ? 'Updated successfully' : 'Created successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/personalization-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      await fetchAllData();
      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    }
  };

  const resetPersonalizationForm = () => {
    setPersonalizationForm({
      name: '',
      description: '',
      system_prompt: '',
      min_tone_level: 1,
      max_tone_level: 10,
      min_detail_level: 1,
      max_detail_level: 10,
      min_response_length: 1,
      max_response_length: 10,
      is_default: false,
    });
    setEditingId(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      emoji: '📝',
      system_personalization_id: '',
      default_tone_level: 5,
      default_detail_level: 5,
      default_response_length: 5,
      is_system_template: false,
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalization Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure system personalizations and templates for your users
        </p>
      </div>

      <Tabs defaultValue="personalizations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personalizations">System Personalizations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="personalizations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">System Personalizations</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={resetPersonalizationForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Personalization
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create System Personalization</DialogTitle>
                  <DialogDescription>
                    Define base system prompt and preference constraints
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={personalizationForm.name}
                      onChange={(e) => setPersonalizationForm(prev => ({...prev, name: e.target.value}))}
                      placeholder="e.g., Professional"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={personalizationForm.description}
                      onChange={(e) => setPersonalizationForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe this personalization..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt">System Prompt *</Label>
                    <Textarea
                      id="prompt"
                      value={personalizationForm.system_prompt}
                      onChange={(e) => setPersonalizationForm(prev => ({...prev, system_prompt: e.target.value}))}
                      placeholder="Enter the system prompt..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tone Range</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={personalizationForm.min_tone_level}
                            onChange={(e) => setPersonalizationForm(prev => ({...prev, min_tone_level: parseInt(e.target.value)}))}
                          />
                          <span className="flex items-center">to</span>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={personalizationForm.max_tone_level}
                            onChange={(e) => setPersonalizationForm(prev => ({...prev, max_tone_level: parseInt(e.target.value)}))}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Detail Range</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={personalizationForm.min_detail_level}
                            onChange={(e) => setPersonalizationForm(prev => ({...prev, min_detail_level: parseInt(e.target.value)}))}
                          />
                          <span className="flex items-center">to</span>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={personalizationForm.max_detail_level}
                            onChange={(e) => setPersonalizationForm(prev => ({...prev, max_detail_level: parseInt(e.target.value)}))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Length Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={personalizationForm.min_response_length}
                        onChange={(e) => setPersonalizationForm(prev => ({...prev, min_response_length: parseInt(e.target.value)}))}
                      />
                      <span className="flex items-center">to</span>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={personalizationForm.max_response_length}
                        onChange={(e) => setPersonalizationForm(prev => ({...prev, max_response_length: parseInt(e.target.value)}))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={personalizationForm.is_default}
                      onChange={(e) => setPersonalizationForm(prev => ({...prev, is_default: e.target.checked}))}
                    />
                    <Label htmlFor="is_default">Set as Default</Label>
                  </div>

                  <Button
                    onClick={handleSavePersonalization}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save Personalization'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {personalizations.map(pers => (
              <Card key={pers.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pers.name}
                        {pers.is_default && <Badge>Default</Badge>}
                        {!pers.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription>{pers.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tone Range</p>
                      <p className="font-semibold">{pers.min_tone_level} - {pers.max_tone_level}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Detail Range</p>
                      <p className="font-semibold">{pers.min_detail_level} - {pers.max_detail_level}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Length Range</p>
                      <p className="font-semibold">{pers.min_response_length} - {pers.max_response_length}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">System Prompt</p>
                    <p className="text-sm mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded line-clamp-2">
                      {pers.system_prompt}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Used by {pers.template_count} template{pers.template_count !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Personalization Templates</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={resetTemplateForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Template</DialogTitle>
                  <DialogDescription>
                    Quick preset for users to apply
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Name *</Label>
                    <Input
                      id="template-name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({...prev, name: e.target.value}))}
                      placeholder="e.g., Quick Responder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-emoji">Emoji</Label>
                    <Input
                      id="template-emoji"
                      value={templateForm.emoji}
                      onChange={(e) => setTemplateForm(prev => ({...prev, emoji: e.target.value}))}
                      maxLength="2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-desc">Description</Label>
                    <Textarea
                      id="template-desc"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({...prev, description: e.target.value}))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>System Personalization</Label>
                    <select
                      value={templateForm.system_personalization_id}
                      onChange={(e) => setTemplateForm(prev => ({...prev, system_personalization_id: e.target.value}))}
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="">None (No constraints)</option>
                      {personalizations.map(pers => (
                        <option key={pers.id} value={pers.id}>
                          {pers.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Tone Default: {templateForm.default_tone_level}</Label>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[templateForm.default_tone_level]}
                        onValueChange={(v) => setTemplateForm(prev => ({...prev, default_tone_level: v[0]}))}
                      />
                    </div>
                    <div>
                      <Label>Detail Default: {templateForm.default_detail_level}</Label>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[templateForm.default_detail_level]}
                        onValueChange={(v) => setTemplateForm(prev => ({...prev, default_detail_level: v[0]}))}
                      />
                    </div>
                    <div>
                      <Label>Length Default: {templateForm.default_response_length}</Label>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[templateForm.default_response_length]}
                        onValueChange={(v) => setTemplateForm(prev => ({...prev, default_response_length: v[0]}))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <span className="text-2xl">{template.emoji}</span> {template.name}
                  </CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Tone:</span>
                      <span className="font-medium">{template.default_tone_level}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detail:</span>
                      <span className="font-medium">{template.default_detail_level}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Length:</span>
                      <span className="font-medium">{template.default_response_length}/10</span>
                    </div>
                  </div>

                  {template.system_personalization && (
                    <div className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      Uses: {template.system_personalization.name}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
