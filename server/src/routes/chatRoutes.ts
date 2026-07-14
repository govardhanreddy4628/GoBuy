import express from "express";
import { accessChat, allMessagesOfChat, createGroupChat, fetchChats, 
  allUsers, renameGroup, addMembersToGroup, removeMemberFromGroup, uploadSingleChatMediaController,
  removeGroupIcon,
  updateGroupIcon} from "../controllers/chatController.js";
import { authenticate } from "../middleware/authenticate.js";
import { handleMulterError, uploadMultipleMedia, uploadSingle, uploadSingleMedia } from "../middleware/multer.js";
import { acceptRequestValidator, sendAttachmentsValidator, sendRequestValidator, validateHandler } from "../lib/chatValidators.js";
import { setUploadFolder } from "../middleware/setFolderName.js";
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
//chatRouter.post("/message", uploadMultipleMedia, sendAttachmentsValidator(), validateHandler, sendAttachments);


chatRouter.get("/users", authenticate(), allUsers);
// chatRouter.get("/chats", allChats);
//chatRouter.get("/", authenticate(), fetchAllChats);
//chatRouter.get("/messages", allMessages);
chatRouter.get("/messages/:chatId", authenticate(), allMessagesOfChat);


chatRouter.post(
  "/upload/chat-media/single",
  authenticate(),
  setUploadFolder("chat"),
  handleMulterError(uploadSingleMedia),
  uploadSingleChatMediaController,
);



chatRouter.put(
  "/icon/:chatId",
  authenticate(), 
  setUploadFolder("group-icons"),
  handleMulterError(uploadSingle),
  updateGroupIcon
);

chatRouter.delete("/icon/:chatId", authenticate(), removeGroupIcon);

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
// chatRouter.get("/friends", getMyFriends);

export default chatRouter;
