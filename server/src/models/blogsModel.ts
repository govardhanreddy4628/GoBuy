import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  image: string;
  category: string;
  description?: string;
  content: string;
  createdAt: Date;
}

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);