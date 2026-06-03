import mongoose, { Schema, Document, Types } from "mongoose";

export type OfferType = "Bank Offer" | "Special Price" | "Coupon" | "Cashback";
export type DiscountType = "FLAT" | "PERCENTAGE";

export interface IOffer extends Document {
  type: OfferType;
  description: string;

  discountValue?: number;
  discountType?: DiscountType;
  maxDiscount?: number;
  minOrderValue?: number;

  applicableBanks?: string[];
  paymentMethods?: string[];
  applicableCategories?: string[];
  applicableProducts?: Types.ObjectId[];

  couponCode?: string;

  validFrom?: Date;
  validTill?: Date;

  usageLimit?: number;
  usageCount?: number;

  isStackable?: boolean;
  priority?: number;

  createdBy?: Types.ObjectId;
  isActive?: boolean;

  terms?: string;
}

const OfferSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Bank Offer", "Special Price", "Coupon", "Cashback"],
    },
    description: { type: String, required: true },
    discountValue: { type: Number, default: 0, required: true },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      default: "FLAT",
    },
    maxDiscount: { type: Number, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    applicableBanks: [String],
    paymentMethods: [String],
    applicableCategories: [String],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    validFrom: Date,
    validTill: Date,
    usageLimit: { type: Number, min:1 },
    usageCount: { type: Number, default: 0 },
    isStackable: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    isActive: { type: Boolean, default: true },
    terms: String,
  },
  { timestamps: true }
);


/* ---------------------- */
/*  Custom Validations    */
/* ---------------------- */

// Coupon must have couponCode
OfferSchema.pre("validate", function (next) {
  if (this.type === "Coupon" && !this.couponCode) {
    return next(new Error("Coupon type must have couponCode"));
  }

  if (
    this.validFrom &&
    this.validTill &&
    this.validTill < this.validFrom
  ) {
    return next(
      new Error("validTill must be greater than validFrom")
    );
  }

  next();
});

/* ---------------------- */
/*  Indexes               */
/* ---------------------- */

OfferSchema.index({ type: 1 });
OfferSchema.index(
  { couponCode: 1 },
  { unique: true, sparse: true }
);
OfferSchema.index({ isActive: 1, validFrom: 1, validTill: 1 });

export const OfferModel =
  mongoose.models.Offer ||
  mongoose.model<IOffer>("Offer", OfferSchema);
