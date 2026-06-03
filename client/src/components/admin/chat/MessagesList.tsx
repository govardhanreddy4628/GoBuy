import { ScrollArea } from "../../../ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef } from "react";

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

interface MessagesListProps {
  messages: Message[];
}

export function MessagesList({ messages }: MessagesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  

  const shouldShowAvatar = (currentMessage: Message, nextMessage?: Message) => {
    if (!nextMessage) return true;
    if (currentMessage.isOwn !== nextMessage.isOwn) return true;
    if (currentMessage.senderName !== nextMessage.senderName) return true;
    return false;
  };

  const isGroupedMessage = (currentMessage: Message, prevMessage?: Message) => {
    if (!prevMessage) return false;
    if (currentMessage.isOwn !== prevMessage.isOwn) return false;
    if (currentMessage.senderName !== prevMessage.senderName) return false;
    const timeDiff = currentMessage.timestamp.getTime() - prevMessage.timestamp.getTime();
    return timeDiff < 60000; // Group messages within 1 minute
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-1">
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined;

          return (
            <div key={message.id}>
              <MessageBubble
                message={message}
                showAvatar={shouldShowAvatar(message, nextMessage)}
                isGrouped={isGroupedMessage(message, prevMessage)}
              />

              {message.isOwn && (
                <span className="text-xs ml-2">
                  {message.status === "sending" && "⏳"}
                  {message.status === "sent" && "✔️"}
                  {message.status === "failed" && "❌"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}