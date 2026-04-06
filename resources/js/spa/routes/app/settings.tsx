import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, Bot, Palette, Save, Shield, User } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey, useSessionQuery } from '@/spa/lib/session';

const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
] as const;

type TabId = typeof tabs[number]['id'];

export function Component() {
    const session = useSessionQuery();
    const [activeTab, setActiveTab] = useState<TabId>('account');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [theme, setTheme] = useState('system');
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedMode, setSelectedMode] = useState<string>('none');
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

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

    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const profileMutation = useMutation({
        mutationFn: () => apiRequest('/api/settings/profile', { method: 'PUT', json: { name, email } }),
        onSuccess: async () => { setError(null); flash(); await queryClient.invalidateQueries({ queryKey: sessionQueryKey }); },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save profile.'),
    });

    const passwordMutation = useMutation({
        mutationFn: (payload: { current_password: string; password: string; password_confirmation: string }) =>
            apiRequest('/api/settings/password', { method: 'PUT', json: payload }),
        onSuccess: () => { setError(null); flash(); },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to change password.'),
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
        onSuccess: async () => { setError(null); flash(); await queryClient.invalidateQueries({ queryKey: ['spa', 'settings', 'preferences'] }); },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save preferences.'),
    });

    const resetPreferences = useMutation({
        mutationFn: () => apiRequest('/api-/_0001/user/chat-preferences/reset', { method: 'POST', json: {} }),
        onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['spa', 'settings', 'preferences'] }); },
    });

    const onProfileSubmit = (event: FormEvent) => { event.preventDefault(); profileMutation.mutate(); };
    const onPasswordSubmit = (event: FormEvent) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget as HTMLFormElement);
        passwordMutation.mutate({
            current_password: String(fd.get('current_password') ?? ''),
            password: String(fd.get('password') ?? ''),
            password_confirmation: String(fd.get('password_confirmation') ?? ''),
        });
    };

    return (
        <div className="mx-auto max-w-3xl">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage your account, AI behavior, and preferences.</p>
            </div>

            {/* Error / success banners */}
            {error && (
                <div className="mb-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            {saved && (
                <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    Changes saved.
                </div>
            )}

            {/* Tab nav — Claude-style horizontal underline tabs */}
            <div className="mb-8 flex gap-1 border-b border-border/40">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === id
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Account tab ── */}
            {activeTab === 'account' && (
                <div className="space-y-8">
                    <form onSubmit={onProfileSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-base font-medium text-foreground mb-4">Profile</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                                        className="bg-card border-border/60 h-10 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="bg-card border-border/60 h-10 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-6">
                            <h2 className="text-base font-medium text-foreground mb-4">Notifications</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">In-app notifications</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Receive alerts inside the app.</p>
                                    </div>
                                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Email notifications</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Get updates sent to your inbox.</p>
                                    </div>
                                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={profileMutation.isPending}
                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm">
                                {profileMutation.isPending
                                    ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                                    : <Save className="h-3.5 w-3.5" />}
                                Save changes
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── AI tab ── */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium text-foreground mb-1">Assistant behavior</h2>
                        <p className="text-sm text-muted-foreground mb-5">Choose your default mode and personalize how the AI responds.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Default AI mode</Label>
                        <Select onValueChange={setSelectedMode} value={selectedMode}>
                            <SelectTrigger className="bg-card border-border/60 h-10 text-sm">
                                <SelectValue placeholder="Choose a mode" />
                            </SelectTrigger>
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

                    <div className="space-y-1.5">
                        <Label htmlFor="prompt" className="text-sm text-muted-foreground">Custom system prompt</Label>
                        <Textarea
                            id="prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Add standing instructions for the assistant…"
                            rows={6}
                            className="bg-card border-border/60 text-sm resize-none"
                        />
                        <p className="text-xs text-muted-foreground">This prompt is prepended to every conversation.</p>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Bell className="h-3.5 w-3.5" /> Current preference snapshot
                        </p>
                        <pre className="text-xs text-muted-foreground/70 overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(preferences.data?.preferences ?? {}, null, 2)}
                        </pre>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <Button variant="ghost" disabled={resetPreferences.isPending}
                            onClick={() => resetPreferences.mutate()}
                            className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground">
                            Reset to defaults
                        </Button>
                        <Button disabled={preferencesMutation.isPending}
                            onClick={() => preferencesMutation.mutate()}
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm">
                            {preferencesMutation.isPending
                                ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                                : <Save className="h-3.5 w-3.5" />}
                            Save AI preferences
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Appearance tab ── */}
            {activeTab === 'appearance' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium text-foreground mb-1">Appearance</h2>
                        <p className="text-sm text-muted-foreground mb-5">Choose how Kwati AI looks for you.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Theme</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['system', 'dark', 'light'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTheme(t)}
                                    className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                                        theme === t
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Theme preference is applied globally across the app.
                    </p>
                </div>
            )}

            {/* ── Security tab ── */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-medium text-foreground mb-1">Password</h2>
                        <p className="text-sm text-muted-foreground mb-5">Change your account password.</p>
                    </div>

                    <form onSubmit={onPasswordSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="current_password" className="text-sm text-muted-foreground">Current password</Label>
                            <Input id="current_password" name="current_password" type="password"
                                placeholder="••••••••"
                                className="bg-card border-border/60 h-10 text-sm" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm text-muted-foreground">New password</Label>
                                <Input id="password" name="password" type="password"
                                    placeholder="••••••••"
                                    className="bg-card border-border/60 h-10 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-sm text-muted-foreground">Confirm new password</Label>
                                <Input id="password_confirmation" name="password_confirmation" type="password"
                                    placeholder="••••••••"
                                    className="bg-card border-border/60 h-10 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={passwordMutation.isPending}
                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm">
                                {passwordMutation.isPending
                                    ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                                    : <Save className="h-3.5 w-3.5" />}
                                Update password
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
