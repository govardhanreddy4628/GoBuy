import express from "express";
import { accessChat, addMembersToGroup, allChats, allMessages, allMessagesOfChat, allUsers, createGroupChat, fetchChats, getMyFriends, removeMemberFromGroup, renameGroup, sendAttachments } from "../controllers/chatController.js";
import { authenticate } from "../middleware/authenticate.js";
import { uploadMultipleMedia } from "../middleware/multer.js";
import { acceptRequestValidator, sendAttachmentsValidator, sendRequestValidator, validateHandler } from "../lib/validators.js";
//import upload from "../middleware/multer";

const chatRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

//chatRouter.use(authenticate());

chatRouter.route("/").post(authenticate(), accessChat);
chatRouter.route("/").get(authenticate(), fetchChats);
chatRouter.route("/newgroup").post(authenticate(), asyncHandler(createGroupChat));
chatRouter.route("/rename").put(authenticate(), renameGroup);
chatRouter.route("/groupremove").put(authenticate(), removeMemberFromGroup);
chatRouter.route("/groupadd").put(authenticate(), addMembersToGroup);

//Send Attachments
chatRouter.post("/message", uploadMultipleMedia, sendAttachmentsValidator(), validateHandler, sendAttachments);


chatRouter.get("/users", allUsers);
chatRouter.get("/chats", allChats);
//chatRouter.get("/", authenticate(), fetchAllChats);
//chatRouter.get("/messages", allMessages);
chatRouter.get("/messages/:chatId", authenticate(), allMessagesOfChat);



// chatRouter.put(
//   "/sendrequest",
//   sendRequestValidator(),
//   validateHandler,
//   sendFriendRequest
// );

// chatRouter.put(
//   "/acceptrequest",
//   acceptRequestValidator(),
//   validateHandler,
//   acceptFriendRequest
// );

//chatRouter.get("/notifications", getMyNotifications);
chatRouter.get("/friends", getMyFriends);

export default chatRouter;
