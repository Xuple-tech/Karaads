import { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Mail, Search, Send, Users } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';

interface UserOption {
    id: string;
    name: string;
    email: string;
    username?: string | null;
}

interface CreateEmailProps {
    users: UserOption[];
    filters: {
        search?: string;
    };
    totalUsers: number;
}

export default function CreateEmail({ users, filters, totalUsers }: CreateEmailProps) {
    const [search, setSearch] = useState(filters.search || '');
    const { data, setData, post, processing, errors, reset } = useForm({
        recipient_type: 'user',
        user_id: '',
        subject: '',
        message: '',
    });

    const selectedUser = useMemo(
        () => users.find((user) => user.id === data.user_id),
        [data.user_id, users],
    );

    const handleSearch = () => {
        router.get('/admin/email-users', { search }, { preserveState: true, replace: true });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/admin/email-users', {
            preserveScroll: true,
            onSuccess: () => {
                reset('subject', 'message');
            },
        });
    };

    return (
        <>
            <Head title="Email Users" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform messaging"
                        title="Email users"
                        description="Send a custom email to one user or broadcast an announcement to every user with an email address."
                        actions={
                            <Link href="/admin/users">
                                <Button variant="outline">Back to users</Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Reachable users" value={totalUsers.toLocaleString()} hint="Users with an email address" icon={Users} />
                        <AdminMetricCard
                            label="Recipient"
                            value={data.recipient_type === 'all' ? 'All users' : 'One user'}
                            hint={selectedUser ? selectedUser.email : 'Choose who should receive this email'}
                            icon={Mail}
                            tone={data.recipient_type === 'all' ? 'warning' : 'default'}
                        />
                        <AdminMetricCard
                            label="Mode"
                            value={processing ? 'Sending' : 'Ready'}
                            hint={processing ? 'Please keep this page open.' : 'Review before sending.'}
                            icon={Send}
                            tone={processing ? 'warning' : 'success'}
                        />
                    </div>

                    <AdminSection title="Compose email" description="Use plain text. Line breaks will be kept in the email.">
                        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                            <AdminPanel title="Recipients" description="Pick a single account or send to all registered users.">
                                <div className="space-y-5">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('recipient_type', 'user')}
                                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                                                data.recipient_type === 'user'
                                                    ? 'border-primary bg-primary/10 text-foreground'
                                                    : 'border-border bg-background hover:bg-muted/50'
                                            }`}
                                        >
                                            <p className="font-semibold">One user</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Send only to the selected account.</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('recipient_type', 'all');
                                                setData('user_id', '');
                                            }}
                                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                                                data.recipient_type === 'all'
                                                    ? 'border-amber-400 bg-amber-500/10 text-foreground'
                                                    : 'border-border bg-background hover:bg-muted/50'
                                            }`}
                                        >
                                            <p className="font-semibold">All users</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Broadcast to {totalUsers.toLocaleString()} reachable users.</p>
                                        </button>
                                    </div>
                                    {errors.recipient_type ? <p className="text-sm text-red-500">{errors.recipient_type}</p> : null}

                                    {data.recipient_type === 'user' ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <Input
                                                    value={search}
                                                    onChange={(event) => setSearch(event.target.value)}
                                                    placeholder="Search by name, username, or email"
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') {
                                                            event.preventDefault();
                                                            handleSearch();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={handleSearch}>
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Search
                                                </Button>
                                            </div>

                                            <div className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-border p-2">
                                                {users.length > 0 ? (
                                                    users.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => setData('user_id', user.id)}
                                                            className={`w-full rounded-xl px-3 py-3 text-left transition ${
                                                                data.user_id === user.id
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'hover:bg-muted'
                                                            }`}
                                                        >
                                                            <span className="block font-semibold">{user.name}</span>
                                                            <span className="block text-xs opacity-75">
                                                                @{user.username || 'user'} · {user.email}
                                                            </span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">No users found.</p>
                                                )}
                                            </div>
                                            {errors.user_id ? <p className="text-sm text-red-500">{errors.user_id}</p> : null}
                                        </div>
                                    ) : (
                                        <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                                            <Mail className="h-4 w-4" />
                                            <AlertTitle>Broadcast email</AlertTitle>
                                            <AlertDescription>
                                                This will send to every user with an email address. Please double-check the message before sending.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </AdminPanel>

                            <AdminPanel title="Message" description="The subject and body will be sent as a Karaads email.">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(event) => setData('subject', event.target.value)}
                                            placeholder="Important update from Karaads"
                                            className={errors.subject ? 'border-red-500' : undefined}
                                        />
                                        {errors.subject ? <p className="text-sm text-red-500">{errors.subject}</p> : null}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(event) => setData('message', event.target.value)}
                                            placeholder="Write the email message here..."
                                            rows={12}
                                            className={`min-h-72 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                                errors.message ? 'border-red-500' : 'border-input'
                                            }`}
                                        />
                                        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                            <span>{data.message.length.toLocaleString()} / 10,000 characters</span>
                                            {errors.message ? <span className="text-red-500">{errors.message}</span> : null}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-muted/35 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Sending to</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {data.recipient_type === 'all' ? (
                                                <Badge variant="secondary">{totalUsers.toLocaleString()} users</Badge>
                                            ) : selectedUser ? (
                                                <Badge variant="secondary">{selectedUser.email}</Badge>
                                            ) : (
                                                <Badge variant="outline">No user selected</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing || (data.recipient_type === 'user' && !data.user_id)}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {processing ? 'Sending...' : data.recipient_type === 'all' ? 'Send to all users' : 'Send email'}
                                    </Button>
                                </div>
                            </AdminPanel>
                        </form>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
