import { Namespace, Server, Socket } from "socket.io";
import { Message } from "../models/MessageModel.js";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from "../constants/events.js";
import { v4 as uuid } from "uuid";
import { getSockets } from "../lib/helper.js";
import { IUserDocument } from "../models/userModel.js";
import ChatModel from "../models/chatModal.js";
//import { getSockets } from "../lib/helper.js";
//dotenv.config({ path: "./.env"});

interface CustomSocket extends Socket {
  user: IUserDocument;
}

// --- Maps user IDs to socket IDs ---
export const userSocketIDs = new Map<string, string>();
export const onlineUsers = new Set<string>();

export function initAdminChat(io: Namespace) {
  io.on("connection", (socket: Socket) => {
    const customSocket = socket as CustomSocket;
    console.log("🟢 connected successfully", socket.id);

    const user = customSocket.user;

    if (!user || !user?._id) {
      console.warn("⚠️ Connected socket has no user data");
      socket.disconnect(true);
      return;
    }

    console.log(`🟢 User connected: ${user.fullName} (${socket.id})`);
    userSocketIDs.set(user._id.toString(), socket.id);

    // socket.on("sendMessage", async (msg) => {
    //   const saved = await new Message(msg).save();
    //   io.to(msg.receiverId).emit("receiveMessage", saved);
    // });

    // socket.on("message", (msg) => {
    //   console.log("📨 Message received:", msg);
    //   io.emit("message", msg);
    // });

    socket.on(NEW_MESSAGE, async ({ chatId, members, message, groupName }) => {
      // Validate message
      if (!message?.trim()) {
        return socket.emit("error", { message: "Message cannot be empty" });
      }

      // Validate members for new chats
      if (
        (!chatId || chatId === "null" || chatId?.startsWith?.("temp")) &&
        (!members || members.length === 0)
      ) {
        return socket.emit("error", {
          message: "Members required for new chat",
        });
      }

      console.log("🔥 RECEIVED ON SERVER", { chatId, members, message });

      try {
        let chat;

        // CASE 1: Real chatId exists
        if (chatId && chatId !== "null" && !chatId.startsWith("temp")) {
          chat = await ChatModel.findById(chatId);
        }

        // CASE 2: No valid chat found → find or create chat
        if (!chat) {
          const allMembers = [user._id.toString(), ...members];

          // 🔥 GROUP CHAT (more than 1 recipient)
          if (members.length > 1) {
            // Optional: prevent duplicate group
            chat = await ChatModel.findOne({
              isGroup: true,
              members: { $all: allMembers, $size: allMembers.length },
            });

            if (!chat) {
              chat = await ChatModel.create({
                chatName: groupName?.trim() || `Group (${allMembers.length})`,
                isGroup: true,
                members: allMembers,
              });

              console.log("✅ Created new GROUP chat:", chat._id);
            }
          }
          // 🔥 DIRECT CHAT (1 recipient)
          else {
            const otherUserId = members?.[0]; // First member should be the recipient

            if (!otherUserId) {
              return socket.emit("error", { message: "Invalid recipient" });
            }

            // Find existing 1-on-1 chat
            chat = await ChatModel.findOne({
              isGroup: false,
              members: { $all: [user._id, otherUserId], $size: 2 },
            });

            // Create new chat if none exists
            if (!chat) {
              chat = await ChatModel.create({
                chatName: "Direct Message",
                isGroup: false,
                members: [user._id, otherUserId],
              });
              console.log("✅ Created new chat:", chat._id);
            }
          }
        }

        // CREATE MESSAGE
        let newMessage = await Message.create({
          content: message.trim(),
          sender: user._id,
          chat: chat._id,
        });

        newMessage = await newMessage.populate("sender", "fullName avatar");

        // UPDATE LAST MESSAGE
        chat.lastMessage = newMessage._id;
        await chat.save();

        // Populate chat members for response
        await chat.populate("members", "_id fullName avatar");

        const membersSockets = getSockets(
          chat.members.map((m: any) => m._id?.toString() || m.toString()),
        ).filter((id): id is string => typeof id === "string");

        console.log("📤 Emitting to sockets:", membersSockets);

        // Emit to all members
        io.to(membersSockets).emit(NEW_MESSAGE, {
          chatId: chat._id.toString(),
          message: newMessage,
          chat: {
            _id: chat._id,
            chatName: chat.chatName,
            isGroup: chat.isGroup,
            members: chat.members,
          },
        });

        // Unread alert to members not in active chat
        io.to(membersSockets).emit(NEW_MESSAGE_ALERT, {
          chatId: chat._id.toString(),
        });
      } catch (error) {
        console.error("❌ Message send error:", error);
        console.error("❌ Error message:", (error as any)?.message);
        console.error("❌ Error stack:", (error as any)?.stack);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on(START_TYPING, ({ members, chatId }) => {
      if (!members?.length) return;
      const membersSockets = getSockets(members).filter(
        (id): id is string => typeof id === "string",
      );
      socket.to(membersSockets).emit(START_TYPING, { chatId });
    });

    socket.on(STOP_TYPING, ({ members, chatId }) => {
      if (!members?.length) return;
      const membersSockets = getSockets(members).filter(
        (id): id is string => typeof id === "string",
      );
      socket.to(membersSockets).emit(STOP_TYPING, { chatId });
    });

    socket.on(CHAT_JOINED, ({ userId, members }) => {
      onlineUsers.add(userId.toString());
      const membersSockets = getSockets(members).filter(
        (id): id is string => typeof id === "string",
      );
      io.to(membersSockets).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on(CHAT_LEAVED, ({ userId, members }) => {
      onlineUsers.delete(userId.toString());
      const membersSockets = getSockets(members).filter(
        (id): id is string => typeof id === "string",
      );
      io.to(membersSockets).emit(ONLINE_USERS, Array.from(onlineUsers));
    });

    socket.on("disconnect", () => {
      console.log("❌ Admin disconnected:", socket.id);
      userSocketIDs.delete(user.id.toString());
      onlineUsers.delete(user.id.toString());
      socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
      // or
      // socket.broadcast.emit(ONLINE_USERS, [...onlineUsers]);
    });
  });
}
