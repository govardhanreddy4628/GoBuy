import { Server, Socket } from "socket.io";
import { aiQueue } from "../aiWorker/queue.js";       // Queue for processing AI messages asynchronously
import conversation from "../models/aiConversation.js";
import assistantMessageModal from "../models/assistantMessageModal.js";
import * as aiService from "../services/aiService.js"; // Service for AI message streaming

const activeHumanChats = new Map<string, boolean>();

export function initAssistantChat(io: Server) {
  // ---------------- AI WORKER QUEUE ----------------
  // Listen for 'process' events from aiQueue to handle AI responses
  aiQueue.on("process", async (job) => {
    const { conversationId, userId, systemPrompt, userPrompt, socketRoom, isManual } = job;

    // Notify clients in the room that AI is typing
    io.to(socketRoom).emit("ai_typing");

    let fullText = "";

    // Stream AI response in chunks
    await aiService.chatStream(
      [
        { role: "system", content: systemPrompt }, // System prompt (instructions)
        { role: "user", content: userPrompt },     // User message
      ],
      (chunk: string) => {
        fullText += chunk;

        // Emit each chunk as it arrives
        io.to(socketRoom).emit("ai_message_chunk", { conversationId, chunk });
      },
      async (finalText: string) => {
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

        // 🚨 Escalation
        if (isManual || finalText.toLowerCase().includes("agent")) {
          activeHumanChats.set(userId, true);

          io.emit("admin_alert", { userId });

          io.to(socketRoom).emit("receive_message", {
            sender: "System",
            message: "Connecting you to a human agent...",
          });
        }
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
    socket.on("join_chat", async ({ userId, conversationId }) => {
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
      socket.emit("chat_history", recent.reverse());
    });

    /**
     * Handle messages from the user
     */
    socket.on("send_message", async (payload) => {
      const { message: text, metadata } = payload;
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

       // 🧑‍💼 Human takeover
      if (activeHumanChats.get(userId)) return;

      // Manual escalation
      const isManual = ["human", "agent"].some(k =>
        text.toLowerCase().includes(k)
      );

      // Build AI prompt using last 6 messages for context
      const history = await assistantMessageModal.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      const contextText = history.reverse().map((h) => `${h.role.toUpperCase()}: ${h.text}`).join("\n");

      const systemPrompt = "You are a concise shopping assistant. Use context when available. Do not request PII.";
      const userPrompt = `${contextText}\nUSER: ${text}`;

      // Enqueue AI processing
      aiQueue.enqueue({ conversationId, userId, systemPrompt, userPrompt, socketRoom: conversationId , isManual});
    });

     // ADMIN TAKEOVER
    socket.on("admin_takeover", (userId: string) => {
      activeHumanChats.set(userId, true);

      const room = socket.data.conversationId;
      socket.join(room);

      io.to(room).emit("receive_message", {
        sender: "System",
        message: "Admin joined the chat.",
      });
    });

    // Handle socket disconnect
    socket.on("disconnect", () => {
      console.log("❌ Customer disconnected:", socket.id);
    });
  });
}
