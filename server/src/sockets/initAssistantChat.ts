import { Namespace, Socket } from "socket.io";
import { aiQueue } from "../aiWorker/queue.js"; // Queue for processing AI messages asynchronously
import conversation from "../models/aiConversation.js";
import assistantMessageModal from "../models/assistantMessageModal.js";
import * as aiService from "../services/aiService.js"; // Service for AI message streaming


export function detectIntent(message: string) {
  const msg = message.toLowerCase();

  if (msg.includes("order")) return "order_status";
  if (msg.includes("recommend")) return "product_recommend";
  if (msg.includes("shipping")) return "shipping";
  if (msg.includes("return") || msg.includes("refund")) return "returns";
  if (msg.includes("cart")) return "cart";

  return "general";
}

export function buildSystemPrompt(intent: string) {
  switch (intent) {
    case "order_status":
      return "You are an ecommerce assistant. Help user track orders. Ask for order ID if missing.";

    case "product_recommend":
      return "Recommend products based on user needs. Be concise and helpful.";

    case "shipping":
      return "Explain shipping options, delivery timelines, and costs clearly.";

    case "returns":
      return "Explain return and refund policy in simple terms.";

    case "cart":
      return "Help user manage cart issues like adding/removing products.";

    default:
      return "You are a helpful ecommerce AI assistant. Be concise.";
  }
}


const activeHumanChats = new Map<string, boolean>();

export function initAssistantChat(io: Namespace) {
  // ---------------- AI WORKER QUEUE ----------------
  // Listen for 'process' events from aiQueue to handle AI responses
  aiQueue.on("process", async (job) => {
    const {
      conversationId,
      userId,
      userPrompt,
      socketRoom,
      isManual,
    } = job;

    const intent = detectIntent(userPrompt);
    const systemPrompt = buildSystemPrompt(intent);

    // Notify clients in the room that AI is typing
    io.to(socketRoom).emit("ai_typing");

    let fullText = "";

    // Stream AI response in chunks
    await aiService.chatStream(
      [
        { role: "system", content: systemPrompt }, // System prompt (instructions)
        { role: "user", content: userPrompt }, // User message
      ],
      (chunk: string) => {
        fullText += chunk;

        // Emit each chunk as it arrives
        io.to(socketRoom).emit("ai_message_chunk", { chunk });
      },
      async (finalText: string) => {
        // When AI finishes, emit final message
        io.to(socketRoom).emit("ai_message_done", {
          conversationId,
          finalText,
        });

        // Save AI message to DB
        await assistantMessageModal.create({
          conversationId,
          role: "assistant",
          text: finalText,
          //userId: null, // AI messages have no user
        });

        // Update conversation timestamp
        await conversation
          .findByIdAndUpdate(conversationId, { lastMessageAt: new Date() })
          .catch(() => {});

        // 🚨 Escalation
        if (isManual || finalText.toLowerCase().includes("agent")) {
          activeHumanChats.set(userId, true);

          io.emit("admin_alert", { userId });

          io.to(socketRoom).emit("receive_message", {
            sender: "System",
            message: "Connecting you to a human agent...",
          });
        }
      },
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
          (await conversation.create({ userId })); // or create new
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

    /* Handle messages from the user */
    socket.on("send_message", async ({ message }) => {
      const { userId, conversationId } = socket.data;

      if (!conversationId) {
        return socket.emit("error", { message: "No conversation joined" });
      }

      // Save user message to database
      const created = await assistantMessageModal.create({
        conversationId,
        userId,
        role: "user",
        text: message,
      });

      // Broadcast message to all clients in the conversation room
      io.to(conversationId).emit("receive_message", {
        sender: "user",
        message,
      });

      // 🧑‍💼 Human takeover
      if (activeHumanChats.get(userId)) return;

      // Manual escalation
      const isManual = ["human", "agent"].some((k) =>
        message.toLowerCase().includes(k),
      );

      // Build AI prompt using last 6 messages for context
      const history = await assistantMessageModal
        .find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      const context = history
        .reverse()
        .map((h) => `${h.role.toUpperCase()}: ${h.text}`)
        .join("\n");

      const systemPrompt = "You are a concise shopping assistant. Use context when available. Do not request PII.";
      const userPrompt = `${context}\nUSER: ${message}`;

      // Enqueue AI processing
      aiQueue.enqueue({
        conversationId,
        userId,
        systemPrompt,
        userPrompt,
        socketRoom: conversationId,
        isManual,
      });
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
