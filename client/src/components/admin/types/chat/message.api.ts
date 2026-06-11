export interface MessageFromApi {
  id: string;
  chatID?: string;
  sender:  { _id: string; fullName: string; avatar?: string };
  type: "text" | "image" | "video" | "audio" | "document" | "location" | "contact" | "sticker"| "system" | "call";
  text?: string;
  media?: {
    url: string;
    mimeType?: string;
    thumbnail?: string;
  };
  createdAt: string;
  status?: "sent" | "delivered" | "read" | "failed";
  replyTo?: string;
  isDeleted?: boolean;
}