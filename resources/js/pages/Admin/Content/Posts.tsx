import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Eye, ListChecks, Pin, Search, ShieldAlert, XCircle } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination, { type PaginationLink } from '@/components/pagination';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    username: string;
    email?: string;
}

interface Post {
    id: string;
    content: string | null;
    created_at: string;
    user: User;
    is_pinned: boolean;
    deleted_at: string | null;
    content_validation_status?: string | null;
    content_validation_score?: number | null;
    content_validation_summary?: string | null;
    content_validation_flags?: {
        violations?: string[];
        warnings?: string[];
    } | null;
    content_validated_at?: string | null;
}

interface PostsProps {
    posts: {
        data: Post[];
        links: PaginationLink[];
        meta: unknown;
    };
    filters: {
        search?: string;
        status?: string;
        validation?: string;
        validation_status?: string;
    };
    validationOnly?: boolean;
    validationStats?: Record<string, number> | null;
}

const validationStatusLabels: Record<string, string> = {
    approved: 'Approved',
    warning: 'Warning',
    needs_review: 'Needs review',
    rejected: 'Rejected',
    blocked: 'Blocked',
    pending: 'Pending',
};

function validationBadgeVariant(status?: string | null) {
    if (!status) return 'secondary' as const;
    if (['approved', 'passed'].includes(status)) return 'outline' as const;
    if (['rejected', 'blocked', 'failed'].includes(status)) return 'destructive' as const;
    if (status === 'needs_review') return 'secondary' as const;
    return 'secondary' as const;
}

function formatValidationStatus(status?: string | null) {
    if (!status) return 'Not recorded';
    return validationStatusLabels[status] || status.replaceAll('_', ' ');
}

function validationWarnings(post: Post): string[] {
    const warnings = post.content_validation_flags?.warnings;
    const violations = post.content_validation_flags?.violations;

    return [...(violations || []), ...(warnings || [])].filter(Boolean);
}

