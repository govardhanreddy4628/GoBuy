import "dotenv/config"; // ✅ MUST be the very first import — loads .env before anything else runs
import "./utils/logger.js";
import { app } from "./app.js";
import "colors";
import connectDB from "./config/connectDB.js";
import redisClient from "./config/connectRedis.js";
import "./jobs/cleanupJob.js";
import "./agent/agent.js";
import { createServer } from "http";
import { initializeSockets } from "./sockets/index.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();           // MongoDB connection
    await redisClient.connect(); // Redis connection

    const httpServer = createServer(app);

    // ✅ Initialize all sockets here
    const io = initializeSockets(httpServer);
    app.set("io", io);    //This stores the Socket.IO instance inside Express. Later, you can access it anywhere like this: const io = req.app.get("io");

    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.bgCyan
          .white
      );
    });
  } catch (error: any) {
  console.error("❌ Server startup error:");
  console.error("message:", error?.message);
  console.error("stack:", error?.stack);
  console.error("full error:", JSON.stringify(error, null, 2));
  process.exit(1);
}
};

startServer();







// // --- src/server.ts ---
// // mongoose.connect(process.env.MONGO_URI!)
// //   .then(() => {
// //     console.log('Connected to MongoDB');
// //     app.listen(5000, () => console.log('Server running on port 5000'));
// //   })
// //   .catch(err => console.error(err));

// //*servers are not computers servers is a software.
// //*app.use() is used for middleware functions and works for all HTTP methods, while app.get() is used specifically for handling GET requests.









