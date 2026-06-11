// src/utils/chatHelpers.ts
import { userSocketIDs } from "../sockets/initAdminChat.js";
import type { Socket } from "socket.io";

// ✅ Define minimal interfaces for clarity
interface Member {
  _id: string | { toString(): string };
}

interface FileData {
  mimetype: string;
  buffer: Buffer;
}

// Get the "other" member in a two-member chat (excludes the given userId)
export const getOtherMember = (members: Member[], userId: string): Member | undefined => {
  return members.find((member) => member._id.toString() !== userId.toString());
};

// Get socket IDs (or sockets) of given users from global socket map
export const getSockets = (users: (string | { toString(): string })[] = []): (string | undefined)[] => {
  return users.map((user) => userSocketIDs.get(user.toString()));
};

// Convert uploaded file buffer to base64 data URL
export const getBase64 = (file: FileData): string => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
