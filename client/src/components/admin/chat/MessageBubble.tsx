import { cn } from "../../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

export interface Message {
  id: string;
  chatID?: string;
  text?: string;
  media?: { url: string; mimeType?: string; type?: string; size?: number }[];
  type?: string;
  location?: { address?: string };
  contact?: { name?: string };
  createdAt: Date;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: "sent" | "delivered" | "read" | "failed";
  clientId?: string;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  message,
  showAvatar = true,
  isGrouped = false,
}: MessageBubbleProps) {
  const bubbleTailClass = !isGrouped ? (message.isOwn ? "bubble-tail-right" : "bubble-tail-left") : "";

  return (
    <div
      className={cn(
        "flex gap-3 group",
        message.isOwn ? "flex-row-reverse" : "flex-row",
        isGrouped ? "mt-1" : "mt-4"
      )}
    >
      {/* Avatar */}
      {showAvatar && !message.isOwn && (
        <Avatar className="h-8 w-8 mt-auto">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {message.senderName?.split(" ").map((n) => n[0]).join("") || "U"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for own messages when avatar is shown */}
      {showAvatar && message.isOwn && <div className="w-8" />}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          message.isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name for group chats */}
        {!message.isOwn && !isGrouped && message.senderName && (
          <span className="text-xs text-muted-foreground mb-1 px-3">
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "relative px-4 py-2 max-w-full break-words shadow-sm",
            message.isOwn
              ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
              : "bg-gray-100 text-black rounded-2xl rounded-bl-sm",
            "transition-all duration-200"
          )}
        >
          {message.media && message.media.length > 0 && (
            <div className="flex flex-col gap-1 mb-1">
              {message.media.map((m, i) => {
                if (m.type === "image") {
                  return <img key={i} src={m.url} className="rounded-lg max-w-64 max-h-64 object-cover" />;
                }
                if (m.type === "video") {
                  return <video key={i} src={m.url} controls className="rounded-lg max-w-64" />;
                }
                if (m.type === "audio") {
                  return <audio key={i} src={m.url} controls className="max-w-64" />;
                }
                return (
                  <a key={i} href={m.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 underline text-sm">
                    📄 {m.url.split("/").pop()}
                  </a>
                );
              })}
            </div>
          )}
          {message.text && (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
        </div>

        {/* Timestamp and read status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-3",
            message.isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.createdAt!).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.isOwn && (
            <div
              className={cn(
                "text-xs",
                message.isRead ? "text-primary" : "text-muted-foreground"
              )}
            >
              ✓✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
