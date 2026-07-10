import { MobileActionSheet } from '@/components/mobile-action-sheet';
import { LiveChat } from '@/components/live-chat';

interface LiveChatSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    streamId: string;
    currentUserId?: string | number;
    canModerate?: boolean;
}

export function LiveChatSheet({ open, onOpenChange, streamId, currentUserId, canModerate = false }: LiveChatSheetProps) {
    return (
        <MobileActionSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Live Chat"
            description="Join the conversation in real time."
        >
            <LiveChat
                streamId={streamId}
                currentUserId={currentUserId}
                canModerate={canModerate}
                variant="sheet"
                showHeader={false}
                className="h-[60vh]"
            />
        </MobileActionSheet>
    );
}
