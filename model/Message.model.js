import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required."],
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "announcement", "system"],
      default: "text",
    },
    // ⚡ TTL: MongoDB auto-deletes when expiresAt < now
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Fast queries: "get latest messages for a group"
messageSchema.index({ group: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;