import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Preferences {
  tone_level: number;
  detail_level: number;
  response_length: number;
  preferred_ai_mode_id: number | null;
  custom_system_prompt: string | null;
  personalization_template_id: string | null;
  is_active: boolean;
  system_constraints?: {
    applied_min_tone: number;
    applied_max_tone: number;
    applied_min_detail: number;
    applied_max_detail: number;
    applied_min_length: number;
    applied_max_length: number;
    system_name?: string;
    system_description?: string;
  };
  template?: {
    id: string;
    name: string;
    emoji: string;
  };
  ai_mode?: {
    id: number;
    name: string;
    emoji: string;
  };
  summary?: {
    tone: string;
    detail: string;
    length: string;
    mode: string;
  };
}

interface Template {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  defaults: {
    tone_level: number;
    detail_level: number;
    response_length: number;
  };
  system_personalization?: {
    id: string;
    name: string;
    constraints: Record<string, any>;
  };
}

interface AIMode {
  id: number;
  name: string;
  description: string;
  emoji: string;
}

interface Descriptions {
  tone: Record<number, string>;
  detail: Record<number, string>;
  length: Record<number, string>;
}

export default function PersonalizationSettings() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [aiModes, setAiModes] = useState<AIMode[]>([]);
  const [descriptions, setDescriptions] = useState<Descriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Preferences>>({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prefsRes, templatesRes, aiModesRes, descriptionsRes] = await Promise.all([
        fetch('/api/settings/personalization'),
        fetch('/api/settings/personalization/templates'),
        fetch('/api/settings/personalization/ai-modes'),
        fetch('/api/settings/personalization/descriptions'),
      ]);

      if (!prefsRes.ok || !templatesRes.ok || !aiModesRes.ok || !descriptionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [prefsData, templatesData, aiModesData, descriptionsData] = await Promise.all([
        prefsRes.json(),
        templatesRes.json(),
        aiModesRes.json(),
        descriptionsRes.json(),
      ]);

      setPreferences(prefsData.preferences);
      setFormData(prefsData.preferences);
      setTemplates(templatesData.templates);
      setAiModes(aiModesData.modes);
      setDescriptions(descriptionsData.descriptions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/personalization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setFormData(data.preferences);
      setHasChanges(false);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings/personalization/reset', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setFormData(data.preferences);
      setHasChanges(false);
      toast.success('Preferences reset to defaults');
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast.error('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (template: Template) => {
    setFormData(prev => ({
      ...prev,
      tone_level: template.defaults.tone_level,
      detail_level: template.defaults.detail_level,
      response_length: template.defaults.response_length,
      personalization_template_id: template.id,
    }));
    setHasChanges(true);
    toast.success(`Applied template: ${template.name}`);
  };

  const updatePreference = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const getConstrainedRange = () => {
    if (!preferences?.system_constraints) {
      return { min: 1, max: 10 };
    }
    return {
      min: preferences.system_constraints.applied_min_tone,
      max: preferences.system_constraints.applied_max_tone,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load personalization preferences</AlertDescription>
        </Alert>
      </div>
    );
  }

  const toneRange = getConstrainedRange();

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat Personalization</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize how the AI assistant behaves in conversations
        </p>
      </div>

      {/* System Constraints Notice */}
      {preferences.system_constraints && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-300">System Configuration Active</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>{preferences.system_constraints.system_name}</strong>: {preferences.system_constraints.system_description}</p>
              <p>Your preference ranges are constrained by organizational requirements. User preferences cannot override system-level policies.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">My Preferences</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* Tone Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎭 Tone</span>
              </CardTitle>
              <CardDescription>
                {descriptions?.tone && formData.tone_level ? descriptions.tone[formData.tone_level as number] : 'Balanced'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Formality Level ({formData.tone_level || 5}/10)</Label>
                  {preferences.system_constraints && (
                    <span className="text-xs text-gray-500">
                      Allowed: {preferences.system_constraints.applied_min_tone}-{preferences.system_constraints.applied_max_tone}
                    </span>
                  )}
                </div>
                <Slider
                  min={preferences.system_constraints?.applied_min_tone || 1}
                  max={preferences.system_constraints?.applied_max_tone || 10}
                  step={1}
                  value={[formData.tone_level || 5]}
                  onValueChange={(v) => updatePreference('tone_level', v[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Formal</span>
                  <span>Balanced</span>
                  <span>Very Playful</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊 Detail Level</span>
              </CardTitle>
              <CardDescription>
                {descriptions?.detail && formData.detail_level ? descriptions.detail[formData.detail_level as number] : 'Moderate'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Detail Complexity ({formData.detail_level || 5}/10)</Label>
                  {preferences.system_constraints && (
                    <span className="text-xs text-gray-500">
                      Allowed: {preferences.system_constraints.applied_min_detail}-{preferences.system_constraints.applied_max_detail}
                    </span>
                  )}
                </div>
                <Slider
                  min={preferences.system_constraints?.applied_min_detail || 1}
                  max={preferences.system_constraints?.applied_max_detail || 10}
                  step={1}
                  value={[formData.detail_level || 5]}
                  onValueChange={(v) => updatePreference('detail_level', v[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Brief & Simple</span>
                  <span>Balanced</span>
                  <span>Comprehensive</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Length */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📝 Response Length</span>
              </CardTitle>
              <CardDescription>
                {descriptions?.length && formData.response_length ? descriptions.length[formData.response_length as number] : 'Moderate'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Response Length ({formData.response_length || 5}/10)</Label>
                  {preferences.system_constraints && (
                    <span className="text-xs text-gray-500">
                      Allowed: {preferences.system_constraints.applied_min_length}-{preferences.system_constraints.applied_max_length}
                    </span>
                  )}
                </div>
                <Slider
                  min={preferences.system_constraints?.applied_min_length || 1}
                  max={preferences.system_constraints?.applied_max_length || 10}
                  step={1}
                  value={[formData.response_length || 5]}
                  onValueChange={(v) => updatePreference('response_length', v[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>One-liner</span>
                  <span>Moderate</span>
                  <span>Very Detailed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Mode Selection */}
          {aiModes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI Mode</CardTitle>
                <CardDescription>Select how the AI should approach responses</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.preferred_ai_mode_id ? String(formData.preferred_ai_mode_id) : 'default'}
                  onValueChange={(v) => updatePreference('preferred_ai_mode_id', v === 'default' ? null : parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Mode</SelectItem>
                    {aiModes.map(mode => (
                      <SelectItem key={mode.id} value={String(mode.id)}>
                        {mode.emoji} {mode.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Custom System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Instructions</CardTitle>
              <CardDescription>Add additional guidelines for the AI (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-24 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="E.g., 'Always explain technical concepts using analogies', 'Prefer markdown formatting for code'"
                value={formData.custom_system_prompt || ''}
                onChange={(e) => updatePreference('custom_system_prompt', e.target.value || null)}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <CardDescription className="py-4">
            Choose a preset template to quickly adjust your preferences
          </CardDescription>

          {templates.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Templates Available</AlertTitle>
              <AlertDescription>
                No personalization templates are currently available. Create one in the admin panel.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <span className="text-2xl">{template.emoji}</span> {template.name}
                    </CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tone:</span>
                        <span className="font-medium">{template.defaults.tone_level}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Detail:</span>
                        <span className="font-medium">{template.defaults.detail_level}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Length:</span>
                        <span className="font-medium">{template.defaults.response_length}/10</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Apply Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Current Settings Summary */}
      {preferences.summary && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle>Current Settings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tone</p>
                <p className="font-semibold">{preferences.summary.tone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detail</p>
                <p className="font-semibold">{preferences.summary.detail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Length</p>
                <p className="font-semibold">{preferences.summary.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Mode</p>
                <p className="font-semibold">{preferences.summary.mode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
