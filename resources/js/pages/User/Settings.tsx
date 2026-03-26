import React, { useState, useEffect } from 'react';
import UserLayout from '@/layouts/UserLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useForm } from '@inertiajs/react';
import { Save, AlertCircle, Loader, User, Bell, Bot, Trash2, Palette } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatPreferences from '@/components/ChatPreferences';
import AppLayout from '@/layouts/app-layout';

interface AIMode {
    id: number;
    name: string;
    description: string;
    emoji: string;
}

interface UserSettingsProps {
    user: {
        id: string;
        name: string;
        email: string;
        ai_mode_id?: number | null;
        call_by_name?: boolean;
        profile_settings?: {
            theme?: string;
            notifications_enabled?: boolean;
            email_notifications?: boolean;
        };
    };
}

export default function UserSettings({ user }: UserSettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        theme: user.profile_settings?.theme || 'system',
        notifications_enabled: user.profile_settings?.notifications_enabled ?? true,
        email_notifications: user.profile_settings?.email_notifications ?? true,
    });

    const [aiModes, setAiModes] = useState<AIMode[]>([]);
    const [selectedMode, setSelectedMode] = useState<number | null>(user.ai_mode_id || null);
    const [callByName, setCallByName] = useState<boolean>(user.call_by_name || false);
    const [loadingModes, setLoadingModes] = useState(true);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    useEffect(() => {
        fetchAiModes();
    }, []);

    const fetchAiModes = async () => {
        try {
            setLoadingModes(true);
            const response = await axios.get('/api-/_0001/user/chat-modes');
            if (response.data.success) {
                setAiModes(response.data.modes);
            }
        } catch (error) {
            console.error('Error fetching AI modes:', error);
            toast.error('Failed to load AI modes');
        } finally {
            setLoadingModes(false);
        }
    };

    const handleSaveAiPreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingPreferences(true);
            const response = await axios.put('/api-/_0001/user/chat-preferences', {
                ai_mode_id: selectedMode,
                call_by_name: callByName,
            });
            if (response.data.success) {
                toast.success('AI preferences saved successfully');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Failed to save AI preferences');
        } finally {
            setSavingPreferences(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api-/_0001/user/chat-preferences', {
            onSuccess: () => {
                toast.success('Account settings updated successfully');
            },
            onError: () => {
                toast.error('Failed to update account settings');
            }
        });
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
                        <TabsTrigger value="account" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Account</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <span className="hidden sm:inline">AI Assistant</span>
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <span className="hidden sm:inline">Chat Style</span>
                        </TabsTrigger>
                        <TabsTrigger value="danger" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Danger Zone</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Account Information
                                </CardTitle>
                                <CardDescription>
                                    Update your basic account details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter your full name"
                                                className={errors.name ? 'border-destructive' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your email address"
                                                className={errors.email ? 'border-destructive' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                        {processing ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Usage Information */}
                        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">
                                    Usage Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-800 dark:text-blue-200 text-sm">
                                    Your usage data is automatically tracked. You can view detailed analytics and usage statistics in your dashboard.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Appearance & Notifications
                                </CardTitle>
                                <CardDescription>
                                    Customize your visual experience and notification preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="theme">Theme Preference</Label>
                                        <Select value={data.theme} onValueChange={(value) => setData('theme', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="system">System Default</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            Choose how the application looks to you
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <Label className="text-base">Notification Settings</Label>

                                        <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="notifications">In-App Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications within the application
                                                </p>
                                            </div>
                                            <Switch
                                                id="notifications"
                                                checked={data.notifications_enabled}
                                                onCheckedChange={(checked) => setData('notifications_enabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications via email
                                                </p>
                                            </div>
                                            <Switch
                                                id="email-notifications"
                                                checked={data.email_notifications}
                                                onCheckedChange={(checked) => setData('email_notifications', checked)}
                                            />
                                        </div>
                                    </div>

                                    <Button type="button" onClick={handleSubmit} disabled={processing} className="w-full sm:w-auto">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Assistant Tab */}
                    <TabsContent value="ai" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5" />
                                    AI Assistant Preferences
                                </CardTitle>
                                <CardDescription>
                                    Customize how the AI assistant interacts with you
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveAiPreferences} className="space-y-6">
                                    {loadingModes ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-20 w-full" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-3">
                                                <Label htmlFor="ai-mode">AI Conversation Mode</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose how you'd like the AI to communicate with you
                                                </p>
                                                <Select
                                                    value={selectedMode?.toString() || ''}
                                                    onValueChange={(value) => setSelectedMode(value ? Number(value) : null)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select conversation mode" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem>Default Mode</SelectItem>
                                                        {aiModes.map((mode) => (
                                                            <SelectItem key={mode.id} value={mode.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{mode.emoji}</span>
                                                                    <span>{mode.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {selectedMode && aiModes.find(m => m.id === selectedMode) && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {aiModes.find(m => m.id === selectedMode)?.description}
                                                    </p>
                                                )}
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="call-by-name" className="cursor-pointer">
                                                        Call me by name
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        The AI will use your name when responding to you
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="call-by-name"
                                                    checked={callByName}
                                                    onCheckedChange={setCallByName}
                                                />
                                            </div>

                                            <Button type="submit" disabled={savingPreferences} className="w-full sm:w-auto">
                                                {savingPreferences ? (
                                                    <>
                                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save AI Preferences
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Chat Style Tab */}
                    <TabsContent value="chat">
                        <ChatPreferences />
                    </TabsContent>

                    {/* Danger Zone Tab */}
                    <TabsContent value="danger">
                        <Card className="border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Irreversible and destructive actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Delete Account</AlertTitle>
                                    <AlertDescription>
                                        Once you delete your account, there is no going back. Please be certain.
                                        This will permanently remove all your data, conversations, and preferences.
                                    </AlertDescription>
                                </Alert>

                                <div className="rounded-lg border border-destructive/20 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-destructive">Delete Account</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Permanently delete your account and all associated data
                                            </p>
                                        </div>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Export Data</h4>
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                Download all your data before deleting your account
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                                            Export Data
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
