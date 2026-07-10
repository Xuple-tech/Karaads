import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    bio: string;
}

interface EditProps {
    user: User;
}

export default function Edit({ user }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.users.update(user.id).url);
    };

    return (
        <>
            <Head title={`Edit User: ${user.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Users"
                        title={`Edit ${user.name}`}
                        description="Update profile identity, contact information, and the public bio for this account."
                        actions={
                            <>
                                <Link href={admin.users.show(user.id).url}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to profile
                                    </Button>
                                </Link>
                                <Button form="edit-user-form" type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save changes'}
                                </Button>
                            </>
                        }
                    />

                    <AdminSection title="Profile editor" description="Keep account records accurate without touching unrelated wallet or moderation data.">
                        <AdminPanel title="User details" description="These values feed the admin directory and the user-facing profile.">
                            <form id="edit-user-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : undefined}
                                    />
                                    {errors.name ? <p className="text-sm text-red-500">{errors.name}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : undefined}
                                    />
                                    {errors.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="username">Username</Label>
                                    <div className="flex items-center">
                                        <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">@</span>
                                        <Input
                                            id="username"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className={errors.username ? 'rounded-l-none border-red-500' : 'rounded-l-none'}
                                        />
                                    </div>
                                    {errors.username ? <p className="text-sm text-red-500">{errors.username}</p> : null}
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        className={errors.bio ? 'min-h-[140px] border-red-500' : 'min-h-[140px]'}
                                    />
                                    {errors.bio ? <p className="text-sm text-red-500">{errors.bio}</p> : null}
                                </div>
                            </form>
                        </AdminPanel>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
