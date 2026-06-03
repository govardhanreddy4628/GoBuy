import { Server, Socket } from "socket.io";
import { aiQueue } from "../aiWorker/queue.js";       // Queue for processing AI messages asynchronously
import conversation from "../models/aiConversation.js";
import assistantMessageModal from "../models/assistantMessageModal.js";
import * as aiService from "../services/aiService.js"; // Service for AI message streaming


/**
 * Initialize customer-side AI chat on a shared Socket.IO server.
 * @param io - Socket.IO server instance
 */
export function initAssistantChat(io: ReturnType<Server["of"]>) {
  // ---------------- AI WORKER QUEUE ----------------
  // Listen for 'process' events from aiQueue to handle AI responses
  aiQueue.on("process", async (workItem) => {
    const { conversationId, userId, systemPrompt, userPrompt, socketRoom } = workItem;

    // Notify clients in the room that AI is typing
    io.to(socketRoom).emit("ai_typing", { conversationId });

    // Stream AI response in chunks
    await aiService.chatStream(
      [
        { role: "system", content: systemPrompt }, // System prompt (instructions)
        { role: "user", content: userPrompt },     // User message
      ],
      (chunk) => {
        // Emit each chunk as it arrives
        io.to(socketRoom).emit("ai_message_chunk", { conversationId, chunk });
      },
      async (finalText) => {
        // When AI finishes, emit final message
        io.to(socketRoom).emit("ai_message_done", { conversationId, finalText });

        // Save AI message to DB
        await assistantMessageModal.create({
          conversationId,
          role: "assistant",
          text: finalText,
          userId: null, // AI messages have no user
        });

        // Update conversation timestamp
        await conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() }).catch(() => {});
      }
    );
  });

  // ---------------- SOCKET CONNECTION ----------------
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Customer connected:", socket.id);

    /**
     * Join a conversation
     * payload contains optional userId and conversationId
     */
    socket.on("join", async ({ userId, conversationId }) => {
      let convId = conversationId;

      // If no conversation exists, find or create a new one
      if (!convId) {
        const conv =
          (await conversation.findOne({ userId, active: true })) || // find existing active
          (await conversation.create({ userId }));                 // or create new
        convId = String(conv._id);
      }

      // Join Socket.IO room for this conversation
      socket.join(convId);

      // Store user and conversation info on the socket
      socket.data.userId = userId;
      socket.data.conversationId = convId;

      // Send last 20 messages to the client
      const recent = await assistantMessageModal
        .find({ conversationId: convId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      socket.emit("recent_messages", recent.reverse());
    });

    /**
     * Handle messages from the user
     */
    socket.on("user_message", async (payload) => {
      const { text, metadata } = payload;
      const { userId, conversationId } = socket.data;

      if (!conversationId) {
        return socket.emit("error", { message: "No conversation joined" });
      }

      // Save user message to database
      const created = await assistantMessageModal.create({
        conversationId,
        userId,
        role: "user",
        text,
        metadata: metadata || {},
      });

      // Broadcast message to all clients in the conversation room
      io.to(conversationId).emit("message", created);

      // Build AI prompt using last 6 messages for context
      const history = await assistantMessageModal.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      const contextText = history.reverse().map((h) => `${h.role.toUpperCase()}: ${h.text}`).join("\n");

      const systemPrompt = "You are a concise shopping assistant. Use context when available. Do not request PII.";
      const userPrompt = `${contextText}\nUSER: ${text}`;

      // Enqueue AI processing
      aiQueue.enqueue({ conversationId, userId, systemPrompt, userPrompt, socketRoom: conversationId });
    });

    // Handle socket disconnect
    socket.on("disconnect", () => {
      console.log("❌ Customer disconnected:", socket.id);
    });
  });
}
