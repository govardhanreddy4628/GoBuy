import Product from "../../models/product.js";

export async function getProductContext(message: string) {
  const msg = message.toLowerCase();

  // 🔥 simple keyword search (upgrade later to vector search)
  const products = await Product.find({
    name: { $regex: msg, $options: "i" }
  }).limit(5);

  return products.map(p => `
Product: ${p.name}
Price: ₹${p.price}
Stock: ${p.stock}
Description: ${p.description}
`).join("\n");
}







import productModel from "../../models/productModel.js";
import { ProductVector } from "../../models/productVectorModel.js";
import { queryEmbedding } from "./embeddingService.js";
import { vectorSearchAggregationPipeline } from "./vectorSearchService.js";

export async function getProductContext(query: string, productId?: string) {

  // ✅ PRIMARY PRODUCT
  const selectedProduct = productId
    ? await productModel.findById(productId)
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

  // ✅ VECTOR SEARCH
  const embeddedQuery = await queryEmbedding(query);

  let ragContext = "";

  if (embeddedQuery.length > 0) {
    const vectorResults = await vectorSearchAggregationPipeline(
      ProductVector,
      embeddedQuery
    );

    if (vectorResults.length > 0) {
      const productIds = vectorResults.map(r => r.productId);

      const products = await productModel.find({
        _id: { $in: productIds },
      });

      const enriched = vectorResults.map(r => {
        const product = products.find(
          p => p._id.toString() === r.productId.toString()
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

  return `
${selectedContext}

SIMILAR PRODUCTS:
${ragContext || "No similar products"}
`;
}