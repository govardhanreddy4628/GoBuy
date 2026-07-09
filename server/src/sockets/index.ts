import { Server } from "socket.io";
import { initProductSocket } from "./products.js";
import aiChatSocket from "./aiChatSocket.js";
import { socketAuthenticator } from "../middleware/socketAuthenticator.js";
import { initAdminChat } from "./initAdminChat.js";
import { initAssistantChat } from "./initAssistantChat.js";
import { initCallSocket } from "./call/initCallSocket.js";
import { initMediasoupSocket } from "./call/mediasoup.socket.js";

let io: Server;

export function initializeSockets(server: any) {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL_DEV!,
        process.env.CLIENT_URL_PROD!,
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Global auth middleware
  io.use((socket, next) => socketAuthenticator(socket, next));

  // Use separate namespaces
  const adminNamespace = io.of("/admin");
  const assistantNamespace = io.of("/assistant");

  adminNamespace.use((socket, next) => socketAuthenticator(socket, next));
  assistantNamespace.use((socket, next) => socketAuthenticator(socket, next));

  // ✅ Keep ALL features
  // Initialize chat modules
  initAdminChat(adminNamespace);

  // Assistant remains separate (AI logic)
  initAssistantChat(assistantNamespace);

  initProductSocket(io);
  aiChatSocket(io);

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);
    initCallSocket(io, socket);
    initMediasoupSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
}

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
