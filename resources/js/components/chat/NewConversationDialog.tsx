// components/chat/NewConversationDialog.tsx
import { useState } from 'react';
import { Bot, Palette, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (title: string) => Promise<void>;
}

export default function NewConversationDialog({
  open,
  onOpenChange,
  onConfirm
}: NewConversationDialogProps) {
  const [title, setTitle] = useState('');
  const [canvasMode, setCanvasMode] = useState(false);
  const [enableTools, setEnableTools] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onConfirm(title);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCanvasMode(false);
    setEnableTools(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Create a new conversation with custom settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Conversation Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for this conversation..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-500" />
                <Label htmlFor="canvas-mode" className="text-sm">
                  Canvas Mode
                </Label>
              </div>
              <Switch
                id="canvas-mode"
                checked={canvasMode}
                onCheckedChange={setCanvasMode}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Structured responses with sections and headings
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <Label htmlFor="ai-tools" className="text-sm">
                  AI Tools
                </Label>
              </div>
              <Switch
                id="ai-tools"
                checked={enableTools}
                onCheckedChange={setEnableTools}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Allow AI to use web search and other tools when needed
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Chat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
