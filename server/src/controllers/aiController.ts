import { GoogleGenerativeAI } from "@google/generative-ai";
import Order from "../models/orderModel.js";
import productModel from "../models/productModel.js";

interface AIResponse {
  text: string;
  needsEscalation: boolean;
  reason: string | null;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004"
});

export const generateGeminiResponse = async (
  userMessage: string,
  userId: string
): Promise<AIResponse> => {
  try {
    // 1️⃣ Create embedding
    const embeddingResult = await embeddingModel.embedContent(userMessage);
    const queryVector = embeddingResult.embedding.values;

    // 2️⃣ Vector search in MongoDB Atlas
    const products = await productModel.aggregate<any>([
      {
        $vectorSearch: {
          index: "product_vector_index",
          path: "product_vector",
          queryVector,
          numCandidates: 50,
          limit: 4
        }
      }
    ]);

    // 3️⃣ Fetch user orders
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // 4️⃣ Escalation detection
    const negativeSentiment =
      /angry|bad|scam|terrible|refund|human|agent/i.test(userMessage);

    const needsEscalation = negativeSentiment || products.length === 0;

    // 5️⃣ Build AI Context
    const productContext = products
      .map(p => `${p.name} - ₹${p.price}. ${p.description}`)
      .join("\n");

    const orderContext = orders
      .map(o => `Order ${o._id} - Status: ${o.status} - ₹${o.totalAmount}`)
      .join("\n");

    const prompt = `
You are an intelligent E-commerce assistant.

User Orders:
${orderContext || "No recent orders."}

Relevant Products:
${productContext || "No matching products found."}

User Question:
${userMessage}

Instructions:
- Be concise.
- Recommend products if relevant.
- If unsure, suggest human agent.
`;

    const result = await chatModel.generateContent(prompt);

    return {
      text: result.response.text(),
      needsEscalation,
      reason: needsEscalation
        ? "Low confidence or negative sentiment"
        : null
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "I'm having trouble connecting. Let me connect you to an agent.",
      needsEscalation: true,
      reason: "System error"
    };
  }
};