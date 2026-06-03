import express from "express";
import { chatWithAgent, createNewChat, deleteConversation, getAgentChats, getAgents, getChatMessages, getMessages, rateMessage, updateAgentSettings } from "../controllers/agentController.js";
import { chatLimiter } from "../middleware/rateLimiter.js";

const agentRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

agentRouter.get("/", getAgents);

// chat lifecycle routes
agentRouter.post("/new-chat", createNewChat);
agentRouter.get("/:agentId/chats", getAgentChats);
agentRouter.post("/chat", chatLimiter, asyncHandler(chatWithAgent));
agentRouter.get("/chat/:conversationId", getChatMessages);
//agentRouter.get("/messages/:agentId", getMessages);

// message actions
agentRouter.patch("/messages/:messageId/rate", rateMessage);

// chat management
agentRouter.delete("/agents/chat/:id", deleteConversation);

// agent settings
agentRouter.put("/:agentId/settings", asyncHandler(updateAgentSettings));

export default agentRouter;