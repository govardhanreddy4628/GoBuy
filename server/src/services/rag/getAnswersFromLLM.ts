import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getAnswerFromGemini(query: string, context: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

     const prompt = `
You are a smart and friendly e-commerce assistant.

🚨 VERY IMPORTANT:
The user is CURRENTLY VIEWING ONE PRODUCT.

STRICT RULES:
- ALWAYS answer about the PRIMARY PRODUCT
- NEVER ask "which product"
- NEVER list all products unless user asks
- Use OTHER PRODUCTS only for recommendations
- If question says "this", "it", etc → it refers to PRIMARY PRODUCT
- Be natural, clear, and helpful


IF USER ASKS ABOUT:
- Name → give exact product name
- Recommendation → suggest similar products (use context)
- Comparison → compare with similar products (use context)
- Quality → analyze based on features (use context)
- Answer based on the given product context
- Understand user intent (name, recommendation, comparison, quality, etc.)
- Give clean, human-like answers (not robotic)

RULES:
1. If context has product info → use it
2. If context is EMPTY → say:
   "I couldn’t find relevant products, but here are some general suggestions..."
3. NEVER repeat the same fallback response again and again
4. Be helpful, conversational, and concise

---------------------
CONTEXT:
${context || "No product data available"}

---------------------
USER QUESTION:
${query}

---------------------
RESPONSE FORMAT:

- If asking product name → give exact name
- If asking recommendation → suggest similar products
- If asking yes/no → explain briefly
- If multiple products → compare clearly

FINAL ANSWER:
`;
    const result = await model.generateContent(prompt);

    // ✅ safer extraction
    const text = result.response.text();

    return text || "Sorry, I couldn't generate a response.";


  } catch (err: any) {
    // This helps see if the error is coming from the API response or the SDK itself
    if (err.response) {
        console.error("Gemini API Details:", err.response.data);
    }
    console.error("Gemini error FULL:", err.message); 
    return "Something went wrong.";
}
}