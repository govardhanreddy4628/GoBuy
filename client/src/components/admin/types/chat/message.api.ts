export interface MessageFromApi {
  _id: string;
  chatId?: string;
  sender:  { _id: string; fullName: string; avatar?: string };
  type: "text" | "image" | "video" | "audio" | "document" | "location" | "contact" | "sticker"| "system" | "call";
  text?: string;
  media?: {
    url: string;
    mimeType?: string;
    thumbnail?: string;
  };
  status?: "sent" | "delivered" | "read" | "failed";
  replyTo?: string;
  isDeleted?: boolean;
  readBy:{userId:string; at:Date}[]
  createdAt: string;
}