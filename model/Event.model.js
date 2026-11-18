import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required."],
      trim: true,
      maxlength: 150,
    },
    slug: { type: String, unique: true, index: true },
    description: {
      type: String,
      required: [true, "Event description is required."],
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ["tech", "academic", "social", "sports", "cultural", "religious", "other"],
      default: "other",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    startTime: { type: Date, required: true },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.startTime;
        },
        message: "End time must be after start time.",
      },
    },

    capacity: { type: Number, default: null },
    coverImage: { type: String, default: null },

    isPublished: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    registrationCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString(36).slice(-4);
  }
  next();
});

eventSchema.index({ startTime: 1, isPublished: 1 });
eventSchema.index({ category: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;