import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  size?: string;
  color?: string;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

// 🔥 prevent duplicates
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const WishlistModel: Model<IWishlist> = mongoose.model<IWishlist>(
  "Wishlist",
  wishlistSchema
);

export default WishlistModel;