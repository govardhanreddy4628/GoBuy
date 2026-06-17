import { Response, RequestHandler, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import UserModel, { IUserDocument } from "../models/userModel.js";
import ChatModel from "../models/chatModal.js";
import { Message } from "../models/MessageModel.js";
import { ApiError } from "../utils/ApiError.js";
import { TryCatch } from "../utils/tryCatch.js";
import {
  ALERT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";
import { getOtherMember, getSockets } from "../lib/helper.js";
import {
  deleteFilesFromCloudinary,
  uploadMultipleToCloudinary,
} from "../services/cloudinaryService.js";

export interface AuthRequest extends Request {
  user?: IUserDocument;
}

const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

export const fetchAllChats: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chats = await ChatModel.find({
      members: req.user._id,
    })
      .populate("members", "fullName avatar")
      .populate("groupAdmins", "fullName avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName avatar",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error: any) {
    console.error("fetchAllChats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- Access / Create One-to-One Chat ----------------
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat: RequestHandler = async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;

  console.log("this is access chat");
  if (!userId) return res.status(400).json({ message: "UserId required" });
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized1" });
  }
  let isChat = await ChatModel.find({
    isGroup: false,
    members: { $all: [req.user?._id, userId] },
  })
    .populate("members", "fullName avatar")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "fullName avatar" },
    });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    try {
      const createdChat = await ChatModel.create({
        isGroup: false,
        members: [req.user._id, userId],
      });

      const fullChat = await ChatModel.findById(createdChat._id).populate(
        "members",
        "fullName avatar",
      );

      res.status(200).json(fullChat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};

// // ---------------- Fetch All Chats ----------------
//@description     Fetch all chats for a user
const fetchChats: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("this is access chat");
    const chats = await ChatModel.find({
      members: req.user._id,
    })
      .populate("members", "fullName avatar")
      .populate("groupAdmins", "fullName avatar")
      .populate("groupCreator", "fullName avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName avatar",
        },
      })
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map((chat: any) => {
      let chatName = chat.chatName;
      let chatAvatar = chat.avatar || "";

      if (!chat.isGroup && !chat.avatar) {
        const otherUser = chat.members.find(
          (m: any) => m._id.toString() !== req.user._id.toString(),
        );

        chatName = otherUser?.fullName || "User";
        chatAvatar = otherUser?.avatar || "";
      }

      const unread = chat.unreadCounts?.find(
        (u: any) => u.user.toString() === req.user._id.toString(),
      );

      const getLastMessagePreview = (msg: any) => {
        if (!msg) return "";

        // text + media
        if (msg.text && msg.media?.url) {
          return "📎 " + msg.text;
        }

        // only text
        if (msg.text) return msg.text;

        // media only
        switch (msg.type) {
          case "image":
            return "📷 Photo";
          case "video":
            return "🎥 Video";
          case "audio":
            return "🎵 Audio";
          case "document":
            return "📄 Document";
          case "location":
            return "📍 Location";
          case "contact":
            return "👤 Contact";
          default:
            return "📎 Attachment";
        }
      };
      return {
        id: chat._id.toString(), // ✅ IMPORTANT
        chatName,
        chatAvatar,
        isGroup: chat.isGroup,
        members: chat.members,

        lastMessage: chat.lastMessage
          ? {
              _id: chat.lastMessage._id,
              text: chat.lastMessage.text,
              type: chat.lastMessage.type,
              media: chat.lastMessage.media,
              sender: chat.lastMessage.sender,
              createdAt: chat.lastMessage.createdAt,
            }
          : null,

        lastMessagePreview: getLastMessagePreview(chat.lastMessage),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,

        unreadCount: unread ? unread.count : 0,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


const allMessagesOfChat = TryCatch(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "fullName avatar")
    .populate("chat", "isGroup");

  const transformedMessages = messages.map((msg) => {
  return {
    _id: msg._id,
    text: msg.text,
    type: msg.type,
    media: msg.media,
    createdAt: msg.createdAt,

    chatId: msg.chat?._id,

    status: msg.status,
    readBy: msg.readBy,

    sender: msg.sender
      ? {
          _id: msg.sender._id,
          fullName: msg.sender.fullName,
          avatar: msg.sender.avatar,
        }
      : null,
  };
});

  res.status(200).json(transformedMessages);
});

const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await ChatModel.find({
    members: req.user._id,
  }).populate("members", "fullName avatar");

  const transformedChats = chats.map((chat) => {
    const { _id, chatName, members, isGroup } = chat;

    const otherMember = getOtherMember(members, req.user._id);

    return {
      _id,
      isGroup,

      avatar: isGroup
        ? members.slice(0, 3).map((m) => m.avatar)
        : otherMember
          ? [otherMember.avatar]
          : [],

      name: isGroup ? chatName : otherMember ? otherMember.fullName : "Unknown",

      members: members
        .filter((m) => m._id.toString() !== req.user._id.toString())
        .map((m) => m._id),
    };
  });

  res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await ChatModel.find({
    members: req.user._id,
    isGroup: true,
    groupAdmin: req.user._id,
  }).populate("members", "fullName avatar");

  const groups = chats.map(({ members, _id, isGroup, chatName }) => ({
    _id,
    isGroup,
    name: chatName,

    avatar: members.slice(0, 3).map((m) => m.avatar),
  }));

  res.status(200).json({
    success: true,
    groups,
  });
});

