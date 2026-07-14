import { memo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Users } from "lucide-react";
import type { Chat } from "./chat";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chatId: string) => void;
}

function formatSidebarTimestamp(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ""; // ✅ guards the Invalid Date bug

  if (isToday(date)) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd/MM/yyyy"); // e.g. "18/06/2026", swap for "d MMM" if you prefer "18 Jun"
}

function ChatListItemComponent({ chat, isSelected, onSelect }: ChatListItemProps) {
  return (
    <div
      onClick={() => onSelect(chat.id)}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
        isSelected ? "bg-accent" : ""
      }`}
    >
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={chat.chatAvatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chat.isGroup ? (
              <Users className="h-6 w-6" />
            ) : (
              chat.chatName ? chat.chatName.split(" ").map((n) => n[0]).join("") : "N/A"
            )}
          </AvatarFallback>
        </Avatar>
        {!chat.isGroup && (
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-chat-sidebar ${
              chat.isOnline ? "bg-green-600" : "bg-gray-400"
            }`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 max-w-48">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground truncate">{chat.chatName}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatSidebarTimestamp(chat.updatedAt)}
          </span>
        </div>
        {/* for truncate to work its nearest parent must constrain child width — hence max-w-48 above */}
        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
      </div>

      {chat.unreadCount > 0 && (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
        </Badge>
      )}
    </div>
  );
}

// ✅ memoized — only re-renders when its own chat/isSelected changes,
// not every time any other chat in the list updates
export const ChatListItem = memo(ChatListItemComponent);