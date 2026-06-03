import { createEmbedding } from "../services/embeddingService.js";
import { vectorSearch } from "../services/vectorService.js";
import productModel from "../models/productModel.js";
import Order from "../models/orderModel.js";
import { generateAIResponse } from "../services/geminiService.js";
import Chat from "../models/aiChatModel.js";

const aiChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_chat", async (userId) => {
      socket.join(userId);

      const history = await Chat.find({ userId }).sort({ createdAt: 1 });
      socket.emit("chat_history", history);
    });

    socket.on("send_message", async ({ userId, message }) => {
      // Save user message
      await Chat.create({ userId, sender: "user", message });

      // Semantic search
      const queryEmbedding = await createEmbedding(message);
      const products = await productModel.find();
      const similarProducts = await vectorSearch(productModel, queryEmbedding);

      const orders = await Order.find({ userId });

      const context = `You are an AI shopping assistant.
      User Orders: ${JSON.stringify(orders)}
      Relevant Products:${JSON.stringify(similarProducts)}
      User Question:${message}`;

      // Streaming Gemini response
      const stream = await generateAIResponse(context);

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.text();
        fullResponse += text;

        socket.to(userId).emit("receive_message", {
          sender: "AI",
          message: text,
        });
      }

      await Chat.create({
        userId,
        sender: "AI",
        message: fullResponse,
      });
    });
  });
};

export default aiChatSocket;
