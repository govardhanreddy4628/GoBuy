import "dotenv/config";
import express from "express"; //refer API reference of express site for more info.
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import http from "http";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.js";
import cartRouter from "./routes/cartRoute.js";
import { Message } from "./models/MessageModel.js";
import rateLimit from "express-rate-limit";
import { customersData } from "./data/customers.js";
import * as ai from "./services/aiService.js";
import { Server } from "socket.io";
import { handleQuery } from "./controllers/assistantController.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import offersRoutes from "./routes/offersRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import couponRouter from "./routes/couponRoute.js";
// import orderRoutes from "./routes/orderRoute.js";

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/functions.js";
import { initAdminChat } from "./sockets/initAdminChat.js";
import { initAssistantChat } from "./sockets/initAssistantChat.js";
import { socketAuthenticator } from "./middleware/socketAuthenticator.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import calendarRouter from "./routes/calendarRoutes.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reviewsRouter from "./routes/reviewRoutes.js";
import questionsRouter from "./routes/prodQARoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import agentRouter from "./routes/agentRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import { initializeSockets } from "./sockets/index.js";
import { inngestHandler } from "./inngest/handler.js";
import logoRouter from "./routes/logoRoutes.js";
//import authRoutes from "./routes/authRoutes.js"

const app = express();

// ---------------- CORS ----------------
const prodOrigins = process.env.CLIENT_URLS_PROD
  ? process.env.CLIENT_URLS_PROD.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : [];

const allowedOrigins = [process.env.CLIENT_URL_DEV, ...prodOrigins].filter(
  Boolean,
);

const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    console.log("🌍 Incoming origin:", origin);
    console.log("📌 Allowed origins:", allowedOrigins);

    // ✅ Allow requests with no origin (Postman, mobile apps, etc.) // 🚫 Skip logging for server-to-server requests (like Inngest)
    if (!origin) return callback(null, true);

    // 🧪 DEVELOPMENT → allow all
    if (!isProd) {
      // ✅ Only log real browser requests
      console.log("🧪 DEV CORS ORIGIN CHECK:", origin);
      return callback(null, true);
    }

    // 🚀 PRODUCTION → strict allow
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("ENV CLIENT_URLS_PROD:", process.env.CLIENT_URLS_PROD);
    console.log("ALLOWED ORIGINS:", allowedOrigins);
    console.log("❌ Blocked by CORS:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// default middleware for any mern project
app.use(cors(corsOptions)); // refer npm cors site for more info. and this middleware should be at top.
app.set("trust proxy", 1);

// ✅ Handle preflight requests globally
app.options("*", cors(corsOptions));

// app.use((req, res, next) => {
//   console.log("HEADERS SENT:", res.getHeaders());
//   next();
// });

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/inngest")) return next();

  console.log("HEADERS SENT:", res.getHeaders());
  next();
});

// ---------------- DEBUG ----------------
// app.use((req, res, next) => {
//   console.log("🌍 CORS origin received:", req.headers.origin);
//   next();
// });

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/inngest")) return next();

  console.log("🌍 CORS origin received:", req.headers.origin);
  next();
});

// ---------------- MIDDLEWARE ----------------
app.use(cookieParser());
app.use(express.static("public")); //public is a folder name where we can store images (server static assets)
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(helmet({ crossOriginResourcePolicy: false }));
// app.use(morgan("dev"));

app.use(
  morgan("dev", {
    skip: (req) => req.originalUrl.includes("/api/inngest"),
  }),
);
// This will hide all Inngest logs in terminal since they are very repetitive. You can customize the skip condition as needed.
//app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ---------------- INNGEST ----------------
app.use("/api/inngest", inngestHandler);

// ---------------- Health Route ------------
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ---------------------- API ROUTES ----------------------
app.use("/api/v1/user", userRoutes);
//app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/offers", offersRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/calendar", calendarRouter);
// app.use("/api/v1/coupons", couponRouter);
// app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/product-qa", questionsRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/searchbar", searchRouter);
// app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/logos", logoRouter);

app.use("/api/v1/agents", agentRouter);
//app.post("/assistant/query", handleQuery);

app.use("/api/v1/customers", (req, res) => {
  res.status(200).json(customersData);
});

app.get("/api/getkey", (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
});

// const io = app.get("io");
// io.use((socket, next) => {socketAuthenticator(socket, next)});

// Optional: Get chat history
app.get("/api/messages/:userId", async (req, res) => {
  const messages = await Message.find({
    $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }],
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/", (req, res) => {
  res.send("Socket.IO server is running...");
});

// ---------------------- Middleware to log cookies ----------------------
// res.send is the Express method used to send a response back to the client. This middleware overwrites res.send temporarily to log the Set-Cookie headers every time the server sends a response.so below code logs cookies in dev. remove it in production.
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (...args) {
      console.log("Set-Cookie headers:", res.getHeader("Set-Cookie"));
      return originalSend.apply(this, args);
    };
    next();
  });
}

// const DIRNAME = path.resolve();
// app.use(express.static(path.join(DIRNAME, "/client/dist")));  // React build files
// app.use("*", (_, res) => {
//   res.sendFile(path.resolve(DIRNAME, "client", "dist", "index.html"));
// });

// 404 handler for API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// // // Error handler (must be at last in code)
app.use(errorHandler);

export { app }; // export the server
