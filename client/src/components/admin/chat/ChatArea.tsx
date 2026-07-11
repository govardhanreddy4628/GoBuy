import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { ChatInput } from "./ChatInput";
import { RiChatNewLine } from "react-icons/ri";
import type { Member } from "./GroupSettings";

interface Message {
  id: string;
  text?: string;
  media?: any[];
  type?: string;
  createdAt: Date;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: "sent" | "delivered" | "read" | "failed";
}

interface Chat {
  id: string;
  chatName: string;
  isOnline: boolean;
  isGroup: boolean;
  memberCount?: number;
  chatAvatar?: string;
  members?: Member[];
}
interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  handleSendMessage: (data: { text?: string; files?: File[] }) => void;
  selectedChatId?: string;
  handleNewChat: () => void;
  onAddMembers?: (chatId: string, members: Member[]) => void;
  onRemoveMember?: (chatId: string, memberId: string) => void;
  onLeaveGroup?: (chatId: string) => void;
  onRenameGroup?: (chatId: string, name: string) => void;
  onToggleAdmin?: (chatId: string, memberId: string) => void;
}

export function ChatArea({
  selectedChat,
  messages,
  handleSendMessage,
  handleNewChat,
  selectedChatId,
  onAddMembers, onRemoveMember, onLeaveGroup, onRenameGroup, onToggleAdmin
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
        chatId={selectedChat.id}
        chatName={selectedChat.chatName}
        //isOnline={selectedChat.isOnline}
        isGroup={selectedChat.isGroup}
        memberCount={selectedChat.memberCount}
        chatAvatar={selectedChat.chatAvatar}
        members={selectedChat.members}
        onAddMembers={(m) => onAddMembers?.(selectedChat.id, m)}
        onRemoveMember={(id) => onRemoveMember?.(selectedChat.id, id)}
        onLeaveGroup={() => onLeaveGroup?.(selectedChat.id)}
        onRenameGroup={(n) => onRenameGroup?.(selectedChat.id, n)}
        onToggleAdmin={(id) => onToggleAdmin?.(selectedChat.id, id)}
      />

      <MessagesList messages={messages} />

      <ChatInput
        handleSendMessage={handleSendMessage}
        selectedChatId={selectedChatId}
        chatMembers={selectedChat?.members?.map((m: Member) => m._id) ?? []}
      />
    </div>
  );
}