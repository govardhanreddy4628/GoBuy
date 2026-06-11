export interface ChatFromApi {
  id: string;
  chatName: string;
  isGroup: boolean;
  groupAdmins: string[];
  groupCreator: string;
  members?: { _id: string; fullName: string; avatar?: string }[];
  //groupName: string;
  groupIcon?: { url: string; public_id: string };
  lastMessage?: { _id: string; text: string; sender: string; createdAt: string };
  memberCount?: number;
  unreadCounts: { user: string; count: number }[];
  createdAt: string;
  updatedAt: string;
}