const getChatDetails = TryCatch(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await ChatModel.findById(req.params.id)
      .populate("members", "fullName avatar")
      .lean();

    if (!chat) return next(new ApiError(404, "Chat not found"));

    const transformedMembers = chat.members.map((m: any) => ({
      _id: m._id,
      name: m.fullName,
      avatar: m.avatar,
    }));

    return res.status(200).json({
      success: true,
      chat: {
        ...chat,
        members: transformedMembers,
      },
    });
  } else {
    const chat = await ChatModel.findById(req.params.id);

    if (!chat) return next(new ApiError(404, "Chat not found"));

    return res.status(200).json({
      success: true,
      chat,
    });
  }
});

const getMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  // ✅ FIX: convert page to number
  const page = Number(req.query.page) || 1;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;

  const chat = await ChatModel.findById(chatId);

  if (!chat) return next(new ApiError(404, "Chat not found"));

  // ✅ FIX: proper ObjectId comparison
  const isMember = chat.members.some(
    (member) => member.toString() === req.user._id.toString(),
  );

  if (!isMember)
    return next(new ApiError(403, "You are not allowed to access this chat"));

  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "fullName avatar") // ✅ FIX
      .lean(),

    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage);

  res.status(200).json({
    success: true,
    messages: messages.reverse(), // oldest first
    totalPages,
  });
});

const deleteChat = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const userId = req.user._id.toString();

  const chat = await ChatModel.findById(chatId);
  if (!chat) return next(new ApiError(404, "Chat not found"));

  // ✅ FIX: check admin safely
  if (
    chat.isGroup &&
    chat.groupAdmin &&
    chat.groupAdmin.toString() !== userId
  ) {
    return next(new ApiError(403, "You are not allowed to delete the group"));
  }

  // ✅ FIX: check membership properly
  const isMember = chat.members.some((member) => member.toString() === userId);

  if (!chat.isGroup && !isMember) {
    return next(new ApiError(403, "You are not allowed to delete this chat"));
  }

  // ✅ Fetch messages with attachments
  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  // ✅ FIX: proper typing
  const publicIds: string[] = [];

  messagesWithAttachments.forEach((msg) => {
    msg.attachments.forEach((att) => {
      if (att.public_id) publicIds.push(att.public_id);
    });
  });

  await Promise.all([
    publicIds.length > 0
      ? deleteFilesFromCloudinary(publicIds)
      : Promise.resolve(),
    Message.deleteMany({ chat: chatId }),
    chat.deleteOne(),
  ]);

  // ✅ emit to all members
  emitEvent(
    req,
    REFETCH_CHATS,
    chat.members.map((m) => m.toString()),
  );

  res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

