import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/ollama";

export function getLLM(agent: any) {
  if (agent.provider === "groq") {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: agent.model,
      temperature: agent.settings.temperature,
    });
  }

  if (agent.provider === "ollama") {
    return new ChatOllama({
      model: agent.model,
    });
  }

  throw new Error("Unsupported provider");
}


export async function getLLMWithFallback(agent: any) {
  try {
    return getLLM(agent);
  } catch (err) {
    console.log("Primary model failed, using fallback");

    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-70b-8192",
    });
  }
}