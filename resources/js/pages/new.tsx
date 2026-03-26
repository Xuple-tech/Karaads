import NewChatComponent from "@/components/chat/newChatComponent";
import { LanguageProvider } from "@/hooks/use-lang";
import GuestLayout from "@/layouts/guest-layout";

function newConersation() {
    return (<>
        <GuestLayout>
            <NewChatComponent />
        </GuestLayout>
    </>);
}

export default newConersation; 
