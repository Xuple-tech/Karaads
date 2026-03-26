import NewChatComponent from "@/components/chat/newChatComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link as InertiaLink, usePage } from "@inertiajs/react"
import { Bell, Building2Icon, ChartBarStackedIcon, Code, icons, LaptopMinimal, MessageCirclePlus, Mic, Target, Clock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChatInterface() {
    const { auth } = usePage().props;
    const topics = [
        { id: 1, name: "Business", icon: Building2Icon },
        { id: 2, name: "Health", icon: Target },
        { id: 3, name: "Develop", icon: LaptopMinimal },
        { id: 4, name: "Finance", icon: ChartBarStackedIcon },
    ];

    interface Conversation {
        id: number | string;
        title?: string;
        created_at?: string;
        // add other fields returned by the API as needed
    }

    const conversationUrl = "/api/conversations/new-api-new-users0request";
    const [conversationsList, setConversationsList] = useState<Conversation[] | null>(null);
    const [isFetchError, setIsFetchError] = useState({ status: false, message: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [fetchStateTimestamp, setFetchStateTimestamp] = useState(Date.now());

    const fetchConversations = async () => {
        setIsLoading(true);
        setIsFetchError({ status: false, message: "" });

        try {
            const response = await fetch(conversationUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.cg_) {
                setConversationsList(data.cg_);
            } else {
                // console.log(data);
                setConversationsList([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setIsFetchError({
                status: true,
                message: "An error occurred while getting the conversations"
            });
            setConversationsList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [fetchStateTimestamp]);

    const handleRefresh = () => {
        setFetchStateTimestamp(Date.now());
    };

    type ConversationId = number | string;

    interface DeleteRequestOptions {
        method: 'DELETE';
        headers: Record<string, string>;
    }

    const handleDeleteConversation = async (conversationId: ConversationId): Promise<void> => {
        if (!confirm('Are you sure you want to delete this conversation?')) {
            return;
        }

        try {
            const csrfToken: string = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.getAttribute('content') ?? '';

            const options: DeleteRequestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            };

            const response: Response = await fetch(`/conversations/${conversationId}`, options);

            if (response.ok) {
                // Refresh the conversations list
                setFetchStateTimestamp(Date.now());
            } else {
                throw new Error('Failed to delete conversation');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete conversation');
        }
    };

    // Skeleton loader component
    const ConversationSkeleton = () => (
        <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 bg-primary/5 backdrop-blur-3xl rounded-2xl animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-8 bg-gray-300 rounded-full ml-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Format date for display
    type DateInput = string | number | Date;

    interface FormatDateFn {
        (dateInput: DateInput): string;
    }

    const formatDate: FormatDateFn = (dateInput) => {
        const date = new Date(dateInput);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <>
            <div className="app-container-seelect-home home-app min-h-screen">
                {/* Top Section */}
                <div className="top-section">
                    <div className="flex justify-between items-center p-4 sm:p-6 rounded-2xl">
                        <div className="logo-section">
                            <img src="/logo.png" alt="kWATI aI LOGO" className="h-12 w-auto" />
                        </div>

                        <div className="flex flex-row flex-wrap
                        ">
                            {auth.user && <>
                                <div className="avater-s3ct flex items-center gap-2 sm:gap-3">
                                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                                        <AvatarFallback className="text-sm sm:text-base">
                                            {auth.user.name.slice(0, 1)}
                                        </AvatarFallback>
                                        <AvatarImage src={auth.user.avatr}></AvatarImage>
                                    </Avatar>
                                    {/* <span className="text-sm sm:text-base font-medium">
                                    {auth.user.name}
                                </span> */}
                                </div>
                                <div className="bell-section">
                                    <div className="p-2 rounded bg-transparent backdrop-blur-3xl">
                                        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                            </>
                            }
                            {!auth.user && <>
                                <div className="w-full gap-2 flex justify-center sm:justify-start">
                                    <Button asChild size={'lg'} variant={'outline'} className="w-auto sm:w-auto">
                                        <InertiaLink href="/login">
                                            Login
                                        </InertiaLink>
                                    </Button>
                                    <Button asChild size={'lg'} className="w-auto sm:w-auto">
                                        <InertiaLink href="/register">
                                            Register
                                        </InertiaLink>
                                    </Button>
                                </div>
                            </>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6">
                    {/* Action Buttons Grid */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-2">
                        <InertiaLink href="/new" >
                            <div className="p-3 sm:p-4 flex flex-col content-center justify-center items-center gap-3 sm:gap-4 bg-primary/5 backdrop-blur-3xl rounded-2xl hover:bg-primary/10 transition-colors">
                                <div className="rounded-2xl p-3 sm:p-4 bg-primary/5 backdrop-blur-3xl">
                                    <MessageCirclePlus className="w-16 h-16 sm:w-20 sm:h-20" />
                                </div>
                                <h6 className="title text-sm sm:text-base font-medium text-center">
                                    New Chat
                                </h6>
                            </div>
                        </InertiaLink>

                        <InertiaLink href="/voice-chat" >
                            <div className="p-3 sm:p-4 flex flex-col content-center justify-center items-center gap-3 sm:gap-4 bg-primary/5 backdrop-blur-3xl rounded-2xl hover:bg-primary/10 transition-colors">
                                <div className="rounded-2xl p-3 sm:p-4 bg-primary/5 backdrop-blur-3xl">
                                    <Mic className="w-16 h-16 sm:w-20 sm:h-20" />
                                </div>
                                <h6 className="title text-sm sm:text-base font-medium text-center">
                                    Voice Chat
                                </h6>
                            </div>
                        </InertiaLink>
                    </div>

                    {/* Topics Section */}
                    <div className="midd-section mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="title text-lg sm:text-xl font-semibold">Topics</h4>
                            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                                See All
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {topics.map((topic) => (
                                <InertiaLink href="#" key={topic.id}>
                                    <div className="p-3 sm:p-4 flex flex-col content-center justify-center items-center gap-2 sm:gap-3 bg-primary/5 backdrop-blur-3xl rounded-2xl hover:bg-primary/10 transition-colors">
                                        <div className="rounded-full p-3 sm:p-4 bg-primary/5 backdrop-blur-3xl">
                                            <topic.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                                        </div>
                                        <h6 className="title text-xs sm:text-sm font-medium text-center">
                                            {topic.name}
                                        </h6>
                                    </div>
                                </InertiaLink>
                            ))}
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="bottom-section mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="title text-lg sm:text-xl font-semibold">
                                History
                                {isLoading && <span className="text-sm font-normal ml-2">Loading...</span>}
                            </h4>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                >
                                    Refresh
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                                    See All
                                </Button>
                            </div>
                        </div>

                        {/* Error State */}
                        {isFetchError.status && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-4">
                                <p className="text-red-800 text-sm">{isFetchError.message}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={handleRefresh}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && <ConversationSkeleton />}

                        {/* Empty State */}
                        {!isLoading && !isFetchError.status && (!conversationsList || conversationsList.length === 0) && (
                            <div className="text-center p-8 bg-primary/5 backdrop-blur-3xl rounded-2xl">
                                <MessageCirclePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No conversation history yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Start a new chat to see your history here.</p>
                            </div>
                        )}
                        {/* {console.log(conversationsList)} */}
                        {/* Conversations List */}
                        {!isLoading && conversationsList && conversationsList.length > 0 && (
                            <div className="space-y-3">
                                {conversationsList.map((conversation: Conversation) => (
                                    <div
                                        key={conversation.id}
                                        className="p-4 bg-primary/5 backdrop-blur-3xl rounded-2xl hover:bg-primary/10 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <InertiaLink
                                                href={`/c/${conversation.id}`}
                                                className="flex-1"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full p-2 bg-primary/10">
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h6 className="title text-sm font-medium truncate">
                                                            {conversation.title || 'Untitled Conversation'}
                                                        </h6>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {conversation.created_at && formatDate(conversation.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </InertiaLink>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteConversation(conversation.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="footer mt-6 text-center">
                        <InertiaLink href="/privacy-policy" className="text-sm text-muted-foreground hover:underline">
                            Privacy Policy
                        </InertiaLink>
                    </div>
                </div>
            </div>
            <style>
                {`/* Ensure smooth scaling */
.app-container-seelect-home {
  max-width: 100vw;
  overflow-x: hidden;
}

/* Improve touch targets on mobile */
@media (max-width: 640px) {
  .home-app a, .home-app button {
    min-height: 44px;
    min-width: 44px;
  }
}`}
            </style>
        </>
    )
}
