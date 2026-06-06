import { ProductVector } from "../models/productVectorModel.js";
import { buildSearchText } from "../services/rag/buildSerchText.js";
import { createEmbedding } from "../services/rag/embeddingService.js";

export async function syncProductEmbedding(product: any) {
  const searchText = buildSearchText(product);
  const embedding = await createEmbedding(searchText);

  await ProductVector.findOneAndUpdate(
    { productId: product._id },
    {
      product_vector: embedding,
      searchText,
      metadata: {
        category: product.categoryName,
        brand: product.brand
      }
    },
    { upsert: true }
  );
}