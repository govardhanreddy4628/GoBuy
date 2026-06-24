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
export const getSockets = (
  users: (string | { toString(): string } | null | undefined)[] = []
): string[] => {
  return users
    .filter((u) => u !== null && u !== undefined) // ✅ remove nulls
    .map((user) => {
      try {
        const id =
          typeof user === "string"
            ? user
            : typeof user?.toString === "function"
            ? user.toString()
            : null;

        if (!id) return null;

        return userSocketIDs.get(id) || null;
      } catch {
        return null;
      }
    })
    .filter((socketId): socketId is string => Boolean(socketId)); // ✅ only valid sockets
};

// Convert uploaded file buffer to base64 data URL
export const getBase64 = (file: FileData): string => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
