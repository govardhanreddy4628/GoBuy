import mongoose from "mongoose";

const AIMessageSchema = new mongoose.Schema(
  {
    sessionId: String,
    role: { type: String, enum: ["user", "assistant"]},
    content: String,
    rating: { type: String, enum: ["like", "dislike"], default: null },
    fileAttachment: {
      name: String,
      size: Number,
      type: String,
      url: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("AIMessage", AIMessageSchema);