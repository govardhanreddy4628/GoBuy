import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema({
  userId: String,
  sender: String, // user | AI | admin
  message: String
}, { timestamps: true });

export const AIChatModel = mongoose.models.AIChat || mongoose.model("AIChat", aiChatSchema);

export default AIChatModel;