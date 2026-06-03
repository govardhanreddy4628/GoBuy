// // // models/searchAnalyticsModel.ts
// // import mongoose, { Schema, Document } from "mongoose";

// // interface ISearchAnalytics extends Document {
// //   term: string;
// //   count: number;
// // }

// // const searchAnalyticsSchema = new Schema<ISearchAnalytics>(
// //   {
// //     term: { type: String, required: true, unique: true },
// //     count: { type: Number, default: 1 }
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model<ISearchAnalytics>(
// //   "SearchAnalytics",
// //   searchAnalyticsSchema
// // );



// models/searchAnalyticsModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISearchAnalytics extends Document {
  term: string;
  count: number;
  entityType?: "product" | "category" | "brand";
  entityId?: mongoose.Types.ObjectId | string;
}

const searchAnalyticsSchema = new Schema<ISearchAnalytics>(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    count: {
      type: Number,
      default: 1
    },

    entityType: {
      type: String,
      enum: ["product", "category", "brand"],
      default: "product"
    },

    entityId: {
      type: Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Fast trending queries
searchAnalyticsSchema.index({ count: -1 });

export default mongoose.model<ISearchAnalytics>( "SearchAnalytics", searchAnalyticsSchema);