import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { ChatInput } from "./ChatInput";
import { RiChatNewLine } from "react-icons/ri";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: "sending" | "sent" | "failed";
}

interface Chat {
  id: string;
  name: string;
  isOnline: boolean;
  isGroup: boolean;
  memberCount?: number;
  avatar?: string;
}

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  socketRef: React.MutableRefObject<Socket | null>;
  selectedChatId?: string;
  handleNewChat: () => void;
}

export function ChatArea({
  selectedChat,
  messages,
  onSendMessage,
  handleNewChat,
  socketRef,
  selectedChatId,
}: ChatAreaProps) {

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center cursor-pointer"
            onClick={handleNewChat}
          >
            <RiChatNewLine className="text-4xl" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <ChatHeader
        chatName={selectedChat.name}
        isOnline={selectedChat.isOnline}
        isGroup={selectedChat.isGroup}
        memberCount={selectedChat.memberCount}
        avatar={selectedChat.avatar}
      />

      <MessagesList messages={messages} />

      <ChatInput
        onSendMessage={onSendMessage}
        socketRef={socketRef}
        selectedChatId={selectedChatId}
      />
    </div>
  );
}