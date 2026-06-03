import Message from "../models/Message.js";
import { generateAIResponse } from "../controllers/aiController.js";

const activeHumanChats = new Map(); // Stores userId -> true

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    
    // User joins their unique room
    socket.on("join_chat", async (userId) => {
      socket.join(userId);
      const history = await Message.find({ userId }).sort({ createdAt: 1 }).limit(50);
      socket.emit("chat_history", history);
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      const { userId, message, sender } = data; // sender is 'user' or 'Admin'

      // 1. Save User/Admin message to DB
      await Message.create({ userId, sender, message });

      // 2. If Admin sent it, just broadcast to user
      if (sender === "Admin") {
        return io.to(userId).emit("receive_message", { sender: "Admin", message });
      }

      // 3. If User sent it, check if a human is already handling it
      if (activeHumanChats.has(userId)) {
        // Broadcast user message so Admin sees it in real-time
        return io.to(userId).emit("receive_message", { sender: "user", message });
      }

      // 4. AI Logic (Only if no human is active)
      const aiResult = await generateAIResponse(message);

      if (aiResult.needsEscalation) {
        activeHumanChats.set(userId, true);
        // Alert all connected admins
        io.emit("admin_alert", { userId, reason: aiResult.reason });
        
        const sysMsg = "I'm connecting you to a human agent for further help.";
        await Message.create({ userId, sender: "System", message: sysMsg });
        io.to(userId).emit("receive_message", { sender: "System", message: sysMsg });
      } else {
        await Message.create({ userId, sender: "AI", message: aiResult.text });
        io.to(userId).emit("receive_message", { sender: "AI", message: aiResult.text });
      }
    });

    // Admin takes over a specific user's chat
    socket.on("admin_takeover", (userId) => {
      activeHumanChats.set(userId, true);
      socket.join(userId); // Admin joins the user's room
      io.to(userId).emit("receive_message", { 
        sender: "System", 
        message: "An admin has joined the chat." 
      });
    });
  });
};





import { generateGeminiResponse } from "../controllers/aiController.js";

export const initializeSocket = (io) => {
  const activeHumanChats = new Map(); // Track ongoing human escalations

  io.on("connection", (socket) => {
    
    socket.on("join_chat", async (userId) => {
      socket.join(userId);
      const history = await Message.find({ userId }).sort({ createdAt: 1 });
      socket.emit("chat_history", history);
    });

    socket.on("send_message", async ({ userId, message }) => {
      await Message.create({ userId, sender: 'user', message });

      // Check if Human is already talking
      if (activeHumanChats.get(userId)) {
        return; // Admin handles this
      }

      // Check for Manual Escalation Keywords
      const isManual = ["human", "agent"].some(k => message.toLowerCase().includes(k));
      const aiResult = await generateGeminiResponse(message);

      if (isManual || aiResult.needsEscalation) {
        activeHumanChats.set(userId, true);
        io.emit("admin_alert", { userId, reason: aiResult.reason || "User Request" });
        io.to(userId).emit("receive_message", { sender: 'AI', message: "Connecting you to an agent..." });
      } else {
        await Message.create({ userId, sender: 'AI', message: aiResult.text });
        io.to(userId).emit("receive_message", { sender: 'AI', message: aiResult.text });
      }
    });

    socket.on("admin_takeover", (userId) => {
      activeHumanChats.set(userId, true);
      io.to(userId).emit("receive_message", { sender: 'admin', message: "Agent has joined." });
    });
  });
};