//---------------- Create Group Chat ----------------
const createGroupChat = async (req: AuthRequest, res: Response) => {
  const { members: usersRaw, name } = req.body;

  if (!usersRaw || !name) {
    res.status(400).json({ message: "Please fill all the fields" });
    return;
  }

  let members: string[];
  try {
    members = typeof usersRaw === "string" ? JSON.parse(usersRaw) : usersRaw;
  } catch {
    res.status(400).json({ message: "Invalid users format" });
    return;
  }

  if (!Array.isArray(members) || members.length < 2) {
    res.status(400).json({
      message: "At least 2 other users are required to form a group chat",
    });
    return;
  }

  if (!req.user?._id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const allMembers = [...new Set([...members, req.user._id.toString()])];
  try {
    const group = await ChatModel.create({
      chatName: name,
      members: allMembers,
      isGroup: true,
      groupAdmin: req.user?._id,
    });

    const fullGroupChat = await ChatModel.findById(group._id)
      .populate("members", "fullName avatar")
      .populate("groupAdmin", "fullName avatar");

    if (!fullGroupChat) {
      res.status(500).json({ message: "Failed to create group chat" });
      return;
    }
    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);
    return res
      .status(201)
      .json({ success: true, data: fullGroupChat, message: "Group Created" });
  } catch (error: any) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ---------------- Rename Group ----------------
const renameGroup: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.id;
    const { name } = req.body;

    const chat = await ChatModel.findById(chatId);

    if (!chat) return next(new ApiError(404, "Chat not found"));

    if (!chat.isGroup)
      return next(new ApiError(400, "This is not a group chat"));

    if (!chat.groupAdmin) return next(new ApiError(400, "Group admin missing"));

    if (chat.groupAdmin.toString() !== req.user!._id.toString())
      return next(new ApiError(403, "You are not allowed to rename the group"));

    chat.chatName = name;

    await chat.save();

    emitEvent(
      req,
      REFETCH_CHATS,
      chat.members.map((m) => m.toString()),
    );

    return res.status(200).json({
      success: true,
      message: "Group renamed successfully",
    });
  },
);

// --------------------add members to group--------------
const addMembersToGroup: RequestHandler = TryCatch(async (req, res, next) => {
  const { chatId, members } = req.body;

  const chat = await ChatModel.findById(chatId);

  //   if (!chat) return next(new ErrorHandler("Chat not found", 404));
  if (!chat) return next(new ApiError(404, "Chat not found"));

  if (!chat.isGroup) return next(new ApiError(400, "This is not a group chat"));

  if (!chat.groupAdmin) return next(new ApiError(400, "Group admin missing"));

  if (chat.groupAdmin.toString() !== req.user!._id.toString())
    return next(new ApiError(403, "You are not allowed to add members"));

  const users = await UserModel.find({
    _id: { $in: members },
  });

  const uniqueMembers = users
    .filter((u) => !chat.members.some((m) => m.toString() === u._id.toString()))
    .map((u) => u._id);

  if (chat.members.length + uniqueMembers.length > 100)
    return next(new ApiError(400, "Group limit reached"));

  chat.members.push(...uniqueMembers);
  await chat.save();

  const names = users.map((u) => u.fullName).join(", ");

  emitEvent(req, ALERT, chat.members, `${names} has been added in the group`);

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});

// ---------------- Remove From Group ----------------
const removeMemberFromGroup: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { chatId, userId } = req.body;

    const [chat, userThatWillBeRemoved] = await Promise.all([
      ChatModel.findById(chatId),
      UserModel.findById(userId, "fullName"),
    ]);

    if (!chat) return next(new ApiError(404, "Chat not found"));

    if (!chat.isGroup)
      return next(new ApiError(400, "This is not a group chat"));

    if (!chat.groupAdmin) return next(new ApiError(400, "Group admin missing"));

    if (chat.groupAdmin.toString() !== req.user!._id.toString())
      return next(new ApiError(403, "You are not allowed to add members"));

    if (chat.members.length <= 3)
      return next(new ApiError(400, "Group must have at least 3 members"));

    const allChatMembers = chat.members.map((i) => i.toString());

    chat.members = chat.members.filter(
      (member) => member.toString() !== userId.toString(),
    );

    await chat.save();

    emitEvent(req, ALERT, chat.members, {
      message: `${userThatWillBeRemoved.fullName} has been removed from the group`,
      chatId,
    });

    emitEvent(req, REFETCH_CHATS, allChatMembers);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  },
);

const leaveGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await ChatModel.findById(chatId);

  if (!chat) return next(new ApiError(404, "Chat not found"));

  if (!chat.isGroup) return next(new ApiError(400, "This is not a group chat"));

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user!._id.toString(),
  );

  if (remainingMembers.length < 3)
    return next(new ApiError(400, "Group must have at least 3 members"));

  if (!chat.groupAdmin) return next(new ApiError(400, "Group admin missing"));

  if (chat.groupAdmin.toString() === req.user!._id.toString()) {
    const randomElement = Math.floor(Math.random() * remainingMembers.length);
    const newGroupAdmin = remainingMembers[randomElement];
    chat.groupAdmin = newGroupAdmin;
  }

  chat.members = remainingMembers;

  const [user] = await Promise.all([
    UserModel.findById(req.user!._id, "fullName"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, {
    chatId,
    message: `User ${user?.fullName} has left the group`,
  });

  return res.status(200).json({
    success: true,
    message: "Leave Group Successfully",
  });
});

const sendAttachments = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;

  const files = req.files as Express.Multer.File[];

  if (!files || files.length < 1)
    return next(new ApiError(400, "Please Upload Attachments"));

  if (files.length > 5)
    return next(new ApiError(400, "Files Can't be more than 5"));

  const [chat, me] = await Promise.all([
    ChatModel.findById(chatId),
    UserModel.findById(req.user, "name"),
  ]);

  if (!chat) return next(new ApiError(404, "Chat not found"));

  //   Upload files here
  const attachments = await uploadMultipleToCloudinary(files);

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
  };

  const messageForRealTime = {
    ...messageForDB,
    sender: {
      _id: me._id,
      name: me.name,
    },
  };

  const message = await Message.create(messageForDB);

  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json({
    success: true,
    message,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await ChatModel.find({})
    .populate("members", "fullName avatar")
    .populate("groupAdmins", "fullName avatar");

  const transformedChats = await Promise.all(
    chats.map(async (chat) => {
      const { members, _id, isGroup, chatName, groupAdmins } = chat;

      const totalMessages = await Message.countDocuments({ chat: _id });

      return {
        _id,
        isGroup,
        name: chatName,

        avatar: members.slice(0, 3).map((m) => m.avatar),

        members: members.map((m) => ({
          _id: m._id,
          name: m.fullName,
          avatar: m.avatar,
        })),

        creator: groupCreator
          ? {
              name: groupCreator.fullName,
              avatar: groupCreator.avatar,
            }
          : null,

        totalMembers: members.length,
        totalMessages,
      };
    }),
  );

  res.status(200).json({
    status: "success",
    chats: transformedChats,
  });
});



const allMessages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
    .populate("sender", "fullName avatar")
    .populate("chat", "isGroup");

  const transformedMessages = messages.map((msg) => {
    const { content, attachments, _id, sender, createdAt, chat } = msg;

    return {
      _id,
      attachments,
      content,
      createdAt,
      chat: chat?._id,
      isGroup: chat?.isGroup,

      sender: sender
        ? {
            _id: sender._id,
            name: sender.fullName,
            avatar: sender.avatar,
          }
        : null,
    };
  });

  res.status(200).json({
    success: true,
    messages: transformedMessages,
  });
});

// const allUsers = TryCatch(async (req, res) => {
//   const users = await UserModel.find({});

//   const transformedUsers = await Promise.all(
//     users.map(async (user) => {
//       const { fullName, username, avatar, _id } = user;

