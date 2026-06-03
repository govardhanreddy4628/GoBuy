import mongoose from "mongoose";

const agentConversationSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  agentId: { type: String, index: true },
  title: String,
}, { timestamps: true });

// ✅ renamed model
const AgentConversation = mongoose.models.AgentConversation || mongoose.model("AgentConversation", agentConversationSchema);

export default AgentConversation;