import mongoose, { Schema, Document } from "mongoose";
import { IReview } from "./reviewsModel.js";
import slugifyModule from "slugify";

const slugify = slugifyModule as unknown as (
  input: string,
  options?: { lower?: boolean; strict?: boolean },
) => string;

export interface IEmbeddedOffer {
  type: string;
  description: string;
  offerId?: mongoose.Types.ObjectId;
}

interface ISpecifications {
  key: string; // e.g. "Fabric", "Processor"
  value: string; // e.g. "Cotton", "Intel i7"
  unit?: string; // e.g. "GB", "cm"
  group?: string; // e.g. "Technical Specs", "Material Info"
}

interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  stock: number;
  finalPrice?: number;
  images?: string[];
  active?: boolean;
  specifications?: [ISpecifications];
}

export interface IShipping extends Document {
  isShippable: boolean;
  shippingCost?: number;
  shippingMethods?: {
    carrier: string;
    type: "standard" | "express" | "same-day" | "pickup";
    cost: number;
    estimatedDelivery: {
      minDays: number;
      maxDays: number;
    };
    regions?: string[];
  }[];
  restrictions?: {
    notDeliverableTo?: string[];
    fragile?: boolean;
    hazardous?: boolean;
  };
  handlingTimeInDays?: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: mongoose.Types.ObjectId;
  costPerItem?: number;
  finalPrice?: number;
  listedPrice: number;
  discountPercentage?: number;
  isFeatured?: boolean;
  productRam?: string[];
  productWeight?: string[];
  productColor?: string;
  availableColorsForProduct?: string[];
  brand: string;
  quantityInStock: number;
  recentQuantity: number;
  rating?: number;
  numReviews: number;
  // thumbnails: string[];
  images?: {
    public_id: string;
    url: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    uploadedAt?: Date;
    alt?: string;
    role?: "cover" | "thumbnail" | "gallery";
  }[];
  imageAudit?: {
    public_id?: string;
    action?: "upload" | "delete" | "replace";
    userId?: mongoose.Types.ObjectId;
    timestamp?: Date;
    meta?: Record<string, any>;
  }[];
  availableColors?: mongoose.Schema.Types.Mixed[];
  productMeasurement?: string[];
  sizes?: any[];
  highlights?: string[];
  status?: "active" | "inactive" | "discontinued" | "archived";
  barcode?: string;
  sku?: string;
  shipping?: IShipping;
  availabilityOfShipping?: boolean;
  specifications: ISpecifications[];
  //variants: IVariant[];
  seoTags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  returnPolicy?: string;
  offerIds?: mongoose.Types.ObjectId[]; // references to Offer
  embeddedOffers?: IEmbeddedOffer[]; // lightweight offers for fast reads
  warranty?: string;
  reviews?: IReview[];
  views?: number;
  cartAdds?: number;
  orderedCount?: number;
  product_vector?: number[]; // for vector search
  createdAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

//==============schema=======================
const EmbeddedOfferSchema = new Schema<IEmbeddedOffer>(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
    offerId: { type: Schema.Types.ObjectId, ref: "Offer" },
  },
  { _id: false },
);

const SpecificationsSchema = new Schema<ISpecifications>({
  key: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String },
  group: { type: String },
});

const VariantSchema: Schema = new Schema(
  {
    sku: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    stock: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    active: { type: Boolean, default: true },
    specifications: [SpecificationsSchema],
  },
  { _id: false },
);

