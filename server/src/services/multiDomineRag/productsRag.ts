import productModel from "../../models/productModel.js";
import { ProductVector } from "../../models/productVectorModel.js";
import { queryEmbedding } from "../rag/embeddingService.js";
import { vectorSearchAggregationPipeline } from "../rag/vectorSearchService.js";


type VectorResult = {
  productId: string;
  text: string;
  score?: number;
};

export async function getProductContext(
  query: string,
  productId?: string
): Promise<string> {
  const msg = query.toLowerCase();

  /* ---------------- PRIMARY PRODUCT ---------------- */
  const selectedProduct = productId
    ? await productModel.findById(productId).lean()
    : null;

  const selectedContext = selectedProduct
    ? `
PRIMARY PRODUCT:
Name: ${selectedProduct.name}
Brand: ${selectedProduct.brand}
Category: ${selectedProduct.categoryName}
Price: ₹${selectedProduct.finalPrice}
Description: ${selectedProduct.description}
`
    : "";

  /* ---------------- KEYWORD SEARCH (IMPORTANT) ---------------- */
  const keywordProducts = await productModel
    .find({
      name: { $regex: msg, $options: "i" },
    })
    .limit(5)
    .lean();

  const keywordContext = keywordProducts
    .map(
      (p) => `
Matched Product:
Name: ${p.name}
Price: ₹${p.finalPrice}
Stock: ${p.quantityInStock}
Description: ${p.description}
`
    )
    .join("\n");

  /* ---------------- VECTOR SEARCH ---------------- */
  const embeddedQuery = await queryEmbedding(query);

  let ragContext = "";

  if (embeddedQuery.length > 0) {
    const vectorResults: VectorResult[] = await vectorSearchAggregationPipeline(
      ProductVector,
      embeddedQuery
    );

    if (vectorResults.length > 0) {
      const productIds = vectorResults.map((r:VectorResult) => r.productId);

      const products = await productModel
        .find({ _id: { $in: productIds } })
        .lean();

      const enriched = vectorResults.map((r:VectorResult) => {
        const product = products.find(
          (p) => p._id.toString() === r.productId.toString()
        );

        return `
Similar Product:
Name: ${product?.name}
Price: ₹${product?.finalPrice}
Description: ${r.text}
`;
      });

      ragContext = enriched.join("\n---\n");
    }
  }

  /* ---------------- FINAL CONTEXT ---------------- */

  return `
${selectedContext}

KEYWORD MATCHES:
${keywordContext || "No direct matches"}

SIMILAR PRODUCTS:
${ragContext || "No similar products"}
`;
}