import { Server, Socket } from "socket.io";
import {
  addUserSocket,
  removeUserSocket,
  getUserSockets,
} from "./userRegistry.js";
import {
  createCall,
  setCallConnected,
  endCallSession,
} from "./callSession.js";

interface CallData {
  to: string;
  from: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export const initCallSocket = (io: Server, socket: Socket) => {
  const userId = socket.handshake.auth?.userId;

   if (!userId) {
    console.log("❌ No userId in socket auth");
    return;
  }

  // ✅ Register user
  addUserSocket(userId, socket.id);
  console.log(`✅ User ${userId} connected with socket ${socket.id}`);

  // 📞 CALL USER
  socket.on("call:user", ({ to, from, offer }) => {
    const sockets = getUserSockets(to);

    if (!sockets.size) {
      socket.emit("call:failed", { reason: "offline" });
      return;
    }

    const callId = createCall(from, to);

    sockets.forEach((id) => {
      io.to(id).emit("incoming:call", {
        from,
        offer,
        callId,
      });
    });

    // ⏳ AUTO TIMEOUT (30 sec)
    setTimeout(() => {
      io.to(socket.id).emit("call:timeout");
      endCallSession(callId);
    }, 30000);
  });

  // ✅ ACCEPT
  socket.on("call:accept", ({ to, answer, callId }) => {
    setCallConnected(callId);

    getUserSockets(to).forEach((id) => {
      io.to(id).emit("call:accepted", { answer });
    });
  });

  // ❌ REJECT
  socket.on("call:reject", ({ to, callId }) => {
    getUserSockets(to).forEach((id) => {
      io.to(id).emit("call:rejected");
    });

    endCallSession(callId);
  });

  // 🔁 ICE CANDITATE
  socket.on("ice:candidate", ({ to, candidate }: CallData) => {
    getUserSockets(to).forEach((id) => {
      io.to(id).emit("ice:candidate", { candidate });
    });
  });

  // 📞 END
  socket.on("call:end", ({ to, callId }) => {
    getUserSockets(to).forEach((id) => {
      io.to(id).emit("call:ended");
    });

    endCallSession(callId);
  });

  socket.on("disconnect", () => {
    removeUserSocket(socket.id);
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
};