export const ShippingSchema: Schema = new Schema(
  {
    isShippable: { type: Boolean, required: true, default: true },
    shippingCost: { type: Number, min: 0 },
    shippingMethods: [
      {
        carrier: { type: String, required: true },
        type: {
          type: String,
          enum: ["standard", "express", "same-day", "pickup"],
          default: "standard",
        },
        cost: { type: Number, min: 0, default: 0 },
        estimatedDelivery: {
          minDays: { type: Number, min: 0 },
          maxDays: { type: Number, min: 0 },
        },
        regions: [{ type: String }], // ISO country codes
      },
    ],

    restrictions: {
      notDeliverableTo: [{ type: String }],
      fragile: { type: Boolean, default: false },
      hazardous: { type: Boolean, default: false },
    },

    handlingTimeInDays: { type: Number, min: 0, default: 0 },
  },
  { _id: false }, // ✅ prevents separate _id for sub-doc
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      //index: true,
    },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },

    costPerItem: { type: Number, min: 0 },

    listedPrice: {
      type: Number,
      required: true,
      min: [1, "Listed price must be at least 1"],
      max: [300000, "Listed price too high"],
    },

    finalPrice: {
      type: Number,
      min: [0, "Final price cannot be negative"],
    },

    discountPercentage: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [99, "Discount cannot exceed 99%"],
      default: 0,
    },

    brand: {
      type: String,
      trim: true,
      lowercase: true,
      //minlength: [2, "Brand name must be at least 2 characters long"],
    },

    warranty: { type: String },

    specifications: [SpecificationsSchema],
    //variants: { type: [VariantSchema], default: [] },
    isFeatured: { type: Boolean, default: false },
    productRam: { type: [String], default: [] },
    productMeasurement: { type: [String], default: [] },
    productWeight: { type: [String], default: [] },
    productColor: { type: String },
    availableColorsForProduct: { type: [String], default: [] },

    //category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    recentQuantity: { type: Number, min: 0, default: 0 },
    quantityInStock: { type: Number, min: 0, default: 0 },

    // thumbnails: {
    //   type: [String],
    //   // validate: [
    //   //   (val: string[]) => val.length > 0,
    //   //   "At least one thumbnail required",
    //   // ],
    // },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        width: Number,
        height: Number,
        format: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
        alt: { type: String, default: "" },
        role: {
          type: String,
          enum: ["cover", "thumbnail", "gallery"],
          default: "gallery",
        },
      },
    ],
    imageAudit: [
      {
        public_id: String,
        action: { type: String, enum: ["upload", "delete", "replace"] },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
        meta: mongoose.Schema.Types.Mixed,
      },
    ],
    sizes: {
      type: [Schema.Types.Mixed], //Schema.Types.Mixed (or just mongoose.Schema.Types.Mixed) defines a Mongoose schema field that holds an array of arbitrary values — in other words, it's an array where each element can be any type (object, string, number, etc.).
      default: [],
    },
    highlights: { type: [String], default: [] },

    // ✅ Embed ShippingSchema
    //shipping: { type: ShippingSchema, default: { isShippable: true } },

    sku: { type: String, unique: true, index: true },
    barcode: {
      type: String,
      //unique: true,
      sparse: true, // ensures uniqueness only for documents with a barcode
      default: null,
    },
    seoTags: { type: [String], default: [] },

    seoTitle: { type: String, maxlength: 60 },
    seoDescription: { type: String, maxlength: 160 },
    returnPolicy: { type: String },

    offerIds: [{ type: Schema.Types.ObjectId, ref: "Offer" }],
    embeddedOffers: [EmbeddedOfferSchema],
    rating: {
      type: Number,
      min: [0, "wrong min rating"],
      max: [5, "wrong max rating"],
      default: 4,
    },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        numReviews: { type: Number, default: 0 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "discontinued", "archived"],
      default: "active",
    },

    views: { type: Number, default: 0 },
    cartAdds: {type: Number, default: 0 },
    orderedCount: { type: Number, default: 0 },

    product_vector: { type: [Number], index: true}, // for vector search

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ✅ Auto-generate slug before saving  //To ensure unique slugs if multiple products have the same name: This will automatically append -1, -2, etc. to ensure uniqueness.
productSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  const Product = mongoose.model("Product", productSchema);
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  this.slug = slug;
  next();
});

//======================== Virtuals & Indexes ========================//

// productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
// productSchema.index({ deleted: 1 });
// productSchema.index({ isFeatured: 1 });

const productModel = mongoose.model<IProduct>("Product", productSchema);
export default productModel;

// const productSchema = new Schema({
//     colors:{ type : [Schema.Types.Mixed] },
//     sizes:{ type : [Schema.Types.Mixed]},
//     discountPrice: { type: Number},
//     thumbnail: {
//        data: Buffer,            //MongoDB (especially with Mongoose) allow storing raw binary data (like images, PDFs, etc.) as buffers. It's a way to embed small files directly into the database document, instead of using a file system or a separate storage service.
//        contentType: String,
//     },
// })

// ❗Important: Enable Virtuals in JSON Output
// Mongoose doesn't include virtuals by default in .toJSON() or .toObject().
// const productSchema = new mongoose.Schema<IProduct>(
//   { /* your fields */ },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

productSchema.pre("save", function (next) {
  const images = this.images || []; // fallback if undefined
  const cover = images.filter((i) => i.role === "cover");
  const thumbs = images.filter((i) => i.role === "thumbnail");

  if (cover.length !== 1)
    return next(new Error("Exactly one cover image required"));

  if (thumbs.length > 2) return next(new Error("Max 2 thumbnails allowed"));

  next();
});
