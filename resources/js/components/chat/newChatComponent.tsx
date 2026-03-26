import { usePage } from "@inertiajs/react";
import ChatInput from "./ChatInput";
import ChatInterface from "./ChatInterface";

function NewChatComponent() {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth.user;
    return (<>
        <ChatInterface isAuthenticated={isAuthenticated} />
    </>);
}

export default NewChatComponent;
