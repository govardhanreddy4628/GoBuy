const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// // below controller code no more needed as we are handling message creation in socket connection
// // @description     Create New Message
// const sendMessage = asyncHandler(async (req, res) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     console.log("Invalid data passed into request");
//     return res.sendStatus(400);
//   }

//   var newMessage = {
//     sender: req.user._id,
//     content,
//     chat: chatId,
//   };

//   try {
//     var message = await Message.create(newMessage);

//     message = await message.populate("sender", "fullName avatar");
//     message = await message.populate("chat");
//     message = await User.populate(message, {
//       path: "chat.users",
//       select: "fullName avatar",
//     });

//     await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

//     res.status(200).json(message);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

module.exports = { allMessages, sendMessage };