import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Head } from '@/components/page-head';
import SettingsLayout from '@/layouts/settings/layout';
import axiosInstance from '@/lib/axios';
import { useEffect, useMemo, useState } from 'react';

interface BlockedUser {
    id: string;
    name: string;
    username: string;
    avatar?: string;
}

type MessagePolicy = 'everyone' | 'followers' | 'nobody';
type PostVisibility = 'everyone' | 'followers' | 'private';

export default function PrivacySettings() {
    const [messagePolicy, setMessagePolicy] = useState<MessagePolicy>('everyone');
    const [defaultPostVisibility, setDefaultPostVisibility] = useState<PostVisibility>('everyone');
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [privacyRes, blockedRes] = await Promise.all([
                axiosInstance.get('/api/users/privacy'),
                axiosInstance.get('/api/users/blocked'),
            ]);

            const privacy = privacyRes.data?.data ?? privacyRes.data;
            const blocked = blockedRes.data?.data ?? blockedRes.data ?? [];
            setMessagePolicy((privacy?.message_policy ?? 'everyone') as MessagePolicy);
            setDefaultPostVisibility((privacy?.default_post_visibility ?? 'everyone') as PostVisibility);
            setBlockedUsers(Array.isArray(blocked) ? blocked : []);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to load privacy settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await axiosInstance.patch('/api/users/privacy', {
                message_policy: messagePolicy,
                default_post_visibility: defaultPostVisibility,
            });
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to save privacy settings.');
        } finally {
            setSaving(false);
        }
    };

    const unblock = async (userId: string) => {
        try {
            await axiosInstance.post(`/api/users/${userId}/unblock`);
            setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to unblock user.');
        }
    };

    const messageOptions: Array<{ value: MessagePolicy; label: string; hint: string }> = useMemo(
        () => [
            { value: 'everyone', label: 'Everyone', hint: 'Anyone can start a chat' },
            { value: 'followers', label: 'People I follow', hint: 'Only people you follow can message you' },
            { value: 'nobody', label: 'Nobody', hint: 'Messages disabled' },
        ],
        [],
    );

    const visibilityOptions: Array<{ value: PostVisibility; label: string; hint: string }> = useMemo(
        () => [
            { value: 'everyone', label: 'Everyone', hint: 'Default visibility is public' },
            { value: 'followers', label: 'Followers', hint: 'Only your followers' },
            { value: 'private', label: 'Private', hint: 'Only you can see new posts until changed' },
        ],
        [],
    );

    return (
        <>
            <Head title="Privacy settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Privacy"
                        description="Decide who can reach you and who sees your content."
                    />

                    {error ? (
                        <div className="rounded-md border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-sm">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Who can message me</p>
                                <p className="text-xs text-muted-foreground">Control DM entry to cut noise.</p>
                            </div>
                            <div className="space-y-2">
                                {messageOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                                            messagePolicy === opt.value
                                                ? 'border-primary/60 bg-primary/5'
                                                : 'border-border/70 hover:border-primary/30'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="message_policy"
                                            value={opt.value}
                                            checked={messagePolicy === opt.value}
                                            onChange={() => setMessagePolicy(opt.value)}
                                            disabled={loading || saving}
                                            className="mt-1"
                                        />
                                        <div className="space-y-0.5">
                                            <div className="font-semibold">{opt.label}</div>
                                            <div className="text-xs text-muted-foreground">{opt.hint}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-sm">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Default post visibility</p>
                                <p className="text-xs text-muted-foreground">Choose who sees new posts by default.</p>
                            </div>
                            <div className="space-y-2">
                                {visibilityOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                                            defaultPostVisibility === opt.value
                                                ? 'border-primary/60 bg-primary/5'
                                                : 'border-border/70 hover:border-primary/30'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="post_visibility"
                                            value={opt.value}
                                            checked={defaultPostVisibility === opt.value}
                                            onChange={() => setDefaultPostVisibility(opt.value)}
                                            disabled={loading || saving}
                                            className="mt-1"
                                        />
                                        <div className="space-y-0.5">
                                            <div className="font-semibold">{opt.label}</div>
                                            <div className="text-xs text-muted-foreground">{opt.hint}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button onClick={save} disabled={loading || saving}>
                            {saving ? 'Saving...' : 'Save settings'}
                        </Button>
                        {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
                    </div>

                    <div className="space-y-3 border-t border-border pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold">Blocked users</h3>
                                <p className="text-xs text-muted-foreground">People you won’t hear from.</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {blockedUsers.length} blocked
                            </span>
                        </div>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading blocked users...</p>
                        ) : blockedUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No blocked users.</p>
                        ) : (
                            <div className="space-y-2">
                                {blockedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => unblock(user.id)}>
                                            Unblock
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </>
    );
}

