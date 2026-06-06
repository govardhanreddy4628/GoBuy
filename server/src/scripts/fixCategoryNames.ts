import mongoose from "mongoose";
import CategoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

async function runMigration() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected");

    const products = await productModel.find();

    for (const product of products) {
      const category = await CategoryModel.findById(product.category);

      if (category) {
        product.categoryName = category.name;
        await product.save();

        console.log(`✔ Updated: ${product._id}`);
      }
    }

    console.log("🎉 Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();