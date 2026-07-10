import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageSquare, Search, XCircle } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    username: string;
}

interface Post {
    id: string;
    content: string;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: User;
    post: Post;
    deleted_at: string | null;
}

interface CommentsProps {
    comments: {
        data: Comment[];
        links: unknown[];
        meta: unknown;
    };
    filters: {
        search?: string;
    };
}

export default function Comments({ comments, filters }: CommentsProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(admin.content.comments.url({ search }), { preserveState: true });
    };

    const handleReject = (id: string) => {
        router.post(admin.content.comments.reject.url({ id }));
    };

    const removedCount = comments.data.filter((comment) => comment.deleted_at !== null).length;

    return (
        <>
            <Head title="Content Moderation - Comments" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Content"
                        title="Comments moderation"
                        description="Search user comments, inspect related posts, and reject harmful or unwanted comments."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminMetricCard label="Comments" value={comments.data.length} hint="Comment rows in the current result set" icon={MessageSquare} />
                        <AdminMetricCard label="Removed" value={removedCount} hint="Comments already marked deleted in this view" icon={XCircle} tone="warning" />
                    </div>

                    <AdminSection title="Search" description="Filter comments by user or comment text without leaving the page.">
                        <AdminPanel title="Search comments" description="Look up content or users before moderation action.">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="max-w-md flex-1">
                                    <Input
                                        placeholder="Search content or user..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </form>
                        </AdminPanel>
                    </AdminSection>

                    <AdminSection title="Moderation queue" description="Review current comments and remove them when needed.">
                        <AdminPanel title="Comments" description="Each row includes user, comment, source post, and moderation action.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Comment</TableHead>
                                            <TableHead>Post</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {comments.data.length > 0 ? (
                                            comments.data.map((comment) => (
                                                <TableRow key={comment.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{comment.user.name}</span>
                                                            <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate" title={comment.content}>
                                                        {comment.content}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                                        {comment.post ? comment.post.content : 'Deleted post'}
                                                    </TableCell>
                                                    <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Reject comment?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This removes the comment from public view.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleReject(comment.id)} className="bg-red-600 hover:bg-red-700">
                                                                        Reject
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    No comments found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </AdminSection>

                    <div className="rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <Pagination links={comments.links as never[]} />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
