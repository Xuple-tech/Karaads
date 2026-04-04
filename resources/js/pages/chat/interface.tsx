import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, usePage } from "@inertiajs/react";
import {
    Building2Icon, ChartBarStackedIcon, Clock, Code,
    MessageCirclePlus, Mic, RefreshCw, Target, Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
    id: number | string;
    title?: string;
    created_at?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(input: string | number | Date) {
    const date = new Date(input);
    const diff = Math.floor((Date.now() - date.getTime()) / 86_400_000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const topics = [
    { id: 1, name: "Business", icon: Building2Icon },
    { id: 2, name: "Health", icon: Target },
    { id: 3, name: "Develop", icon: Code },
    { id: 4, name: "Finance", icon: ChartBarStackedIcon },
];

function TopicCard({ name, icon: Icon }: { name: string; icon: React.ElementType }) {
    return (
        <Link href="#">
            <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/40 bg-card/50 hover:bg-card hover:border-border transition-all duration-150 cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">{name}</span>
            </div>
        </Link>
    );
}

function ConversationSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/30">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4 rounded" />
                        <Skeleton className="h-2.5 w-1/3 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatHomePage() {
    const { auth } = usePage().props as any;

    const [conversations, setConversations] = useState<Conversation[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [tick, setTick] = useState(0);

    const fetchConversations = async () => {
        setIsLoading(true);
        setFetchError(false);
        try {
            const res = await fetch("/api/conversations/new-api-new-users0request");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setConversations(data.success && data.cg_ ? data.cg_ : []);
        } catch {
            setFetchError(true);
            setConversations([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchConversations(); }, [tick]);

    const handleDelete = async (id: number | string) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
        try {
            const res = await fetch(`/conversations/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
            });
            if (!res.ok) throw new Error();
            toast.success("Conversation deleted");
            setTick(t => t + 1);
        } catch {
            toast.error("Failed to delete conversation");
        }
    };

    return (
        <div className="min-h-screen max-w-lg mx-auto px-4 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between py-5">
                <img src="/logo.png" alt="Kwati AI" className="h-9 w-auto" />

                {auth.user ? (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={auth.user.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                                {auth.user.name?.slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/register">Register</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <Link href="/new">
                    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/40 bg-card/50 hover:bg-card hover:border-border transition-all duration-150 cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageCirclePlus className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">New Chat</span>
                    </div>
                </Link>

                <Link href="/voice-chat">
                    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/40 bg-card/50 hover:bg-card hover:border-border transition-all duration-150 cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Mic className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Voice Chat</span>
                    </div>
                </Link>
            </div>

            {/* Topics */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Topics</h2>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">See all</Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {topics.map(t => <TopicCard key={t.id} name={t.name} icon={t.icon} />)}
                </div>
            </section>

            {/* History */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">History</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-muted-foreground"
                        onClick={() => setTick(t => t + 1)}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Error */}
                {fetchError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 mb-3">
                        <p className="text-sm text-destructive mb-2">Could not load conversations.</p>
                        <Button variant="outline" size="sm" onClick={() => setTick(t => t + 1)}>Try Again</Button>
                    </div>
                )}

                {/* Loading */}
                {isLoading && <ConversationSkeleton />}

                {/* Empty */}
                {!isLoading && !fetchError && conversations?.length === 0 && (
                    <div className="text-center py-10 rounded-2xl border border-dashed border-border/50">
                        <MessageCirclePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to begin</p>
                    </div>
                )}

                {/* List */}
                {!isLoading && conversations && conversations.length > 0 && (
                    <div className="space-y-1.5">
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/30 hover:border-border bg-card/40 hover:bg-card transition-all duration-150"
                            >
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-4 w-4 text-primary/70" />
                                </div>

                                <Link href={`/c/${conv.id}`} className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate leading-tight">
                                        {conv.title || "Untitled Conversation"}
                                    </p>
                                    {conv.created_at && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDate(conv.created_at)}
                                        </p>
                                    )}
                                </Link>

                                <button
                                    onClick={() => handleDelete(conv.id)}
                                    className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <div className="mt-10 text-center">
                <Link href="/privacy-policy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    Privacy Policy
                </Link>
            </div>
        </div>
    );
}