//       const [groups, friends] = await Promise.all([
//         ChatModel.countDocuments({ isGroup: true, members: _id }),
//         ChatModel.countDocuments({ isGroup: false, members: _id }),
//       ]);

//       return {
//         name: fullName,
//         username,
//         avatar,
//         _id,
//         groups,
//         friends,
//       };
//     })
//   );

//   res.status(200).json({
//     status: "success",
//     users: transformedUsers,
//   });
// });

const allUsers = TryCatch(async (req, res) => {
  const users = await UserModel.find({
    role: { $in: ["ADMIN", "SUPER-ADMIN"] },
  });

  const transformedUsers = await Promise.all(
    users.map(async (user) => {
      const { fullName, avatar, _id } = user;

      const [groups, friends] = await Promise.all([
        ChatModel.countDocuments({ isGroup: true, members: _id }),
        ChatModel.countDocuments({ isGroup: false, members: _id }),
      ]);

      return {
        name: fullName,
        avatar,
        _id,
        groups,
        friends,
      };
    }),
  );

  res.status(200).json({
    status: "success",
    users: transformedUsers,
  });
});

const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;

  // Finding All my chats
  const myChats = await ChatModel.find({
    groupChat: false,
    members: req.user._id,
  });

  //  extracting All Users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  // Finding all users except me and my friends
  const allUsersExceptMeAndFriends = await UserModel.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  });

  // Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});

// const searchUser = TryCatch(async (req, res) => {
//   const keyword = (req.query.name as string) || "";
//   const userId = req.user._id;

//   const myChats = await ChatModel.find({
//     isGroup: false,
//     members: userId,
//   });

//   const friendIds = new Set<string>();

//   myChats.forEach((chat) => {
//     chat.members.forEach((m) => {
//       if (m.toString() !== userId.toString()) {
//         friendIds.add(m.toString());
//       }
//     });
//   });

//   const users = await UserModel.find({
//     _id: {
//       $nin: [userId, ...Array.from(friendIds)],
//     },
//     fullName: { $regex: keyword, $options: "i" },
//   });

//   const transformed = users.map((u) => ({
//     _id: u._id,
//     name: u.fullName,
//     avatar: u.avatar,
//   }));

//   res.status(200).json({
//     success: true,
//     users: transformed,
//   });
// });

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId as string | undefined;
  const userId = req.user._id;

  const chats = await ChatModel.find({
    members: userId,
    isGroup: false,
  }).populate("members", "fullName avatar");

  const friends = chats.map((chat) => {
    const otherUser = getOtherMember(chat.members, userId);

    return {
      _id: otherUser._id,
      name: otherUser.fullName,
      avatar: otherUser.avatar,
    };
  });

  if (chatId) {
    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }

    const availableFriends = friends.filter(
      (f) => !chat.members.some((m) => m.toString() === f._id.toString()),
    );

    res.status(200).json({
      success: true,
      friends: availableFriends,
    });
    return;
  }

  res.status(200).json({
    success: true,
    friends,
  });
});

export {
  createGroupChat,
  accessChat,
  fetchChats,
  getMyChats,
  getMyGroups,
  addMembersToGroup,
  removeMemberFromGroup,
  leaveGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
  allUsers,
  searchUser,
  getMyFriends,
  allChats,
  allMessages,
  allMessagesOfChat,
};

const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar",
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ApiError(400, "Request already sent"));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});

const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ApiError(404, "Request not found"));

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ApiError(401, "You are not authorized to accept this request"),
    );

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    ChatModel.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

// const renameGroup = asyncHandler(async (req, res) => {
//   const { chatId, chatName } = req.body;

//   const updatedChat = await ChatModel.findByIdAndUpdate(
//     chatId,
//     {
//       chatName: chatName,
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!updatedChat) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(updatedChat);
//   }
// });

// const removeFromGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   const removed = await ChatModel.findByIdAndUpdate(
//     chatId,
//     {
//       $pull: { users: userId },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!removed) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(removed);
//   }
// });
