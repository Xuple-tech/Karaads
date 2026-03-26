import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, RefreshCw, Save, Settings2, Wand2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ChatPreference {
    tone_level: number;
    tone_description: string;
    detail_level: number;
    detail_description: string;
    response_length: number;
    length_description: string;
    preferred_ai_mode_id: number | null;
    ai_mode: { id: number; name: string; emoji: string } | null;
    custom_system_prompt: string | null;
}

interface AIMode {
    id: number;
    name: string;
    description: string;
    emoji: string;
}

export default function ChatPreferences() {
    const [preferences, setPreferences] = useState<ChatPreference | null>(null);
    const [modes, setModes] = useState<AIMode[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [tone, setTone] = useState(5);
    const [detail, setDetail] = useState(5);
    const [length, setLength] = useState(5);
    const [selectedMode, setSelectedMode] = useState<number | null>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);

    useEffect(() => {
        fetchPreferences();
        fetchModes();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await axios.get('/api-/_0001/user/chat-preferences');
            if (response.data.success) {
                const prefs = response.data.preferences;
                setPreferences(prefs);
                setTone(prefs.tone_level);
                setDetail(prefs.detail_level);
                setLength(prefs.response_length);
                setSelectedMode(prefs.preferred_ai_mode_id);
                setCustomPrompt(prefs.custom_system_prompt || '');
                setUseCustomPrompt(!!prefs.custom_system_prompt);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            toast.error('Failed to load chat preferences');
        } finally {
            setLoading(false);
        }
    };

    const fetchModes = async () => {
        try {
            const response = await axios.get('/api-/_0001/user/chat-modes');
            if (response.data.success) {
                setModes(response.data.modes);
            }
        } catch (error) {
            console.error('Error fetching modes:', error);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put('/api-/_0001/user/chat-preferences', {
                tone_level: tone,
                detail_level: detail,
                response_length: length,
                preferred_ai_mode_id: selectedMode,
                custom_system_prompt: useCustomPrompt ? customPrompt : null,
            });

            if (response.data.success) {
                setPreferences(response.data.preferences);
                toast.success('Preferences saved successfully');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Reset all preferences to default values?')) {
            try {
                const response = await axios.post('/api-/_0001/user/chat-preferences/reset');
                if (response.data.success) {
                    setTone(5);
                    setDetail(5);
                    setLength(5);
                    setSelectedMode(null);
                    setCustomPrompt('');
                    setUseCustomPrompt(false);
                    toast.success('Preferences reset to defaults');
                    fetchPreferences();
                }
            } catch (error) {
                console.error('Error resetting preferences:', error);
                toast.error('Failed to reset preferences');
            }
        }
    };

    const toneDescriptions: Record<number, { label: string; description: string }> = {
        1: { label: 'Very Formal', description: 'Professional and structured responses' },
        2: { label: 'Formal', description: 'Professional tone with some flexibility' },
        3: { label: 'Professional', description: 'Business-appropriate communication' },
        4: { label: 'Semi-professional', description: 'Balanced professional tone' },
        5: { label: 'Balanced', description: 'Neutral and adaptable tone' },
        6: { label: 'Friendly', description: 'Warm and approachable' },
        7: { label: 'Casual', description: 'Relaxed and informal' },
        8: { label: 'Very Casual', description: 'Everyday conversation style' },
        9: { label: 'Humorous', description: 'Light-hearted with occasional humor' },
        10: { label: 'Playful', description: 'Fun and energetic responses' }
    };

    const detailDescriptions: Record<number, { label: string; description: string }> = {
        1: { label: 'Extremely Brief', description: 'Minimal information, straight to point' },
        2: { label: 'Very Brief', description: 'Concise key points only' },
        3: { label: 'Brief', description: 'Short and focused responses' },
        4: { label: 'Concise', description: 'Clear and to the point' },
        5: { label: 'Moderate', description: 'Balanced detail level' },
        6: { label: 'Detailed', description: 'Comprehensive explanations' },
        7: { label: 'Very Detailed', description: 'Thorough with examples' },
        8: { label: 'Comprehensive', description: 'In-depth coverage of topics' },
        9: { label: 'Exhaustive', description: 'Extensive details and context' },
        10: { label: 'Ultra-detailed', description: 'Maximum possible detail' }
    };

    const lengthDescriptions: Record<number, { label: string; description: string }> = {
        1: { label: 'One-liner', description: 'Single sentence responses' },
        2: { label: 'Very Short', description: 'Brief 1-2 sentence answers' },
        3: { label: 'Short', description: 'Quick 2-3 sentence responses' },
        4: { label: 'Brief', description: '3-4 sentence summaries' },
        5: { label: 'Moderate', description: 'Balanced paragraph length' },
        6: { label: 'Long', description: 'Detailed multi-paragraph responses' },
        7: { label: 'Very Long', description: 'Comprehensive explanations' },
        8: { label: 'Extended', description: 'In-depth multi-topic coverage' },
        9: { label: 'Very Extended', description: 'Extensive detailed responses' },
        10: { label: 'Maximum', description: 'Most comprehensive responses possible' }
    };

    if (loading) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <TooltipProvider>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5" />
                                Chat Personalization
                            </CardTitle>
                            <CardDescription>
                                Customize how the AI assistant responds to your messages
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            Beta
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6 pt-4">
                            {/* Conversation Mode */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium">Conversation Style</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="w-64">Choose a predefined conversation style that best fits your needs</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Button
                                        variant={selectedMode === null ? "default" : "outline"}
                                        onClick={() => setSelectedMode(null)}
                                        className="justify-start h-auto py-3"
                                    >
                                        <div className="text-left">
                                            <div className="font-medium">Default</div>
                                            <div className="text-xs text-muted-foreground">Balanced all-purpose assistant</div>
                                        </div>
                                    </Button>
                                    {modes.map((mode) => (
                                        <Button
                                            key={mode.id}
                                            variant={selectedMode === mode.id ? "default" : "outline"}
                                            onClick={() => setSelectedMode(mode.id)}
                                            className="justify-start h-auto py-3"
                                        >
                                            <div className="text-left">
                                                <div className="font-medium flex items-center gap-2">
                                                    <span>{mode.emoji}</span>
                                                    {mode.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {mode.description}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Tone Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium">Conversation Tone</Label>
                                    <Badge variant="secondary" className="font-normal">
                                        {toneDescriptions[tone].label}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[tone]}
                                        onValueChange={(value) => setTone(value[0])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                                        <span>Formal</span>
                                        <span>Casual</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {toneDescriptions[tone].description}
                                </p>
                            </div>

                            {/* Detail Level Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium">Detail Level</Label>
                                    <Badge variant="secondary" className="font-normal">
                                        {detailDescriptions[detail].label}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[detail]}
                                        onValueChange={(value) => setDetail(value[0])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                                        <span>Brief</span>
                                        <span>Detailed</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {detailDescriptions[detail].description}
                                </p>
                            </div>

                            {/* Response Length Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium">Response Length</Label>
                                    <Badge variant="secondary" className="font-normal">
                                        {lengthDescriptions[length].label}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        value={[length]}
                                        onValueChange={(value) => setLength(value[0])}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                                        <span>Short</span>
                                        <span>Long</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {lengthDescriptions[length].description}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-6 pt-4">
                            {/* Custom System Prompt */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium">Custom Instructions</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="w-64">Add specific instructions to customize the AI's behavior</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Switch
                                        checked={useCustomPrompt}
                                        onCheckedChange={setUseCustomPrompt}
                                    />
                                </div>

                                {useCustomPrompt && (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={customPrompt}
                                            onChange={(e) => setCustomPrompt(e.target.value)}
                                            placeholder="E.g., 'Always provide practical examples', 'Focus on step-by-step explanations', 'Use markdown formatting for code'"
                                            className="min-h-[120px] resize-vertical"
                                            maxLength={2000}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Optional: Add specific behavior instructions</span>
                                            <span>{customPrompt.length}/2000</span>
                                        </div>
                                    </div>
                                )}
                                {!useCustomPrompt && (
                                    <p className="text-sm text-muted-foreground italic">
                                        Enable to add custom instructions for the AI assistant
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Preview Section */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <span>Preview</span>
                            <Badge variant="outline" className="text-xs">Live</Badge>
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-muted-foreground">Tone:</span>
                                <div className="font-medium">{toneDescriptions[tone].label}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Detail:</span>
                                <div className="font-medium">{detailDescriptions[detail].label}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Length:</span>
                                <div className="font-medium">{lengthDescriptions[length].label}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Style:</span>
                                <div className="font-medium">
                                    {modes.find((m) => m.id === selectedMode)?.name || 'Default'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1"
                            size="lg"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="lg"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
