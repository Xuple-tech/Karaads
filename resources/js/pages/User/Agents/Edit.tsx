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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Cpu, Palette, Settings, Globe } from 'lucide-react';

interface Site {
  id: number;
  name: string;
}

interface AIAgent {
  id: number;
  name: string;
  description: string | null;
  agent_type: string;
  behavior_profile: string;
  welcome_message: string;
  primary_color: string;
  secondary_color: string;
  widget_position: string;
  default_language: string;
  supported_languages: string[];
  knowledge_base_enabled: boolean;
  web_search_enabled: boolean;
  file_upload_enabled: boolean;
  voice_enabled: boolean;
  site: Site;
}

interface AgentEditProps {
  agent: AIAgent;
}

export default function AgentEdit() {
  const { props } = usePage<{ props: AgentEditProps }>();
  const { agent } = props;

  const { data, setData, put, processing, errors } = useForm({
    name: agent.name,
    description: agent.description || '',
    behavior_profile: agent.behavior_profile,
    welcome_message: agent.welcome_message,
    primary_color: agent.primary_color,
    secondary_color: agent.secondary_color,
    widget_position: agent.widget_position,
    default_language: agent.default_language,
    supported_languages: agent.supported_languages,
    knowledge_base_enabled: agent.knowledge_base_enabled,
    web_search_enabled: agent.web_search_enabled,
    file_upload_enabled: agent.file_upload_enabled,
    voice_enabled: agent.voice_enabled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/ai-agents/agents/${agent.id}`);
  };

  const widgetPositions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'center', label: 'Center' },
    { value: 'custom', label: 'Custom Position' },
  ];

  const behaviorProfiles = [
    { value: 'helpful', label: 'Helpful Assistant' },
    { value: 'professional', label: 'Professional Support' },
    { value: 'friendly', label: 'Friendly Chat' },
    { value: 'technical', label: 'Technical Expert' },
    { value: 'sales', label: 'Sales Representative' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
  ];

  const toggleLanguage = (languageCode: string) => {
    const current = data.supported_languages || [];
    const newLanguages = current.includes(languageCode)
      ? current.filter(lang => lang !== languageCode)
      : [...current, languageCode];
    setData('supported_languages', newLanguages);
  };

  return (
    <Layout>
      <Head title={`Edit ${agent.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/ai-agents/agents/${agent.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agent
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded"
              style={{ backgroundColor: agent.primary_color + '20' }}
            >
              <Cpu className="h-6 w-6" style={{ color: agent.primary_color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit {agent.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{agent.site.name}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                  <CardDescription>
                    Update your AI agent's settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="appearance">Appearance</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Agent Name *
                          </label>
                          <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Customer Support Assistant"
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Description
                          </label>
                          <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe what this agent does..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Behavior Profile
                          </label>
                          <Select
                            value={data.behavior_profile}
                            onValueChange={(value) => setData('behavior_profile', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select behavior profile" />
                            </SelectTrigger>
                            <SelectContent>
                              {behaviorProfiles.map((profile) => (
                                <SelectItem key={profile.value} value={profile.value}>
                                  {profile.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Welcome Message *
                          </label>
                          <Textarea
                            value={data.welcome_message}
                            onChange={(e) => setData('welcome_message', e.target.value)}
                            placeholder="Hello! How can I help you today?"
                            rows={3}
                            required
                          />
                          {errors.welcome_message && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.welcome_message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Default Language *
                            </label>
                            <Select
                              value={data.default_language}
                              onValueChange={(value) => setData('default_language', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Widget Position *
                            </label>
                            <Select
                              value={data.widget_position}
                              onValueChange={(value) => setData('widget_position', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                {widgetPositions.map((position) => (
                                  <SelectItem key={position.value} value={position.value}>
                                    {position.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Primary Color
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={data.primary_color}
                                onChange={(e) => setData('primary_color', e.target.value)}
                                type="color"
                                className="w-12 p-1"
                              />
                              <Input
                                value={data.primary_color}
                                onChange={(e) => setData('primary_color', e.target.value)}
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
                                onChange={(e) => setData('secondary_color', e.target.value)}
                                type="color"
                                className="w-12 p-1"
                              />
                              <Input
                                value={data.secondary_color}
                                onChange={(e) => setData('secondary_color', e.target.value)}
                                placeholder="#1E40AF"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Knowledge Base</p>
                            <p className="text-sm text-muted-foreground">
                              Enable knowledge base functionality
                            </p>
                          </div>
                          <Switch
                            checked={data.knowledge_base_enabled}
                            onCheckedChange={(checked) =>
                              setData('knowledge_base_enabled', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Web Search</p>
                            <p className="text-sm text-muted-foreground">
                              Allow agent to search the web
                            </p>
                          </div>
                          <Switch
                            checked={data.web_search_enabled}
                            onCheckedChange={(checked) =>
                              setData('web_search_enabled', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">File Upload</p>
                            <p className="text-sm text-muted-foreground">
                              Allow users to upload files
                            </p>
                          </div>
                          <Switch
                            checked={data.file_upload_enabled}
                            onCheckedChange={(checked) =>
                              setData('file_upload_enabled', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Voice Features</p>
                            <p className="text-sm text-muted-foreground">
                              Enable voice input and output
                            </p>
                          </div>
                          <Switch
                            checked={data.voice_enabled}
                            onCheckedChange={(checked) =>
                              setData('voice_enabled', checked)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Supported Languages
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {languages.map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => toggleLanguage(lang.code)}
                                className={`px-3 py-1 rounded-full text-sm border ${
                                  data.supported_languages?.includes(lang.code)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-input hover:bg-muted'
                                }`}
                              >
                                {lang.name}
                              </button>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Select all languages your agent should support
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <Link href={`/ai-agents/agents/${agent.id}`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Agent appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: data.primary_color + '40',
                        backgroundColor: data.primary_color + '10',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: data.primary_color }}
                        >
                          <Cpu className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{data.name || 'Your Agent'}</p>
                          <p className="text-sm text-muted-foreground">
                            AI Assistant
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: data.secondary_color + '20' }}
                        >
                          <p className="text-sm">
                            {data.welcome_message || 'Hello! How can I help you today?'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: data.primary_color + '20',
                              color: data.primary_color,
                            }}
                          >
                            Ask a question
                          </div>
                          <div
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: data.primary_color + '20',
                              color: data.primary_color,
                            }}
                          >
                            Get support
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Preview of how your agent will appear to users.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Features Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Knowledge Base</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.knowledge_base_enabled
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Web Search</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.web_search_enabled
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Upload</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.file_upload_enabled
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Voice Features</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.voice_enabled
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
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