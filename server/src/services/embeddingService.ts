import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001"
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