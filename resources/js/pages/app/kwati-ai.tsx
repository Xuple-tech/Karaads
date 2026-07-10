import { MobileEmptyState } from "@/components/mobile-empty-state";
import { MobilePageShell } from "@/components/mobile-page-shell";
import { Head, Link } from "@/components/page-head";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { AlertCircle, ArrowLeft, Loader2, Send, Sparkles, User2 } from "lucide-react";
import { FormEvent, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
    published_at?: string;
  }>;
  searchedAt?: string | null;
};

const starterPrompts = [
  "Write a catchy ad caption for my product",
  "Give me 5 viral content ideas for Karaads",
  "Help me plan a campaign for this week",
];

const kwatiAiIcon = "/kwati-ai-icon.png";

function shouldUseLiveSearch(message: string): boolean {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return [
    "latest",
    "current",
    "today",
    "news",
    "recent",
    "right now",
    "just happened",
    "update",
    "updates",
    "internet",
    "web search",
    "search online",
    "look it up",
    "source",
    "sources",
    "link",
    "links",
  ].some((keyword) => normalized.includes(keyword));
}

export default function KwatiAiPage() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I’m Kwati AI. I can help you write ads, shape content ideas, and plan smarter campaigns inside Karaads.",
    },
  ]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");

    setIsSending(true);
    const useWebSearch = shouldUseLiveSearch(message);

    try {
      const response = await axiosInstance.post("/api/kwati-ai/chat", {
        messages: nextMessages.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        use_web_search: useWebSearch,
      });

      const assistantReply =
        response.data?.data?.message ||
        response.data?.message ||
        "Kwati AI did not return a response.";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now() + 1}`,
          role: "assistant",
          content: assistantReply,
          sources: Array.isArray(response.data?.data?.sources) ? response.data.data.sources : [],
          searchedAt: response.data?.data?.searched_at ?? null,
        },
      ]);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Kwati AI is unavailable right now.");
      setMessages((current) => current.filter((item) => item.id !== userMessage.id));
      setDraft(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  return (
    <>
      <Head title="Kwati AI" />
      <MobilePageShell withBottomNavSpacing={false} contentClassName="pb-6">
        <div className="px-3 pt-4">
          <div className="mx-auto max-w-[430px] overflow-hidden rounded-[38px] border border-[#243454] bg-[radial-gradient(circle_at_top,_rgba(18,160,199,0.24),_transparent_34%),linear-gradient(180deg,#07121e_0%,#091321_48%,#130f24_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="border-b border-white/10 px-4 pb-4 pt-5">
              <div className="flex items-center justify-between">
                <Link
                  href="/search"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </Link>

                <div className="text-center">
                  <p className="text-[16px] font-extrabold tracking-tight text-white">
                    Kwati AI
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                    Creative Assistant
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.4),_rgba(8,32,50,0.92)_72%)] shadow-[0_0_24px_rgba(34,211,238,0.22)]">
                  <img
                    src={kwatiAiIcon}
                    alt="Kwati AI icon"
                    className="h-full w-full object-contain p-1"
                  />
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-5">
              <div className="rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-4">
                <p className="text-sm font-bold text-white">Ask Kwati AI anything</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Get help with ad copy, promotion strategy, content ideas, and campaign structure.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      disabled={isSending}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {messages.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {messages.map((message) => {
                    const isAssistant = message.role === "assistant";

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${isAssistant ? "" : "justify-end"}`}
                      >
                        {isAssistant ? (
                          <Avatar className="h-10 w-10 border border-cyan-400/30 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.4),_rgba(8,32,50,0.92)_72%)]">
                            <AvatarImage src={kwatiAiIcon} alt="Kwati AI" className="object-contain p-1" />
                            <AvatarFallback className="bg-transparent text-cyan-100">
                              K
                            </AvatarFallback>
                          </Avatar>
                        ) : null}

                        <div
                          className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-[0_14px_30px_rgba(0,0,0,0.16)] ${
                            isAssistant
                              ? "border border-white/10 bg-white/[0.05] text-white/82"
                              : "bg-cyan-400 text-[#082032]"
                          }`}
                        >
                          {message.content}
                        </div>

                        {!isAssistant ? (
                          <Avatar className="h-10 w-10 border border-white/10 bg-white/6">
                            <AvatarFallback className="bg-transparent text-white">
                              <User2 className="h-4.5 w-4.5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <MobileEmptyState
                  icon={Sparkles}
                  title="Start chatting"
                  description="Ask Kwati AI for writing, campaign, or growth help."
                  className="py-10"
                />
              )}

              {messages
                .filter((message) => message.role === "assistant" && (message.sources?.length ?? 0) > 0)
                .slice(-1)
                .map((message) => (
                  <div key={`${message.id}-sources`} className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-100/75">
                        Live Sources
                      </p>
                      {message.searchedAt ? (
                        <p className="text-[11px] text-white/45">
                          Updated {new Date(message.searchedAt).toLocaleTimeString()}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-3">
                      {message.sources?.map((source, index) => (
                        <a
                          key={`${source.url}-${index}`}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.06]"
                        >
                          <p className="text-sm font-bold text-white">{source.title}</p>
                          {source.snippet ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">{source.snippet}</p>
                          ) : null}
                          {source.published_at ? (
                            <p className="mt-2 text-[11px] text-white/42">
                              {new Date(source.published_at).toLocaleString()}
                            </p>
                          ) : null}
                          <p className="mt-2 truncate text-[11px] text-cyan-200/70">{source.url}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

              {error ? (
                <div className="mt-4 flex items-start gap-2 rounded-[20px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 px-4 pb-5 pt-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask Kwati AI for help..."
                  disabled={isSending}
                  className="h-12 rounded-[18px] border-white/10 bg-white/[0.04] text-[15px] text-white placeholder:text-white/35"
                />
                <Button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="h-12 rounded-[18px] bg-cyan-400 px-4 text-[#082032] hover:bg-cyan-300 disabled:bg-cyan-400/40 disabled:text-[#082032]/70"
                >
                  {isSending ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4.5 w-4.5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </MobilePageShell>
    </>
  );
}
