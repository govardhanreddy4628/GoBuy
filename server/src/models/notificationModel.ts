import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: String, // message, call, group, etc.

    data: Object,

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);