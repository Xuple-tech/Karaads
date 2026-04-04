import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Plus, ArrowRight, MessageSquare, Bot, Wrench, PlugZap } from 'lucide-react';

type WorkspaceProject = {
    id: string;
    title: string;
    description?: string | null;
    status?: string | null;
    visibility?: string | null;
    conversations_count?: number;
    agents_count?: number;
    tools_count?: number;
    mcp_servers_count?: number;
};

export default function WorkspaceIndex({ projects }: { projects: WorkspaceProject[] }) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
    });

    const createProject = async () => {
        if (!form.title.trim()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/workspace/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(form),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Failed to create workspace project.');
            }

            setOpen(false);
            setForm({ title: '', description: '' });
            router.visit(`/workspace/${payload.data.id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Workspace', href: '/workspace' }]}>
            <Head title="Workspace" />
            <div className="space-y-8">
                <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_38%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#1f2937)] text-white shadow-xl">
                        <CardHeader className="space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                <FolderKanban className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-3xl tracking-tight">Workspace Core</CardTitle>
                                <CardDescription className="max-w-2xl text-sm text-slate-200">
                                    Projects are now the root surface for chat, agents, tools, and MCP integrations. This view is the new workspace shell over the v1 backend.
                                </CardDescription>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-slate-200/70 bg-slate-50/70">
                        <CardHeader>
                            <CardTitle className="text-base">Included in this slice</CardTitle>
                            <CardDescription>Core project surfaces wired to the new API.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3 text-sm">
                            <StatusChip icon={MessageSquare} label="Project chat" />
                            <StatusChip icon={Bot} label="Interactive agents" />
                            <StatusChip icon={Wrench} label="Internal tools" />
                            <StatusChip icon={PlugZap} label="Project MCP" />
                        </CardContent>
                    </Card>
                </section>

                <section className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
                        <p className="text-sm text-muted-foreground">Choose a workspace project or create a new one on the new API surface.</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Workspace Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Workspace Project</DialogTitle>
                                <DialogDescription>Start a project on the rebuilt workspace core.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="workspace-title">Title</Label>
                                    <Input
                                        id="workspace-title"
                                        value={form.title}
                                        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                        placeholder="Customer Success Copilot"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workspace-description">Description</Label>
                                    <Textarea
                                        id="workspace-description"
                                        value={form.description}
                                        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                        placeholder="Describe the project workspace, its agents, and tool scope."
                                    />
                                </div>
                                <Button className="w-full" onClick={createProject} disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Project'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <Link key={project.id} href={`/workspace/${project.id}`}>
                                <Card className="h-full border-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                                            <Badge variant="outline">{project.visibility ?? 'private'}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2 min-h-10">
                                            {project.description || 'No description yet.'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                                            <Metric label="Chat" value={project.conversations_count ?? 0} />
                                            <Metric label="Agents" value={project.agents_count ?? 0} />
                                            <Metric label="Tools" value={project.tools_count ?? 0} />
                                            <Metric label="MCP" value={project.mcp_servers_count ?? 0} />
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-3 text-sm">
                                            <span className="font-medium text-slate-700">{project.status ?? 'active'}</span>
                                            <span className="inline-flex items-center gap-1 text-slate-500">
                                                Open
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card className="col-span-full border-dashed">
                            <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                                <FolderKanban className="h-10 w-10 text-slate-400" />
                                <div className="space-y-1">
                                    <p className="font-medium">No workspace projects yet.</p>
                                    <p className="text-sm text-muted-foreground">Create the first project to start using the rebuilt core.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

function StatusChip({ icon: Icon, label }: { icon: typeof Bot; label: string }) {
    return (
        <div className="rounded-xl border bg-white px-3 py-3 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Icon className="h-4 w-4" />
            </div>
            <p className="font-medium text-slate-900">{label}</p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
        </div>
    );
}
