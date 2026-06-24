import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "location",
        "contact",
        "sticker",
        "system",
        "call",
      ],
      default: "text",
    },

    text: String,

    media: [
      {
        url: String,
        public_id: String,
        mimeType: String,
        type: String,
        size: Number,
        duration: Number,
        thumbnail: String,
      },
    ],

    isMixedMedia: { type: Boolean, default: false },

    location: {
      lat: Number,
      lng: Number,
      address: String,
    },

    contact: {
      name: String,
      phoneNumber: String,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    forwarded: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },

    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: Date,
      },
    ],

    deliveredTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: Date,
      },
    ],

    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],

    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    edited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);





  
  // const messageSchema = new mongoose.Schema({
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true},
//     chatType: String,  // e.g., 'ai' or 'human'
//     content: { type: String, trim: true, },
//     attachments: [
//       {
//         public_id: {type: String, required: true},
//         url: {type: String, required: true}
//       }
//     ],
//     readby: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// )

// export default mongoose.model("Message", messageSchema);

