import agentModel from "../models/agentModel.js";
import { Request, Response, NextFunction, CookieOptions } from "express";
import { runAgent } from "../services/agentService.js";
import { z } from "zod";
import agentMessage from "../models/agentMessageModel.js";
import Agent from "../models/agentModel.js";
import AgentConversation from "../models/agentConversationModel.js";

export const getAgents = async (req: Request, res: Response) => {
  const agents = await agentModel.find();
  res.json(agents);
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const userId = req.user?.id || "demo-user";

    const messages = await agentMessage
      .find({
        userId,
        agentId,
      })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};


// ✅ Get all chats (sidebar)
export const getAgentChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || "demo-user";
    const { agentId } = req.params;

    const chats = await AgentConversation.find({ userId, agentId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean()
      .then((msgs) => msgs.reverse()); // chronological

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// ✅ Create new chat
export const createNewChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || "demo-user";
    const { agentId } = req.body;

    const chat = await AgentConversation.create({
      userId,
      agentId,
      title: "New Chat",
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// ✅ Get messages of a conversation
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const messages = await agentMessage
      .find({ conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ✅ Chat schema
const chatSchema = z.object({
  agentId: z.string(),
  message: z.string().min(1),
  conversationId: z.string(),
});


// ✅ Chat with agent (MAIN LOGIC)
export const chatWithAgent = async (req: Request, res: Response) => {
  try {
    const { agentId, message, conversationId } = chatSchema.parse(req.body);

    const userId = req.user?.id || "demo-user";

    const agent = await agentModel.findOne({ id: agentId });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ✅ 1. Save user message FIRST
    const userMsg = await agentMessage.create({
      userId,
      agentId: agent.id,
      conversationId,
      role: "user",
      content: message,
    });

    // ✅ 2. Get updated history (includes new message)
    // 🔥 Get previous messages for context
    const history = await agentMessage
      .find({ conversationId })
      .sort({ createdAt: 1 });

    // 🔥 Format for LLM
    const formattedHistory = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 🔥 Call LLM
    const response = await runAgent({
      userId,
      agent,
      input: message,
      history: formattedHistory, // 👈 pass history instead
    });

    // 🔥 Save assistant response
    const assistantMsg = await agentMessage.create({
      userId,
      agentId: agent.id,
      conversationId,
      role: "assistant",
      content: response,
    });

    // ✅ 5. Update conversation
    const msgCount = history.length;
  
    await AgentConversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
      ...(msgCount === 1 && { title: message.slice(0, 30) }),
    });

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Chat failed" });
  }
};


// controllers/agent.controller.ts
export const createConversation = async (req: Request, res: Response) => {
  const { agentId } = req.body;

  const conversation = await AgentConversation.create({
    agentId,
    title: "New Chat",
  });

  res.json(conversation);
};


export const getChatss = async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const chats = await AgentConversation.find({ agentId }).sort({updatedAt: -1});
  res.json(chats);
};


export const sendMessage = async (req: Request, res: Response) => {
  const { agentId, conversationId, message, userId } = req.body;

  // 1. Save user message
  const userMsg = await agentMessage.create({
    agentId,
    conversationId,
    userId,
    role: "user",
    content: message,
  });

  // 2️. Get agent settings
  const agent = await Agent.findOne({ id: agentId });

  // 3. Call LLM (replace with your agent.invoke later)
  const aiResponse = `AI response for: ${message}`;

  // 4. Save AI message
  const assistantMsg = await agentMessage.create({
    agentId,
    conversationId,
    userId,
    role: "assistant",
    content: aiResponse,
  });

  // 5. Update conversation timestamp, Update chat title (first message)
  const msgCount = await agentMessage.countDocuments({ conversationId });

  if (msgCount <= 2) {
    await AgentConversation.findByIdAndUpdate(conversationId, {
      title: message.slice(0, 30),
      updatedAt: new Date(),
    });
  }

  res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  });
};

export const rateMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { rating } = req.body;

  const message = await agentMessage.findByIdAndUpdate(
    messageId,
    { rating },
    { new: true },
  );

  res.json(message);
};

export const deleteConversation = async (req: Request, res: Response) => {
  const { id } = req.params;

  await agentMessage.deleteMany({ conversationId: id });
  await AgentConversation.findByIdAndDelete(id);

  res.json({ success: true });
};

export const updateAgentSettings = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const isFullUpdate = Object.keys(req.body).length > 2; // tweak logic if needed

    const updateQuery = isFullUpdate
      ? { $set: { settings: req.body } }
      : {
          $set: Object.fromEntries(
            Object.entries(req.body).map(([k, v]) => [`settings.${k}`, v]),
          ),
        };

    const updated = await Agent.findOneAndUpdate(
      { id: agentId }, // ⚠️ or _id depending on your schema
      updateQuery,
      {
        new: true,
      },
    );

    if (!updated) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};
