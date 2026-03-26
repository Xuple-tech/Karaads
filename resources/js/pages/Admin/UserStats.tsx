import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, Image, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    conversations_count: number;
    chats_count: number;
    image_uploads_count: number;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function UserStats({ users }: Props) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getActivityLevel = (user: User) => {
        const totalActivity = user.conversations_count + user.chats_count + user.image_uploads_count;

        if (totalActivity >= 100) return { level: 'High', color: 'bg-green-100 text-green-800' };
        if (totalActivity >= 50) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
        if (totalActivity >= 10) return { level: 'Low', color: 'bg-blue-100 text-blue-800' };
        return { level: 'New', color: 'bg-gray-100 text-gray-800' };
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Statistics</h1>
                        <p className="text-gray-500 mt-1">Detailed analytics of user activity and engagement</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-8 h-8 text-blue-500" />
                                <div>
                                    <div className="text-2xl font-bold">{users.total}</div>
                                    <p className="text-xs text-muted-foreground">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {users.data.reduce((sum, user) => sum + user.conversations_count, 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total Conversations</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Image className="w-8 h-8 text-purple-500" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {users.data.reduce((sum, user) => sum + user.image_uploads_count, 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total Image Uploads</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-8 h-8 text-orange-500" />
                                <div>
                                    <div className="text-2xl font-bold">
                                        {Math.round(users.data.reduce((sum, user) => sum + user.chats_count, 0) / Math.max(users.total, 1))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Avg Chats per User</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Level Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Distribution</CardTitle>
                        <CardDescription>User activity levels based on total interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['High', 'Medium', 'Low', 'New'].map((level) => {
                                const count = users.data.filter(user => getActivityLevel(user).level === level).length;
                                const color = getActivityLevel({ conversations_count: 0, chats_count: 0, image_uploads_count: 0 } as User).color;
                                return (
                                    <div key={level} className="text-center">
                                        <div className="text-2xl font-bold">{count}</div>
                                        <Badge className={`${level === 'High' ? 'bg-green-100 text-green-800' :
                                                         level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                         level === 'Low' ? 'bg-blue-100 text-blue-800' :
                                                         'bg-gray-100 text-gray-800'} mt-1`}>
                                            {level}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Activity Details</CardTitle>
                        <CardDescription>
                            Comprehensive view of user engagement metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Activity Level</TableHead>
                                    <TableHead>Conversations</TableHead>
                                    <TableHead>Chats</TableHead>
                                    <TableHead>Image Uploads</TableHead>
                                    <TableHead>Total Activity</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => {
                                    const activityLevel = getActivityLevel(user);
                                    const totalActivity = user.conversations_count + user.chats_count + user.image_uploads_count;

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={activityLevel.color}>
                                                    {activityLevel.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <div className="font-medium">{user.conversations_count}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <div className="font-medium">{user.chats_count}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <div className="font-medium">{user.image_uploads_count}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <div className="font-bold text-lg">{totalActivity}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing page {users.current_page} of {users.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {users.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get(route('admin.user-stats'), {
                                                page: users.current_page - 1
                                            })}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {users.current_page < users.last_page && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get(route('admin.user-stats'), {
                                                page: users.current_page + 1
                                            })}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
