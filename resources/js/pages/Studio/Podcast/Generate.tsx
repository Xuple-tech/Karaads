// resources/js/Pages/Podcast/Generate.tsx
import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mic,
  Music,
  Play,
  Download,
  Copy,
  Share2,
  Clock,
  Volume2,
  FileText,
  Sparkles,
  Zap,
  Brain,
  Music2,
  Podcast,
  Globe,
  Users,
  BookOpen,
  Lightbulb,
  History,
  TrendingUp,
  Coffee,
} from 'lucide-react';
import PodcastPlayer from '@/components/Podcast/PodcastPlayer';
import AppLayout from '@/layouts/app-layout';

interface Genre {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
}

interface Podcast {
  id: string;
  title: string;
  topic: string;
  genre: string;
  duration: number;
  script: string;
  created_at: string;
  voice: string;
  audio_url?: string;
}

interface GenerationResult {
  audio_url: string;
  script: string;
  episode?: Podcast;
}

interface PodcastGenerateProps {
  formats: Record<string, string>;
  userPodcasts: Podcast[];
}

export default function PodcastGenerate({ formats, userPodcasts }: PodcastGenerateProps) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'script' | 'audio' | 'complete'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);

  const { data, setData, post, processing, errors } = useForm({
    topic: '',
    genre: 'news',
    format: 'solo',
    duration: 5,
    voice: 'nova',
    instructions: '',
    includeIntro: true,
    includeOutro: true,
    addBackgroundMusic: false,
    musicIntensity: 'low',
  });

  // Enhanced genres with icons and colors
  const enhancedGenres: Record<string, Genre> = {
    news: {
      id: 'news',
      name: 'News & Current Affairs',
      icon: <Globe className="h-4 w-4" />,
      color: 'bg-blue-500',
      description: 'Daily news updates and current events analysis'
    },
    technology: {
      id: 'technology',
      name: 'Technology & Innovation',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-purple-500',
      description: 'Tech trends, innovations, and future predictions'
    },
    business: {
      id: 'business',
      name: 'Business & Entrepreneurship',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-green-500',
      description: 'Business insights, startups, and entrepreneurship'
    },
    health: {
      id: 'health',
      name: 'Health & Wellness',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-teal-500',
      description: 'Health tips, wellness advice, and medical updates'
    },
    education: {
      id: 'education',
      name: 'Education & Learning',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'bg-orange-500',
      description: 'Educational content and learning strategies'
    },
    entertainment: {
      id: 'entertainment',
      name: 'Entertainment & Pop Culture',
      icon: <Music2 className="h-4 w-4" />,
      color: 'bg-pink-500',
      description: 'Entertainment news and pop culture discussions'
    },
    science: {
      id: 'science',
      name: 'Science & Discovery',
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-indigo-500',
      description: 'Scientific discoveries and research updates'
    },
    storytelling: {
      id: 'storytelling',
      name: 'Storytelling & Narrative',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'bg-yellow-500',
      description: 'Compelling stories and narrative content'
    },
  };

  // Enhanced voices
  const enhancedVoices: Voice[] = [
    { id: 'alloy', name: 'Alloy', gender: 'neutral', accent: 'American', description: 'Balanced and clear' },
    { id: 'echo', name: 'Echo', gender: 'neutral', accent: 'American', description: 'Confident and direct' },
    { id: 'fable', name: 'Fable', gender: 'neutral', accent: 'British', description: 'Storytelling tone' },
    { id: 'onyx', name: 'Onyx', gender: 'male', accent: 'American', description: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', gender: 'female', accent: 'American', description: 'Warm and engaging' },
    { id: 'shimmer', name: 'Shimmer', gender: 'female', accent: 'American', description: 'Bright and energetic' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenerationStep('script');
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await post('/podcast/generate', {
        onSuccess: (response) => {
          clearInterval(progressInterval);
          setGenerationStep('complete');
          // You might need to adjust this based on your actual response structure
          if (response && (response as any).props) {
            setResult((response as any).props.data);
          } else if (response && (response as any).data) {
            setResult((response as any).data);
          }
          setGenerating(false);
          setGenerationProgress(100);
        },
        onError: (errors) => {
          clearInterval(progressInterval);
          console.error('Generation error:', errors);
          setGenerating(false);
          setGenerationStep('idle');
        }
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Unexpected error:', error);
      setGenerating(false);
      setGenerationStep('idle');
    }
  };

  const handleGenerateFromText = (text: string) => {
    if (text && text.length >= 100) {
      setGenerating(true);
      router.post('/podcast/generate-from-text', {
        text: text,
        voice: selectedVoice
      }, {
        onSuccess: (response) => {
          if (response && (response as any).props) {
            setResult((response as any).props.data);
          } else if (response && (response as any).data) {
            setResult((response as any).data);
          }
          setGenerating(false);
        },
        onError: (errors) => {
          console.error('Text generation error:', errors);
          setGenerating(false);
        }
      });
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'script':
        return <FileText className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'complete':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getStepColor = (step: string) => {
    if (generating) {
      if (step === 'script') return 'text-blue-500';
      if (step === 'audio') return 'text-purple-500';
      if (step === 'complete') return 'text-green-500';
    }
    return 'text-gray-400';
  };

  return (
    <AppLayout>
      <Head title="Generate Podcast | AI-Powered Podcast Creation" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Podcast className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Podcast Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              Create professional-grade podcasts in minutes using advanced AI. Perfect for content creators, educators, and businesses.
            </p>
          </div>

          {errors.topic && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errors.topic}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Generation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generation Status */}
              {generating && (
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getStepColor(generationStep)} bg-opacity-10`}>
                            {getStepIcon(generationStep)}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {generationStep === 'script' && 'Generating Script...'}
                              {generationStep === 'audio' && 'Creating Audio...'}
                              {generationStep === 'complete' && 'Complete!'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {generationStep === 'script' && 'AI is crafting your podcast script'}
                              {generationStep === 'audio' && 'Converting script to high-quality audio'}
                              {generationStep === 'complete' && 'Your podcast is ready!'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="animate-pulse">
                          {generationProgress}%
                        </Badge>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Form Card */}
              <Card className="shadow-xl border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Mic className="h-6 w-6 text-blue-500" />
                    Podcast Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the details to create your perfect podcast episode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Topic */}
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Podcast Topic *
                      </Label>
                      <Input
                        id="topic"
                        value={data.topic}
                        onChange={(e) => setData('topic', e.target.value)}
                        placeholder="What's your podcast about? e.g., 'The Future of AI in Healthcare'"
                        className="h-12 text-lg"
                        required
                        disabled={processing || generating}
                      />
                      {errors.topic && (
                        <p className="text-sm text-red-500">{errors.topic}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Be specific for better results. Include key points or questions.
                      </p>
                    </div>

                    {/* Genre & Format Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Genre Selection */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Music2 className="h-4 w-4" />
                          Podcast Genre
                        </Label>
                        <Select
                          value={data.genre}
                          onValueChange={(value) => setData('genre', value)}
                          disabled={processing || generating}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(enhancedGenres).map(([key, genre]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${genre.color} bg-opacity-10`}>
                                    {genre.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium">{genre.name}</p>
                                    <p className="text-xs text-gray-500">{genre.description}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Format Selection */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Podcast Format
                        </Label>
                        <Select
                          value={data.format}
                          onValueChange={(value) => setData('format', value)}
                          disabled={processing || generating}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a format" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(formats).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Duration & Voice Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Duration Slider */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Duration: {data.duration} minutes
                        </Label>
                        <div className="space-y-4">
                          <Slider
                            value={[data.duration]}
                            onValueChange={(value) => setData('duration', value[0])}
                            min={1}
                            max={30}
                            step={1}
                            disabled={processing || generating}
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>1 min</span>
                            <span className="font-medium">Recommended: 5-10 min</span>
                            <span>30 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Voice Selection */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          Voice Style
                        </Label>
                        <Select
                          value={selectedVoice}
                          onValueChange={(value) => {
                            setSelectedVoice(value);
                            setData('voice', value);
                          }}
                          disabled={processing || generating}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent>
                            {enhancedVoices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${
                                      voice.gender === 'male' ? 'bg-blue-100 dark:bg-blue-900' :
                                      voice.gender === 'female' ? 'bg-pink-100 dark:bg-pink-900' :
                                      'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                      <Volume2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{voice.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {voice.gender} • {voice.accent}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {voice.description}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Additional Instructions */}
                    <div className="space-y-3">
                      <Label htmlFor="instructions" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Additional Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        value={data.instructions}
                        onChange={(e) => setData('instructions', e.target.value)}
                        placeholder="Add specific instructions: tone, style, key points to cover, etc."
                        className="min-h-[120px] resize-none"
                        disabled={processing || generating}
                      />
                      <p className="text-sm text-gray-500">
                        The more specific you are, the better the AI can tailor the content.
                      </p>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Advanced Options</Label>
                        <Switch
                          checked={showAdvanced}
                          onCheckedChange={setShowAdvanced}
                          disabled={processing || generating}
                        />
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 animate-in fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="includeIntro"
                                checked={data.includeIntro}
                                onCheckedChange={(checked) => setData('includeIntro', checked)}
                                disabled={processing || generating}
                              />
                              <Label htmlFor="includeIntro">Include Intro Music</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="includeOutro"
                                checked={data.includeOutro}
                                onCheckedChange={(checked) => setData('includeOutro', checked)}
                                disabled={processing || generating}
                              />
                              <Label htmlFor="includeOutro">Include Outro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="addBackgroundMusic"
                                checked={data.addBackgroundMusic}
                                onCheckedChange={(checked) => setData('addBackgroundMusic', checked)}
                                disabled={processing || generating}
                              />
                              <Label htmlFor="addBackgroundMusic">Background Music</Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={processing || generating || !data.topic.trim()}
                      >
                        {generating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Podcast
                          </>
                        )}
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="h-12"
                            disabled={processing || generating}
                          >
                            <FileText className="mr-2 h-5 w-5" />
                            Generate from Text
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Generate from Existing Text</DialogTitle>
                            <DialogDescription>
                              Paste your script or article to convert it into a podcast
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Paste your script here (minimum 100 characters)..."
                              className="min-h-[200px]"
                              onChange={(e) => {
                                const text = e.target.value;
                                if (text.length >= 100) {
                                  handleGenerateFromText(text);
                                }
                              }}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const textarea = document.querySelector('textarea');
                                  if (textarea) {
                                    textarea.value = '';
                                  }
                                }}
                              >
                                Clear
                              </Button>
                              <Button
                                type="button"
                                onClick={() => {
                                  const textarea = document.querySelector('textarea');
                                  if (textarea && textarea.value.length >= 100) {
                                    handleGenerateFromText(textarea.value);
                                  }
                                }}
                                className="bg-gradient-to-r from-green-600 to-teal-600"
                              >
                                Generate Audio
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Tips Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-amber-500" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        icon: <Lightbulb className="h-5 w-5" />,
                        title: 'Be Specific',
                        desc: 'Detailed topics get better results'
                      },
                      {
                        icon: <Clock className="h-5 w-5" />,
                        title: 'Optimal Length',
                        desc: '5-10 minutes for maximum engagement'
                      },
                      {
                        icon: <Volume2 className="h-5 w-5" />,
                        title: 'Voice Selection',
                        desc: 'Match voice to your content tone'
                      },
                      {
                        icon: <Users className="h-5 w-5" />,
                        title: 'Format Matters',
                        desc: 'Choose format based on your audience'
                      },
                      {
                        icon: <BookOpen className="h-5 w-5" />,
                        title: 'Clear Instructions',
                        desc: 'Specify tone, style, and key points'
                      },
                      {
                        icon: <Sparkles className="h-5 w-5" />,
                        title: 'Review & Edit',
                        desc: 'Always review the generated script'
                      },
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          {tip.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{tip.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Results & Preview */}
            <div className="space-y-6">
              {/* Results Card */}
              <Card className="shadow-xl border-gray-200 dark:border-gray-800 sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result ? (
                      <>
                        <Play className="h-5 w-5 text-green-500" />
                        Your Podcast
                      </>
                    ) : (
                      <>
                        <Music className="h-5 w-5 text-blue-500" />
                        Preview
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {result ? 'Your podcast has been generated successfully!' : 'Your podcast will appear here'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Podcast Player */}
                      <PodcastPlayer
                        audioUrl={result.audio_url}
                        title={result.episode?.title || data.topic}
                      />

                      {/* Podcast Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {data.duration}
                          </p>
                          <p className="text-xs text-gray-500">Minutes</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {result.episode?.genre || data.genre}
                          </p>
                          <p className="text-xs text-gray-500">Genre</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {selectedVoice}
                          </p>
                          <p className="text-xs text-gray-500">Voice</p>
                        </div>
                      </div>

                      {/* Script Preview */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Script Preview</Label>
                          <Badge variant="outline">
                            {result.script.split(' ').length} words
                          </Badge>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm whitespace-pre-line line-clamp-6">
                            {result.script.substring(0, 500)}...
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setResult(null)}
                        >
                          <History className="mr-2 h-4 w-4" />
                          New Podcast
                        </Button>
                        <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600">
                          <Download className="mr-2 h-4 w-4" />
                          Download MP3
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Script
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                        <Music className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No Podcast Yet</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Fill out the form to generate your first podcast episode
                        </p>
                      </div>
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setData('topic', 'The Future of Artificial Intelligence');
                            setData('genre', 'technology');
                            setData('duration', 8);
                          }}
                        >
                          Try Example
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Podcasts */}
              {userPodcasts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Podcasts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userPodcasts.slice(0, 3).map((podcast) => (
                        <div
                          key={podcast.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          onClick={() => setResult({
                            audio_url: podcast.audio_url || '',
                            script: podcast.script,
                            episode: podcast
                          })}
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Music className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{podcast.title}</p>
                            <p className="text-xs text-gray-500">
                              {podcast.duration} min • {new Date(podcast.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Link href="/podcast/library">
                        <Button variant="ghost" className="w-full text-blue-600">
                          View All Podcasts →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
