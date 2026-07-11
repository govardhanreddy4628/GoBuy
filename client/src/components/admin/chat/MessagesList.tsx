import { ScrollArea } from "../../../ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef } from "react";

// features/chat/types/chat/message.ui.ts
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
  
  useEffect(() => {
  const viewport = scrollRef.current?.querySelector<HTMLDivElement>(
    "[data-radix-scroll-area-viewport]"
  );
  if (viewport) viewport.scrollTop = viewport.scrollHeight;
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
    const timeDiff = currentMessage.createdAt.getTime() - prevMessage.createdAt.getTime();
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

            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}