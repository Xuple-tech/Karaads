import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowRight,
    Blocks,
    BookOpen,
    Bot,
    Briefcase,
    Brain,
    Globe2,
    MessageSquare,
    Puzzle,
    Radio,
    ShieldCheck,
    Sparkles,
    Wrench,
} from 'lucide-react';

interface PageProps {
    appName: string;
}

function Section({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="space-y-4 scroll-mt-24">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

function InfoCard({
    icon,
    title,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
}) {
    return (
        <Card className="border-border/60 bg-card/80">
            <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
            </CardContent>
        </Card>
    );
}

export default function AgentsDocs({ appName }: PageProps) {
    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'building-blocks', label: 'Building Blocks' },
        { id: 'deployment', label: 'Deployment' },
        { id: 'tools', label: 'Tools and MCP' },
        { id: 'knowledge', label: 'Knowledge Base' },
        { id: 'operations', label: 'Operations and Safety' },
        { id: 'examples', label: 'Use Cases' },
    ];

    return (
        <>
            <Head title={`Agents - ${appName}`} />

            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-lg font-bold tracking-tight">
                            {appName}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                            Agent Docs
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/docs/api"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            API Reference
                        </Link>
                        <Button size="sm" asChild>
                            <Link href="/widget">
                                Open Product <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-10 px-4 py-8">
                <aside className="hidden w-56 shrink-0 lg:block">
                    <div className="sticky top-24 space-y-1">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Agents
                        </p>
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </aside>

                <main className="min-w-0 flex-1 space-y-16">
                    <div className="space-y-6 border-b pb-8">
                        <Badge className="text-xs">Kwati Agents</Badge>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-extrabold tracking-tight">Build AI agents that can work across chat, websites, and WhatsApp</h1>
                            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                                Kwati agents combine instructions, business knowledge, external tools, and live channels into a deployable assistant.
                                You can use the same core agent behavior inside an embeddable website widget or WhatsApp automation without rebuilding the logic each time.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard
                                icon={<Brain className="h-5 w-5" />}
                                title="Instruction-driven"
                                body="Define the agent's role, tone, escalation rules, and boundaries with system instructions that stay consistent across conversations."
                            />
                            <InfoCard
                                icon={<Puzzle className="h-5 w-5" />}
                                title="Connected to real systems"
                                body="Agents can call configured HTTPS tools and remote MCP servers when they need live data or an external action."
                            />
                            <InfoCard
                                icon={<Radio className="h-5 w-5" />}
                                title="Deployable in channels"
                                body="Run the same business assistant inside the embeddable widget or WhatsApp automation flow, depending on your use case."
                            />
                        </div>
                    </div>

                    <Section
                        id="overview"
                        title="Overview"
                        description="An agent in Kwati is a packaged assistant built for a business workflow. It is more than a prompt: it has behavior, context, channels, and operational controls."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">What an agent does</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Receives a user request from a live channel.</p>
                                    <p>Combines instructions with business context and recent conversation history.</p>
                                    <p>Calls tools only when needed.</p>
                                    <p>Returns a response in the right tone for the brand and channel.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">What an agent is not</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>It is not just a static FAQ list.</p>
                                    <p>It is not limited to one interface or one web page.</p>
                                    <p>It does not need direct access to private prompts or secrets on the client.</p>
                                    <p>It should not perform sensitive actions without clear tool and business controls.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Section
                        id="building-blocks"
                        title="Building Blocks"
                        description="Every production agent in Kwati is assembled from a few core parts. Keeping these parts separate makes the system easier to manage and safer to scale."
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <InfoCard
                                icon={<Bot className="h-5 w-5" />}
                                title="Identity"
                                body="The name, greeting, tone, and role of the assistant. This defines how the agent introduces itself and how it speaks."
                            />
                            <InfoCard
                                icon={<Blocks className="h-5 w-5" />}
                                title="Instructions"
                                body="System prompts and business rules that shape decisions, escalation, formatting, and what the agent should avoid doing."
                            />
                            <InfoCard
                                icon={<BookOpen className="h-5 w-5" />}
                                title="Knowledge"
                                body="Business facts, policies, documents, URLs, and text notes that give the agent factual grounding for replies."
                            />
                            <InfoCard
                                icon={<Wrench className="h-5 w-5" />}
                                title="Actions"
                                body="Tools and MCP connections that let the agent read live data or trigger external systems when a plain text answer is not enough."
                            />
                        </div>
                    </Section>

                    <Section
                        id="deployment"
                        title="Deployment Surfaces"
                        description="The same agent behavior can be used in different customer-facing channels. The channel changes the experience, but the core operating model stays the same."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card className="border-border/60">
                                <CardHeader className="space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Globe2 className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-base">Embeddable website widget</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Best for support, lead capture, onboarding, and product guidance on your own site.</p>
                                    <p>Supports branding, knowledge items, domain allowlists, HTTPS tools, remote MCP servers, and streaming responses.</p>
                                    <p>Uses a secure public widget token while keeping prompts and secrets on the server.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-border/60">
                                <CardHeader className="space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-base">WhatsApp automation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Best for customer support, order follow-up, appointment flow, and business response automation.</p>
                                    <p>Uses Meta account preferences, AI mode selection, and automation policies to decide how replies are generated.</p>
                                    <p>Pairs well with the setup wizard so teams can connect the webhook and start receiving real inbound messages.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Section
                        id="tools"
                        title="Tools and MCP"
                        description="Agents become materially more useful when they can reach live business systems. Kwati supports two integration paths in the current stack."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">HTTPS tools</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Use HTTPS tools when the agent needs to fetch live business data or trigger a bounded action through your API.</p>
                                    <p>Each tool includes a name, description, method, endpoint, headers, and parameter schema.</p>
                                    <p>These tools are executed on the server, not in the browser, so private credentials remain protected.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Remote MCP servers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Use remote MCP when you want the agent to discover and call a richer external tool surface from a remote endpoint.</p>
                                    <p>Kwati maps discovered MCP tools into the same AI tool-calling pipeline used for normal tool execution.</p>
                                    <p>Current support is designed for remote HTTP or SSE MCP connections rather than local process spawning.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Section
                        id="knowledge"
                        title="Knowledge Base"
                        description="The quality of an agent depends on the quality of its context. Knowledge should be curated, current, and specific to the business workflow."
                    >
                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard
                                icon={<Sparkles className="h-5 w-5" />}
                                title="Text notes"
                                body="Fastest way to add policy snippets, operating instructions, pricing guidance, and compact FAQ material."
                            />
                            <InfoCard
                                icon={<Globe2 className="h-5 w-5" />}
                                title="Website URLs"
                                body="Useful for pulling product pages, service pages, or documentation into a widget-ready context layer."
                            />
                            <InfoCard
                                icon={<Briefcase className="h-5 w-5" />}
                                title="PDF documents"
                                body="Useful for manuals, policy documents, brochures, tenancy guides, or any long-form business reference."
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Knowledge design guidance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>Keep answers grounded in current business policy, not generic model assumptions.</p>
                                <p>Prefer concise, high-signal knowledge items over large noisy dumps.</p>
                                <p>Separate evergreen business instructions from temporary campaign or pricing updates.</p>
                            </CardContent>
                        </Card>
                    </Section>

                    <Section
                        id="operations"
                        title="Operations and Safety"
                        description="Production agents need operating rules. The goal is not only accuracy, but also controlled behavior when the model is uncertain or a task is sensitive."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader className="space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-base">Recommended controls</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Define when the agent must escalate to a human.</p>
                                    <p>Restrict sensitive actions to explicit tools with bounded schemas.</p>
                                    <p>Use domain allowlists for public widgets where needed.</p>
                                    <p>Keep internal secrets out of public config responses.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="space-y-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-base">Escalation moments</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p>Payment disputes, fraud claims, legal edge cases, and account security events should escalate early.</p>
                                    <p>High-risk business actions should require a deterministic backend tool or a human queue.</p>
                                    <p>When context is incomplete, the agent should ask for clarification instead of improvising facts.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Section
                        id="examples"
                        title="Common Use Cases"
                        description="These examples map cleanly to the current Kwati product surface and help teams understand where agent design has the highest leverage."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Customer support agent</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>Deploy in the website widget.</p>
                                    <p>Back it with docs, policy notes, and order-status tools.</p>
                                    <p>Escalate refunds, account recovery, and service incidents.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Sales qualification agent</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>Deploy on landing pages or WhatsApp.</p>
                                    <p>Use product knowledge, pricing, and lead capture tools.</p>
                                    <p>Route qualified leads to the right human team.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Operations assistant</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>Use remote MCP or HTTPS tools for inventory, tickets, or delivery data.</p>
                                    <p>Keep responses grounded in live operational systems.</p>
                                    <p>Use explicit action boundaries for safety.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Policy or legal information assistant</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>Use curated knowledge, disclaimers, and escalation guidance.</p>
                                    <p>Keep the agent in an informational role rather than pretending to replace a professional advisor.</p>
                                    <p>Best when paired with clear source material and narrow workflow boundaries.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </Section>

                    <Separator />

                    <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/70 p-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Next step</p>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                Use the widget manager for website deployment, or the automations area for WhatsApp setup and channel-specific behavior.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" asChild>
                                <Link href="/docs/api">View API docs</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/automations">
                                    Open automations <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
