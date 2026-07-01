const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
import { Request, Response } from "express";

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unknown error occurred");
  }
});

// below controller code no more needed as we are handling message creation in socket connection
// @description     Create New Message
// const sendMessage = asyncHandler(async (req: Request, res: Response) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     return res.sendStatus(400);
//   }

//   const newMessage = {
//     sender: req.user._id,
//     content,
//     chat: chatId,
//   };

//   try {
//     let message = await Message.create(newMessage);

//     message = await message.populate("sender", "fullName avatar");
//     message = await message.populate("chat");
//     message = await User.populate(message, {
//       path: "chat.users",
//       select: "fullName avatar",
//     });

//     await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

//     return res.status(200).json(message);
//   } catch (error) {
//     res.status(400);

//     if (error instanceof Error) {
//       throw new Error(error.message);
//     }

//     throw new Error("Unknown error occurred");
//   }
// });

//module.exports = { allMessages, sendMessage };


module.exports = { allMessages};