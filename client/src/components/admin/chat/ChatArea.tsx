import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { ChatInput } from "./ChatInput";
import { RiChatNewLine } from "react-icons/ri";
import { Socket } from "socket.io-client";
import { Chat } from "./chat";

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

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  onSendMessage: (data: { text?: string; file?: File | null }) => void;
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
        chatName={selectedChat.chatName}
        //isOnline={selectedChat.isOnline}
        isGroup={selectedChat.isGroup}
        memberCount={selectedChat.memberCount}
        chatAvatar={selectedChat.chatAvatar}
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