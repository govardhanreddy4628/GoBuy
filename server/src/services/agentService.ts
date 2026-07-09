import { executeTool } from "./agentTools.js";
import { getLLMWithFallback } from "./llmService.js";
import {saveMessage,updateConversationTime} from "./memoryService.js";


type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function runAgent({
  userId, 
  agent, 
  input, 
  history = []
} : {
  userId: string;
  agent: any;
  input: string;
  history?: ChatMessage[]; // ✅ FIX
}) {

  const llm = await getLLMWithFallback(agent);

  const messages: ChatMessage[] = [
    {role: "system", content: agent.settings.systemPrompt},
    ...history,
    {role: "user", content: input},
  ];

  const response = await llm.invoke(messages);
  return response.content;
}



function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}



// // /agents/executor.ts
// export async function runAutonomousAgent({
//   systemPrompt,
//   userMessage,
//   history
// }) {
//   let steps = 0;
//   const MAX_STEPS = 5;

//   let messages = [
//     { role: "system", content: systemPrompt },
//     ...history,
//     { role: "user", content: userMessage }
//   ];

//   while (steps < MAX_STEPS) {
//     const ai = await callLLM(messages);
//     const parsed = safeJsonParse(ai);

//     // 🧠 If AI wants tool
//     if (parsed?.action === "tool_call") {
//       const result = await executeTool(parsed.tool, parsed.params);

//       messages.push({ role: "assistant", content: ai });
//       messages.push({
//         role: "tool",
//         content: JSON.stringify(result)
//       });

//       steps++;
//       continue;
//     }

//     // ✅ Final answer
//     return ai;
//   }

//   return "Max steps reached. Could not complete request";
// }


export async function runAutonomousAgent({
  systemPrompt,
  userMessage,
  history,
  onToken,
  onEvent
}: any) {
  let messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage }
  ];

  onEvent?.("thinking", { text: "Understanding problem..." });

  const ai = await callLLM(messages);

  const parsed = safeJsonParse(ai);

  if (parsed?.action === "tool_call") {
    onEvent?.("tool", {
      name: parsed.tool,
      params: parsed.params
    });

    const result = await executeTool(parsed.tool, parsed.params);

    onEvent?.("thinking", { text: "Processing tool results..." });

    const final = await callLLM([
      ...messages,
      { role: "tool", content: JSON.stringify(result) }
    ]);

    return final;
  }

  return ai;
}