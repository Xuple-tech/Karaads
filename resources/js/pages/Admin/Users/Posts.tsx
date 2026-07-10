import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pin, Rows3 } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Post {
    id: string;
    content: string;
    created_at: string;
    is_pinned: boolean;
}

interface Props {
    user: { id: string; name: string };
    posts: { data: Post[] };
}

export default function UserPosts({ user, posts }: Props) {
    const pinnedCount = posts.data.filter((post) => post.is_pinned).length;

    return (
        <>
            <Head title={`Posts: ${user.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Users"
                        title={`${user.name} posts`}
                        description="Inspect the user’s published posts and pin status."
                        actions={
                            <Link href={admin.users.show(user.id).url}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to user
                                </Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminMetricCard label="Posts" value={posts.data.length} hint="Posts returned for this user" icon={Rows3} />
                        <AdminMetricCard label="Pinned" value={pinnedCount} hint="Posts currently pinned" icon={Pin} tone="warning" />
                    </div>

                    <AdminSection title="Post history" description="Review content volume and pin state from one table.">
                        <AdminPanel title="Posts" description="Current posts loaded for this user account.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Content</TableHead>
                                            <TableHead className="text-right">Pinned</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {posts.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                                    No posts found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            posts.data.map((post) => (
                                                <TableRow key={post.id}>
                                                    <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="max-w-xl truncate" title={post.content}>
                                                        {post.content}
                                                    </TableCell>
                                                    <TableCell className="text-right">{post.is_pinned ? 'Yes' : 'No'}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
