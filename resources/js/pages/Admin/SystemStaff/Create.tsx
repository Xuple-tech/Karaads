import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShieldPlus } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Props {
    roles: string[];
    permissions: string[];
}

export default function CreateSystemStaff({ roles, permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: roles[0] || 'admin',
        permissions: [] as string[],
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.systemStaff.store.url());
    };

    const togglePermission = (permission: string) => {
        setData(
            'permissions',
            data.permissions.includes(permission)
                ? data.permissions.filter((p) => p !== permission)
                : [...data.permissions, permission],
        );
    };

    return (
        <>
            <Head title="Create System Staff" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform"
                        title="Create system staff"
                        description="Provision a new privileged account, assign a role, and grant explicit permissions."
                        actions={
                            <>
                                <Link href={admin.systemStaff.index.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to staff
                                    </Button>
                                </Link>
                                <Button form="create-staff-form" type="submit" disabled={processing}>
                                    <ShieldPlus className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create staff'}
                                </Button>
                            </>
                        }
                    />

                    <AdminSection title="Staff setup" description="Create the base identity, login credentials, and access scope for the new staff account.">
                        <form id="create-staff-form" onSubmit={submit} className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
                            <AdminPanel title="Identity and role" description="These fields determine who the account belongs to and which high-level role they assume.">
                                <div className="grid gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                        {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                        {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                        {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                            <SelectTrigger id="role">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role.replace(/_/g, ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role ? <p className="text-sm text-red-600">{errors.role}</p> : null}
                                    </div>
                                </div>
                            </AdminPanel>

                            <AdminPanel title="Credentials and permissions" description="Choose a password and fine-tune explicit permissions granted to the staff account.">
                                <div className="space-y-6">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="font-medium text-foreground">Permissions</h3>
                                            <p className="text-sm text-muted-foreground">Grant only the capabilities this staff account needs.</p>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {permissions.map((permission) => (
                                                <label
                                                    key={permission}
                                                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4"
                                                >
                                                    <Checkbox
                                                        checked={data.permissions.includes(permission)}
                                                        onCheckedChange={() => togglePermission(permission)}
                                                    />
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">{permission}</div>
                                                        <div className="text-xs text-muted-foreground">Explicit access grant for this admin capability.</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.permissions ? <p className="text-sm text-red-600">{errors.permissions}</p> : null}
                                    </div>
                                </div>
                            </AdminPanel>
                        </form>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
