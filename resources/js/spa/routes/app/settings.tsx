import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Bell, Bot, Palette, Save, Shield, User } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey, useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedMode, setSelectedMode] = useState<string>('none');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(session.data?.user?.name ?? '');
        setEmail(session.data?.user?.email ?? '');
    }, [session.data?.user?.email, session.data?.user?.name]);

    const modes = useQuery({
        queryKey: ['spa', 'settings', 'modes'],
        queryFn: () => apiRequest<any>('/api-/_0001/user/chat-modes'),
        staleTime: 300_000,
    });

    const preferences = useQuery({
        queryKey: ['spa', 'settings', 'preferences'],
        queryFn: () => apiRequest<any>('/api-/_0001/user/chat-preferences'),
    });

    useEffect(() => {
        if (preferences.data?.preferences) {
            setCustomPrompt(preferences.data.preferences.custom_system_prompt ?? '');
            setSelectedMode(String(preferences.data.preferences.preferred_ai_mode_id ?? 'none'));
        }
    }, [preferences.data]);

    const profileMutation = useMutation({
        mutationFn: () => apiRequest('/api/settings/profile', { method: 'PUT', json: { name, email } }),
        onSuccess: async () => {
            setError(null);
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
        },
        onError: (mutationError) => setError(mutationError instanceof ApiError ? mutationError.message : 'Failed to save profile.'),
    });

    const passwordMutation = useMutation({
        mutationFn: (payload: { current_password: string; password: string; password_confirmation: string }) =>
            apiRequest('/api/settings/password', { method: 'PUT', json: payload }),
        onError: (mutationError) => setError(mutationError instanceof ApiError ? mutationError.message : 'Failed to change password.'),
    });

    const preferencesMutation = useMutation({
        mutationFn: () =>
            apiRequest('/api-/_0001/user/chat-preferences', {
                method: 'PUT',
                json: {
                    preferred_ai_mode_id: selectedMode === 'none' ? null : Number(selectedMode),
                    custom_system_prompt: customPrompt || null,
                },
            }),
        onSuccess: async () => {
            setError(null);
            await queryClient.invalidateQueries({ queryKey: ['spa', 'settings', 'preferences'] });
        },
        onError: (mutationError) => setError(mutationError instanceof ApiError ? mutationError.message : 'Failed to save preferences.'),
    });

    const resetPreferences = useMutation({
        mutationFn: () => apiRequest('/api-/_0001/user/chat-preferences/reset', { method: 'POST', json: {} }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'settings', 'preferences'] });
        },
    });

    const onProfileSubmit = (event: FormEvent) => {
        event.preventDefault();
        profileMutation.mutate();
    };

    const onPasswordSubmit = (event: FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        passwordMutation.mutate({
            current_password: String(formData.get('current_password') ?? ''),
            password: String(formData.get('password') ?? ''),
            password_confirmation: String(formData.get('password_confirmation') ?? ''),
        });
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account, chat behavior, and preferences.</p>
            </div>

            {error ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Tabs className="space-y-6" defaultValue="account">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="account"><User className="mr-2 h-4 w-4" />Account</TabsTrigger>
                    <TabsTrigger value="ai"><Bot className="mr-2 h-4 w-4" />AI</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
                    <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Update your name and email address.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={onProfileSubmit}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" onChange={(e) => setName(e.target.value)} value={name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                                    <div>
                                        <p className="font-medium">Notifications</p>
                                        <p className="text-sm text-muted-foreground">Toggle in-app and email notifications.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch checked={notifications} onCheckedChange={setNotifications} />
                                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                    </div>
                                </div>
                                <Button disabled={profileMutation.isPending} type="submit">
                                    {profileMutation.isPending ? <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save account
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ai">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assistant behavior</CardTitle>
                            <CardDescription>Choose your default mode and personalize responses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Default AI mode</Label>
                                <Select onValueChange={setSelectedMode} value={selectedMode}>
                                    <SelectTrigger><SelectValue placeholder="Choose a mode" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">System default</SelectItem>
                                        {modes.data?.modes?.map((mode: any) => (
                                            <SelectItem key={mode.id} value={String(mode.id)}>
                                                {(mode.emoji ? `${mode.emoji} ` : '') + mode.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prompt">Custom system prompt</Label>
                                <Textarea id="prompt" onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Add any standing instructions for the assistant..." rows={6} value={customPrompt} />
                            </div>

                            <div className="rounded-xl border border-border/60 p-4">
                                <p className="mb-2 flex items-center gap-2 font-medium"><Bell className="h-4 w-4" />Current preference snapshot</p>
                                <pre className="overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(preferences.data?.preferences ?? {}, null, 2)}</pre>
                            </div>

                            <div className="flex gap-3">
                                <Button disabled={preferencesMutation.isPending} onClick={() => preferencesMutation.mutate()}>Save AI preferences</Button>
                                <Button disabled={resetPreferences.isPending} onClick={() => resetPreferences.mutate()} variant="outline">Reset</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Keep the original user theme controls available in the SPA.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <Select onValueChange={setTheme} value={theme}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">System</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="light">Light</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            <p className="text-sm text-muted-foreground">Theme persistence is now handled from the SPA shell. This panel restores the original settings structure so it stays consistent with the old user experience.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Change your password without leaving the SPA.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={onPasswordSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current password</Label>
                                    <Input id="current_password" name="current_password" type="password" />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New password</Label>
                                        <Input id="password" name="password" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm password</Label>
                                        <Input id="password_confirmation" name="password_confirmation" type="password" />
                                    </div>
                                </div>
                                <Button disabled={passwordMutation.isPending} type="submit">
                                    {passwordMutation.isPending ? <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" /> : <Save className="mr-2 h-4 w-4" />}
                                    Update password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
