// // controllers/product/productAssistant.ts

// import { Request, Response } from "express";
// import productModel from "../../models/productModel.js";
// import { ProductVector } from "../../models/productVectorModel.js";
// import { getAnswerFromGemini } from "./getAnswersFromLLM.js";
// import { queryEmbedding } from "./embeddingService.js";
// import { vectorSearchAggregationPipeline } from "./vectorSearchService.js";

// export const askProductQuestion = async (req: Request, res: Response) => {
//   const { query, productId } = req.body;

//   if (!query) {
//     return res.status(400).json({ error: "Query is required" });
//   }

//   try {
//     // 1️⃣ Query embedding
//     const embeddedQuery = await queryEmbedding(query);

//     console.log("🔍 Query embedding length:", embeddedQuery.length);

//     // 2️⃣ Search in ProductVector collection
//     let vectorResults = await vectorSearchAggregationPipeline(
//       ProductVector,
//       embeddedQuery,
//     );

//     console.log("📊 Vector results:", vectorResults.length);

//     // 🟡 Fallback if nothing found
//     if (vectorResults.length === 0 && productId) {
//       const product = await productModel.findById(productId);

//       if (!product) {
//         return res.json({ answer: "No relevant information found." });
//       }

//       const context = `
// Product: ${product.name}
// Brand: ${product.brand}
// Price: ₹${product.finalPrice}
// Description: ${product.description}
// `;

//       const answer = await getAnswerFromGemini(query, context);

//       return res.json({ answer });
//     }

//     // 3️⃣ Extract productIds
//     const productIds = vectorResults.map((r) => r.productId);

//     // 4️⃣ Fetch actual products
//     const products = await productModel.find({
//       _id: { $in: productIds },
//     });

//     // 5️⃣ Merge vector + product data
//     const enrichedResults = vectorResults.map((r) => {
//       const product = products.find(
//         (p) => p._id.toString() === r.productId.toString(),
//       );

//       return {
//         name: product?.name,
//         brand: product?.brand,
//         finalPrice: product?.finalPrice,
//         text: r.text,
//         score: r.score,
//       };
//     });

//     // 🔥 Optional: prioritize selected product
//     let finalResults = enrichedResults;

//     if (productId) {
//       finalResults = enrichedResults.sort((a, b) =>
//         a?.name && productId ? -1 : 1,
//       );
//     }

//     // 6️⃣ Build context
//     const context = finalResults
//       .map(
//         (r) => `
// Product: ${r.name}
// Brand: ${r.brand}
// Price: ₹${r.finalPrice}
// Description: ${r.text}
// `,
//       )
//       .join("\n----------------\n");

//     // 7️⃣ Ask Gemini
//     const answer = await getAnswerFromGemini(query, context);

//     return res.json({ answer });
//   } catch (error: any) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// controllers/product/productAssistant.ts

import { Request, Response } from "express";
import productModel from "../../models/productModel.js";
import { ProductVector } from "../../models/productVectorModel.js";
import { getAnswerFromGemini } from "./getAnswersFromLLM.js";
import { queryEmbedding } from "./embeddingService.js";
import { vectorSearchAggregationPipeline } from "./vectorSearchService.js";

let lastCallTime = 0;

export const askProductQuestion = async (req: Request, res: Response) => {
  const { query, productId } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // ✅ rate limit protection
  const now = Date.now();
  if (now - lastCallTime < 1200) {
    return res.json({ answer: "⏳ Please wait a moment..." });
  }
  lastCallTime = now;

  try {
    // ✅ 1. ALWAYS get selected product
    const selectedProduct = productId
      ? await productModel.findById(productId)
      : null;

    // ✅ 2. Build PRIMARY product context
    const selectedContext = selectedProduct
      ? `
PRIMARY PRODUCT (FOCUS ON THIS):
--------------------------------
Name: ${selectedProduct.name}
Brand: ${selectedProduct.brand}
Category: ${selectedProduct.categoryName}
Price: ₹${selectedProduct.finalPrice}
Description: ${selectedProduct.description}
--------------------------------
`
      : "";

    // ✅ 3. Generate embedding
    const embeddedQuery = await queryEmbedding(query);

    // ✅ 4. Vector search (secondary)
    let ragContext = "";

    if (embeddedQuery.length > 0) {
      const vectorResults = await vectorSearchAggregationPipeline(
        ProductVector,
        embeddedQuery,
      );

      if (vectorResults.length > 0) {
        const productIds = vectorResults.map((r) => r.productId);

        const products = await productModel.find({
          _id: { $in: productIds },
        });

        const enrichedResults = vectorResults.map((r) => {
          const product = products.find(
            (p) => p._id.toString() === r.productId.toString(),
          );

          return {
            name: product?.name,
            brand: product?.brand,
            finalPrice: product?.finalPrice,
            text: r.text,
          };
        });

        ragContext = enrichedResults
          .map(
            (r) => `
                Similar Product:
                Name: ${r.name}
                Brand: ${r.brand}
                Price: ₹${r.finalPrice}
                Description: ${r.text}
            `,
          )
          .join("\n----------------\n");
      }
    }

    // ✅ 5. FINAL context (PRIMARY + SECONDARY)
    const finalContext = `
${selectedContext}

OTHER PRODUCTS (ONLY FOR RECOMMENDATION):
${ragContext || "No similar products found"}
`;

    // ✅ 6. Ask LLM
    const answer = await getAnswerFromGemini(query, finalContext);

    return res.json({ answer });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
};
