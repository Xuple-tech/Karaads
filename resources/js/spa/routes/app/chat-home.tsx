import SpaChatInterface from '@/spa/components/SpaChatInterface';
import { useSessionQuery } from '@/spa/lib/session';

export function Component() {
    const session = useSessionQuery();

    return (
        <SpaChatInterface
            initialConversationId={null}
            initialMessages={[]}
            isAuthenticated={true}
            userName={session.data?.user?.name?.split(' ')[0]}
        />
    );
}
