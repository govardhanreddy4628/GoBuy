import mongoose, { Schema, Document } from "mongoose";

export interface IProductQA extends Document {
  productId: mongoose.Types.ObjectId;
  question: string;
  answer?: string;
  askedBy?: mongoose.Types.ObjectId;
  answeredBy?: mongoose.Types.ObjectId;
  helpfulCount: number;
  createdAt: Date;
}

const schema = new Schema<IProductQA>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: "",
    },
    askedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    answeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProductQA>("ProductQA", schema);