export default function Posts({ posts, filters, validationOnly = false, validationStats = null }: PostsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [validationStatus, setValidationStatus] = useState(filters.validation_status || '');
    const [previewPost, setPreviewPost] = useState<Post | null>(null);
    const totalValidated = Object.values(validationStats || {}).reduce((sum, count) => sum + count, 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            admin.content.posts.url({
                query: {
                    search: search || undefined,
                    status: status || undefined,
                    validation: validationOnly ? '1' : undefined,
                    validation_status: validationStatus || undefined,
                },
            }),
            {},
            { preserveState: true },
        );
    };

    const handleReject = (id: string) => {
        router.post(admin.content.posts.reject.url(id));
    };

    const handleApprove = (id: string) => {
        router.post(admin.content.posts.approve.url(id));
    };

    const handlePin = (id: string) => {
        router.post(admin.content.posts.pin.url(id));
    };

    const handleDisable = (id: string) => {
        router.post(admin.content.posts.disable.url(id));
    };

    const handleEnable = (id: string) => {
        router.post(admin.content.posts.enable.url(id));
    };

    return (
        <>
            <Head title={validationOnly ? 'Content Verification' : 'Content Moderation - Posts'} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Operations"
                        title={validationOnly ? 'Content verification' : 'Posts moderation'}
                        description={
                            validationOnly
                                ? 'Review every post users submitted through content validation, including the validation status, score, warnings, and owner.'
                                : 'Review current post inventory, pin important content, and remove harmful or disabled items.'
                        }
                        actions={
                            <Badge variant="outline" className="rounded-full px-3 py-1.5">
                                {validationOnly ? `${totalValidated || posts.data.length} validated` : `${posts.data.length} visible`}
                            </Badge>
                        }
                    />

                    {validationOnly ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <AdminPanel title="Validated posts" description="All posts with saved validation records.">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                        <ListChecks className="h-5 w-5" />
                                    </div>
                                    <p className="karads-heading text-3xl font-semibold">{totalValidated || posts.data.length}</p>
                                </div>
                            </AdminPanel>
                            <AdminPanel title="Approved" description="Posts that passed checks.">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <p className="karads-heading text-3xl font-semibold">{validationStats?.approved || 0}</p>
                                </div>
                            </AdminPanel>
                            <AdminPanel title="Needs attention" description="Warnings, rejections, and blocked content.">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <p className="karads-heading text-3xl font-semibold">
                                        {(validationStats?.needs_review || 0) + (validationStats?.rejected || 0) + (validationStats?.blocked || 0)}
                                    </p>
                                </div>
                            </AdminPanel>
                            <AdminPanel title="Needs review" description="Published posts waiting for admin decision.">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600">
                                        <ShieldAlert className="h-5 w-5" />
                                    </div>
                                    <p className="karads-heading text-3xl font-semibold">{validationStats?.needs_review || 0}</p>
                                </div>
                            </AdminPanel>
                        </div>
                    ) : null}

                    <AdminSection title="Filters" description="Search for content and narrow by moderation status.">
                        <AdminPanel title="Search posts" description="Find posts by content or creator username.">
                            <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search content or user..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-full lg:w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {validationOnly ? (
                                    <Select
                                        value={validationStatus || 'all'}
                                        onValueChange={(value) => setValidationStatus(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger className="w-full lg:w-[220px]">
                                            <SelectValue placeholder="Validation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All validation</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="needs_review">Needs review</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="blocked">Blocked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : null}
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </form>
                        </AdminPanel>
                    </AdminSection>

                    <AdminPanel
                        title={validationOnly ? 'Validated user posts' : 'Moderation queue'}
                        description={
                            validationOnly
                                ? 'Every row shows the user, post, validation result, score, and saved content-check notes.'
                                : 'Take direct action on posts in the current result set.'
                        }
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Content</TableHead>
                                        {validationOnly ? <TableHead>Validation</TableHead> : null}
                                        {validationOnly ? <TableHead>Checks</TableHead> : null}
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.data.length > 0 ? (
                                        posts.data.map((post) => (
                                            <TableRow key={post.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{post.user.name}</span>
                                                        <span className="text-xs text-muted-foreground">@{post.user.username}</span>
                                                        {validationOnly && post.user.email ? (
                                                            <span className="text-xs text-muted-foreground">{post.user.email}</span>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-md" title={post.content || ''}>
                                                    <div className="space-y-1">
                                                        <p className="line-clamp-2 text-sm">{post.content || 'Media post without caption'}</p>
                                                        {validationOnly && post.content_validation_summary ? (
                                                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                                                {post.content_validation_summary}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                {validationOnly ? (
                                                    <TableCell>
                                                        <div className="space-y-2">
                                                            <Badge variant={validationBadgeVariant(post.content_validation_status)} className="capitalize">
                                                                {formatValidationStatus(post.content_validation_status)}
                                                            </Badge>
                                                            <p className="text-xs text-muted-foreground">
                                                                Score: {post.content_validation_score ?? 'N/A'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                ) : null}
                                                {validationOnly ? (
                                                    <TableCell className="max-w-xs">
                                                        {validationWarnings(post).length > 0 ? (
                                                            <div className="space-y-1">
                                                                {validationWarnings(post).slice(0, 3).map((item) => (
                                                                    <p key={item} className="line-clamp-1 text-xs text-muted-foreground">
                                                                        {item}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">No warnings recorded</span>
                                                        )}
                                                    </TableCell>
                                                ) : null}
                                                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {post.is_pinned ? <Badge>Pinned</Badge> : null}
                                                        <Badge variant={post.deleted_at ? 'secondary' : 'outline'}>
                                                            {post.deleted_at ? 'Disabled' : 'Active'}
                                                        </Badge>
                                                        {validationOnly && post.content_validated_at ? (
                                                            <Badge variant="secondary">
                                                                Checked {new Date(post.content_validated_at).toLocaleDateString()}
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => setPreviewPost(post)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Button>
                                                        {validationOnly && post.content_validation_status !== 'approved' ? (
                                                            <Button variant="default" size="sm" onClick={() => handleApprove(post.id)}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                        ) : null}
                                                        <Button
                                                            variant={post.is_pinned ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePin(post.id)}
                                                            title={post.is_pinned ? 'Unpin Post' : 'Pin Post'}
                                                        >
                                                            <Pin className="mr-2 h-4 w-4" />
                                                            {post.is_pinned ? 'Pinned' : 'Pin'}
                                                        </Button>
                                                        {post.deleted_at ? (
                                                            <Button variant="outline" size="sm" onClick={() => handleEnable(post.id)}>
                                                                Enable
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" size="sm" onClick={() => handleDisable(post.id)}>
                                                                Disable
                                                            </Button>
                                                        )}

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Reject this post?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This removes the post from public view and treats it as rejected content.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleReject(post.id)} className="bg-red-600 hover:bg-red-700">
                                                                        Reject post
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={validationOnly ? 7 : 5} className="py-8 text-center text-muted-foreground">
                                                {validationOnly
                                                    ? 'No content validation posts found matching your criteria.'
                                                    : 'No posts found matching your criteria.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Result navigation</p>
                                <p className="text-sm text-muted-foreground">Move through the current moderation result set.</p>
                            </div>
                        </div>
                        <Pagination links={posts.links} />
                    </div>
                    <Dialog open={Boolean(previewPost)} onOpenChange={(open) => !open && setPreviewPost(null)}>
                        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
                            <DialogHeader className="border-b px-5 py-4">
                                <DialogTitle>Post preview</DialogTitle>
                                <DialogDescription>
                                    {previewPost
                                        ? `Viewing ${previewPost.user.name}'s post without leaving admin.`
                                        : 'View the selected post.'}
                                </DialogDescription>
                            </DialogHeader>
                            {previewPost ? (
                                <div className="h-[78vh] bg-slate-950">
                                    <iframe
                                        title={`Post preview ${previewPost.id}`}
                                        src={`/admin/content/posts/${previewPost.id}/preview`}
                                        className="h-full w-full border-0"
                                        loading="lazy"
                                    />
                                </div>
                            ) : null}
                        </DialogContent>
                    </Dialog>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
