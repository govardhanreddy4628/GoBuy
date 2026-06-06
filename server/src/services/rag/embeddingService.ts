import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
console.log("gemini API key:", process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001",
});

export async function createEmbedding(text: string) {
  try {
    const result = await model.embedContent(text);
    const vector = result.embedding.values;
    console.log("Embedding length:", vector.length);
    return vector;
  } catch (error) {
    console.error("Embedding error:", error);
    return null;
  }
}



export async function queryEmbedding(query: string = "Green cotton polo tshirt for men") {
  const embedding = await createEmbedding(query);
  console.log("Embedding length:", embedding?.length);
  console.log("First values:", embedding?.slice(0,5));
  return embedding || [];
}
