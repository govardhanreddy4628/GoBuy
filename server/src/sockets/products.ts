export const initProductSocket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("User connected:", socket.id);

    socket.on("join-product", (productId: string) => {
      console.log("Joined room:", productId);
      socket.join(productId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};