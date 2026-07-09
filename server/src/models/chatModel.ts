import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true},
    avatar: String,
    isGroup: { type: Boolean, default: false },
    groupAdmins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (this: any) {
        return this.isGroup === true;
      },
    }],
    groupCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // groupName: String,
    groupIcon: { url: String, public_id: String},
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
    lastActivity: { type: Date },
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mutedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        until: Date,
      },
    ],
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    disappearingMessages: {
      isEnabled: { type: Boolean, default: false },
      duration: Number, // seconds
    },
  },
  { timestamps: true },
);

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;
