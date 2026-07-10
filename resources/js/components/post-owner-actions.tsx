import {
  EditPostDialog,
  EditPostMedia,
  EditPostUpdatePayload,
} from "@/components/edit-post-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Edit2, MoreHorizontal, Rocket, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface PostOwnerActionsProps {
  postId: string;
  content: string;
  media?: EditPostMedia[];
  onPostUpdated: (payload: EditPostUpdatePayload) => void;
  onPostDeleted: () => void;
  trigger?: ReactNode;
}

export function PostOwnerActions({
  postId,
  content,
  media = [],
  onPostUpdated,
  onPostDeleted,
  trigger,
}: PostOwnerActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handleDelete = async () => {
    if (deleteBusy) return;
    setDeleteBusy(true);
    try {
      await axios.delete(`/api/posts/${postId}`);
      onPostDeleted();
      toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete post.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:bg-white/10"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit post
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to={`/ads/create?mode=boost&post=${encodeURIComponent(postId)}`}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Boost post
            </Link>
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onSelect={(event) => event.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDelete}
                    disabled={deleteBusy}
                  >
                    {deleteBusy ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        postId={postId}
        initialContent={content}
        initialMedia={media}
        onUpdated={onPostUpdated}
      />
    </>
  );
}
