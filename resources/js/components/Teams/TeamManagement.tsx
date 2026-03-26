import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, Trash2, Users, Mail, Settings } from 'lucide-react';

interface Team {
    id: string;
    name: string;
    description: string;
    member_count: number;
    owner: { id: string; name: string };
    members_count: number;
    created_at: string;
}

interface TeamMember {
    id: string;
    user: { id: string; name: string; email: string };
    role: 'admin' | 'manager' | 'member' | 'viewer';
    joined_at: string;
}

export function TeamManagement() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch teams
    const { data: teams, isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const res = await axios.get('/api/teams');
            return res.data.data;
        },
    });

    // Fetch team members
    const { data: members } = useQuery({
        queryKey: ['team-members', selectedTeam?.id],
        queryFn: async () => {
            if (!selectedTeam) return [];
            const res = await axios.get(`/api/teams/${selectedTeam.id}/members`);
            return res.data.data;
        },
        enabled: !!selectedTeam,
    });

    // Create team mutation
    const createTeamMutation = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            const res = await axios.post('/api/teams', data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setTeamName('');
            setTeamDescription('');
            setIsCreateOpen(false);
            toast.success('Team created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create team');
        },
    });

    // Delete team mutation
    const deleteTeamMutation = useMutation({
        mutationFn: async (teamId: string) => {
            await axios.delete(`/api/teams/${teamId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setDeleteTeamId(null);
            toast.success('Team deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete team');
        },
    });

    const handleCreateTeam = () => {
        if (!teamName.trim()) {
            toast.error('Team name is required');
            return;
        }
        createTeamMutation.mutate({ name: teamName, description: teamDescription });
    };

    const getRoleBadgeColor = (role: string) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            manager: 'bg-blue-100 text-blue-800',
            member: 'bg-green-100 text-green-800',
            viewer: 'bg-gray-100 text-gray-800',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Teams Overview */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Teams Management</h1>
                    <p className="text-gray-500 mt-2">Manage your organization teams and members</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={20} />
                            Create Team
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Team</DialogTitle>
                            <DialogDescription>
                                Set up a new team to collaborate with your members
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Team Name</label>
                                <Input
                                    placeholder="e.g., Marketing Team"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="Optional team description"
                                    value={teamDescription}
                                    onChange={(e) => setTeamDescription(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <Button
                                onClick={handleCreateTeam}
                                disabled={createTeamMutation.isPending}
                                className="w-full"
                            >
                                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Teams List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="pt-6">Loading teams...</CardContent>
                    </Card>
                ) : teams && teams.length > 0 ? (
                    teams.map((team: Team) => (
                        <Card
                            key={team.id}
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => setSelectedTeam(team)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{team.name}</CardTitle>
                                        <CardDescription>{team.description}</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>
                                                <Settings size={16} className="mr-2" />
                                                Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeleteTeamId(team.id)}
                                            >
                                                <Trash2 size={16} className="mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={16} />
                                    {team.members_count} members
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-gray-500">No teams yet. Create one to get started!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Team Details */}
            {selectedTeam && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users size={20} />
                            Team Members - {selectedTeam.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members && members.length > 0 ? (
                                    members.map((member: TeamMember) => (
                                        <TableRow key={member.id}>
                                            <TableCell>{member.user.name}</TableCell>
                                            <TableCell>{member.user.email}</TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadgeColor(member.role)}>
                                                    {member.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(member.joined_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            Remove Member
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No members yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All workflows and data associated with this team will be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteTeamId && deleteTeamMutation.mutate(deleteTeamId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default TeamManagement;
