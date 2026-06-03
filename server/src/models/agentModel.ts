import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema({
  id: {type: String, required: true,unique: true},
  name: String,
  type: String,
  description: String,
  icon: String,
  //color: String,
  //provider: { type: String, default: "groq" }, // groq | ollama
  //model: { type: String, required: true },
  settings: {
    temperature: Number,
    maxTokens: Number,
    systemPrompt: String,
    enableFileUpload: Boolean,
    enableHistory: Boolean
  }
});

export default mongoose.model("Agent", AgentSchema);