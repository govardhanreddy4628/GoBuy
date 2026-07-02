import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAnswer(
  question: string,
  context: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const prompt = `
You are an intelligent e-commerce assistant.

You can answer questions about:
- Orders
- Cart
- Products

RULES:
- Use context strictly
- Be natural and helpful
- If missing data → say "I couldn't find that"
- If product context exists → prioritize it

----------------
CONTEXT:
${context}

----------------
USER QUESTION:
${question}

----------------
FINAL ANSWER:
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}