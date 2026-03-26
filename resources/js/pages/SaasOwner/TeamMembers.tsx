import React, { useState } from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Users, Mail, Calendar } from 'lucide-react';

interface TeamMember {
    id: string;
    user: {
        name: string;
        email: string;
        id: string;
    };
    role: 'admin' | 'manager' | 'member';
    permissions?: string[];
    joined_at: string;
}

interface SaasOwnerTeamProps {
    members: {
        data: TeamMember[];
        current_page: number;
        last_page: number;
    };
}

export default function SaasOwnerTeamMembers({ members }: SaasOwnerTeamProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const { delete: deleteMember } = useForm();

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            deleteMember(route('saas-owner.team-members.destroy', id));
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800',
            manager: 'bg-blue-100 text-blue-800',
            member: 'bg-gray-100 text-gray-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <SaasOwnerLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Team Members</h1>
                        <p className="text-gray-500 mt-1">Manage your team and their permissions</p>
                    </div>
                    <Link href={route('saas-owner.team-members.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    </Link>
                </div>

                {/* Member Stats */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{members.data.filter(m => m.role === 'admin').length}</div>
                                <p className="text-sm text-gray-600">Admins</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{members.data.filter(m => m.role === 'manager').length}</div>
                                <p className="text-sm text-gray-600">Managers</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">{members.data.filter(m => m.role === 'member').length}</div>
                                <p className="text-sm text-gray-600">Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Members</CardTitle>
                        <CardDescription>{members.data.length} team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {members.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Team Members</h3>
                                <p className="text-gray-500 mb-4">Start by inviting your first team member</p>
                                <Link href={route('saas-owner.team-members.create')}>
                                    <Button>Invite Member</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.data.map((member) => (
                                    <div
                                        key={member.id}
                                        className="p-4 border rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-medium">{member.user.name}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded ${getRoleColor(member.role)}`}>
                                                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {member.user.email}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Joined {new Date(member.joined_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Link href={route('saas-owner.team-members.edit', member.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Role Permissions Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>Overview of role capabilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                                    Admin
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1 ml-5">
                                    <li>✓ Manage team members</li>
                                    <li>✓ View all analytics</li>
                                    <li>✓ Create custom prompts</li>
                                    <li>✓ Manage billing</li>
                                </ul>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                                    Manager
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1 ml-5">
                                    <li>✓ View analytics</li>
                                    <li>✓ Create custom prompts</li>
                                    <li>✗ Manage team</li>
                                    <li>✗ Manage billing</li>
                                </ul>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                                    Member
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1 ml-5">
                                    <li>✓ Use chat features</li>
                                    <li>✗ View analytics</li>
                                    <li>✗ Create prompts</li>
                                    <li>✗ Manage team</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SaasOwnerLayout>
    );
}
