import mongoose from "mongoose";

const agentMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  userId: { type: String, index: true },
  agentId: { type: String, index: true },
  role: { type: String, enum: ["user", "assistant"] },
  rating: { type: String, enum: ["like", "dislike", null], default: null },
  content: String,
}, { timestamps: true });

agentMessageSchema.index({ userId: 1, agentId: 1, createdAt: -1 });

const agentMessage = mongoose.model("AgentMessage", agentMessageSchema);
export default agentMessage;