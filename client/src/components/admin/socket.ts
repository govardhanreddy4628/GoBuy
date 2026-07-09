import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../../api/api_utility";

const backendUrl = import.meta.env.VITE_BACKEND_URL_LOCAL as string;
if (!backendUrl) {
  throw new Error("Backend URL is not defined");
}

// ✅ SINGLE GLOBAL SOCKET
export const socket: Socket = io(backendUrl + "/admin", {
  autoConnect: false,
  withCredentials: true, // Add this at the top level
  transports: ["websocket", "polling"], // Add polling as fallback
  transportOptions: {
    websocket: {
      withCredentials: true,
    },
  },
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// ✅ HELPER FUNCTION TO CONNECT WITH TOKEN
export const connectSocket = () => {
  const token = getAccessToken();

  socket.auth = { token }; // 🔥 IMPORTANT
  socket.connect();
};
