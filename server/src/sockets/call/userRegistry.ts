const userSocketMap = new Map<string, Set<string>>();

export const addUserSocket = (userId: string, socketId: string) => {
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId)!.add(socketId);
};

export const removeUserSocket = (socketId: string) => {
  for (const [userId, sockets] of userSocketMap.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
      }
      break;
    }
  }
};

export const getUserSockets = (userId: string) => {
  return userSocketMap.get(userId) || new Set();
};