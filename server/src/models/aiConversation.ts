import mongoose from "mongoose";

const aiConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  title: String,
  aiSummary: String,
  lastMessageAt: { type: Date, default: Date.now },
  assignedAgentId: { type: mongoose.Types.ObjectId, ref: "User" },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ renamed model
const AIConversation = mongoose.models.AIConversation ||  mongoose.model("AIConversation", aiConversationSchema);

export default AIConversation;