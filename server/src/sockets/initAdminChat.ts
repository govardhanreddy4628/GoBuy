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
import UserModel, { IUserDocument } from "../models/userModel.js";
import ChatModel from "../models/chatModal.js";

interface CustomSocket extends Socket {
  user: IUserDocument;
}

// --- Maps user IDs to socket IDs ---
export const userSocketIDs = new Map<string, string>();
export const onlineUsers = new Set<string>();

export function initAdminChat(io: Namespace) {
  io.on("connection", (socket: Socket) => {
    const customSocket = socket as CustomSocket;
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
      try {
        const { text, media, type } = message || {};
        // Validate message
        if (!text?.trim() && !media) {
          return socket.emit("error", { message: "Message cannot be empty" });
        }

        // Validate members for new chats
        if (
          (!chatId || chatId?.startsWith?.("temp")) &&
          (!members || members.length === 0)
        ) {
          return socket.emit("error", {
            message: "Members required for new chat",
          });
        }

        console.log("🔥 RECEIVED ON SERVER", { chatId, members, text });

        let chat;

        // CASE 1: Real chatId exists
        if (chatId && !chatId.startsWith("temp")) {
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
                chatName: groupName,
                isGroup: true,
                members: allMembers,
              });

              console.log("✅ Created new GROUP chat:", chat._id);
            }
          }
          // 🔥 DIRECT CHAT (1 recipient)
          else {
            const allMembers = [user._id.toString(), ...members];
            const uniqueMembers = [...new Set(allMembers)];

            if (uniqueMembers.length !== 2) {
              return socket.emit("error", {
                message: "Direct chat must have exactly 2 users",
              });
            }

            const otherUserId = uniqueMembers.find(
              (id) => id !== user._id.toString(),
            );

            if (!otherUserId) {
              return socket.emit("error", {
                message: "Invalid member structure",
              });
            }

            chat = await ChatModel.findOne({
              isGroup: false,
              members: { $all: [user._id, otherUserId], $size: 2 },
            });

            const otherUser =
              await UserModel.findById(otherUserId).select("fullName");
            console.log(otherUser);
            if (!chat) {
              chat = await ChatModel.create({
                chatName: otherUser?.fullName || "Direct Message",
                isGroup: false,
                members: [user._id.toString(), otherUserId.toString()],
              });
            }
          }
        }

        // CREATE MESSAGE
        let newMessage = await Message.create({
          chat: chat._id,
          sender: user._id,
          text: text?.trim(),
          media,
          type: type || "text",
        });

        newMessage = await newMessage.populate("sender", "fullName avatar");

        // ✅ Increment unread count for all OTHER users
        for (const member of chat.members) {
          const memberId = member._id?.toString() || member.toString();

          if (memberId !== user._id.toString()) {
            await ChatModel.updateOne(
              { _id: chat._id, "unreadCounts.user": memberId },
              { $inc: { "unreadCounts.$.count": 1 } },
            );

            // If user not found → push new
            await ChatModel.updateOne(
              { _id: chat._id, "unreadCounts.user": { $ne: memberId } },
              {
                $addToSet: {
                  unreadCounts: { user: memberId, count: 1 },
                },
              },
            );
          }
        }

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
            _id: chat._id.toString(),
            chatName: chat.chatName,
            isGroup: chat.isGroup,
            members: chat.members.map((m: any) =>
              m._id ? m._id.toString() : m.toString(),
            ),
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

    socket.on(CHAT_JOINED, ({ userId, members, chatId }) => {
      socket.join(chatId);
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

    socket.on("MARK_SEEN", async ({ chatId, userId }) => {
      if (!chatId || !userId) return;

      try {
        // 1. Mark messages as read
        await Message.updateMany(
          {
            chat: chatId,
            "readBy.user": { $ne: userId },
          },
          {
            $push: {
              readBy: { user: userId, at: new Date() },
            },
          },
        );

        // 2. Reset unread count
        await ChatModel.updateOne(
          { _id: chatId, "unreadCounts.user": userId },
          { $set: { "unreadCounts.$.count": 0 } },
        );

        // 3. Notify others (optional)
        socket.to(chatId).emit("MESSAGES_READ", { chatId, userId });
      } catch (err) {
        console.error("MARK_SEEN error", err);
      }
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
