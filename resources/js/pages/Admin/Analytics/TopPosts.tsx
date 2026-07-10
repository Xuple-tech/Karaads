import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Coins, Heart, MessageSquare } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface TopPost {
    id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    earnings_sum_amount: number | null;
    user?: {
        name: string;
        username: string;
    };
}

interface Props {
    topPosts: TopPost[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export default function TopPosts({ topPosts }: Props) {
    const totalLikes = topPosts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalComments = topPosts.reduce((sum, post) => sum + post.comments_count, 0);
    const totalEarnings = topPosts.reduce((sum, post) => sum + Number(post.earnings_sum_amount || 0), 0);

    return (
        <>
            <Head title="Top Posts" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Analytics"
                        title="Top posts"
                        description="Review the posts driving the strongest mix of earnings and engagement."
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Total likes" value={totalLikes} hint="Likes across ranked posts" icon={Heart} />
                        <AdminMetricCard label="Total comments" value={totalComments} hint="Comments across ranked posts" icon={MessageSquare} />
                        <AdminMetricCard label="Total earnings" value={formatCurrency(totalEarnings)} hint="Combined earnings from the ranked set" icon={Coins} tone="success" />
                    </div>

                    <AdminSection title="Ranking table" description="Inspect the author, engagement, and earnings for each top post.">
                        <AdminPanel title="Post rankings" description="Content is ranked using the current analytics query output.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Post</TableHead>
                                            <TableHead className="text-right">Likes</TableHead>
                                            <TableHead className="text-right">Comments</TableHead>
                                            <TableHead className="text-right">Earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topPosts.length === 0 ? (
                                            <TableRow>
                                                <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                                                    No post data available.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            topPosts.map((post) => (
                                                <TableRow key={post.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{post.user?.name ?? 'Unknown'}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {post.user?.username ? `@${post.user.username}` : 'Unknown user'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-md truncate" title={post.content}>
                                                        {post.content}
                                                    </TableCell>
                                                    <TableCell className="text-right">{post.likes_count}</TableCell>
                                                    <TableCell className="text-right">{post.comments_count}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(post.earnings_sum_amount || 0))}</TableCell>
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
