import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@inertiajs/react";
import { MoreVertical, Edit3, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ConversationShareDialog from "@/components/chat/ConversationShareDialog";
import toast from "react-hot-toast";

export default function ConversationLink({ conversation, onConversationUpdate, onConversationDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "",
        },
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Conversation deleted");
        if (onConversationDelete) {
          onConversationDelete(id);
        }
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleEditTitle = () => {
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() === "") return;

    try {
      const response = await fetch(`/api/chat/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') || "",
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        if (onConversationUpdate) {
          onConversationUpdate(conversation.id, { title: editTitle.trim() });
        }
      } else {
        toast.error("Failed to update title");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update title");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(conversation.title);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="relative group flex items-center gap-1 px-1 py-0.5 rounded-lg hover:bg-accent/60 transition-colors">
      {/* The Link or Edit Input */}
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className="text-sm px-2 py-1 h-7 border-none bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-md"
          autoFocus
        />
      ) : (
        <Link
          key={conversation.id}
          href={`/c/${conversation.id}`}
          data-tujo-csr
          className="text-sm text-foreground/80 hover:text-foreground block truncate px-2 py-1.5 w-full leading-tight"
        >
          {conversation.title}
        </Link>
      )}

      {/* Dropdown - Only shows on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={handleEditTitle}>
              <Edit3 size={14} className="mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 size={14} className="mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(conversation.id)} className="text-destructive focus:text-destructive">
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      <ConversationShareDialog
        open={shareDialogOpen}
        conversationId={conversation.id}
        conversationTitle={conversation.title}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
}
