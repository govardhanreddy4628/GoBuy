import mongoose, { Schema, Document, Types } from "mongoose";
import { embed } from "../services/aiService.js";

export interface IProductVector extends Document {
  productId: Types.ObjectId;
  product_vector: number[];
  searchText: string;

  // optional but production useful
  metadata?: {
    category?: string;
    brand?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}


const productVectorSchema = new Schema<IProductVector>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true, // one vector per product
      index: true
    },
    product_vector: {
      type: [Number],
      required: true
    },
    searchText: {
      type: String,
      required: true
    },
    metadata: {
      category: String,
      brand: String
    }
  },
  {
    timestamps: true
  }
);

export const ProductVector = mongoose.model<IProductVector>("ProductVector", productVectorSchema);