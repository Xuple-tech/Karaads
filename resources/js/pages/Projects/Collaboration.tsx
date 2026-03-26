import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, Plus, Trash2, Shield, Eye, Edit3, Users, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
    project: Projects;
    members: any[];
    currentUserRole: string;
}

const ROLE_PERMISSIONS: { [key: string]: { label: string; description: string; color: string } } = {
    owner: {
        label: "Owner",
        description: "Full control over project",
        color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    },
    admin: {
        label: "Admin",
        description: "Can manage settings and members",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    },
    member: {
        label: "Member",
        description: "Can create and edit content",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    viewer: {
        label: "Viewer",
        description: "Read-only access",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300",
    },
};

export default function ProjectCollaboration({
    project,
    members,
    currentUserRole,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        role: "member",
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [editRole, setEditRole] = useState("");

    const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("projects.members.add", project.id), {
            onSuccess: () => {
                toast.success("Member added successfully!");
                setData({ email: "", role: "member" });
                window.location.reload();
            },
            onError: (err: any) => {
                toast.error(err.message || "Failed to add member");
            },
        });
    };

    const handleUpdateRole = (memberId: string) => {
        post(
            route("projects.members.update", [project.id, memberId]),
            {
                role: editRole,
                onSuccess: () => {
                    toast.success("Member role updated!");
                    setEditingMember(null);
                    window.location.reload();
                },
                onError: () => {
                    toast.error("Failed to update member role");
                },
            }
        );
    };

    const handleRemoveMember = (memberId: string) => {
        post(route("projects.members.remove", [project.id, memberId]), {
            onSuccess: () => {
                toast.success("Member removed successfully!");
                setShowDeleteDialog(null);
                window.location.reload();
            },
            onError: () => {
                toast.error("Failed to remove member");
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title, href: route("projects.dashboard", project.id) },
                { label: "Team" },
            ]}
        >
            <Head title={`${project.title} - Team`} />

            <div className="container mx-auto p-6 space-y-8 max-w-3xl">
                {/* Header */}
                <div>
                    <Button variant="ghost" size="sm" className="mb-4" asChild>
                        <Link href={route("projects.dashboard", project.id)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8" />
                        Team Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Invite and manage team members for this project
                    </p>
                </div>

                <Separator />

                {/* Add Member Form */}
                {canManageMembers && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Invite Team Member
                            </CardTitle>
                            <CardDescription>Add someone to your project team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            placeholder="member@example.com"
                                            className="mt-1"
                                        />
                                        {errors.email && (
                                            <p className="text-destructive text-sm mt-1">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) => setData("role", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? "Adding..." : "Invite Member"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            {members.length + 1} member{members.length !== 0 ? "s" : ""}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Owner */}
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/50">
                            <div className="flex items-center gap-3 flex-1">
                                <Avatar>
                                    <AvatarFallback>O</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">Project Owner</p>
                                    <p className="text-sm text-muted-foreground">
                                        Full control and ownership
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Shield className="h-3 w-3 mr-1" />
                                Owner
                            </Badge>
                        </div>

                        {/* Team Members */}
                        {members.length > 0 ? (
                            members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Avatar>
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback>
                                                {member.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingMember === member.id ? (
                                            <Select
                                                value={editRole}
                                                onValueChange={setEditRole}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="outline">{member.role}</Badge>
                                        )}

                                        {canManageMembers && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {editingMember === member.id ? (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUpdateRole(member.id)
                                                                }
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Save
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setEditingMember(null)}
                                                            >
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setEditingMember(member.id);
                                                                    setEditRole(member.role);
                                                                }}
                                                            >
                                                                <Edit3 className="h-4 w-4 mr-2" />
                                                                Change Role
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setShowDeleteDialog(member.id)
                                                                }
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No team members added yet. Invite someone to get started!
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Role Descriptions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>What each role can do</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                                <div key={role} className="p-3 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={info.color}>{info.label}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Dialog */}
                <AlertDialog
                    open={!!showDeleteDialog}
                    onOpenChange={() => setShowDeleteDialog(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove this member from the project? They
                                will lose access to all project files and conversations.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                showDeleteDialog && handleRemoveMember(showDeleteDialog)
                            }
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

import { Check } from "lucide-react";
