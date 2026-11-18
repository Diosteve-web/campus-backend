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
    // ⚡ THE MAGIC: TTL index deletes this automatically
    expiresAt: {
      type: Date,
      index: { expires: 0 },   // ← MongoDB deletes at this exact time
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;