import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // adjust import to your path
import { Link } from "@inertiajs/react";

import { MoreVertical, Edit3, Share2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ConversationShareDialog from "@/components/chat/ConversationShareDialog";

export default function ConversationLink({ conversation, onConversationUpdate, onConversationDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert("Conversation deleted successfully!");
        if (onConversationDelete) {
          onConversationDelete(id);
        }
      } else {
        alert("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete conversation");
    }
  };

  const handleEditTitle = () => {
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() === "") return;

    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
        alert("Failed to update title");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update title");
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
    <div className="relative group flex items-center justify-between px-2 py-1 rounded-xl hover:bg-accent">
      {/* The Link or Edit Input */}
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className="text-sm p-2 h-auto border-none bg-transparent focus:bg-background"
          autoFocus
        />
      ) : (
        <Link
          key={conversation.id}
          href={`/c/${conversation.id}`}
          data-tujo-csr
          className="text-foreground hover:text-primary block truncate p-2 text-sm w-full"
        >
          {conversation.title}
        </Link>
      )}

      {/* Dropdown - Only shows on hover */}
      <div className="lg:invisible group-hover:visible transition-opacity duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-primary">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditTitle}>
              <Edit3 size={16} className="mr-2" />
              Edit Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 size={16} className="mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(conversation.id)} className="text-red-500">
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
