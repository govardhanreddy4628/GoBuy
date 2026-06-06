// scripts/backfillProductVectors.ts
import Product from "../models/productModel.js";
import { ProductVector } from "../models/productVectorModel.js";
import { createEmbedding } from "../services/rag/embeddingService.js";
// import { buildSearchText } from "../utils/buildSearchText.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { buildSearchText } from "../services/rag/buildSerchText.js";

dotenv.config();

const BATCH_SIZE = 20; // safe for API limits

export const backfillProductVectors = async () => {
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const products = await Product.find().skip(skip).limit(BATCH_SIZE);

    if (products.length === 0) {
      hasMore = false;
      break;
    }

    for (const product of products) {
      try {
        // ✅ Check if already exists (IMPORTANT)
        const exists = await ProductVector.findOne({
          productId: product._id,
        });

        if (exists) {
          console.log(`⏭️ Skipped: ${product._id}`);
          continue;
        }

        const searchText = buildSearchText(product);

        const embedding = await createEmbedding(searchText);

        if (!embedding) {
          console.log(`❌ Embedding failed: ${product._id}`);
          continue;
        }

        await ProductVector.create({
          productId: product._id,
          product_vector: embedding,
          searchText,
          metadata: {
            category: product.category,
            brand: product.brand,
          },
        });

        console.log(`✅ Stored: ${product._id}`);
      } catch (err) {
        console.error(`❌ Error: ${product._id}`, err);
      }
    }

    skip += BATCH_SIZE;
  }

  console.log("🎉 Backfill completed");
};



const MONGO_URI = process.env.MONGO_URI!;

async function createProductEmbeddings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected");

    await backfillProductVectors();

    console.log("🎉 Done");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createProductEmbeddings();