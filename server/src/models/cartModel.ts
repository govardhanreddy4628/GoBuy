import mongoose, { Schema, Document, Model } from 'mongoose';
export interface ICart extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  userId: mongoose.Types.ObjectId;
  size?: unknown; // Mixed can be unknown or any
  color?: unknown;
  expiresAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    //   items: [{ productId: { type: mongoose.Types.ObjectId, ref: "Product" }, qty: Number }],
    size: { type: Schema.Types.Mixed },
    color: { type: Schema.Types.Mixed },
     // 👇 Cart expiration after 60 days
    expiresAt: {
      type: Date,
      required: true,
      default: () =>
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  },
  { timestamps: true } // ✅ corrected spelling
);

// 🔥 TTL Index (Mongo auto deletes)
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.index(
  { userId: 1, productId: 1, size: 1, color: 1 },
  { unique: true }
);

// Virtual field
cartSchema.virtual('id').get(function (this: ICart) {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

// Transform JSON output
cartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    delete ret._id;
  },
});

const CartModel: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);
export default CartModel;