import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    type: {
      type: String,
      enum: ["voice", "video"],
    },

    status: {
      type: String,
      enum: ["missed", "rejected", "answered", "ended"],
    },

    startedAt: Date,
    endedAt: Date,

    duration: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Call", callSchema);