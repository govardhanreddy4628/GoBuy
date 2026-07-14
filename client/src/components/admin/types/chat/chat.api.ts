interface media {
      url: string;
      public_id: string;
      mimeType: string;
      size: number;
      duration: number; // audio/video
      thumbnail: string;
    }

export interface ChatFromApi {
  id: string;
  chatName: string;
  chatAvatar: string;
  isGroup: boolean;
  groupAdmins: {_id: string}[];
  groupCreator: {_id: string};
  members?: { _id: string; fullName: string; avatar?: string; isAdmin?: boolean }[];
  //groupName: string;
  groupIcon?: { url: string; public_id: string };
  lastMessage?: { _id: string; text: string; media: media; type: string; sender: string; createdAt: string };
  lastMessagePreview: string;
  //memberCount?: number;
  unreadCounts: { user: string; count: number }[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}