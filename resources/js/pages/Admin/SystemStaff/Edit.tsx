import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Staff {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    permissions: string[] | null;
}

interface Props {
    staff: Staff;
    roles: string[];
    permissions: string[];
}

export default function EditSystemStaff({ staff, roles, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        role: staff.role,
        permissions: staff.permissions || [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.systemStaff.update(staff.id).url);
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
            <Head title={`Edit Staff: ${staff.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform"
                        title={`Edit ${staff.name}`}
                        description="Update the base identity, role assignment, and granted permissions for this staff account."
                        actions={
                            <>
                                <Link href={admin.systemStaff.index.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to staff
                                    </Button>
                                </Link>
                                <Button form="edit-staff-form" type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save changes'}
                                </Button>
                            </>
                        }
                    />

                    <AdminSection title="Staff editor" description="Use this page to keep role and permission assignments aligned with current responsibilities.">
                        <form id="edit-staff-form" onSubmit={submit} className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
                            <AdminPanel title="Identity and role" description="Basic ownership and the high-level role for the account.">
                                <div className="grid gap-5">
                                    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-900">
                                        <div className="flex items-center gap-2 font-medium">
                                            <ShieldCheck className="h-4 w-4" />
                                            Staff account
                                        </div>
                                        <p className="mt-2 text-sky-800">{staff.email}</p>
                                    </div>

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

                            <AdminPanel title="Permission scope" description="Grant or remove explicit access without changing the role taxonomy itself.">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-foreground">Permissions</h3>
                                        <p className="text-sm text-muted-foreground">These permissions are applied directly to this staff account.</p>
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
                                                    <div className="text-xs text-muted-foreground">Direct permission grant for this staff member.</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.permissions ? <p className="text-sm text-red-600">{errors.permissions}</p> : null}
                                </div>
                            </AdminPanel>
                        </form>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
