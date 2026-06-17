import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";



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
            "relative px-4 py-2 max-w-full break-words shadow-sm message-bubble",
            message.isOwn
              ? "bg-green-100 text-black rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md"
              : "bg-white text-black rounded-tr-2xl rounded-tl-2xl rounded-br-2xl rounded-bl-md",
            bubbleTailClass
          )}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>

        {/* Timestamp and read status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-3",
            message.isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {format(message.createdAt, "HH:mm")}
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
