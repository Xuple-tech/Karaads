import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flame, Heart, PartyPopper, Sparkles, Smile } from "lucide-react";
import { useMemo, useState } from "react";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥳",
  "🔥",
  "❤️",
  "👏",
  "😎",
  "🤩",
  "😢",
  "🙏",
  "💯",
  "🤣",
  "😘",
  "🤗",
  "😭",
  "😡",
  "🥶",
  "🤯",
  "👀",
  "🎉",
  "🌹",
  "💔",
  "💃",
  "🕺",
  "😴",
  "🤝",
  "🙌",
  "🎯",
  "⭐",
  "🎶",
  "🍾",
  "💥",
  "👑",
  "🫶",
  "😇",
  "😈",
  "🤭",
  "😋",
  "🥺",
  "🤤",
];

const STICKERS = [
  { label: "Party", value: "🎉✨" },
  { label: "Love", value: "💖🥰" },
  { label: "Hype", value: "🔥🚀" },
  { label: "Mood", value: "😎💫" },
  { label: "Laugh", value: "😂🤣" },
  { label: "Blessed", value: "🙏🌟" },
  { label: "Queen", value: "👑💎" },
  { label: "Soft", value: "🫶🌷" },
  { label: "Win", value: "🏆💯" },
  { label: "Breakup", value: "💔🥀" },
  { label: "Dance", value: "💃🕺" },
  { label: "Star", value: "⭐🌙" },
  { label: "Cute", value: "🥺💕" },
  { label: "Rich", value: "💸✨" },
  { label: "Boss", value: "😎👑" },
  { label: "Noise", value: "📣🔥" },
];

const LIVE_STICKERS = [
  { label: "Fire Up", value: "🔥🔥🔥", className: "animate-pulse" },
  { label: "Heart Beat", value: "💓💓💓", className: "animate-pulse" },
  { label: "Party Drop", value: "🎉🎉🎉", className: "animate-bounce" },
  { label: "Star Rush", value: "✨🌟✨", className: "animate-pulse" },
  { label: "Cry Flood", value: "😭😭😭", className: "animate-bounce" },
  { label: "Hype Wave", value: "🚀🔥🚀", className: "animate-pulse" },
  { label: "Love Rain", value: "💖💕💖", className: "animate-bounce" },
  { label: "Clap Back", value: "👏👏👏", className: "animate-pulse" },
];

interface EmojiStickerPickerProps {
  onSelect: (value: string) => void;
  className?: string;
}

export function EmojiStickerPicker({
  onSelect,
  className,
}: EmojiStickerPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "sticker" | "live">("emoji");

  const emojiItems = useMemo(() => EMOJIS, []);
  const stickerItems = useMemo(() => STICKERS, []);
  const liveStickerItems = useMemo(() => LIVE_STICKERS, []);

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => setOpen((value) => !value)}
      >
        <Smile className="h-4.5 w-4.5" />
      </Button>

      {open ? (
        <div className="absolute bottom-12 left-0 z-50 w-80 rounded-3xl border border-white/10 bg-[#0b111c]/96 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("emoji")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                tab === "emoji"
                  ? "bg-white text-black"
                  : "bg-white/6 text-white/70",
              )}
            >
              <Smile className="h-3.5 w-3.5" />
              Emoji
            </button>
            <button
              type="button"
              onClick={() => setTab("sticker")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                tab === "sticker"
                  ? "bg-white text-black"
                  : "bg-white/6 text-white/70",
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Stickers
            </button>
            <button
              type="button"
              onClick={() => setTab("live")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                tab === "live"
                  ? "bg-white text-black"
                  : "bg-white/6 text-white/70",
              )}
            >
              <Flame className="h-3.5 w-3.5" />
              Live
            </button>
          </div>

          {tab === "emoji" ? (
            <div className="max-h-72 overflow-y-auto pr-1">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                <Smile className="h-3.5 w-3.5" />
                Expression
              </div>
              <div className="grid grid-cols-5 gap-2">
                {emojiItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onSelect(`${item} `);
                      setOpen(false);
                    }}
                    className="flex min-h-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-2xl text-center transition hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "sticker" ? (
            <div className="max-h-72 overflow-y-auto pr-1">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                <Heart className="h-3.5 w-3.5" />
                Sticker Packs
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stickerItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onSelect(`${item.value} `);
                      setOpen(false);
                    }}
                    className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-left transition hover:bg-white/10"
                  >
                    <div className="text-xl">{item.value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "live" ? (
            <div className="max-h-72 overflow-y-auto pr-1">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                <PartyPopper className="h-3.5 w-3.5" />
                Live Stickers
              </div>
              <div className="grid grid-cols-2 gap-2">
                {liveStickerItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onSelect(`${item.value} `);
                      setOpen(false);
                    }}
                    className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-3 py-3 text-left transition hover:bg-white/10"
                  >
                    <div className={cn("text-xl", item.className)}>{item.value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-[11px] text-white/55">
            <Sparkles className="h-3.5 w-3.5" />
            Tap to insert into your post, message, or comment.
          </div>
        </div>
      ) : null}
    </div>
  );
}
