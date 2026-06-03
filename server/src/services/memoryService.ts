import agentMessage from "../models/agentMessageModel.js";
import Conversation from "../models/agentConversationModel.js";


export async function saveMessage(data: any) {
  return agentMessage.create(data);
}

export async function updateConversationTime(conversationId: string) {
  return Conversation.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });
}


function getRecentMessages(conversationId: string) {
  return agentMessage
    .find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

function getConversationSummary(conversationId: string) {
  // For simplicity, we return a static summary. In production, you'd generate this using an LLM.
}

export async function getHistory(conversationId: string) {
    const history = await getRecentMessages(conversationId);
    const summary = await getConversationSummary(conversationId);
    
    const finalHistory = [
      { role: "system", content: `Summary: ${summary}` },
      ...history
    ];
    return finalHistory;
  }